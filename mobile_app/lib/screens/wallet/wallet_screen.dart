import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/wallet_provider.dart';
import '../../providers/auth_provider.dart';

class WalletScreen extends StatefulWidget {
  const WalletScreen({super.key});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  final _amountController = TextEditingController();

  void _topUp() async {
    final amount = double.tryParse(_amountController.text);
    if (amount == null || amount <= 0) return;

    final user = context.read<AuthProvider>().user;
    if (user == null) return;

    try {
       await context.read<WalletProvider>().initializePayment(
        amount,
        'user@example.com', // In a real app, use user's email if available or ask for it
        user.phone,
        user.fullName,
      );
      // After returning from browser, user can verify. 
      // Ideally we listen to Deep Link, but for now we manually check or show a message.
       if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment initialized. Please complete in browser.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    }
  }

  void _verify(String trxRef) async {
    try {
       final result = await context.read<WalletProvider>().verifyPayment(trxRef);
       if (mounted) {
         showDialog(context: context, builder: (_) => AlertDialog(
           title: const Text('Payment Status'),
           content: Text(result.toString()),
           actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
         ));
       }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Verification Failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    // For manual verification testing, we might need a text field for TrxRef if deep link isn't set up
    // But usually Chapa redirects. 
    // Simplified UI for now.
    
    return Scaffold(
      appBar: AppBar(title: const Text('My Wallet')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            const Text('Top Up Amount'),
            TextField(
              controller: _amountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                prefixText: 'ETB ',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _topUp,
              child: const Text('Top Up with Chapa'),
            ),
            const Divider(height: 40),
            const Text('Verify Transaction (Manual Test)'),
             // Hidden or Dev only feature normally
             TextField(
               decoration: const InputDecoration(labelText: 'Enter Transaction Reference', border: OutlineInputBorder()),
               onSubmitted: _verify,
             ),
          ],
        ),
      ),
    );
  }
}
