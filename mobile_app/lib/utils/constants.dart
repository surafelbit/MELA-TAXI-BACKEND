import 'package:flutter/foundation.dart';

class ApiConstants {
  // Use 10.0.2.2 for Android Emulator to access host localhost
  // Use localhost for iOS simulator or web
  static const String baseUrl = kReleaseMode
      ? 'https://your-production-url.com' 
      : 'http://10.0.2.2:3000'; 
      
  static const String uploadsUrl = '$baseUrl/uploads';
}
