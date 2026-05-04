import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../data/services/revenue_cat_service.dart';
import '../../../data/services/analytics_service.dart';
import '../../../shared/providers/subscription_provider.dart';

class PaywallScreen extends ConsumerStatefulWidget {
  final bool canDismiss;
  final bool isWinBack;
  final String trigger;

  const PaywallScreen({
    super.key,
    this.canDismiss = true,
    this.isWinBack = false,
    this.trigger = 'settings',
  });

  @override
  ConsumerState<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends ConsumerState<PaywallScreen> {
  Offering? _offering;
  Package? _selectedPackage;
  bool _isLoading = true;
  bool _isPurchasing = false;
  String? _error;

  String get _trigger => widget.isWinBack ? 'winback' : widget.trigger;

  @override
  void initState() {
    super.initState();
    AnalyticsService.paywallViewed(_trigger);
    _loadOffering();
  }

  Future<void> _loadOffering() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final offering = await RevenueCatService.getCurrentOffering();
      if (offering == null) {
        setState(() {
          _error =
              'Subscriptions are not available right now. Please try again later.';
          _isLoading = false;
        });
        return;
      }

      final annual = offering.annual ??
          offering.availablePackages.firstWhere(
            (p) => p.packageType == PackageType.annual,
            orElse: () => offering.availablePackages.first,
          );

      setState(() {
        _offering = offering;
        _selectedPackage = annual;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Could not load subscription options.';
        _isLoading = false;
      });
    }
  }

  Future<void> _purchase() async {
    if (_selectedPackage == null) return;

    final packageType = _selectedPackage!.packageType == PackageType.annual
        ? 'annual'
        : 'monthly';

    setState(() => _isPurchasing = true);
    await AnalyticsService.subscriptionPurchaseAttempted(packageType);

    try {
      final success =
          await RevenueCatService.purchasePackage(_selectedPackage!);

      if (success && mounted) {
        await AnalyticsService.subscriptionPurchaseSucceeded(packageType);
        ref.invalidate(subscriptionStatusProvider);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Welcome to TwoWallet Premium!'),
            backgroundColor: Color(0xFF1D9E75),
          ),
        );
        context.go('/home');
      } else if (mounted) {
        setState(() => _isPurchasing = false);
      }
    } catch (e) {
      await AnalyticsService.subscriptionPurchaseFailed(packageType, e.toString());
      if (mounted) {
        setState(() {
          _error = 'Purchase failed. Please try again.';
          _isPurchasing = false;
        });
      }
    }
  }

  Future<void> _restore() async {
    setState(() => _isPurchasing = true);

    try {
      final hasAccess = await RevenueCatService.restorePurchases();

      if (mounted) {
        if (hasAccess) {
          await AnalyticsService.subscriptionRestored();
          ref.invalidate(subscriptionStatusProvider);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Subscription restored!'),
              backgroundColor: Color(0xFF1D9E75),
            ),
          );
          context.go('/home');
        } else {
          setState(() {
            _error = 'No active subscription found to restore.';
            _isPurchasing = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Restore failed.';
          _isPurchasing = false;
        });
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final subAsync = ref.watch(subscriptionStatusProvider);
    final isOnTrial =
        subAsync.valueOrNull?.status == 'trial';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: Stack(
          children: [
            if (widget.canDismiss)
              Positioned(
                top: 8,
                right: 8,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.black54),
                  onPressed: () {
                    AnalyticsService.paywallDismissed(_trigger);
                    if (Navigator.of(context).canPop()) {
                      Navigator.of(context).pop();
                    } else if (context.canPop()) {
                      context.pop();
                    } else {
                      context.go('/home');
                    }
                  },
                ),
              ),
            SingleChildScrollView(
              padding:
                  const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 32),

                  Center(
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1D9E75),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(Icons.favorite,
                          color: Colors.white, size: 40),
                    ),
                  ),

                  const SizedBox(height: 24),

                  Text(
                    widget.isWinBack
                        ? 'Welcome back to TwoWallet'
                        : 'TwoWallet Premium',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: Colors.black87,
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    widget.isWinBack
                        ? 'Pick up where you left off — subscribe to unlock premium features again.'
                        : 'Manage money together, beautifully.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      color: Colors.black54,
                    ),
                  ),

                  const SizedBox(height: 32),

                  const _FeatureRow(text: 'Weekly Money Date with AI insights'),
                  const _FeatureRow(
                      text: 'Auto-calculated fair split based on income'),
                  const _FeatureRow(
                      text: 'Unlimited goals with progress tracking'),
                  const _FeatureRow(
                      text: 'Private Pocket for surprise spending'),
                  const _FeatureRow(text: 'Spending analytics & trends'),
                  const _FeatureRow(text: 'Export your financial data'),

                  const SizedBox(height: 32),

                  if (_isLoading)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(32),
                        child: CircularProgressIndicator(
                            color: Color(0xFF1D9E75)),
                      ),
                    )
                  else if (_error != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline,
                              color: Colors.red.shade700),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _error!,
                              style: TextStyle(
                                  color: Colors.red.shade900, fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    )
                  else if (_offering != null)
                    Column(
                      children: _offering!.availablePackages.map((package) {
                        final isSelected =
                            _selectedPackage?.identifier == package.identifier;
                        final isAnnual =
                            package.packageType == PackageType.annual;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _PackageOption(
                            package: package,
                            isSelected: isSelected,
                            isBestValue: isAnnual,
                            onTap: () {
                            final pkgType = package.packageType == PackageType.annual
                                ? 'annual'
                                : 'monthly';
                            AnalyticsService.paywallPackageSelected(pkgType);
                            setState(() => _selectedPackage = package);
                          },
                          ),
                        );
                      }).toList(),
                    ),

                  const SizedBox(height: 24),

                  FilledButton(
                    onPressed:
                        _isPurchasing || _selectedPackage == null ? null : _purchase,
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF1D9E75),
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    child: _isPurchasing
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2),
                          )
                        : Text(
                            'Subscribe',
                            style: GoogleFonts.inter(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),

                  if (isOnTrial) ...[
                    const SizedBox(height: 8),
                    OutlinedButton(
                      onPressed: _isPurchasing ? null : () {
                        if (Navigator.of(context).canPop()) {
                          Navigator.of(context).pop();
                        } else if (context.canPop()) {
                          context.pop();
                        } else {
                          context.go('/home');
                        }
                      },
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 52),
                        side: const BorderSide(color: Color(0xFF1D9E75)),
                        foregroundColor: const Color(0xFF1D9E75),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        'Continue with free trial',
                        style: GoogleFonts.inter(fontSize: 15),
                      ),
                    ),
                  ],

                  const SizedBox(height: 8),

                  TextButton(
                    onPressed: _isPurchasing ? null : _restore,
                    child: Text(
                      'Restore purchases',
                      style: GoogleFonts.inter(
                          fontSize: 14, color: Colors.black54),
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(
                    'Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                        fontSize: 11, color: Colors.black45),
                  ),

                  const SizedBox(height: 8),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      TextButton(
                        onPressed: () => _launchUrl('https://twowallet.app/privacy'),
                        child: Text(
                          'Privacy Policy',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.black54,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                      const Text(' • ', style: TextStyle(color: Colors.black45)),
                      TextButton(
                        onPressed: () => _launchUrl(
                          'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
                        ),
                        child: Text(
                          'Terms of Use',
                          style: GoogleFonts.inter(
                            fontSize: 12,
                            color: Colors.black54,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureRow extends StatelessWidget {
  final String text;
  const _FeatureRow({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              color: Color(0xFF1D9E75),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check, color: Colors.white, size: 14),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: GoogleFonts.inter(fontSize: 14, color: Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}

class _PackageOption extends StatelessWidget {
  final Package package;
  final bool isSelected;
  final bool isBestValue;
  final VoidCallback onTap;

  const _PackageOption({
    required this.package,
    required this.isSelected,
    required this.isBestValue,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final price = package.storeProduct.priceString;
    final period =
        package.packageType == PackageType.annual ? 'year' : 'month';

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF1D9E75).withOpacity(0.05)
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                isSelected ? const Color(0xFF1D9E75) : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFF1D9E75)
                      : Colors.grey.shade400,
                  width: 2,
                ),
                color:
                    isSelected ? const Color(0xFF1D9E75) : Colors.transparent,
              ),
              child: isSelected
                  ? const Icon(Icons.check, color: Colors.white, size: 16)
                  : null,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        package.packageType == PackageType.annual
                            ? 'Yearly'
                            : 'Monthly',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (isBestValue) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1D9E75),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'BEST VALUE',
                            style: GoogleFonts.inter(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '$price / $period',
                    style: GoogleFonts.inter(
                        fontSize: 14, color: Colors.black54),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
