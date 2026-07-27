class Internship {
  final int id;
  final String title;
  final String? companyName;
  final String? domain;
  final String? location;
  final String? workMode;
  final String? mode;
  final String? stipend;
  final String? duration;
  final String? ctc;
  final String? startDate;
  final String? experience;
  final String? perks;
  final double? matchScore;
  final List<String>? matchReasons;
  final String? description;
  final String? preferredSkills;

  Internship({
    required this.id,
    required this.title,
    this.companyName,
    this.domain,
    this.location,
    this.workMode,
    this.mode,
    this.stipend,
    this.duration,
    this.ctc,
    this.startDate,
    this.experience,
    this.perks,
    this.matchScore,
    this.matchReasons,
    this.description,
    this.preferredSkills,
  });

  factory Internship.fromJson(Map<String, dynamic> json) {
    return Internship(
      id: json['id'] ?? json['internship_id'] ?? 0,
      title: json['title'] ?? 'Unknown Title',
      companyName: json['company_name'],
      domain: json['domain'],
      location: json['location'],
      workMode: json['work_mode'],
      mode: json['mode'] ?? json['work_mode'],
      stipend: json['stipend']?.toString(),
      duration: json['duration'],
      ctc: json['ctc'],
      startDate: json['start_date'],
      experience: json['experience'],
      perks: json['perks'],
      matchScore: json['match_percentage'] != null 
          ? (json['match_percentage'] as num).toDouble() 
          : (json['match_score'] != null ? (json['match_score'] as num).toDouble() : null),
      matchReasons: json['reasons'] != null 
          ? List<String>.from(json['reasons']) 
          : (json['match_reasons'] != null ? List<String>.from(json['match_reasons']) : null),
      description: json['description'],
      preferredSkills: json['preferred_skills'],
    );
  }
}
