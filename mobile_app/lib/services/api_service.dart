import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class ApiService {
  late Dio _dio;

  ApiService() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString('token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) {
        print("API Error: ${e.response?.statusCode} - ${e.response?.data}");
        return handler.next(e);
      },
    ));
  }

  Dio get dio => _dio;

  // Auth
  Future<Response> login(String phone, String password) async {
    try {
      // Backend expects multipart/form-data for login based on routes analysis
      FormData formData = FormData.fromMap({
       'phone': phone,
       'password': password,
      });
      return await _dio.post('/auth/login', data: formData);
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> register(Map<String, dynamic> data, String? photoPath) async {
    try {
      FormData formData = FormData.fromMap(data);
      if (photoPath != null) {
        formData.files.add(MapEntry(
          'photo',
          await MultipartFile.fromFile(photoPath, filename: 'profile.jpg'),
        ));
      }
      return await _dio.post('/auth/register', data: formData);
    } catch (e) {
      rethrow;
    }
  }

  Future<Response> getMe(String userId) async {
    return await _dio.get('/auth/get-me/$userId');
  }

  // Wallet / Payment
  Future<Response> initializePayment(double amount, String email, String phone, String fullName) async {
    return await _dio.post('/payment/initialize-payment', data: {
      'amount': amount,
      'email': email,
      'phone': phone,
      'fullName': fullName,
    });
  }

  Future<Response> verifyPayment(String trxRef) async {
    return await _dio.get('/payment/verify-payment', queryParameters: {'trx_ref': trxRef});
  }
  
  // Admin
  Future<Response> approvePassenger(String id) async {
    return await _dio.post('/admin/approve-passenger/$id');
  }

  Future<Response> getAllPassengerApplicants() async {
    return await _dio.get('/admin/get-all-passenger-applicants');
  }

  // Agent
  Future<Response> createPhysicalPassenger(Map<String, dynamic> data, String? photoPath) async {
     FormData formData = FormData.fromMap(data);
       if (photoPath != null) {
        formData.files.add(MapEntry(
          'photo',
          await MultipartFile.fromFile(photoPath, filename: 'profile.jpg'),
        ));
      }
    return await _dio.post('/auth/create-manual-passenger', data: formData);
  }

}
