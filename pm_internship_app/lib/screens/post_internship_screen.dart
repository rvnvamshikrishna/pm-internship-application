import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/company_service.dart';

class PostInternshipScreen extends StatefulWidget {
  const PostInternshipScreen({super.key});

  @override
  State<PostInternshipScreen> createState() => _PostInternshipScreenState();
}

class _PostInternshipScreenState extends State<PostInternshipScreen> {
  final _titleController = TextEditingController();
  final _domainController = TextEditingController();
  final _locationController = TextEditingController();
  final _workModeController = TextEditingController();
  final _stipendController = TextEditingController();
  final _durationController = TextEditingController();
  final _descriptionController = TextEditingController();

  bool _isSaving = false;

  Future<void> _submitInternship() async {
    setState(() => _isSaving = true);

    try {
      final success = await CompanyService.postInternship({
        'title': _titleController.text,
        'domain': _domainController.text,
        'location': _locationController.text,
        'mode': _workModeController.text.isEmpty ? 'On-site' : _workModeController.text,
        'stipend': double.tryParse(_stipendController.text.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 0.0,
        'duration': _durationController.text,
        'description': _descriptionController.text,
        'last_date': DateTime.now().add(const Duration(days: 30)).toIso8601String().split('T')[0],
      });

      setState(() => _isSaving = false);

      if (success) {
        if (mounted) {
          context.pop(); // return to dashboard
        }
      } else {
        _showError('Failed to post internship.');
      }
    } catch (e) {
      setState(() => _isSaving = false);
      _showError('An error occurred.');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Post Internship')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildField(_titleController, 'Internship Title (e.g. Flutter Developer)'),
            const SizedBox(height: 16),
            _buildField(_domainController, 'Domain (e.g. Software, Design)'),
            const SizedBox(height: 16),
            _buildField(_locationController, 'Location (e.g. Mumbai, Remote)'),
            const SizedBox(height: 16),
            _buildField(_workModeController, 'Work Mode (Remote, On-site, Hybrid)'),
            const SizedBox(height: 16),
            _buildField(_stipendController, 'Stipend (e.g. ₹20,000/month)'),
            const SizedBox(height: 16),
            _buildField(_durationController, 'Duration (e.g. 6 Months)'),
            const SizedBox(height: 16),
            TextField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Job Description',
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 32),
            _isSaving
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
                    onPressed: _submitInternship,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Post Internship', style: TextStyle(fontSize: 18)),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(TextEditingController controller, String label) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
    );
  }
}
