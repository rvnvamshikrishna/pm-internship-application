import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/api_service.dart';

class CompanyProfileBuilderScreen extends StatefulWidget {
  const CompanyProfileBuilderScreen({super.key});

  @override
  State<CompanyProfileBuilderScreen> createState() => _CompanyProfileBuilderScreenState();
}

class _CompanyProfileBuilderScreenState extends State<CompanyProfileBuilderScreen> {
  int _currentStep = 0;
  bool _isSaving = false;

  // 1. Account Contact
  final _contactNameController = TextEditingController();
  final _contactDesignationController = TextEditingController();
  final _contactPhoneController = TextEditingController();

  // 2. Organization Identity
  final _companyNameController = TextEditingController();
  String? _selectedOrgType;
  final _industryController = TextEditingController();
  String? _selectedCompanySize;
  final _websiteController = TextEditingController();
  final _descriptionController = TextEditingController();

  // 3. Location
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _countryController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _officeLocationsController = TextEditingController();

  // 4. Verification
  final _cinController = TextEditingController();
  final _gstinController = TextEditingController();
  final _domainController = TextEditingController();

  Future<void> _submitProfile() async {
    setState(() => _isSaving = true);
    try {
      final payload = {
        'company_name': _companyNameController.text,
        'contact_name': _contactNameController.text,
        'contact_designation': _contactDesignationController.text,
        'contact_phone': _contactPhoneController.text,
        'org_type': _selectedOrgType,
        'industry': _industryController.text,
        'company_size': _selectedCompanySize,
        'website': _websiteController.text,
        'description': _descriptionController.text,
        'city': _cityController.text,
        'state': _stateController.text,
        'country': _countryController.text,
        'pincode': _pincodeController.text,
        'office_locations': _officeLocationsController.text,
        'cin_number': _cinController.text,
        'gstin_pan': _gstinController.text,
        'email_domain': _domainController.text,
      };

      final response = await ApiService.put('/companies/me', payload);

      setState(() => _isSaving = false);
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) context.go('/company/dashboard');
      } else {
        _showError('Failed to save company profile. Status: ${response.statusCode}');
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Setup Organization Profile')),
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
            if (_currentStep < 3) {
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
              title: const Text('Contact Details', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(controller: _contactNameController, decoration: const InputDecoration(labelText: 'Contact Person Name')),
                  const SizedBox(height: 12),
                  TextField(controller: _contactDesignationController, decoration: const InputDecoration(labelText: 'Designation (e.g. HR Manager)')),
                  const SizedBox(height: 12),
                  TextField(controller: _contactPhoneController, decoration: const InputDecoration(labelText: 'Contact Phone Number'), keyboardType: TextInputType.phone),
                ],
              ),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Organization Identity', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(controller: _companyNameController, decoration: const InputDecoration(labelText: 'Organization Name')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Organization Type'),
                    value: _selectedOrgType,
                    items: ['Company', 'Startup', 'NGO', 'Government/PSU', 'Educational institution']
                        .map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                    onChanged: (val) => setState(() => _selectedOrgType = val),
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: _industryController, decoration: const InputDecoration(labelText: 'Industry / Domain')),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Company Size'),
                    value: _selectedCompanySize,
                    items: ['1–10', '11–50', '51–200', '200+']
                        .map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                    onChanged: (val) => setState(() => _selectedCompanySize = val),
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: _websiteController, decoration: const InputDecoration(labelText: 'Official Website')),
                  const SizedBox(height: 12),
                  TextField(controller: _descriptionController, decoration: const InputDecoration(labelText: 'About the Organization'), maxLines: 3),
                ],
              ),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Location', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  Row(
                    children: [
                      Expanded(child: TextField(controller: _cityController, decoration: const InputDecoration(labelText: 'City'))),
                      const SizedBox(width: 12),
                      Expanded(child: TextField(controller: _stateController, decoration: const InputDecoration(labelText: 'State'))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: TextField(controller: _countryController, decoration: const InputDecoration(labelText: 'Country'))),
                      const SizedBox(width: 12),
                      Expanded(child: TextField(controller: _pincodeController, decoration: const InputDecoration(labelText: 'Pincode'))),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(controller: _officeLocationsController, decoration: const InputDecoration(labelText: 'All Office Locations')),
                ],
              ),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
            ),
            Step(
              title: const Text('Verification', style: TextStyle(fontWeight: FontWeight.bold)),
              content: Column(
                children: [
                  TextField(controller: _cinController, decoration: const InputDecoration(labelText: 'CIN Number (Optional)')),
                  const SizedBox(height: 12),
                  TextField(controller: _gstinController, decoration: const InputDecoration(labelText: 'GSTIN / PAN (Optional)')),
                  const SizedBox(height: 12),
                  TextField(controller: _domainController, decoration: const InputDecoration(labelText: 'Official Email Domain')),
                  const SizedBox(height: 24),
                  if (_isSaving) const CircularProgressIndicator(),
                ],
              ),
              isActive: _currentStep >= 3,
              state: StepState.indexed,
            ),
          ],
        ),
      ),
    );
  }
}
