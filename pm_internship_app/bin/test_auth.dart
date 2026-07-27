import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  final endpoint = 'http://127.0.0.1:8000/auth/student/signup';
  final Map<String, dynamic> body = {
    'email': 'test1@gmail.com',
    'password': 'password123',
    'password_confirm': 'password123',
    'otp_code': '123456',
    'full_name': 'Test User',
    'phone': '0000000000'
  };

  try {
    final response = await http.post(
      Uri.parse(endpoint),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    
    print('Status: ${response.statusCode}');
    print('Body: ${response.body}');
  } catch (e) {
    print('Error: $e');
  }
}
