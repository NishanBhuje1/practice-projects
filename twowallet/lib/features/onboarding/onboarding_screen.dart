import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/services/auth_service.dart';
import '../../shared/providers/auth_provider.dart';
import 'onboarding_controller.dart';
import 'onboarding_page.dart';

class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final _controller = PageController();
  int _currentPage = 0;
  final int _totalPages = 4;

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  void _prevPage() {
    if (_currentPage > 0) {
      _controller.previousPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final isLoggedIn = ref.read(authUserProvider).value != null;
      if (isLoggedIn && _currentPage == 0) {
        _controller.jumpToPage(3);
      }
    });
  }

  Future<void> _complete() async {
    await OnboardingController.markOnboardingComplete();
    await OnboardingController.markSetupComplete();
    if (mounted) context.go('/home');
  }

  Future<void> _goToSignup() async {
    await OnboardingController.markOnboardingComplete();
    if (mounted) context.go('/onboarding/signup');
  }

  Future<void> _goToSignin() async {
    await OnboardingController.markOnboardingComplete();
    if (mounted) context.go('/signin');
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Column(
          children: [
            // Header: back button + progress indicator
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 12, 24, 0),
              child: Row(
                children: [
                  AnimatedOpacity(
                    opacity: _currentPage > 0 ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 200),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                      color: Colors.black87,
                      onPressed: _currentPage > 0 ? _prevPage : null,
                    ),
                  ),
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_totalPages, (i) {
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: _currentPage == i ? 24 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: _currentPage == i
                                ? const Color(0xFF1D9E75)
                                : Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        );
                      }),
                    ),
                  ),
                  const SizedBox(width: 40), // balance the back button width
                ],
              ),
            ),

            // Page view
            Expanded(
              child: PageView(
                controller: _controller,
                onPageChanged: (i) => setState(() => _currentPage = i),
                children: [
                  _Page1(onGetStarted: _nextPage, onLogin: _goToSignin),
                  _Page2(onNext: _nextPage),
                  _Page3(onSignUp: _goToSignup),
                  _Page4(onSolo: _complete),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Page 1 — Value proposition ────────────────────────────────────────────────

class _Page1 extends StatelessWidget {
  final VoidCallback onGetStarted;
  final VoidCallback onLogin;

  const _Page1({required this.onGetStarted, required this.onLogin});

  @override
  Widget build(BuildContext context) {
    return OnboardingPage(
      content: Column(
        children: [
          const Spacer(flex: 2),

          // Illustration
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: const Color(0xFF1D9E75).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.favorite,
              size: 56,
              color: Color(0xFF1D9E75),
            ),
          ),
          const SizedBox(height: 40),

          // Title
          Text(
            'Money is better\ntogether.',
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 34,
              fontWeight: FontWeight.w800,
              color: Colors.black87,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 16),

          // Subtitle
          Text(
            'Track spending, split fairly, and\nreach goals as a couple.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 16,
              color: Colors.grey.shade500,
              height: 1.5,
            ),
          ),

          const Spacer(flex: 3),

          // Buttons
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: onGetStarted,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF1D9E75),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Get started',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),

          TextButton(
            onPressed: onLogin,
            child: Text(
              'Log in',
              style: GoogleFonts.inter(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: Colors.grey.shade500,
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Page 2 — Features ─────────────────────────────────────────────────────────

class _Page2 extends StatelessWidget {
  final VoidCallback onNext;

  const _Page2({required this.onNext});

  @override
  Widget build(BuildContext context) {
    return OnboardingPage(
      content: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 40),

          Text(
            'Built for\ncouples.',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 34,
              fontWeight: FontWeight.w800,
              color: Colors.black87,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Everything you need to manage\nmoney as a team.',
            style: GoogleFonts.inter(
              fontSize: 15,
              color: Colors.grey.shade500,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 32),

          const FeatureCard(
            icon: Icons.receipt_long_outlined,
            title: 'Track together',
            subtitle: 'See exactly where your money goes.',
            color: Color(0xFF378ADD),
          ),
          const SizedBox(height: 12),
          const FeatureCard(
            icon: Icons.balance_outlined,
            title: 'Split fairly',
            subtitle: 'No awkward money conversations.',
            color: Color(0xFF1D9E75),
          ),
          const SizedBox(height: 12),
          const FeatureCard(
            icon: Icons.flag_outlined,
            title: 'Reach goals',
            subtitle: 'Save for things you both want.',
            color: Color(0xFFBA7517),
          ),

          const Spacer(),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: onNext,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF1D9E75),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Continue',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Page 3 — Create account ───────────────────────────────────────────────────

class _Page3 extends StatelessWidget {
  final VoidCallback onSignUp;

  const _Page3({required this.onSignUp});

  @override
  Widget build(BuildContext context) {
    return OnboardingPage(
      content: Column(
        children: [
          const Spacer(flex: 2),

          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: const Color(0xFF1D9E75).withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.person_add_outlined,
              size: 56,
              color: Color(0xFF1D9E75),
            ),
          ),
          const SizedBox(height: 40),

          Text(
            'Create your\naccount',
            textAlign: TextAlign.center,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 34,
              fontWeight: FontWeight.w800,
              color: Colors.black87,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 16),

          Text(
            'Set up your profile to start\ntracking money together.',
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 16,
              color: Colors.grey.shade500,
              height: 1.5,
            ),
          ),

          const Spacer(flex: 3),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton(
              onPressed: onSignUp,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF1D9E75),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'Create account',
                style: GoogleFonts.inter(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Page 4 — Invite partner ───────────────────────────────────────────────────

class _Page4 extends ConsumerWidget {
  final VoidCallback onSolo;

  const _Page4({required this.onSolo});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final partnerAsync = ref.watch(myPartnerProvider);

    return partnerAsync.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => Center(
        child: Text('Something went wrong.',
            style: GoogleFonts.inter(color: Colors.grey.shade500)),
      ),
      data: (partner) {
        if (partner == null) {
          // Not signed up yet — prompt them
          return OnboardingPage(
            content: Column(
              children: [
                const Spacer(flex: 2),
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: const Color(0xFF378ADD).withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.group_add_outlined,
                      size: 56, color: Color(0xFF378ADD)),
                ),
                const SizedBox(height: 40),
                Text(
                  'Invite your\npartner',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 34,
                    fontWeight: FontWeight.w800,
                    color: Colors.black87,
                    height: 1.15,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Create an account first to\ngenerate your invite link.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(
                      fontSize: 16,
                      color: Colors.grey.shade500,
                      height: 1.5),
                ),
                const Spacer(flex: 3),
                TextButton(
                  onPressed: onSolo,
                  child: Text('Skip for now',
                      style: GoogleFonts.inter(
                          fontSize: 15,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey.shade500)),
                ),
                const SizedBox(height: 24),
              ],
            ),
          );
        }

        final inviteLink =
            AuthService().generateInviteLink(partner.householdId);

        return OnboardingPage(
          content: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 40),
              Text(
                'Invite your\npartner',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 34,
                  fontWeight: FontWeight.w800,
                  color: Colors.black87,
                  height: 1.15,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Send this link to your partner so they can join your household.',
                style: GoogleFonts.inter(
                    fontSize: 15,
                    color: Colors.grey.shade500,
                    height: 1.5),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        inviteLink,
                        style: GoogleFonts.inter(
                            fontSize: 13, color: Colors.black87),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy, size: 20),
                      color: const Color(0xFF1D9E75),
                      onPressed: () {
                        Clipboard.setData(ClipboardData(text: inviteLink));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Invite link copied')),
                        );
                      },
                    ),
                  ],
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: onSolo,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF1D9E75),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    'Continue to app',
                    style: GoogleFonts.inter(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      },
    );
  }
}
