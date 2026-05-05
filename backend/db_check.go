package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	dbUrl := "postgres://postgres:Paternoster123@localhost:5432/stokku?sslmode=disable"
	pool, err := pgxpool.New(context.Background(), dbUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	rows, err := pool.Query(context.Background(), "SELECT email, password, is_active FROM users")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("Users:")
	for rows.Next() {
		var email, pwd string
        var isActive bool
		rows.Scan(&email, &pwd, &isActive)
		fmt.Printf("Email: %s, Pwd: %s, IsActive: %t\n", email, pwd, isActive)
	}
}
