import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'dashboard/passenger_dashboard.dart';
import 'dashboard/admin_dashboard.dart';
import 'dashboard/driver_dashboard.dart';
import 'dashboard/agent_dashboard.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    if (user == null) {
      return const Scaffold(body: Center(child: Text("Error: No User Data")));
    }

    switch (user.role) {
      case 'PASSENGER':
        return const PassengerDashboard();
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return const AdminDashboard();
      case 'DRIVER':
        return const DriverDashboard();
      case 'AGENT':
        return const AgentDashboard();
      default:
        return const Scaffold(body: Center(child: Text("Unknown Role")));
    }
  }
}
