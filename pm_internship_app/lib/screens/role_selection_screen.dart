import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  bool _isHindi = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isHindi ? 'भूमिका चुनें' : 'PM Internship Engine'),
        centerTitle: true,
        actions: [
          TextButton.icon(
            onPressed: () {
              setState(() => _isHindi = !_isHindi);
            },
            icon: const Icon(Icons.language),
            label: Text(_isHindi ? 'English' : 'हिंदी'),
          ),
          IconButton(
            icon: const Icon(Icons.admin_panel_settings),
            onPressed: () => context.push('/admin'),
            tooltip: 'Admin Dashboard',
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildRoleCard(
              context: context,
              title: _isHindi ? 'मैं एक छात्र हूँ' : 'I am a Student',
              subtitle: _isHindi ? 'सर्वश्रेष्ठ इंटर्नशिप खोजें और आवेदन करें।' : 'Find and apply for the best internships.',
              icon: Icons.school,
              onTap: () {
                context.push('/login?role=student');
              },
            ),
            const SizedBox(height: 24),
            _buildRoleCard(
              context: context,
              title: _isHindi ? 'मैं एक संगठन का प्रतिनिधित्व करता हूँ' : 'I represent an Organization',
              subtitle: _isHindi ? 'इंटर्नशिप पोस्ट करें और शीर्ष प्रतिभा खोजें।' : 'Post internships and find top talent.',
              icon: Icons.business,
              onTap: () {
                context.push('/login?role=company');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              Icon(icon, size: 64, color: Theme.of(context).primaryColor),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
