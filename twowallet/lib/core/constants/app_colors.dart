import 'package:flutter/material.dart';

class AppColors {
  // Three-bucket brand colors
  static const mine = Color(0xFF378ADD);
  static const ours = Color(0xFF1D9E75);
  static const theirs = Color(0xFFBA7517);

  // Light fills (for badges, backgrounds)
  static const mineLight = Color(0xFFE6F1FB);
  static const oursLight = Color(0xFFE1F5EE);
  static const theirsLight = Color(0xFFFAEEDA);

  // Dark text on light fills
  static const mineDark = Color(0xFF0C447C);
  static const oursDark = Color(0xFF085041);
  static const theirsDark = Color(0xFF633806);

  static Color forBucket(String bucket) => switch (bucket) {
        'mine' => mine,
        'ours' => ours,
        'theirs' => theirs,
        _ => Colors.grey,
      };

  static Color lightForBucket(String bucket) => switch (bucket) {
        'mine' => mineLight,
        'ours' => oursLight,
        'theirs' => theirsLight,
        _ => Colors.grey.shade100,
      };
}
