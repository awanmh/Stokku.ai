import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/product_model.dart';
import '../providers/product_provider.dart';
import '../providers/warehouse_provider.dart';
import '../providers/transaction_provider.dart';
import '../providers/sync_provider.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});
  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  MobileScannerController? _camCtrl;
  ProductModel? _scannedProduct;
  bool _scanning = true;
  String? _lastCode;

  @override
  void initState() {
    super.initState();
    _camCtrl = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WarehouseProvider>().loadWarehouses();
    });
  }

  @override
  void dispose() {
    _camCtrl?.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) async {
    if (!_scanning) return;
    final code = capture.barcodes.firstOrNull?.rawValue;
    if (code == null || code == _lastCode) return;
    _lastCode = code;
    setState(() => _scanning = false);

    final product = await context.read<ProductProvider>().findBySku(code);
    setState(() => _scannedProduct = product);

    if (product == null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Produk dengan SKU "$code" tidak ditemukan'),
        backgroundColor: AppColors.error,
      ));
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) setState(() { _scanning = true; _lastCode = null; });
      });
    }
  }

  void _resetScanner() {
    setState(() {
      _scannedProduct = null;
      _scanning = true;
      _lastCode = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera
          if (_scanning)
            MobileScanner(controller: _camCtrl!, onDetect: _onDetect),

          // Top bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  ShaderMask(
                    shaderCallback: (b) => const LinearGradient(
                      colors: [AppColors.cyan, AppColors.indigo],
                    ).createShader(b),
                    child: const Text('Scan Barcode',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700,
                            color: Colors.white)),
                  ),
                  const Spacer(),
                  if (_camCtrl != null)
                    IconButton(
                      icon: const Icon(Icons.flash_on, color: Colors.white),
                      onPressed: () => _camCtrl!.toggleTorch(),
                    ),
                ],
              ),
            ),
          ),

          // Scan overlay
          if (_scanning)
            Center(
              child: Container(
                width: 260, height: 260,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.cyan, width: 2),
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),

          // Instruction
          if (_scanning)
            Positioned(
              bottom: 120, left: 0, right: 0,
              child: Center(child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text('Arahkan kamera ke barcode produk',
                    style: TextStyle(color: Colors.white70, fontSize: 13)),
              )),
            ),

          // Result sheet
          if (_scannedProduct != null)
            _buildResultSheet(context),
        ],
      ),
    );
  }

  Widget _buildResultSheet(BuildContext context) {
    final p = _scannedProduct!;
    final warehouses = context.watch<WarehouseProvider>().warehouses;
    String? selectedWarehouseId = warehouses.isNotEmpty ? warehouses.first.id : null;
    final qtyCtrl = TextEditingController(text: '1');

    return Positioned(
      bottom: 0, left: 0, right: 0,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: AppColors.darkBorder)),
        ),
        child: SafeArea(
          top: false,
          child: StatefulBuilder(builder: (ctx, setLocal) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product info
              Row(children: [
                Container(width: 48, height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.cyan.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.inventory_2, color: AppColors.cyan)),
                const SizedBox(width: 14),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600,
                        fontSize: 16, color: AppColors.textPrimary)),
                    Text('SKU: ${p.sku} • ${p.category}',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ])),
              ]),
              const SizedBox(height: 20),

              // Warehouse picker
              const Text('GUDANG', style: TextStyle(fontSize: 10,
                  fontWeight: FontWeight.w700, letterSpacing: 1.5,
                  color: AppColors.textMuted)),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: selectedWarehouseId,
                dropdownColor: AppColors.darkCard,
                style: const TextStyle(color: AppColors.textPrimary),
                items: warehouses.map((w) => DropdownMenuItem(
                    value: w.id, child: Text(w.name))).toList(),
                onChanged: (v) => setLocal(() => selectedWarehouseId = v),
                decoration: const InputDecoration(isDense: true),
              ),
              const SizedBox(height: 16),

              // Quantity
              const Text('JUMLAH', style: TextStyle(fontSize: 10,
                  fontWeight: FontWeight.w700, letterSpacing: 1.5,
                  color: AppColors.textMuted)),
              const SizedBox(height: 8),
              TextFormField(
                controller: qtyCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
              ),
              const SizedBox(height: 20),

              // Action buttons
              Row(children: [
                Expanded(child: SizedBox(height: 48, child: ElevatedButton.icon(
                  icon: const Icon(Icons.add_circle_outline, size: 18),
                  label: const Text('Stock In'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                  onPressed: () => _submit('stock_in', selectedWarehouseId,
                      int.tryParse(qtyCtrl.text) ?? 1),
                ))),
                const SizedBox(width: 12),
                Expanded(child: SizedBox(height: 48, child: ElevatedButton.icon(
                  icon: const Icon(Icons.remove_circle_outline, size: 18),
                  label: const Text('Stock Out'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12))),
                  onPressed: () => _submit('stock_out', selectedWarehouseId,
                      int.tryParse(qtyCtrl.text) ?? 1),
                ))),
              ]),
              const SizedBox(height: 12),
              SizedBox(width: double.infinity, height: 44,
                child: TextButton(
                  onPressed: _resetScanner,
                  child: const Text('Scan Lagi', style: TextStyle(color: AppColors.cyan)),
                )),
            ],
          )),
        ),
      ),
    );
  }

  void _submit(String type, String? warehouseId, int qty) async {
    if (warehouseId == null || _scannedProduct == null) return;
    final tx = context.read<TransactionProvider>();
    await tx.createTransaction(
      warehouseId: warehouseId,
      productId: _scannedProduct!.id,
      type: type,
      quantity: qty,
      reference: 'SCAN-${DateTime.now().millisecondsSinceEpoch}',
    );
    if (!mounted) return;
    
    context.read<SyncProvider>().refreshPendingCount();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text('${type == 'stock_in' ? 'Stock In' : 'Stock Out'}'
          ' ${_scannedProduct!.name} x$qty berhasil'),
      backgroundColor: AppColors.success,
    ));
    _resetScanner();
  }
}
