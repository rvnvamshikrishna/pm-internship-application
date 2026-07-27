import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  static Future<bool> login(String email, String password, String role) async {
    try {
      String endpoint;
      if (role == 'student') {
        endpoint = '/auth/student/login';
      } else if (role == 'admin') {
        endpoint = '/auth/admin/login';
      } else {
        endpoint = '/auth/company/login';
      }
      final response = await ApiService.post(endpoint, {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['access_token'];
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('auth_token', token);
          await prefs.setString('user_role', role);
          return true;
        }
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  static Future<bool> signup(String name, String email, String password, String role) async {
    try {
      final endpoint = role == 'student' ? '/auth/student/signup' : '/auth/company/signup';
      
      final Map<String, dynamic> body = {
        'email': email,
        'password': password,
        'password_confirm': password,
        'otp_code': '123456',
      };

      if (role == 'student') {
        body['full_name'] = name;
        body['phone'] = '0000000000'; // Placeholder
      } else {
        body['company_name'] = name;
      }

      final response = await ApiService.post(endpoint, body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Automatically login after successful signup
        return await login(email, password, role);
      }
      return false;
    } catch (e) {
      print('Signup error: $e');
      return false;
    }
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_role');
  }

  static Future<String?> getRole() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_role');
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
}
