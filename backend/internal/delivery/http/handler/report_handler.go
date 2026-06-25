package handler

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
	"github.com/stokku-ai/backend/internal/domain"
	"github.com/stokku-ai/backend/internal/usecase"
	"github.com/xuri/excelize/v2"
)

type ReportHandler struct {
	txUC *usecase.TransactionUsecase
}

func NewReportHandler(txUC *usecase.TransactionUsecase) *ReportHandler {
	return &ReportHandler{
		txUC: txUC,
	}
}

func (h *ReportHandler) GenerateInventoryExcel(c *fiber.Ctx) error {
	// Fetch all inventory (limit to 10000 for safety)
	stocks, _, err := h.txUC.GetInventory(c.Context(), domain.StockFilter{
		Limit:  10000,
		Offset: 0,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch inventory",
		})
	}

	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	sheet := "Sheet1"
	f.SetCellValue(sheet, "A1", "SKU Produk")
	f.SetCellValue(sheet, "B1", "Nama Produk")
	f.SetCellValue(sheet, "C1", "Gudang")
	f.SetCellValue(sheet, "D1", "Jumlah Stok")
	f.SetCellValue(sheet, "E1", "Nilai Total (Rp)")

	for i, stock := range stocks {
		row := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", row), stock.ProductSKU)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", row), stock.ProductName)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", row), stock.WarehouseName)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", row), stock.Quantity)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", row), stock.TotalValue)
	}

	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", "attachment; filename=Laporan_Inventaris.xlsx")

	if err := f.Write(c.Response().BodyWriter()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to write excel file",
		})
	}
	return nil
}

func (h *ReportHandler) GenerateTransactionsPDF(c *fiber.Ctx) error {
	// Fetch transactions (last 1000)
	txs, _, err := h.txUC.GetAll(c.Context(), domain.TransactionFilter{
		Limit:  1000,
		Offset: 0,
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch transactions",
		})
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Laporan Transaksi Stokku.ai")
	pdf.Ln(10)
	
	pdf.SetFont("Arial", "", 10)
	pdf.Cell(40, 10, fmt.Sprintf("Tanggal Cetak: %s", time.Now().Format("02-01-2006 15:04:05")))
	pdf.Ln(15)

	// Table Header
	pdf.SetFont("Arial", "B", 10)
	pdf.CellFormat(30, 8, "Tanggal", "1", 0, "C", false, 0, "")
	pdf.CellFormat(40, 8, "Produk", "1", 0, "C", false, 0, "")
	pdf.CellFormat(25, 8, "Tipe", "1", 0, "C", false, 0, "")
	pdf.CellFormat(20, 8, "Jumlah", "1", 0, "C", false, 0, "")
	pdf.CellFormat(40, 8, "Gudang", "1", 0, "C", false, 0, "")
	pdf.CellFormat(35, 8, "Pelaku", "1", 0, "C", false, 0, "")
	pdf.Ln(-1)

	// Table Body
	pdf.SetFont("Arial", "", 9)
	for _, tx := range txs {
		pdf.CellFormat(30, 8, tx.CreatedAt.Format("02-01-06 15:04"), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 8, tx.ProductName, "1", 0, "L", false, 0, "")
		
		tipe := "Masuk"
		if tx.Type == "stock_out" {
			tipe = "Keluar"
		}
		
		pdf.CellFormat(25, 8, tipe, "1", 0, "C", false, 0, "")
		pdf.CellFormat(20, 8, fmt.Sprintf("%d", tx.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 8, tx.WarehouseName, "1", 0, "L", false, 0, "")
		pdf.CellFormat(35, 8, tx.PerformerName, "1", 0, "L", false, 0, "")
		pdf.Ln(-1)
	}

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment; filename=Laporan_Transaksi.pdf")

	if err := pdf.Output(c.Response().BodyWriter()); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to write pdf file",
		})
	}

	return nil
}
