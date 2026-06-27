package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load("../../.env")
	dbURL := "postgres://postgres:root@localhost:5432/stokku?sslmode=disable"
	
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to db: %v", err)
	}
	defer pool.Close()

	log.Println("Starting Database Seeding...")

	// 1. Seed Warehouses
	warehouses := []string{
		"Gudang Utama Jakarta", "Gudang Cabang Bandung", "Pusat Distribusi Surabaya",
		"Gudang Material Depok", "Fasilitas Penyimpanan Bekasi", "Gudang Transit Semarang",
		"Hub Logistik Medan", "Gudang Elektronik Makassar", "Gudang Makanan Bali",
		"Penyimpanan Cadangan Yogyakarta",
	}
	
	var warehouseIDs []uuid.UUID
	for _, w := range warehouses {
		id := uuid.New()
		_, err := pool.Exec(ctx, `
			INSERT INTO warehouses (id, name, location, address, is_active)
			VALUES ($1, $2, $3, $4, true)
			ON CONFLICT DO NOTHING
		`, id, w, "Location-"+w, "Address-"+w)
		if err != nil {
			log.Printf("Error inserting warehouse %s: %v", w, err)
		} else {
			warehouseIDs = append(warehouseIDs, id)
		}
	}
	log.Printf("Seeded %d warehouses", len(warehouseIDs))

	if len(warehouseIDs) == 0 {
		log.Fatal("No warehouses seeded, aborting.")
	}

	// 2. Seed Products
	products := []struct {
		name string
		cat  string
	}{
		{"Semen Portland", "Material"}, {"Besi Beton", "Material"}, {"Pipa PVC", "Material"},
		{"Cat Tembok", "Material"}, {"Kabel Listrik", "Elektronik"}, {"Laptop ASUS", "Elektronik"},
		{"Beras Maknyus", "Makanan"}, {"Minyak Goreng", "Makanan"}, {"Gula Pasir", "Makanan"},
		{"Smartphone Samsung", "Elektronik"}, {"Mouse Logitech", "Elektronik"}, {"Keyboard Mechanical", "Elektronik"},
		{"Batu Bata", "Material"}, {"Kaca Jendela", "Material"}, {"Paku Payung", "Material"},
		{"Keramik Lantai", "Material"}, {"Triplek", "Material"}, {"Baja Ringan", "Material"},
		{"Televisi LED", "Elektronik"}, {"Kipas Angin", "Elektronik"},
	}

	var productIDs []uuid.UUID
	for i, p := range products {
		id := uuid.New()
		sku := fmt.Sprintf("SKU-%d", 1000+i)
		_, err := pool.Exec(ctx, `
			INSERT INTO products (id, sku, name, description, category, unit, price, min_stock, max_stock, is_active)
			VALUES ($1, $2, $3, $4, $5, 'pcs', $6, $7, $8, true)
			ON CONFLICT (sku) DO NOTHING
		`, id, sku, p.name, p.name+" desc", p.cat, 50000+(rand.Intn(100)*1000), 50, 500)
		
		if err == nil {
			productIDs = append(productIDs, id)
		}
		
		// Insert duplicate dummy products to reach 50+
		for j := 0; j < 2; j++ {
			idDup := uuid.New()
			skuDup := fmt.Sprintf("SKU-%d-%d", 1000+i, j)
			_, _ = pool.Exec(ctx, `
				INSERT INTO products (id, sku, name, description, category, unit, price, min_stock, max_stock, is_active)
				VALUES ($1, $2, $3, $4, $5, 'pcs', $6, $7, $8, true)
				ON CONFLICT (sku) DO NOTHING
			`, idDup, skuDup, p.name+fmt.Sprintf(" Variant %d", j), p.name+" desc", p.cat, 50000+(rand.Intn(100)*1000), 50, 500)
			productIDs = append(productIDs, idDup)
		}
	}
	productIDs = nil
	rows, err := pool.Query(ctx, "SELECT id FROM products")
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var pid uuid.UUID
			if err := rows.Scan(&pid); err == nil {
				productIDs = append(productIDs, pid)
			}
		}
	}
	
	log.Printf("Seeded %d products", len(productIDs))

	if len(productIDs) == 0 {
		log.Fatal("No products seeded, aborting.")
	}

	var actualAdminID uuid.UUID
	err = pool.QueryRow(ctx, "SELECT id FROM users LIMIT 1").Scan(&actualAdminID)
	if err != nil {
		log.Fatalf("Failed to get any user ID (make sure there is at least 1 user): %v", err)
	}

	// 3. Seed Transactions
	txCount := 0
	now := time.Now()
	for i := 0; i < 200; i++ {
		wID := warehouseIDs[rand.Intn(len(warehouseIDs))]
		pID := productIDs[rand.Intn(len(productIDs))]
		qty := rand.Intn(50) + 10
		
		txType := "stock_in"
		if rand.Intn(100) < 30 {
			txType = "stock_out" // 30% chance out, 70% in (to build up stock)
		}

		// Random time within the last 7 days
		daysAgo := rand.Intn(7)
		hoursAgo := rand.Intn(24)
		createdAt := now.AddDate(0, 0, -daysAgo).Add(time.Duration(-hoursAgo) * time.Hour)

		_, err := pool.Exec(ctx, `
			INSERT INTO transactions (id, warehouse_id, product_id, type, quantity, reference, notes, performed_by, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, uuid.New(), wID, pID, txType, qty, fmt.Sprintf("REF-%d", i), "Seeded transaction", actualAdminID, createdAt)
		
		if err != nil {
			log.Printf("Failed to insert tx: %v", err)
			continue
		}
		
		// Update stock
		if txType == "stock_in" {
			_, _ = pool.Exec(ctx, `
				INSERT INTO stocks (warehouse_id, product_id, quantity, updated_at)
				VALUES ($1, $2, $3, NOW())
				ON CONFLICT (warehouse_id, product_id) DO UPDATE SET quantity = stocks.quantity + $3, updated_at = NOW()
			`, wID, pID, qty)
		} else {
			_, _ = pool.Exec(ctx, `
				UPDATE stocks SET quantity = GREATEST(quantity - $3, 0), updated_at = NOW()
				WHERE warehouse_id = $1 AND product_id = $2
			`, wID, pID, qty)
		}

		txCount++
	}

	log.Printf("Seeded %d transactions", txCount)
	log.Println("Seeding complete!")
}
