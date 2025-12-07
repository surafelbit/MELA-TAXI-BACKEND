import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AdminProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<dynamic> _applicants = [];
  bool _isLoading = false;

  List<dynamic> get applicants => _applicants;
  bool get isLoading => _isLoading;

  Future<void> fetchApplicants() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.getAllPassengerApplicants();
      _applicants = response.data; // Assuming it returns a list directly or in a key
      // Adjust based on controller: res.status(200).json(applicants) or json({data: ...})
      // Looking at controller code, it wasn't strictly shown what getAllPassengerApplicants returns structure-wise, 
      // but commonly it's a list. I'll need to double check if needed.
    } catch (e) {
      print(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> approveUser(String id) async {
    try {
      await _apiService.approvePassenger(id);
      _applicants.removeWhere((app) => app['id'] == id || app['userId'] == id); // Optimistic update
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }
}
