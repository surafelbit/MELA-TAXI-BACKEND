import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../models/user_model.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  String? _token;
  AuthStatus _status = AuthStatus.unknown;

  User? get user => _user;
  AuthStatus get status => _status;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    final userId = prefs.getString('userId');

    if (_token != null && userId != null) {
      try {
        await fetchUser(userId);
        _status = AuthStatus.authenticated;
      } catch (e) {
        // Token invalid or user fetch failed
        await logout();
      }
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<void> fetchUser(String userId) async {
    try {
      final response = await _apiService.getMe(userId);
      _user = User.fromJson(response.data['result']);
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> login(String phone, String password) async {
    try {
      final response = await _apiService.login(phone, password);
      // Response structure: { message, token, user: {id, fullName...} }
      _token = response.data['token'];
      final userData = response.data['user'];
      _user = User.fromJson(userData);
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', _token!);
      await prefs.setString('userId', _user!.id);
      
      _status = AuthStatus.authenticated;
      notifyListeners();
    } catch (e) {
      throw e;
    }
  }

  Future<void> register(Map<String, dynamic> data, String? photoPath) async {
    try {
      await _apiService.register(data, photoPath);
      // Register usually doesn't return token immediately in this flow as it needs approval, 
      // but if it does, handle it. Based on controller, it returns { message, requestId ... }
    } catch (e) {
      throw e;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _token = null;
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
