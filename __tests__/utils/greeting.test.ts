import { getGreeting } from '@/utils/greeting';

function at(hour: number): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
}

describe('getGreeting', () => {
  it('says good morning before noon', () => {
    expect(getGreeting(at(0))).toBe('Good morning');
    expect(getGreeting(at(8))).toBe('Good morning');
    expect(getGreeting(at(11))).toBe('Good morning');
  });

  it('says good afternoon from noon to 4:59pm', () => {
    expect(getGreeting(at(12))).toBe('Good afternoon');
    expect(getGreeting(at(16))).toBe('Good afternoon');
  });

  it('says good evening from 5pm', () => {
    expect(getGreeting(at(17))).toBe('Good evening');
    expect(getGreeting(at(23))).toBe('Good evening');
  });
});
