import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/timezone.dart' as tz;
import 'package:timezone/data/latest.dart' as tz_data;
import 'package:twowallet/shared/providers/subscription_provider.dart';

class NotificationService {
  static final _plugin = FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  static Future<void> init() async {
    if (_initialized) return;

    tz_data.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Australia/Sydney'));

    const settings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      ),
    );

    await _plugin.initialize(settings);
    _initialized = true;
  }

  static Future<void> scheduleMoneyDate({
    required int dayOfWeek,
    required int hour,
  }) async {
    await _plugin.cancel(0); // Only cancel the money date notification.

    final now = tz.TZDateTime.now(tz.local);

    int daysUntil = (dayOfWeek - now.weekday + 7) % 7;
    if (daysUntil == 0 && now.hour >= hour) daysUntil = 7;

    final scheduled = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day + daysUntil,
      hour,
    );

    await _plugin.zonedSchedule(
      0,
      'Your Money Date is ready',
      '3 things to talk about this week — takes 5 minutes.',
      scheduled,
      _moneyDateDetails(),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime,
    );
  }

  static Future<void> scheduleTrialNotifications(
      SubscriptionStatus sub) async {
    await cancelTrialNotifications();

    if (sub.trialEndsAt == null) return;

    final now = tz.TZDateTime.now(tz.local);
    final trialEnd = tz.TZDateTime.from(sub.trialEndsAt!, tz.local);

    final threeDaysBefore = trialEnd.subtract(const Duration(days: 3));
    if (threeDaysBefore.isAfter(now)) {
      await _plugin.zonedSchedule(
        100,
        'Your TwoWallet trial ends in 3 days',
        'Subscribe to keep Money Date, Goals, and all premium features.',
        threeDaysBefore,
        _subscriptionDetails(),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );
    }

    final oneDayBefore = trialEnd.subtract(const Duration(days: 1));
    if (oneDayBefore.isAfter(now)) {
      await _plugin.zonedSchedule(
        101,
        'Last day of your TwoWallet trial',
        "Don't lose your goals and Money Date insights — subscribe today.",
        oneDayBefore,
        _subscriptionDetails(),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );
    }

    if (trialEnd.isAfter(now)) {
      await _plugin.zonedSchedule(
        102,
        'Your TwoWallet trial has ended',
        'Subscribe anytime to unlock premium features again.',
        trialEnd,
        _subscriptionDetails(),
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
      );
    }
  }

  static Future<void> cancelTrialNotifications() async {
    await _plugin.cancel(100);
    await _plugin.cancel(101);
    await _plugin.cancel(102);
  }

  static Future<void> cancelAll() async {
    await _plugin.cancelAll();
  }

  static NotificationDetails _moneyDateDetails() => const NotificationDetails(
        android: AndroidNotificationDetails(
          'money_date',
          'Money Date',
          channelDescription: 'Weekly Money Date reminders',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      );

  static NotificationDetails _subscriptionDetails() =>
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'subscription',
          'Subscription',
          channelDescription: 'TwoWallet subscription reminders',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      );
}
