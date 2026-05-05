import Cookies from "js-cookie";
import { useAuthStore } from "./auth";

function getApiBase(): string {
  // If an explicit API URL is set, use it (e.g. for Docker or external deploys).
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Default: use relative URL → proxied by Next.js rewrites → no CORS issues.
  return "/api/v1";
}

const API_BASE = getApiBase();

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = Cookies.get("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Global 401 handling — token expired or invalid
  if (res.status === 401) {
    // Don't redirect if already on login-related endpoint
    const isLoginCall = endpoint === "/auth/login";
    if (!isLoginCall && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      useAuthStore.getState().logout();
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      throw new Error("Sesi telah berakhir. Silakan login kembali.");
    }
  }

  let data;
  try {
    data = await res.json();
  } catch {
    // Response is not valid JSON (e.g. backend is down, proxy returned plain text)
    throw new Error(
      res.status === 502 || res.status === 503
        ? "Server sedang tidak tersedia. Pastikan backend sudah berjalan."
        : `Server error (${res.status}). Pastikan backend sudah berjalan.`
    );
  }

  if (!res.ok) {
    console.error(`[API Error] ${res.status} ${res.statusText}`, data);

    // Detect stale JWT — user no longer exists in DB (FK constraint on performed_by)
    const msg = data.message || "";
    if (msg.includes("performed_by") || msg.includes("23503")) {
      if (typeof window !== "undefined") {
        useAuthStore.getState().logout();
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        throw new Error("Sesi tidak valid. Silakan login kembali.");
      }
    }

    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginOTPResponse>("/auth/login", { email, password }),
  loginDirect: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login/direct", { email, password }),
  verifyOTP: (session_id: string, otp_code: string) =>
    api.post<{ token: string; user: User }>("/auth/verify-otp", { session_id, otp_code }),
  resendOTP: (session_id: string) =>
    api.post<LoginOTPResponse>("/auth/resend-otp", { session_id }),
  register: (data: { email: string; name: string; password: string; role?: string }) =>
    api.post<{ token: string; user: User }>("/auth/register", data),
  getProfile: () => api.get<User>("/auth/profile"),
  getUsers: (limit = 20, offset = 0) =>
    api.get<User[]>(`/users?limit=${limit}&offset=${offset}`),
  createUser: (data: { email: string; name: string; password: string; role: string }) =>
    api.post<User>("/users", data),
  updateUser: (id: string, data: { name?: string; role?: string }) =>
    api.put<User>(`/users/${id}`, data),
  deleteUser: (id: string) =>
    api.delete(`/users/${id}`),
};

// Products
export const productApi = {
  getAll: (params?: { search?: string; category?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    query.set("limit", String(params?.limit || 20));
    query.set("offset", String(params?.offset || 0));
    return api.get<Product[]>(`/products?${query}`);
  },
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: CreateProductRequest) => api.post<Product>("/products", data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Warehouses
export const warehouseApi = {
  getAll: (limit = 20, offset = 0) =>
    api.get<Warehouse[]>(`/warehouses?limit=${limit}&offset=${offset}`),
  getById: (id: string) => api.get<Warehouse>(`/warehouses/${id}`),
  create: (data: { name: string; location: string; address: string }) =>
    api.post<Warehouse>("/warehouses", data),
  update: (id: string, data: Partial<Warehouse>) =>
    api.put<Warehouse>(`/warehouses/${id}`, data),
  delete: (id: string) => api.delete(`/warehouses/${id}`),
};

// Transactions
export const transactionApi = {
  getAll: (params?: {
    warehouse_id?: string;
    product_id?: string;
    type?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set("warehouse_id", params.warehouse_id);
    if (params?.product_id) query.set("product_id", params.product_id);
    if (params?.type) query.set("type", params.type);
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    query.set("limit", String(params?.limit || 20));
    query.set("offset", String(params?.offset || 0));
    return api.get<TransactionView[]>(`/transactions?${query}`);
  },
  create: (data: CreateTransactionRequest) =>
    api.post<Transaction>("/transactions", data),
};

// Inventory
export const inventoryApi = {
  getAll: (params?: {
    warehouse_id?: string;
    search?: string;
    low_stock?: boolean;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.warehouse_id) query.set("warehouse_id", params.warehouse_id);
    if (params?.search) query.set("search", params.search);
    if (params?.low_stock) query.set("low_stock", "true");
    query.set("limit", String(params?.limit || 20));
    query.set("offset", String(params?.offset || 0));
    return api.get<StockView[]>(`/inventory?${query}`);
  },
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats"),
  getLowStockAlerts: (limit = 10) =>
    api.get<StockView[]>(`/dashboard/alerts/low-stock?limit=${limit}`),
  getDeadStock: (limit = 10) =>
    api.get<StockView[]>(`/dashboard/alerts/dead-stock?limit=${limit}`),
};

// AI / Forecast
export const forecastApi = {
  getForecast: (productId?: string, warehouseId?: string) => {
    const query = new URLSearchParams();
    if (productId) query.set("product_id", productId);
    if (warehouseId) query.set("warehouse_id", warehouseId);
    return api.get<ForecastData>(`/ai/forecast?${query}`);
  },
  getReplenishment: () => api.get<ReplenishmentData>("/ai/replenishment"),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "warehouse_staff" | "viewer";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginOTPResponse {
  session_id: string;
  message: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  price: number;
  min_stock: number;
  max_stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  price: number;
  min_stock: number;
  max_stock: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  warehouse_id: string;
  product_id: string;
  type: "stock_in" | "stock_out";
  quantity: number;
  reference: string;
  notes: string;
  performed_by: string;
  created_at: string;
}

export interface TransactionView extends Transaction {
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  performer_name: string;
}

export interface CreateTransactionRequest {
  warehouse_id: string;
  product_id: string;
  type: "stock_in" | "stock_out";
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface StockView {
  id: string;
  warehouse_id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  price: number;
  min_stock: number;
  total_value: number;
}

export interface DashboardStats {
  total_products: number;
  total_warehouses: number;
  total_stock_value: number;
  low_stock_count: number;
  dead_stock_count: number;
  today_tx_count: number;
}

export interface ForecastData {
  product_id: string;
  warehouse_id: string;
  forecast: Array<{
    date: string;
    predicted_demand: number;
    confidence: number;
  }>;
  recommendation: string;
  status: string;
  note: string;
}

export interface ReplenishmentData {
  suggestions: Array<{
    product_sku: string;
    product_name: string;
    current_stock: number;
    recommended_order: number;
    estimated_stockout: string;
    priority: string;
  }>;
  status: string;
  note: string;
}
