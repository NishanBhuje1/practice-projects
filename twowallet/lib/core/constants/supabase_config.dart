class SupabaseConfig {
  static const url = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://wdhhwzsawkfxtxvmjrnb.supabase.co',
  );

  static const anonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkaGh3enNhd2tmeHR4dm1qcm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNDg1NTIsImV4cCI6MjA4OTYyNDU1Mn0.YP7VcYjwDg1Aq-CriUIJC0Bw7Mx6O2B49bbjVrnpohA',
  );
}
