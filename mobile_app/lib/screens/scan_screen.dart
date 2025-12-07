import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MobileScannerController controller = MobileScannerController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan QR Code')),
      body: MobileScanner(
        controller: controller,
        onDetect: (capture) {
          final List<Barcode> barcodes = capture.barcodes;
          for (final barcode in barcodes) {
             print('Barcode found! ${barcode.rawValue}');
             // Handle barcode value (e.g. Passenger ID or Payment ID)
             controller.stop();
             ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Found: ${barcode.rawValue}')));
             Navigator.pop(context, barcode.rawValue);
          }
        },
      ),
    );
  }
}
