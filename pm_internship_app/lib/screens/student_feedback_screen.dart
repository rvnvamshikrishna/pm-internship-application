import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import '../services/api_service.dart';

class StudentFeedbackScreen extends StatefulWidget {
  const StudentFeedbackScreen({super.key});

  @override
  State<StudentFeedbackScreen> createState() => _StudentFeedbackScreenState();
}

class _StudentFeedbackScreenState extends State<StudentFeedbackScreen> {
  int? _selectedInternshipId;
  int _rating = 0;
  final _commentsController = TextEditingController();
  String _isRelevant = 'Yes';
  bool _isSubmitting = false;
  
  // Dummy data for MVP. In reality, fetch from student's applied/completed internships
  final List<Map<String, dynamic>> _internships = [
    {'id': 1, 'title': 'Software Engineering Intern at Google'},
    {'id': 2, 'title': 'Data Analyst Intern at Microsoft'},
  ];

  Future<void> _submitFeedback() async {
    if (_selectedInternshipId == null || _rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select an internship and provide a rating')));
      return;
    }

    setState(() => _isSubmitting = true);
    try {
      final payload = {
        'internship_id': _selectedInternshipId,
        'rating': _rating,
        'comments': _commentsController.text,
        'is_relevant': _isRelevant,
      };

      final response = await ApiService.post('/students/feedback', payload);

      setState(() => _isSubmitting = false);
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Thank you for your feedback!')));
          context.pop();
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to submit feedback')));
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leave Feedback', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'How was your experience?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            DropdownButtonFormField<int>(
              decoration: const InputDecoration(labelText: 'Select Internship'),
              value: _selectedInternshipId,
              items: _internships.map((i) => DropdownMenuItem<int>(
                value: i['id'] as int,
                child: Text(i['title'] as String),
              )).toList(),
              onChanged: (val) => setState(() => _selectedInternshipId = val),
            ),
            const SizedBox(height: 32),
            const Text('Rate your experience (1-5 Stars)', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                return IconButton(
                  icon: Icon(
                    index < _rating ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 40,
                  ),
                  onPressed: () => setState(() => _rating = index + 1),
                );
              }),
            ),
            const SizedBox(height: 24),
            TextField(
              controller: _commentsController,
              decoration: const InputDecoration(
                labelText: 'Additional Comments (Optional)',
                hintText: 'Tell us what you liked or how it could be improved...',
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 24),
            const Text('Were the AI recommendation results relevant to this role?', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: RadioListTile<String>(
                    title: const Text('Yes'),
                    value: 'Yes',
                    groupValue: _isRelevant,
                    onChanged: (val) => setState(() => _isRelevant = val!),
                  ),
                ),
                Expanded(
                  child: RadioListTile<String>(
                    title: const Text('No'),
                    value: 'No',
                    groupValue: _isRelevant,
                    onChanged: (val) => setState(() => _isRelevant = val!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            _isSubmitting
              ? const Center(child: CircularProgressIndicator())
              : ElevatedButton(
                  onPressed: _submitFeedback,
                  child: const Text('Submit Feedback'),
                ),
          ],
        ),
      ),
    );
  }
}
