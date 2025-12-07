import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/admin_provider.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  @override
  void initState() {
    super.initState();
    // Fetch applicants on load
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AdminProvider>().fetchApplicants();
    });
  }

  @override
  Widget build(BuildContext context) {
     final user = context.watch<AuthProvider>().user;
     final adminProvider = context.watch<AdminProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
         actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      body: adminProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              itemCount: adminProvider.applicants.length,
              itemBuilder: (context, index) {
                final applicant = adminProvider.applicants[index];
                // Need to adapt based on actual API response structure
                // Assuming applicant has user details nested or flat
                // Based on standard practices
                return Card(
                  margin: const EdgeInsets.all(8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundImage: applicant['photoUrl'] != null 
                        ? NetworkImage(applicant['photoUrl']) 
                        : null,
                      child: applicant['photoUrl'] == null ? const Icon(Icons.person) : null,
                    ),
                    title: Text(applicant['fullName'] ?? 'Unknown'),
                    subtitle: Text('Status: ${applicant['status'] ?? 'PENDING'}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.check, color: Colors.green),
                          onPressed: () {
                            context.read<AdminProvider>().approveUser(applicant['id']);
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.red),
                          onPressed: () {
                             // Reject logic if implemented
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
       floatingActionButton: FloatingActionButton(
        onPressed: () => context.read<AdminProvider>().fetchApplicants(),
        child: const Icon(Icons.refresh),
      ),
    );
  }
}
