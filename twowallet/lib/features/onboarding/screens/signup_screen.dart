import 'dart:io' show Platform;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/auth_error_messages.dart';
import '../../../shared/providers/auth_provider.dart';

class SignUpScreen extends ConsumerStatefulWidget {
  const SignUpScreen({super.key});

  @override
  ConsumerState<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends ConsumerState<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _loading = false;
  bool _showPassword = false;
  String? _errorMessage;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() { _loading = true; _errorMessage = null; });

    try {
      await ref.read(authServiceProvider).signUpPartnerA(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        displayName: _nameController.text.trim(),
        monthlyIncomeNetAud: null,
      );
      if (mounted) context.go('/onboarding');
    } catch (e) {
      setState(() => _errorMessage = friendlyAuthError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signUpWithGoogle() async {
    setState(() { _loading = true; _errorMessage = null; });
    try {
      await ref.read(authServiceProvider).signInWithGoogle();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyAuthError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signUpWithApple() async {
    setState(() { _loading = true; _errorMessage = null; });
    try {
      await ref.read(authServiceProvider).signInWithApple();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyAuthError(e))),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => context.go('/onboarding'),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Let\'s set up your account',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 24),

              // Apple Sign In — iOS only
              if (Platform.isIOS) ...[
                _SocialAuthButton(
                  onPressed: _loading ? null : _signUpWithApple,
                  icon: const Icon(Icons.apple, color: Colors.white, size: 22),
                  label: 'Sign up with Apple',
                  backgroundColor: Colors.black,
                  textColor: Colors.white,
                ),
                const SizedBox(height: 12),
              ],

              // Google Sign In — Android only
              if (!Platform.isIOS) ...[
                _SocialAuthButton(
                  onPressed: _loading ? null : _signUpWithGoogle,
                  icon: const _GoogleIcon(),
                  label: 'Sign up with Google',
                  backgroundColor: Colors.white,
                  textColor: Colors.black87,
                  borderColor: Colors.grey.shade300,
                ),
                const SizedBox(height: 12),
              ],

              // OR divider
              Row(
                children: [
                  Expanded(child: Divider(color: Colors.grey.shade300)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      'OR',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Expanded(child: Divider(color: Colors.grey.shade300)),
                ],
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Your first name',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                textCapitalization: TextCapitalization.words,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter your name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  hintText: 'you@example.com',
                  prefixIcon: Icon(Icons.email_outlined),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter your email';
                  }
                  final emailRegex =
                      RegExp(r'^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$');
                  if (!emailRegex.hasMatch(value.trim())) {
                    return 'Please enter a valid email address';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _passwordController,
                obscureText: !_showPassword,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'At least 6 characters',
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(_showPassword
                        ? Icons.visibility_off
                        : Icons.visibility),
                    onPressed: () =>
                        setState(() => _showPassword = !_showPassword),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a password';
                  }
                  if (value.length < 6) {
                    return 'Password needs at least 6 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              TextFormField(
                controller: _confirmPasswordController,
                obscureText: !_showPassword,
                decoration: const InputDecoration(
                  labelText: 'Confirm password',
                  prefixIcon: Icon(Icons.lock_outline),
                ),
                validator: (value) {
                  if (value != _passwordController.text) {
                    return 'Passwords don\'t match';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              if (_errorMessage != null) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline,
                          color: Colors.red.shade700, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(
                              color: Colors.red.shade900, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Continue'),
                ),
              ),
              const SizedBox(height: 16),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/signin'),
                  child: const Text('Already have an account? Sign in'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SocialAuthButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final Widget icon;
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final Color? borderColor;

  const _SocialAuthButton({
    required this.onPressed,
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: backgroundColor,
          side: BorderSide(color: borderColor ?? backgroundColor),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            icon,
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _GoogleIcon extends StatelessWidget {
  const _GoogleIcon();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(2),
      ),
      child: const Center(
        child: Text(
          'G',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Color(0xFF4285F4),
          ),
        ),
      ),
    );
  }
}
