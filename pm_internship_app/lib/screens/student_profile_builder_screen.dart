import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:convert';
import '../services/api_service.dart';

class StudentProfileBuilderScreen extends StatefulWidget {
  const StudentProfileBuilderScreen({super.key});

  @override
  State<StudentProfileBuilderScreen> createState() => _StudentProfileBuilderScreenState();
}

class _StudentProfileBuilderScreenState extends State<StudentProfileBuilderScreen> {
  int _currentStep = 0;
  bool _isSaving = false;

  // Controllers - Basic
  final _nameController = TextEditingController();
  String? _selectedGender;
  DateTime? _selectedDOB;
  final _addressController = TextEditingController();

  // Controllers - Academics
  final _collegeController = TextEditingController();
  final _degreeController = TextEditingController();
  final _gradYearController = TextEditingController();
  final _cgpaController = TextEditingController();
  bool _isPursuing = true;
  
  // Controllers - Prefs
  final _locationPrefController = TextEditingController();
  String? _selectedWorkMode;
  final _interestsController = TextEditingController();

  // Skills
  List<String> _selectedSkills = [];
  List<String> _suggestedSkills = ['Python', 'Java', 'Marketing', 'Figma', 'SQL', 'Project Management'];
  final _skillInputController = TextEditingController();

  final _languagesController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _githubController = TextEditingController();
  
  Future<void> _fetchSkillRecommendations() async {
    if (_selectedSkills.isEmpty) return;
    try {
      final skillsQuery = _selectedSkills.join(',');
      final response = await ApiService.get('/students/skills/recommendations?skills_list=$skillsQuery');
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['recommendations'] != null) {
          setState(() {
            _suggestedSkills = List<String>.from(data['recommendations'])
                .where((s) => !_selectedSkills.contains(s))
                .toList();
          });
        }
      }
    } catch (e) {
      print("Error fetching skills: $e");
    }
  }

  void _addSkill(String skill) {
    if (!_selectedSkills.contains(skill)) {
      setState(() {
        _selectedSkills.add(skill);
        _suggestedSkills.remove(skill);
      });
      _fetchSkillRecommendations();
    }
  }

  void _removeSkill(String skill) {
    setState(() {
      _selectedSkills.remove(skill);
      if (!_suggestedSkills.contains(skill)) {
        _suggestedSkills.insert(0, skill); // Add back to suggestions
      }
    });
    if (_selectedSkills.isNotEmpty) {
      _fetchSkillRecommendations();
    }
  }

  Future<void> _submitProfile() async {
    setState(() => _isSaving = true);
    try {
      // Build payload matching StudentUpdate schema
      final payload = {
        'full_name': _nameController.text,
        'gender': _selectedGender,
        'date_of_birth': _selectedDOB?.toIso8601String().split('T')[0],
        'permanent_address': _addressController.text,
        'college': _collegeController.text,
        'degree': _degreeController.text,
        'graduation_year': int.tryParse(_gradYearController.text),
        'cgpa': double.tryParse(_cgpaController.text),
        'is_pursuing': _isPursuing,
        'preferred_work_location': _locationPrefController.text,
        'preferred_work_mode': _selectedWorkMode,
        'areas_of_interest': _interestsController.text,
        'languages': _languagesController.text,
        'linkedin': _linkedinController.text,
        'github': _githubController.text,
      };

      // 1. Update basic profile
      final response = await ApiService.put('/students/me', payload);

      if (response.statusCode != 200 && response.statusCode != 201) {
        setState(() => _isSaving = false);
        _showError('Failed to save profile info. Status: ${response.statusCode}');
        return;
      }

      // 2. Add skills
      for (var skill in _selectedSkills) {
        await ApiService.post('/students/skills', {'skill_name': skill});
      }

      setState(() => _isSaving = false);
      if (mounted) {
        context.go('/student/dashboard');
      }
    } catch (e) {
      setState(() => _isSaving = false);
      _showError('An error occurred: $e');
    }
  }

  void _showError(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: Colors.red));
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime(2000),
      firstDate: DateTime(1980),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDOB) {
      setState(() {
        _selectedDOB = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Build Your Profile'),
      ),
      body: Theme(
        data: Theme.of(context).copyWith(
          colorScheme: Theme.of(context).colorScheme.copyWith(
            primary: const Color(0xFF4F46E5),
          ),
        ),
        child: Stepper(
          type: StepperType.vertical,
          physics: const ClampingScrollPhysics(),
          currentStep: _currentStep,
          onStepContinue: () {
            if (_currentStep < 4) {
              setState(() => _currentStep += 1);
            } else {
              _submitProfile();
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep -= 1);
            }
          },
          steps: [
            Step(
              title: const Text('Basic Information', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Gender'),
                    value: _selectedGender,
                    items: ['Male', 'Female', 'Other', 'Prefer not to say']
                        .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                        .toList(),
                    onChanged: (val) => setState(() => _selectedGender = val),
                  ),
                  const SizedBox(height: 12),
                  InkWell(
                    onTap: () => _selectDate(context),
                    child: InputDecorator(
                      decoration: const InputDecoration(labelText: 'Date of Birth'),
                      child: Text(_selectedDOB == null ? 'Select Date' : '${_selectedDOB!.toLocal()}'.split(' ')[0]),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _addressController,
                    decoration: const InputDecoration(labelText: 'Permanent Address'),
                    maxLines: 2,
                  ),
                ],
              ),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Academics', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(
                    controller: _collegeController,
                    decoration: const InputDecoration(labelText: 'College / University'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _degreeController,
                    decoration: const InputDecoration(labelText: 'Degree / Course (e.g. B.Tech Computer Science)'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _gradYearController,
                          decoration: const InputDecoration(labelText: 'Graduation Year'),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _cgpaController,
                          decoration: const InputDecoration(labelText: 'CGPA / %'),
                          keyboardType: TextInputType.number,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    title: const Text('Currently Pursuing'),
                    value: _isPursuing,
                    onChanged: (val) => setState(() => _isPursuing = val),
                  ),
                ],
              ),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Preferences', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(
                    controller: _locationPrefController,
                    decoration: const InputDecoration(labelText: 'Preferred Work Location'),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Preferred Work Mode'),
                    value: _selectedWorkMode,
                    items: ['Remote', 'Hybrid', 'On-site']
                        .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                        .toList(),
                    onChanged: (val) => setState(() => _selectedWorkMode = val),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _interestsController,
                    decoration: const InputDecoration(
                      labelText: 'Areas of Interest',
                      hintText: 'e.g. Marketing, Data Science',
                    ),
                  ),
                ],
              ),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Smart Skills', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Selected Skills:', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _selectedSkills.map((s) => Chip(
                      label: Text(s, style: const TextStyle(color: Colors.white)),
                      backgroundColor: const Color(0xFF4F46E5),
                      deleteIconColor: Colors.white,
                      onDeleted: () => _removeSkill(s),
                    )).toList(),
                  ),
                  if (_selectedSkills.isEmpty)
                    const Text('No skills added yet.', style: TextStyle(color: Colors.grey)),
                  
                  const SizedBox(height: 24),
                  const Text('Suggested for you:', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _suggestedSkills.take(10).map((s) => ActionChip(
                      label: Text(s),
                      backgroundColor: const Color(0xFFEEF2FF),
                      onPressed: () => _addSkill(s),
                    )).toList(),
                  ),
                  
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _skillInputController,
                          decoration: const InputDecoration(
                            labelText: 'Add custom skill',
                          ),
                          onSubmitted: (val) {
                            if (val.isNotEmpty) {
                              _addSkill(val.trim());
                              _skillInputController.clear();
                            }
                          },
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: Color(0xFF4F46E5), size: 36),
                        onPressed: () {
                          if (_skillInputController.text.isNotEmpty) {
                            _addSkill(_skillInputController.text.trim());
                            _skillInputController.clear();
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
              isActive: _currentStep >= 3,
              state: _currentStep > 3 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Social & Extras', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(
                    controller: _languagesController,
                    decoration: const InputDecoration(labelText: 'Languages (comma separated)'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _linkedinController,
                    decoration: const InputDecoration(labelText: 'LinkedIn URL'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _githubController,
                    decoration: const InputDecoration(labelText: 'GitHub URL'),
                  ),
                  const SizedBox(height: 24),
                  if (_isSaving) const CircularProgressIndicator(),
                ],
              ),
              isActive: _currentStep >= 4,
              state: StepState.indexed,
            ),
          ],
        ),
      ),
    );
  }
}
