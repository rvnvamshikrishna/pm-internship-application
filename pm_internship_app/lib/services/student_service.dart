import 'dart:convert';
import 'api_service.dart';
import '../models/internship.dart';

class StudentService {
  static Future<List<Internship>> getRecommendations() async {
    try {
      final response = await ApiService.get('/students/recommendations');
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) {
          if (json.containsKey('internship')) {
            final internshipData = json['internship'] as Map<String, dynamic>;
            internshipData['match_score'] = json['match_score'];
            internshipData['match_reasons'] = json['match_reasons'];
            return Internship.fromJson(internshipData);
          }
          return Internship.fromJson(json);
        }).toList();
      }
      return [];
    } catch (e) {
      print('Error fetching recommendations: $e');
      return [];
    }
  }

  static Future<bool> applyToInternship(int internshipId) async {
    try {
      final response = await ApiService.post('/students/apply/$internshipId', {});
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error applying: $e');
      return false;
    }
  }

  static Future<List<dynamic>> getMyApplications() async {
    try {
      final response = await ApiService.get('/students/applications');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return [];
    } catch (e) {
      print('Error fetching applications: $e');
      return [];
    }
  }

  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await ApiService.get('/students/me');
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {};
    } catch (e) {
      print('Error fetching profile: $e');
      return {};
    }
  }
}
