import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../scan_screen.dart'; 
import '../wallet/wallet_screen.dart';

class PassengerDashboard extends StatelessWidget {
  const PassengerDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome, ${user?.fullName ?? "Passenger"}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Wallet Card
            Card(
              elevation: 4,
              color: Colors.amber,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    const Text('Wallet Balance', style: TextStyle(fontSize: 16)),
                    const SizedBox(height: 8),
                    // TODO: Connect to real wallet balance if available in User model or separate call
                    const Text('ETB 0.00', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () {
                         Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen()));
                      },
                      child: const Text('Wallet Actions'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Actions
            GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                 _DashboardTile(
                  icon: Icons.qr_code_scanner, 
                  label: 'Scan QR',
                onTap: () {
                    Navigator.push(context, MaterialPageRoute(builder: (_) => const ScanScreen()));
                  },
                ),
                 const _DashboardTile(icon: Icons.history, label: 'Trip History'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const _DashboardTile({required this.icon, required this.label, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Card(
        elevation: 2,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.amber[800]),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
