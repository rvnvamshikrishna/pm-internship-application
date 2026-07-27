import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../services/student_service.dart';
import '../models/internship.dart';
import '../widgets/internship_card.dart';
import 'explore_screen.dart';
import 'my_applications_screen.dart';

class StudentDashboardScreen extends StatefulWidget {
  const StudentDashboardScreen({super.key});

  @override
  State<StudentDashboardScreen> createState() => _StudentDashboardScreenState();
}

class _StudentDashboardScreenState extends State<StudentDashboardScreen> {
  int _selectedIndex = 0;
  
  // Tab 0: Home (Recommendations)
  List<Internship> _recommendations = [];
  bool _isLoading = true;
  String _studentName = "Student";

  @override
  void initState() {
    super.initState();
    _fetchRecommendations();
  }

  Future<void> _fetchRecommendations() async {
    try {
      final recs = await StudentService.getRecommendations();
      final profile = await StudentService.getProfile();
      if (mounted) {
        setState(() {
          _recommendations = recs;
          _studentName = profile['full_name']?.toString().split(' ').first ?? "Student";
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Widget _buildHomeTab() {
    return _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _recommendations.isEmpty
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.person_off, size: 64, color: Colors.grey),
                    const SizedBox(height: 16),
                    const Text(
                      'No recommendations yet.',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    const Text('Make sure your profile is 100% complete!'),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context.push('/student/profile'),
                      child: const Text('Complete Profile'),
                    ),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: _fetchRecommendations,
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _recommendations.length + 1,
                  itemBuilder: (context, index) {
                    if (index == 0) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 24.0, top: 12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Hi, $_studentName! 👋',
                              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Let's help you land your dream career",
                              style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                            ),
                            const SizedBox(height: 32),
                            const Text(
                              'Top Matches For You',
                              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Color(0xFF1E293B)),
                            ),
                          ],
                        ),
                      );
                    }
                    final internship = _recommendations[index - 1];
                    return InternshipCard(
                      internship: internship,
                      onTap: () {
                        context.push('/internship/details', extra: internship);
                      },
                    );
                  },
                ),
              );
  }

  Widget _buildProfileTab() {
    return FutureBuilder<Map<String, dynamic>>(
      future: StudentService.getProfile(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError || !snapshot.hasData) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                const Text('Failed to load profile.'),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => context.push('/student/profile'),
                  child: const Text('Setup Profile'),
                ),
                TextButton.icon(
                  icon: const Icon(Icons.logout),
                  label: const Text('Logout'),
                  onPressed: () async {
                    await AuthService.logout();
                    if (context.mounted) context.go('/');
                  },
                ),
              ],
            ),
          );
        }

        final profile = snapshot.data!;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                child: Text(
                  (profile['full_name']?.toString().isNotEmpty == true) 
                      ? profile['full_name'][0].toUpperCase() 
                      : 'S',
                  style: TextStyle(fontSize: 40, color: Theme.of(context).primaryColor, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                profile['full_name'] ?? 'Student Name',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                profile['email'] ?? 'student@example.com',
                style: TextStyle(fontSize: 16, color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),
              
              // Details Card
              Card(
                elevation: 0,
                color: Colors.grey.shade50,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      _buildProfileRow(Icons.phone, 'Phone', profile['phone'] ?? 'Not provided'),
                      const Divider(height: 24),
                      _buildProfileRow(Icons.school, 'Degree/Course', '${profile['degree'] ?? ''} ${profile['course'] ?? ''}'.trim().isEmpty ? 'Not provided' : '${profile['degree'] ?? ''} ${profile['course'] ?? ''}'),
                      const Divider(height: 24),
                      _buildProfileRow(Icons.calendar_today, 'Graduation Year', profile['graduation_year']?.toString() ?? 'Not provided'),
                      const Divider(height: 24),
                      _buildProfileRow(Icons.grade, 'CGPA', profile['cgpa']?.toString() ?? 'Not provided'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.edit),
                  label: const Text('Edit Profile'),
                  onPressed: () => context.push('/student/profile').then((_) => setState(() {})),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: TextButton.icon(
                  icon: const Icon(Icons.logout, color: Colors.red),
                  label: const Text('Logout', style: TextStyle(color: Colors.red)),
                  onPressed: () async {
                    await AuthService.logout();
                    if (context.mounted) context.go('/');
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileRow(IconData icon, String title, String value) {
    return Row(
      children: [
        Icon(icon, color: Colors.grey.shade600, size: 20),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      _buildHomeTab(),
      const ExploreScreen(),
      const MyApplicationsScreen(),
      _buildProfileTab(),
    ];

    return Scaffold(
      appBar: _selectedIndex == 0 ? AppBar(
        title: const Text(
          'PM Internship',
          style: TextStyle(color: Color(0xFF008BDC), fontWeight: FontWeight.bold, fontSize: 22),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ) : null,
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      floatingActionButton: _selectedIndex == 0 ? FloatingActionButton.extended(
        onPressed: () => _showChatbotOverlay(context),
        icon: const Icon(Icons.chat_bubble_outline),
        label: const Text('AI Guide'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ) : null,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search_outlined), selectedIcon: Icon(Icons.search), label: 'Explore'),
          NavigationDestination(icon: Icon(Icons.work_outline), selectedIcon: Icon(Icons.work), label: 'Applied'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  void _showChatbotOverlay(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Container(
            height: MediaQuery.of(context).size.height * 0.7,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('AI Career Guide', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const Divider(),
                Expanded(
                  child: ListView(
                    children: [
                      _buildChatBubble('Hello! I can help you prepare for interviews or find the right internship. What do you need help with?', true),
                      _buildChatBubble('Can you help me prepare for a PM interview?', false),
                      _buildChatBubble('Absolutely! The most common PM interview questions involve product design and metrics. Let\'s practice a mock question: "How would you design a bookshelf for children?"', true),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Ask me anything...',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          filled: true,
                          fillColor: Colors.grey.shade100,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: IconButton(
                        icon: const Icon(Icons.send, color: Colors.white),
                        onPressed: () {},
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildChatBubble(String text, bool isBot) {
    return Align(
      alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
          color: isBot ? Colors.grey.shade100 : Theme.of(context).colorScheme.primary,
          borderRadius: BorderRadius.circular(20).copyWith(
            bottomLeft: isBot ? const Radius.circular(0) : const Radius.circular(20),
            bottomRight: !isBot ? const Radius.circular(0) : const Radius.circular(20),
          ),
        ),
        child: Text(
          text,
          style: TextStyle(
            color: isBot ? Colors.black87 : Colors.white,
            fontSize: 15,
          ),
        ),
      ),
    );
  }
}
