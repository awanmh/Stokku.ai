import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    const sample = {
        success: true,
        data: {
            suggestions: [
                {
                    product_name: "Gula Pasir",
                    product_sku: "SKU-GULA-01",
                    current_stock: 5,
                    recommended_order: 100,
                    estimated_stockout: "2026-05-25",
                    priority: "high",
                },
            ],
            status: "ok",
        },
    };

    return NextResponse.json(sample);
}
