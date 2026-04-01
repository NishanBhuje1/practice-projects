import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';

class AppShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;
  const AppShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: navigationShell,
      floatingActionButton: _CenterFab(
        onPressed: () => context.push('/add-transaction'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Container(
            height: 64,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Row(
              children: [
                _NavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home_rounded,
                  label: 'Home',
                  selected: navigationShell.currentIndex == 0,
                  onTap: () => navigationShell.goBranch(0,
                      initialLocation: navigationShell.currentIndex == 0),
                ),
                _NavItem(
                  icon: Icons.receipt_long_outlined,
                  activeIcon: Icons.receipt_long_rounded,
                  label: 'Spending',
                  selected: navigationShell.currentIndex == 1,
                  onTap: () => navigationShell.goBranch(1,
                      initialLocation: navigationShell.currentIndex == 1),
                ),
                _NavItem(
                  icon: Icons.balance_outlined,
                  activeIcon: Icons.balance_rounded,
                  label: 'Fair split',
                  selected: navigationShell.currentIndex == 2,
                  onTap: () => navigationShell.goBranch(2,
                      initialLocation: navigationShell.currentIndex == 2),
                ),
                _NavItem(
                  icon: Icons.flag_outlined,
                  activeIcon: Icons.flag_rounded,
                  label: 'Goals',
                  selected: navigationShell.currentIndex == 3,
                  onTap: () => navigationShell.goBranch(3,
                      initialLocation: navigationShell.currentIndex == 3),
                ),
                _NavItem(
                  icon: Icons.bar_chart_outlined,
                  activeIcon: Icons.bar_chart_rounded,
                  label: 'Analytics',
                  selected: navigationShell.currentIndex == 4,
                  onTap: () => navigationShell.goBranch(4,
                      initialLocation: navigationShell.currentIndex == 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Center FAB ────────────────────────────────────────────────────────────────

class _CenterFab extends StatefulWidget {
  final VoidCallback onPressed;
  const _CenterFab({required this.onPressed});

  @override
  State<_CenterFab> createState() => _CenterFabState();
}

class _CenterFabState extends State<_CenterFab> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        widget.onPressed();
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.91 : 1.0,
        duration: const Duration(milliseconds: 130),
        curve: Curves.easeInOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 130),
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: AppColors.ours,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppColors.ours.withValues(alpha: _pressed ? 0.2 : 0.38),
                blurRadius: _pressed ? 8 : 18,
                offset: Offset(0, _pressed ? 2 : 4),
              ),
            ],
          ),
          child: const Icon(Icons.add, color: Colors.white, size: 24),
        ),
      ),
    );
  }
}

// ── Nav item ──────────────────────────────────────────────────────────────────

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 36,
              height: 28,
              decoration: BoxDecoration(
                color: selected
                    ? AppColors.ours.withValues(alpha: 0.15)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                selected ? activeIcon : icon,
                size: 18,
                color: selected ? AppColors.ours : Colors.grey.shade400,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                color: selected ? AppColors.ours : Colors.grey.shade400,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
