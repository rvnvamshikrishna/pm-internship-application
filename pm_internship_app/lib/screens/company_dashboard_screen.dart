import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';
import '../services/company_service.dart';
import '../models/internship.dart';

class CompanyDashboardScreen extends StatefulWidget {
  const CompanyDashboardScreen({super.key});

  @override
  State<CompanyDashboardScreen> createState() => _CompanyDashboardScreenState();
}

class _CompanyDashboardScreenState extends State<CompanyDashboardScreen> {
  List<Internship> _internships = [];
  Map<int, List<dynamic>> _internshipMatches = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchInternships();
  }

  Future<void> _fetchInternships() async {
    final internships = await CompanyService.getMyInternships();
    Map<int, List<dynamic>> matchesMap = {};
    
    // Fetch matches for top candidates chips
    for (var internship in internships) {
      try {
        final matches = await CompanyService.getMatches(internship.id);
        matchesMap[internship.id] = matches;
      } catch (e) {
        matchesMap[internship.id] = [];
      }
    }

    if (mounted) {
      setState(() {
        _internships = internships;
        _internshipMatches = matchesMap;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recruiter Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push('/company/profile'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await AuthService.logout();
              if (context.mounted) {
                context.go('/');
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchInternships,
              child: CustomScrollView(
                slivers: [
                  SliverPadding(
                    padding: const EdgeInsets.all(16.0),
                    sliver: SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Bold missions deserve the brightest talent',
                            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Color(0xFF0F172A), height: 1.2),
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Discover and hire the right interns for your startup. Let AI do the heavy lifting of shortlisting candidates.',
                            style: TextStyle(fontSize: 16, color: Colors.grey[700], height: 1.5),
                          ),
                          const SizedBox(height: 32),
                          const Text('Overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              _buildStatCard('Active Jobs', '${_internships.length}', Icons.work, Colors.blue),
                              const SizedBox(width: 12),
                              _buildStatCard('Total Apps', '${_internships.length * 12}', Icons.people, Colors.purple),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              _buildStatCard('Shortlisted', '${_internships.length * 3}', Icons.check_circle, Colors.green),
                              const SizedBox(width: 12),
                              _buildStatCard('Avg Match', '87%', Icons.auto_awesome, Colors.amber.shade700),
                            ],
                          ),
                          const SizedBox(height: 32),
                          const Text('Your Posted Internships', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 16),
                        ],
                      ),
                    ),
                  ),
                  _internships.isEmpty
                      ? SliverFillRemaining(
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.post_add, size: 64, color: Colors.grey),
                                const SizedBox(height: 16),
                                const Text('No internships posted yet.', style: TextStyle(fontSize: 18)),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: () => context.push('/company/post-internship').then((_) => _fetchInternships()),
                                  icon: const Icon(Icons.add),
                                  label: const Text('Post an Internship'),
                                ),
                              ],
                            ),
                          ),
                        )
                      : SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final internship = _internships[index];
                              final matches = _internshipMatches[internship.id] ?? [];
                              final topMatches = matches.take(2).toList();
                              final remaining = matches.length > 2 ? matches.length - 2 : 0;

                              return Card(
                                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                                color: Colors.white,
                                child: InkWell(
                                  borderRadius: BorderRadius.circular(16),
                                  onTap: () => context.push('/company/internship/${internship.id}/candidates'),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      border: Border.all(color: Colors.grey.shade200),
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                    padding: const EdgeInsets.all(16.0),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Container(
                                              padding: const EdgeInsets.all(10),
                                              decoration: BoxDecoration(
                                                color: Colors.blue.shade50,
                                                borderRadius: BorderRadius.circular(12),
                                              ),
                                              child: const Icon(Icons.work_outline, color: Colors.blue, size: 20),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(internship.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                                                  const SizedBox(height: 4),
                                                  Text('${internship.domain} • ${internship.location}', style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                                                ],
                                              ),
                                            ),
                                            const Icon(Icons.chevron_right, color: Colors.grey),
                                          ],
                                        ),
                                        if (topMatches.isNotEmpty) ...[
                                          const SizedBox(height: 16),
                                          const Divider(height: 1),
                                          const SizedBox(height: 12),
                                          const Text('Top AI Matches:', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF475569))),
                                          const SizedBox(height: 8),
                                          Wrap(
                                            spacing: 8,
                                            runSpacing: 8,
                                            crossAxisAlignment: WrapCrossAlignment.center,
                                            children: [
                                              ...topMatches.map((match) {
                                                final name = match['student']?['full_name'] ?? 'Candidate';
                                                final score = match['match_score']?.round() ?? 0;
                                                return Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                  decoration: BoxDecoration(
                                                    color: Colors.green.shade50,
                                                    borderRadius: BorderRadius.circular(16),
                                                    border: Border.all(color: Colors.green.shade200),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Text(
                                                        name.split(' ')[0],
                                                        style: TextStyle(fontSize: 12, color: Colors.green.shade800, fontWeight: FontWeight.w500),
                                                      ),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        '($score%)',
                                                        style: TextStyle(fontSize: 12, color: Colors.green.shade800, fontWeight: FontWeight.bold),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                              }),
                                              if (remaining > 0)
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                                  decoration: BoxDecoration(
                                                    color: Colors.grey.shade100,
                                                    borderRadius: BorderRadius.circular(16),
                                                  ),
                                                  child: Text('+$remaining more', style: TextStyle(fontSize: 12, color: Colors.grey.shade700, fontWeight: FontWeight.w500)),
                                                ),
                                            ],
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                              );
                            },
                            childCount: _internships.length,
                          ),
                        ),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push('/company/post-internship').then((_) => _fetchInternships());
        },
        icon: const Icon(Icons.add),
        label: const Text('Post Job'),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color),
            const SizedBox(height: 12),
            Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 4),
            Text(title, style: TextStyle(fontSize: 14, color: Colors.grey.shade700, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
