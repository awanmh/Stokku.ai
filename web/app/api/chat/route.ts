import { NextRequest, NextResponse } from "next/server";
import {
    CHAT_HISTORY_LIMIT,
    CHAT_MODEL_OPTIONS,
    DEFAULT_CHAT_MODEL,
    type ChatMessage,
    type ChatModelId,
} from "@/lib/chatbot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_DEFAULT_MODEL =
    (process.env.GEMINI_DEFAULT_MODEL as ChatModelId | undefined) ||
    DEFAULT_CHAT_MODEL;
const BACKEND_INTERNAL_URL =
    (process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
const USE_AI_MOCKS = process.env.USE_AI_MOCKS === "1";
const ALLOW_ORIGIN = process.env.ALLOW_ORIGIN || "*";

type BackendResponse<T> = {
    success: boolean;
    data?: T;
    message?: string;
    meta?: {
        total: number;
        limit: number;
        offset: number;
    };
};

type ChatRequestBody = {
    message?: string;
    messages?: ChatMessage[];
    model?: ChatModelId;
};

type DashboardStatsData = {
    total_products?: number;
    total_warehouses?: number;
    total_stock_value?: number;
    low_stock_count?: number;
    dead_stock_count?: number;
    today_tx_count?: number;
};

type StockItem = {
    product_name?: string;
    product_sku?: string;
    warehouse_name?: string;
    quantity?: number;
    min_stock?: number;
};

type ReplenishmentSuggestion = {
    product_name?: string;
    product_sku?: string;
    current_stock?: number;
    recommended_order?: number;
    estimated_stockout?: string;
    priority?: string;
};

type ReplenishmentData = {
    suggestions?: ReplenishmentSuggestion[];
    status?: string;
    note?: string;
};

type ForecastPoint = {
    date?: string;
    predicted_demand?: number;
    confidence?: number;
};

type ForecastData = {
    product_id?: string;
    warehouse_id?: string;
    forecast?: ForecastPoint[];
    recommendation?: string;
    status?: string;
    note?: string;
};

type GeminiResponse = {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
};

type GeminiPart = { text?: string };

type GeminiMessage = {
    role: string;
    parts: GeminiPart[];
};

type GeminiRequest = {
    contents: GeminiMessage[];
    generationConfig: {
        temperature?: number;
        topP?: number;
        maxOutputTokens?: number;
        [key: string]: unknown;
    };
    systemInstruction?: { parts: GeminiPart[] };
    [key: string]: unknown;
};

type ChatIntent =
    | "inventory-summary"
    | "low-stock"
    | "dead-stock"
    | "replenishment"
    | "forecast"
    | "product-search"
    | "warehouse-search"
    | "general";

function isChatModelId(value: unknown): value is ChatModelId {
    return CHAT_MODEL_OPTIONS.some((option) => option.id === value);
}

function detectIntent(message: string): ChatIntent {
    const lower = message.toLowerCase();

    if (/forecast|prediksi|proyeksi|ramalan|tren|demand/.test(lower)) {
        return "forecast";
    }

    if (/restock|replenish|pengadaan|pesan|beli|order/.test(lower)) {
        return "replenishment";
    }

    if (/dead[-\s]?stock|slow[-\s]?moving|mati|tak laku|tidak laku/.test(lower)) {
        return "dead-stock";
    }

    if (/stok rendah|stok kritis|kritis|habis|menipis|low stock/.test(lower)) {
        return "low-stock";
    }

    if (/ringkas|summary|overview|total stok|kondisi inventaris|inventaris|inventory/.test(lower)) {
        return "inventory-summary";
    }

    if (/gudang|warehouse/.test(lower)) {
        return "warehouse-search";
    }

    if (/sku|produk|barang|item/.test(lower)) {
        return "product-search";
    }

    return "general";
}

function extractSearchTerm(message: string): string | null {
    const quoted = message.match(/["“”']([^"“”']{2,80})["“”']/);
    if (quoted?.[1]) {
        return quoted[1].trim();
    }

    const lowered = message.toLowerCase();
    const patterns = [
        /(?:produk|barang|sku|item|gudang|warehouse|stok|tentang|cari|cek|lihat|detail|info|informasi)\s+(.+)/i,
        /(?:untuk|di)\s+(.+)/i,
    ];

    for (const pattern of patterns) {
        const match = lowered.match(pattern);
        if (match?.[1]) {
            const cleaned = match[1]
                .replace(/[?.!,]/g, " ")
                .replace(/\b(yang|dan|atau|the|of|di|pada|untuk|soal|tentang|stok|stoknya|inventaris|inventory|gudang|warehouse)\b/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (cleaned.length >= 3) {
                return cleaned.slice(0, 80);
            }
        }
    }

    return null;
}

function formatMoney(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

function summarizeStats(data: DashboardStatsData | undefined): string {
    if (!data) {
        return "- Ringkasan dashboard tidak tersedia.";
    }

    return [
        `- Total produk: ${data.total_products ?? "-"}`,
        `- Total gudang: ${data.total_warehouses ?? "-"}`,
        `- Nilai stok: ${typeof data.total_stock_value === "number"
            ? formatMoney(data.total_stock_value)
            : data.total_stock_value ?? "-"
        }`,
        `- Stok rendah: ${data.low_stock_count ?? "-"}`,
        `- Dead-stock: ${data.dead_stock_count ?? "-"}`,
        `- Transaksi hari ini: ${data.today_tx_count ?? "-"}`,
    ].join("\n");
}

function summarizeStockList(label: string, items: StockItem[] | undefined): string {
    if (!items || items.length === 0) {
        return `- ${label}: tidak ada data.`;
    }

    const topItems = items.slice(0, 5).map((item, index) => {
        const productName = item.product_name || "Produk tidak dikenal";
        const quantity = item.quantity ?? "-";
        const warehouseName = item.warehouse_name || "Gudang tidak diketahui";
        const threshold = item.min_stock ?? "-";

        return `${index + 1}. ${productName} - sisa ${quantity} di ${warehouseName} (minimum ${threshold})`;
    });

    return [`- ${label}:`, ...topItems.map((item) => `  ${item}`)].join("\n");
}

function summarizeForecast(data: ForecastData | undefined): string {
    if (!data) {
        return "- Forecast tidak tersedia.";
    }

    const points = data.forecast || [];
    const topPoints = points.slice(0, 5).map((point) => {
        const date = point.date || "tanggal tidak diketahui";
        const demand = point.predicted_demand ?? "-";
        const confidence = typeof point.confidence === "number"
            ? `${Math.round(point.confidence * 100)}%`
            : "-";

        return `  - ${date}: prediksi ${demand}, confidence ${confidence}`;
    });

    return [
        `- Status forecast: ${data.status || "-"}`,
        data.recommendation ? `- Rekomendasi: ${data.recommendation}` : null,
        data.note ? `- Catatan: ${data.note}` : null,
        points.length > 0 ? "- Detail forecast:" : null,
        ...topPoints,
    ]
        .filter(Boolean)
        .join("\n");
}

async function fetchBackendData<T>(
    path: string,
    token?: string
): Promise<BackendResponse<T> | null> {
    try {
        const response = await fetch(`${BACKEND_INTERNAL_URL}${path}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            cache: "no-store",
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as BackendResponse<T>;
    } catch {
        return null;
    }
}

function buildSystemPrompt(context: string, intent: ChatIntent): string {
    return [
        "Kamu adalah Stokku AI, asisten inventaris dan operasional untuk aplikasi Stokku.ai.",
        "Jawab dalam bahasa Indonesia yang jelas, ringkas, dan actionable.",
        "Fokus pada inventaris, stok rendah, dead-stock, replenishment, gudang, transaksi, dan forecast.",
        "Gunakan gaya jawaban berikut: 1) jawab langsung di awal, 2) beri data pendukung singkat, 3) tutup dengan saran tindakan.",
        "Jika ada angka, sebutkan dengan presisi dan jangan mengarang data baru.",
        "Jika data yang tersedia tidak cukup, jelaskan keterbatasannya dan minta detail tambahan secara spesifik.",
        "Jika pertanyaan di luar domain inventory, bantu sebisanya lalu arahkan kembali ke konteks Stokku.",
        "Untuk permintaan forecast, jelaskan status, rekomendasi, dan poin demand utama secara ringkas.",
        `Intent saat ini: ${intent}`,
        "",
        "Konteks aplikasi terbaru:",
        context,
    ].join("\n");
}

function buildConversation(messages: ChatMessage[]) {
    const slicedMessages = messages.slice(-CHAT_HISTORY_LIMIT);
    const firstUserIndex = slicedMessages.findIndex((message) => message.role === "user");

    return (firstUserIndex >= 0 ? slicedMessages.slice(firstUserIndex) : slicedMessages).map(
        (message) => ({
            role: message.role,
            parts: [{ text: message.content }],
        })
    );
}

async function getInventoryContext(token: string | undefined, intent: ChatIntent, message: string): Promise<string> {
    const searchTerm = extractSearchTerm(message);

    const [stats, lowStock, deadStock, replenishment, inventoryMatches] = await Promise.all([
        fetchBackendData<DashboardStatsData>("/api/v1/dashboard/stats", token),
        ["inventory-summary", "low-stock", "dead-stock", "replenishment", "forecast"].includes(intent)
            ? fetchBackendData<StockItem[]>("/api/v1/dashboard/alerts/low-stock?limit=5", token)
            : Promise.resolve(null),
        ["inventory-summary", "dead-stock"].includes(intent)
            ? fetchBackendData<StockItem[]>("/api/v1/dashboard/alerts/dead-stock?limit=5", token)
            : Promise.resolve(null),
        ["replenishment", "forecast"].includes(intent)
            ? fetchBackendData<ReplenishmentData>("/api/v1/ai/replenishment", token)
            : Promise.resolve(null),
        searchTerm
            ? fetchBackendData<StockItem[]>(`/api/v1/inventory?search=${encodeURIComponent(searchTerm)}&limit=5&offset=0`, token)
            : Promise.resolve(null),
    ]);

    const forecastSource = inventoryMatches?.data?.[0];
    const forecast = forecastSource && (intent === "forecast" || intent === "replenishment")
        ? await fetchBackendData<ForecastData>(
            `/api/v1/ai/forecast?product_id=${encodeURIComponent(forecastSource.product_id || "")}&warehouse_id=${encodeURIComponent(forecastSource.warehouse_id || "")}`,
            token
        )
        : null;

    const contextSections = [
        "Ringkasan dashboard:",
        summarizeStats(stats?.data),
        "",
        lowStock?.data ? summarizeStockList("Alert stok rendah", lowStock.data) : "- Alert stok rendah: tidak diminta.",
        "",
        deadStock?.data ? summarizeStockList("Alert dead-stock", deadStock.data) : "- Alert dead-stock: tidak diminta.",
    ];

    if (searchTerm) {
        contextSections.push("");
        contextSections.push(`Pencarian relevan untuk "${searchTerm}":`);
        contextSections.push(
            inventoryMatches?.data?.length
                ? summarizeStockList("Hasil pencarian inventaris", inventoryMatches.data)
                : "- Tidak ada kecocokan inventaris langsung dari pencarian tersebut."
        );
    }

    if (replenishment?.data) {
        const suggestions = replenishment.data.suggestions || [];

        if (suggestions.length > 0) {
            contextSections.push("");
            contextSections.push("- Rekomendasi replenishment:");
            contextSections.push(
                ...suggestions.slice(0, 5).map((item, index) => {
                    const productName = item.product_name || item.product_sku || "Produk tidak dikenal";
                    const currentStock = item.current_stock ?? "-";
                    const recommendedOrder = item.recommended_order ?? "-";
                    const estimatedStockout = item.estimated_stockout || "-";
                    const priority = item.priority || "-";

                    return `  ${index + 1}. ${productName} - stok sekarang ${currentStock}, saran pesan ${recommendedOrder}, perkiraan habis ${estimatedStockout}, prioritas ${priority}`;
                })
            );
        } else if (replenishment.data.note) {
            contextSections.push("");
            contextSections.push(`- Replenishment: ${replenishment.data.note}`);
        }
    }

    if (forecast?.data) {
        contextSections.push("");
        contextSections.push("- Forecast terkait pencarian:");
        contextSections.push(summarizeForecast(forecast.data));
    }

    return contextSections.join("\n");
}

function extractGeminiText(payload: GeminiResponse): string {
    const candidate = payload.candidates?.[0];
    return candidate?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
}

function jsonWithCors(body: unknown, status = 200) {
    return NextResponse.json(body, {
        status,
        headers: {
            "Access-Control-Allow-Origin": ALLOW_ORIGIN,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}

function buildMockReply(intent: ChatIntent, context: string, message: string): string {
    const firstContextLines = context
        .split("\n")
        .filter((line) => line.trim().length > 0)
        .slice(0, 6)
        .join("\n");

    if (intent === "forecast") {
        return [
            "[MOCK] Berikut ringkasan forecast sementara:",
            firstContextLines || "Forecast mock belum memiliki konteks tambahan.",
            "Gunakan endpoint backend AI saat service forecasting siap.",
        ].join("\n");
    }

    if (intent === "replenishment") {
        return [
            "[MOCK] Berikut saran replenishment sementara:",
            firstContextLines || "Replenishment mock belum memiliki konteks tambahan.",
            "Validasi hasil ini dengan endpoint backend AI sebelum dipakai operasional.",
        ].join("\n");
    }

    return [
        "[MOCK] Chatbot sedang berjalan dalam mode dev.",
        `Intent terdeteksi: ${intent}`,
        message ? `Pesan Anda: ${message}` : null,
        firstContextLines || "Konteks inventaris belum tersedia.",
    ]
        .filter(Boolean)
        .join("\n");
}

export async function POST(request: NextRequest) {
    const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
    const message = body?.message?.trim() || "";
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const model = isChatModelId(body?.model) ? body.model : GEMINI_DEFAULT_MODEL;
    const token = request.cookies.get("token")?.value;


    if (!message && messages.length === 0) {
        return jsonWithCors({ success: false, message: "Pesan chatbot tidak boleh kosong." }, 400);
    }

    if (USE_AI_MOCKS) {
        const safeMessages =
            messages.length > 0 ? messages : [{ role: "user", content: message }];
        const activeMessage = message || safeMessages[safeMessages.length - 1]?.content || "";
        const intent = detectIntent(activeMessage);
        const context = await getInventoryContext(token, intent, activeMessage);
        const reply = buildMockReply(intent, context, activeMessage);

        return jsonWithCors(
            {
                success: true,
                data: {
                    reply,
                    model: "mock" as const,
                },
            },
            200
        );
    }

    if (!GEMINI_API_KEY) {
        return jsonWithCors(
            {
                success: false,
                message:
                    "GEMINI_API_KEY belum diatur. Tambahkan variabel environment untuk mengaktifkan chatbot.",
            },
            500
        );
    }

    const safeMessages = messages.length > 0 ? messages : [{ role: "user", content: message }];
    const intent = detectIntent(message || safeMessages[safeMessages.length - 1]?.content || "");
    const context = await getInventoryContext(token, intent, message || safeMessages[safeMessages.length - 1]?.content || "");
    const systemPrompt = buildSystemPrompt(context, intent);

    const isGemma = model.startsWith("gemma-");

    // Build contents; for Gemma we inject system prompt as the first message
    const contents = isGemma
        ? [{ role: "MODEL", parts: [{ text: systemPrompt }] }, ...buildConversation(safeMessages)]
        : buildConversation(safeMessages);

    const requestBody: GeminiRequest = {
        contents,
        generationConfig: {
            temperature: 0.4,
            topP: 0.95,
            maxOutputTokens: 900,
        },
    };

    if (!isGemma) {
        // only include systemInstruction when supported (Gemini flash, etc.)
        requestBody.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    async function callGemini(modelId: string) {
        return fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );
    }

    const geminiResponse = await callGemini(model);

    // If a non-default model fails, try fallback to the default Gemini model.
    // This covers unsupported model features, permission issues, and transient API failures.
    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text().catch(() => "");
        const shouldFallback =
            model !== GEMINI_DEFAULT_MODEL &&
            (
                geminiResponse.status === 400 ||
                geminiResponse.status === 403 ||
                geminiResponse.status === 404 ||
                geminiResponse.status === 429 ||
                geminiResponse.status >= 500 ||
                /developer instruction is not enabled|role 'system' is not supported|permission|quota|not found|unsupported/i.test(errorText)
            );

        if (shouldFallback) {
            // Retry with default model (e.g., gemini-2.5-flash) and include systemInstruction there.
            const fallbackModel = GEMINI_DEFAULT_MODEL;
            const fallbackRequestBody = { ...requestBody };
            // ensure systemInstruction present for fallback
            fallbackRequestBody.systemInstruction = { parts: [{ text: systemPrompt }] };

            const fallbackResp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fallbackRequestBody),
                }
            );

            if (fallbackResp.ok) {
                const payload = (await fallbackResp.json()) as GeminiResponse;
                const reply = extractGeminiText(payload);

                if (!reply) {
                    return jsonWithCors({ success: false, message: "Gemini tidak mengembalikan teks jawaban." }, 502);
                }

                return jsonWithCors({ success: true, data: { reply, model: fallbackModel } }, 200);
            }

            // fallback also failed — return its error
            const fallbackError = await fallbackResp.text().catch(() => "");
            return jsonWithCors(
                {
                    success: false,
                    message: `Gagal memanggil Gemini API (${fallbackResp.status}). ${fallbackError || "Coba lagi nanti."}`,
                },
                502
            );
        }

        return jsonWithCors(
            {
                success: false,
                message: `Gagal memanggil Gemini API (${geminiResponse.status}). ${errorText || "Coba lagi nanti."}`,
            },
            502
        );
    }

    const payload = (await geminiResponse.json()) as GeminiResponse;
    const reply = extractGeminiText(payload);

    if (!reply) {
        return jsonWithCors({ success: false, message: "Gemini tidak mengembalikan teks jawaban." }, 502);
    }

    return jsonWithCors({ success: true, data: { reply, model } }, 200);
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": ALLOW_ORIGIN,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
