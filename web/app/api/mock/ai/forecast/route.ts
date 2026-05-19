import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    const sample = {
        success: true,
        data: {
            product_id: "sample-product-1",
            warehouse_id: "wh-1",
            forecast: [
                { date: "2026-06-01", predicted_demand: 120, confidence: 0.82 },
                { date: "2026-06-08", predicted_demand: 95, confidence: 0.76 },
            ],
            recommendation: "Tambahkan 200 unit dalam 14 hari",
            status: "ok",
        },
    };

    return NextResponse.json(sample);
}
