# stokku.ai — API Documentation

Base URL: `http://localhost:8080/api/v1`

All responses follow this format:

```json
{
  "success": true,
  "data": <response_data>,
  "message": "Human readable message",
  "meta": { "total": 100, "limit": 20, "offset": 0 }  // paginated only
}
```

Errors return `"success": false` with appropriate HTTP status codes.

---

## Health Check

```
GET /health
Auth: public
Response: { success, data: { status: "healthy", version: "1.0.0" } }
```

---

## Authentication

### Login

```
POST /api/v1/auth/login
Auth: public
Body: { "email": "string", "password": "string" }
Response: { token: "jwt_string", user: User }
```

### Register (onboarding)

```
POST /api/v1/auth/register
Auth: public
Body: { "email": "string", "name": "string", "password": "string", "role": "admin|warehouse_staff|viewer" }
Response: { token: "jwt_string", user: User }
```

### Get Profile

```
GET /api/v1/auth/profile
Auth: Bearer token
Response: User
```

### User type

```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "role": "admin | warehouse_staff | viewer",
  "is_active": true,
  "created_at": "RFC3339",
  "updated_at": "RFC3339"
}
```

---

## Users (Admin only)

### List Users

```
GET /api/v1/users?limit=20&offset=0
Auth: Bearer token (admin)
Response: User[] (paginated)
```

### Create User

```
POST /api/v1/users
Auth: Bearer token (admin)
Body: { "email": "string", "name": "string", "password": "string", "role": "admin|warehouse_staff|viewer" }
Response: User
```

### Update User

```
PUT /api/v1/users/:id
Auth: Bearer token (admin)
Body: { "name": "string", "role": "admin|warehouse_staff|viewer" }
Response: User
```

### Delete User

```
DELETE /api/v1/users/:id
Auth: Bearer token (admin)
Response: null
```

---

## Products

### List Products

```
GET /api/v1/products?search=&category=&limit=20&offset=0
Auth: Bearer token
Response: Product[] (paginated)
```

### Get Product

```
GET /api/v1/products/:id
Auth: Bearer token
Response: Product
```

### Create Product

```
POST /api/v1/products
Auth: Bearer token (admin, warehouse_staff)
Body: {
  "sku": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "unit": "string",
  "price": 0.0,
  "min_stock": 0,
  "max_stock": 0
}
Response: Product
```

### Update Product

```
PUT /api/v1/products/:id
Auth: Bearer token (admin, warehouse_staff)
Body: (partial) { "name": "string", "price": 0.0, ... }
Response: Product
```

### Delete Product

```
DELETE /api/v1/products/:id
Auth: Bearer token (admin)
Response: null
```

### Product type

```json
{
  "id": "uuid",
  "sku": "string",
  "name": "string",
  "description": "string",
  "category": "string",
  "unit": "string",
  "price": 0.0,
  "min_stock": 0,
  "max_stock": 0,
  "is_active": true,
  "created_at": "RFC3339",
  "updated_at": "RFC3339"
}
```

---

## Warehouses

### List Warehouses

```
GET /api/v1/warehouses?limit=20&offset=0
Auth: Bearer token
Response: Warehouse[] (paginated)
```

### Get Warehouse

```
GET /api/v1/warehouses/:id
Auth: Bearer token
Response: Warehouse
```

### Create Warehouse

```
POST /api/v1/warehouses
Auth: Bearer token (admin)
Body: { "name": "string", "location": "string", "address": "string" }
Response: Warehouse
```

### Update Warehouse

```
PUT /api/v1/warehouses/:id
Auth: Bearer token (admin)
Body: { "name": "string", "location": "string", "address": "string" }
Response: Warehouse
```

### Delete Warehouse

```
DELETE /api/v1/warehouses/:id
Auth: Bearer token (admin)
Response: null
```

### Warehouse type

```json
{
  "id": "uuid",
  "name": "string",
  "location": "string",
  "address": "string",
  "is_active": true,
  "created_at": "RFC3339",
  "updated_at": "RFC3339"
}
```

---

## Transactions

### List Transactions

```
GET /api/v1/transactions?warehouse_id=&product_id=&type=stock_in|stock_out&start_date=&end_date=&limit=20&offset=0
Auth: Bearer token
Response: TransactionView[] (paginated)
```

### Get Transaction

```
GET /api/v1/transactions/:id
Auth: Bearer token
Response: TransactionView
```

### Create Transaction

```
POST /api/v1/transactions
Auth: Bearer token (admin, warehouse_staff)
Body: {
  "warehouse_id": "uuid",
  "product_id": "uuid",
  "type": "stock_in | stock_out",
  "quantity": 1,
  "reference": "string",
  "notes": "string"
}
Response: Transaction
```

### TransactionView type

```json
{
  "id": "uuid",
  "warehouse_id": "uuid",
  "product_id": "uuid",
  "type": "stock_in | stock_out",
  "quantity": 1,
  "reference": "string",
  "notes": "string",
  "performed_by": "uuid",
  "created_at": "RFC3339",
  "product_name": "string",
  "product_sku": "string",
  "warehouse_name": "string",
  "performer_name": "string"
}
```

---

## Inventory

### List Inventory (Stock Levels)

```
GET /api/v1/inventory?warehouse_id=&search=&low_stock=true&limit=20&offset=0
Auth: Bearer token
Response: StockView[] (paginated)
```

### StockView type

```json
{
  "id": "uuid",
  "warehouse_id": "uuid",
  "product_id": "uuid",
  "quantity": 0,
  "updated_at": "RFC3339",
  "product_name": "string",
  "product_sku": "string",
  "warehouse_name": "string",
  "price": 0.0,
  "min_stock": 0,
  "total_value": 0.0
}
```

---

## Dashboard

### Get Stats

```
GET /api/v1/dashboard/stats
Auth: Bearer token
Response: {
  "total_products": 0,
  "total_warehouses": 0,
  "total_stock_value": 0.0,
  "low_stock_count": 0,
  "dead_stock_count": 0,
  "today_tx_count": 0
}
```

### Low Stock Alerts

```
GET /api/v1/dashboard/alerts/low-stock?limit=10
Auth: Bearer token
Response: StockView[]
```

### Dead Stock Alerts

```
GET /api/v1/dashboard/alerts/dead-stock?limit=10
Auth: Bearer token
Response: StockView[]
```

---

## AI / Forecast (placeholder)

### Demand Forecast

```
GET /api/v1/ai/forecast?product_id=&warehouse_id=
Auth: Bearer token
Response: ForecastData
```

### Replenishment Suggestions

```
GET /api/v1/ai/replenishment
Auth: Bearer token
Response: ReplenishmentData
```

---

## Role-Based Access Control (RBAC)

| Endpoint | Admin | Warehouse Staff | Viewer |
|---|:---:|:---:|:---:|
| GET (all read endpoints) | ✅ | ✅ | ✅ |
| POST /products | ✅ | ✅ | ❌ |
| PUT /products/:id | ✅ | ✅ | ❌ |
| DELETE /products/:id | ✅ | ❌ | ❌ |
| POST /transactions | ✅ | ✅ | ❌ |
| POST/PUT/DELETE /warehouses | ✅ | ❌ | ❌ |
| POST/PUT/DELETE /users | ✅ | ❌ | ❌ |

---

## Error Codes

| HTTP Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 409 | Conflict (duplicate SKU, email, etc.) |
| 500 | Internal server error |
