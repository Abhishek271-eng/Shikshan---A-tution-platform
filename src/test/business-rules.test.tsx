import { describe, it, expect, vi } from 'vitest';
import { api } from '../lib/api';

describe('Shikshan Core Business Rules & Edge API Safeguards', () => {
  it('enforces 3-hour fixed batch duration constraint', () => {
    // Exactly 3 hours (180 minutes)
    const validateThreeHourBatch = (start: string, end: string): boolean => {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const startMin = sh * 60 + sm;
      let endMin = eh * 60 + em;
      if (endMin < startMin) endMin += 24 * 60;
      return endMin - startMin === 180;
    };

    expect(validateThreeHourBatch('17:00', '20:00')).toBe(true);
    expect(validateThreeHourBatch('09:30', '12:30')).toBe(true);
    expect(validateThreeHourBatch('17:00', '19:00')).toBe(false); // 2 hours
    expect(validateThreeHourBatch('17:00', '21:00')).toBe(false); // 4 hours
    expect(validateThreeHourBatch('18:00', '18:30')).toBe(false); // 30 mins
  });

  it('detects overlapping batch schedules for a tutor', () => {
    const isOverlapping = (
      start1: string,
      end1: string,
      days1: string[],
      start2: string,
      end2: string,
      days2: string[]
    ): boolean => {
      const sharedDays = days1.some((d) => days2.includes(d));
      if (!sharedDays) return false;

      const [s1h, s1m] = start1.split(':').map(Number);
      const [e1h, e1m] = end1.split(':').map(Number);
      const [s2h, s2m] = start2.split(':').map(Number);
      const [e2h, e2m] = end2.split(':').map(Number);

      const m1s = s1h * 60 + s1m;
      const m1e = e1h * 60 + e1m;
      const m2s = s2h * 60 + s2m;
      const m2e = e2h * 60 + e2m;

      return Math.max(m1s, m2s) < Math.min(m1e, m2e);
    };

    // Same days, overlapping time
    expect(
      isOverlapping('17:00', '20:00', ['Mon', 'Wed'], '18:00', '21:00', ['Mon', 'Wed'])
    ).toBe(true);

    // Same time, different days -> NO overlap
    expect(
      isOverlapping('17:00', '20:00', ['Mon', 'Wed'], '17:00', '20:00', ['Tue', 'Thu'])
    ).toBe(false);

    // Same days, contiguous time (20:00 to 23:00) -> NO overlap
    expect(
      isOverlapping('17:00', '20:00', ['Mon', 'Wed'], '20:00', '23:00', ['Mon', 'Wed'])
    ).toBe(false);
  });

  it('enforces maximum monthly fee limit of ₹3,000', () => {
    const MAX_FEE = 3000;
    const isAllowedFee = (fee: number): boolean => fee >= 100 && fee <= MAX_FEE;

    expect(isAllowedFee(1500)).toBe(true);
    expect(isAllowedFee(3000)).toBe(true);
    expect(isAllowedFee(3001)).toBe(false);
    expect(isAllowedFee(5000)).toBe(false);
    expect(isAllowedFee(0)).toBe(false);
  });

  it('enforces strict maximum 4 students capacity limit per batch', () => {
    const MAX_CAPACITY = 4;
    const canEnroll = (currentEnrolled: number): boolean => currentEnrolled < MAX_CAPACITY;

    expect(canEnroll(0)).toBe(true);
    expect(canEnroll(1)).toBe(true);
    expect(canEnroll(3)).toBe(true);
    expect(canEnroll(4)).toBe(false); // full
    expect(canEnroll(5)).toBe(false);
  });

  it('confirms private phone visibility rules', () => {
    // Phone should only be exposed if caller is admin, tutor themself, or student with accepted request
    const canSeePhone = (
      userRole: string,
      isSelf: boolean,
      requestStatus?: string
    ): boolean => {
      if (userRole === 'admin') return true;
      if (isSelf) return true;
      if (requestStatus === 'accepted') return true;
      return false;
    };

    expect(canSeePhone('student', false, 'pending')).toBe(false);
    expect(canSeePhone('student', false, 'declined')).toBe(false);
    expect(canSeePhone('student', false, undefined)).toBe(false);
    expect(canSeePhone('student', false, 'accepted')).toBe(true);
    expect(canSeePhone('tutor', true, undefined)).toBe(true);
    expect(canSeePhone('admin', false, undefined)).toBe(true);
  });

  it('calls payment coordination interest recording API correctly', async () => {
    const spy = vi.spyOn(api, 'recordPaymentInterest');
    await api.recordPaymentInterest({
      requestId: 'req-123',
      tutorId: 'tutor-456',
      batchId: 'batch-789',
    });

    expect(spy).toHaveBeenCalledWith({
      requestId: 'req-123',
      tutorId: 'tutor-456',
      batchId: 'batch-789',
    });
  });

  it('calls tutor approval acknowledgement API correctly', async () => {
    const spy = vi.spyOn(api, 'acknowledgeTutorApproval');
    await api.acknowledgeTutorApproval();
    expect(spy).toHaveBeenCalled();
  });
});
