// Time-of-day greeting tied to the device's local clock.
// Morning: 00:00–11:59 · Afternoon: 12:00–16:59 · Evening: 17:00–23:59.
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
