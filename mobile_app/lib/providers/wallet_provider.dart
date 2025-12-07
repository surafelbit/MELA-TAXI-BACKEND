import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'package:url_launcher/url_launcher.dart';

class WalletProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  bool get isLoading => _isLoading;

  Future<void> initializePayment(double amount, String email, String phone, String fullName) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.initializePayment(amount, email, phone, fullName);
      final checkoutUrl = response.data['checkout_url'];
      
      if (checkoutUrl != null) {
        final uri = Uri.parse(checkoutUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          throw 'Could not launch payment URL';
        }
      }
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> verifyPayment(String trxRef) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _apiService.verifyPayment(trxRef);
      return response.data;
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
