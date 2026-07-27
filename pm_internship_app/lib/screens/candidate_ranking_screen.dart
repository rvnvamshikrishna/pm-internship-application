import 'package:flutter/material.dart';
import '../services/company_service.dart';

class CandidateRankingScreen extends StatefulWidget {
  final int internshipId;

  const CandidateRankingScreen({super.key, required this.internshipId});

  @override
  State<CandidateRankingScreen> createState() => _CandidateRankingScreenState();
}

class _CandidateRankingScreenState extends State<CandidateRankingScreen> {
  List<dynamic> _candidates = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchCandidates();
  }

  Future<void> _fetchCandidates() async {
    final matches = await CompanyService.getMatches(widget.internshipId);
    if (mounted) {
      setState(() {
        _candidates = matches;
        _isLoading = false;
      });
    }
  }

  Future<void> _updateStatus(int applicationId, String status) async {
    final success = await CompanyService.updateApplicationStatus(applicationId, status);
    if (success) {
      _fetchCandidates();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Marked as $status')),
        );
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update status')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Candidate Rankings (AI)')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _candidates.isEmpty
              ? const Center(child: Text('No candidates have applied yet.'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _candidates.length,
                  itemBuilder: (context, index) {
                    final candidate = _candidates[index];
                    final student = candidate['student'] ?? {};
                    final name = student['full_name'] ?? 'Unknown Student';
                    final university = student['college'] ?? 'Unknown Univ';
                    final matchScore = candidate['match_score'] ?? 0;
                    final status = candidate['status'] ?? 'applied';
                    final reasons = candidate['match_reasons'] as List<dynamic>? ?? [];

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      Text(university, style: TextStyle(color: Colors.grey[700])),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: Colors.green.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: Colors.green),
                                  ),
                                  child: Text(
                                    '${matchScore.round()}% Match',
                                    style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            if (reasons.isNotEmpty) ...[
                              const SizedBox(height: 12),
                              Text('AI Reasoning:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue[800])),
                              ...reasons.map((r) => Text('• $r', style: const TextStyle(fontSize: 13))),
                            ],
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Status: ${status.toUpperCase()}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: status == 'shortlisted' ? Colors.orange : (status == 'selected' ? Colors.green : Colors.grey),
                                  ),
                                ),
                                Row(
                                  children: [
                                    TextButton(
                                      onPressed: () => _updateStatus(candidate['application_id'], 'shortlisted'),
                                      child: const Text('Shortlist', style: TextStyle(color: Colors.orange)),
                                    ),
                                    TextButton(
                                      onPressed: () => _updateStatus(candidate['application_id'], 'rejected'),
                                      child: const Text('Reject', style: TextStyle(color: Colors.red)),
                                    ),
                                  ],
                                ),
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
