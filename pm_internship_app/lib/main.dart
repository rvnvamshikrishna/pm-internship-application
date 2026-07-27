import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

import 'screens/splash_screen.dart';
import 'screens/role_selection_screen.dart';
import 'screens/login_screen.dart';
import 'screens/registration_screen.dart';
import 'screens/student_dashboard_screen.dart';
import 'screens/company_dashboard_screen.dart';
import 'screens/student_profile_builder_screen.dart';
import 'screens/internship_details_screen.dart';
import 'screens/my_applications_screen.dart';
import 'screens/company_profile_builder_screen.dart';
import 'screens/post_internship_screen.dart';
import 'screens/candidate_ranking_screen.dart';
import 'screens/admin_analytics_screen.dart';
import 'models/internship.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        Provider.value(value: 'placeholder'),
      ],
      child: const PMInternshipApp(),
    ),
  );
}

final GoRouter _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/role',
      builder: (context, state) => const RoleSelectionScreen(),
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) {
        final role = state.uri.queryParameters['role'] ?? 'student';
        return LoginScreen(role: role);
      },
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) {
        final role = state.uri.queryParameters['role'] ?? 'student';
        return RegistrationScreen(role: role);
      },
    ),
    GoRoute(
      path: '/student/dashboard',
      builder: (context, state) => const StudentDashboardScreen(),
    ),
    GoRoute(
      path: '/student/profile',
      builder: (context, state) => const StudentProfileBuilderScreen(),
    ),
    GoRoute(
      path: '/internship/details',
      builder: (context, state) {
        final internship = state.extra as Internship;
        return InternshipDetailsScreen(internship: internship);
      },
    ),
    GoRoute(
      path: '/student/applications',
      builder: (context, state) => const MyApplicationsScreen(),
    ),
    GoRoute(
      path: '/company/dashboard',
      builder: (context, state) => const CompanyDashboardScreen(),
    ),
    GoRoute(
      path: '/company/profile',
      builder: (context, state) => const CompanyProfileBuilderScreen(),
    ),
    GoRoute(
      path: '/company/post-internship',
      builder: (context, state) => const PostInternshipScreen(),
    ),
    GoRoute(
      path: '/company/internship/:id/candidates',
      builder: (context, state) {
        final id = int.parse(state.pathParameters['id']!);
        return CandidateRankingScreen(internshipId: id);
      },
    ),
    GoRoute(
      path: '/admin',
      builder: (context, state) => const AdminAnalyticsScreen(),
    ),
  ],
);

class PMInternshipApp extends StatelessWidget {
  const PMInternshipApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'PM Internship Engine',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF008BDC), // Internshala blue
          primary: const Color(0xFF008BDC),
          secondary: const Color(0xFF06B6D4),
          background: const Color(0xFFF8F9FA), // Clean web light grey/blue
          surface: Colors.white,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme).apply(
          bodyColor: const Color(0xFF1E293B),
          displayColor: const Color(0xFF0F172A),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
          iconTheme: IconThemeData(color: Color(0xFF1E293B)),
          titleTextStyle: TextStyle(
            color: Color(0xFF0F172A),
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            backgroundColor: const Color(0xFF008BDC),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Color(0xFF008BDC), width: 1.5),
          ),
          hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 2,
          shadowColor: Colors.black.withOpacity(0.08),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFFF1F5F9)),
          ),
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: const Color(0xFFEEF2FF),
          labelTextStyle: MaterialStateProperty.all(
            const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ),
      ),
      routerConfig: _router,
    );
  }
}
