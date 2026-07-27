import 'dart:convert';
import 'api_service.dart';
import '../models/internship.dart';

class CompanyService {
  static Future<bool> createProfile(Map<String, dynamic> data) async {
    try {
      final response = await ApiService.put('/companies/me', data);
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error creating company profile: $e');
      return false;
    }
  }

  static Future<List<Internship>> getMyInternships() async {
    try {
      final response = await ApiService.get('/companies/internships');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Internship.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching company internships: $e');
      return [];
    }
  }

  static Future<bool> postInternship(Map<String, dynamic> data) async {
    try {
      final response = await ApiService.post('/companies/internships', data);
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error posting internship: $e');
      return false;
    }
  }

  static Future<List<dynamic>> getMatches(int internshipId) async {
    try {
      final response = await ApiService.get('/companies/internships/$internshipId/ranked-candidates');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      print('Error fetching matches: $e');
      return [];
    }
  }

  static Future<bool> updateApplicationStatus(int applicationId, String status) async {
    try {
      final response = await ApiService.put('/companies/applications/$applicationId/status', {
        'status': status,
      });
      return response.statusCode == 200;
    } catch (e) {
      print('Error updating status: $e');
      return false;
    }
  }
}
