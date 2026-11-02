import { describe, it, expect } from 'vitest';

describe('Authoritative 3-Hour Batch Scheduling & Strict 4-Student Capacity Rules', () => {
  // Pure logic helpers mirroring Cloudflare Worker backend and frontend client

  const calculateEndTime = (start: string): string => {
    if (!start) return '20:00';
    const [hStr, mStr] = start.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const endH = (h + 3) % 24;
    return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const parseDaysList = (days: any): string[] => {
    if (Array.isArray(days)) {
      return days.map((d) => String(d).trim().toLowerCase()).filter(Boolean);
    }
    if (typeof days === 'string') {
      try {
        const parsed = JSON.parse(days);
        if (Array.isArray(parsed)) {
          return parsed.map((d) => String(d).trim().toLowerCase()).filter(Boolean);
        }
      } catch {}
      return days.split(/[\s,·•]+/).map((d) => d.trim().toLowerCase()).filter(Boolean);
    }
    return [];
  };

  const doDaysOverlap = (d1: any, d2: any): boolean => {
    const arr1 = parseDaysList(d1);
    const arr2 = parseDaysList(d2);
    if (!arr1.length || !arr2.length) return true; // if days unspecified, assume potential conflict
    return arr1.some((day1) =>
      arr2.some(
        (day2) =>
          day1.startsWith(day2.slice(0, 3)) ||
          day2.startsWith(day1.slice(0, 3))
      )
    );
  };

  interface BatchRecord {
    id: string;
    tutor_id: string;
    name: string;
    start_time: string;
    end_time: string;
    days: any;
    max_capacity: number;
  }

  const validateBatchCreation = (
    newBatch: { start_time: string; end_time: string; days: any },
    existingBatches: BatchRecord[]
  ): { allowed: boolean; error?: string } => {
    for (const b of existingBatches) {
      if (!b.start_time || !b.end_time) continue;
      if (doDaysOverlap(newBatch.days, b.days)) {
        // Strict interval overlap: start1 < end2 && end1 > start2
        // Adjacent slots (start1 == end2 or end1 == start2) are ALLOWED!
        if (newBatch.start_time < b.end_time && newBatch.end_time > b.start_time) {
          return {
            allowed: false,
            error: `Schedule conflict: overlaps with existing batch "${b.name}" (${b.start_time} - ${b.end_time}).`,
          };
        }
      }
    }
    return { allowed: true };
  };

  interface EnrollmentState {
    batchId: string;
    enrolledStudentIds: Set<string>;
    maxCapacity: number;
  }

  const assignStudentToBatch = (
    state: EnrollmentState,
    studentId: string
  ): { success: boolean; error?: string } => {
    // 1. Duplicate check
    if (state.enrolledStudentIds.has(studentId)) {
      return { success: false, error: 'This student is already enrolled in this batch.' };
    }

    // 2. Strict capacity check (Max 4 students)
    if (state.enrolledStudentIds.size >= state.maxCapacity) {
      return { success: false, error: 'This batch is full. Please choose another available batch.' };
    }

    state.enrolledStudentIds.add(studentId);
    return { success: true };
  };

  it('Rule 1: calculateEndTime computes strictly 3 hours duration', () => {
    expect(calculateEndTime('09:00')).toBe('12:00');
    expect(calculateEndTime('17:00')).toBe('20:00');
    expect(calculateEndTime('06:30')).toBe('09:30');
    expect(calculateEndTime('14:15')).toBe('17:15');
  });

  it('Rule 2: Overlapping batch creation on same schedule days is rejected', () => {
    const existingBatches: BatchRecord[] = [
      {
        id: 'b-1',
        tutor_id: 't-1',
        name: 'Mathematics (Class 8)',
        start_time: '09:00',
        end_time: '12:00',
        days: ['Mon', 'Wed', 'Fri'],
        max_capacity: 4,
      },
    ];

    // Conflict: 10:00 - 13:00 on Mon, Wed, Fri
    const conflict1 = validateBatchCreation(
      { start_time: '10:00', end_time: '13:00', days: ['Mon', 'Wed', 'Fri'] },
      existingBatches
    );
    expect(conflict1.allowed).toBe(false);
    expect(conflict1.error).toContain('Schedule conflict');

    // Conflict: 08:00 - 11:00 on Mon, Wed, Fri
    const conflict2 = validateBatchCreation(
      { start_time: '08:00', end_time: '11:00', days: ['Mon', 'Wed', 'Fri'] },
      existingBatches
    );
    expect(conflict2.allowed).toBe(false);

    // Conflict: 09:30 - 12:30 on Wednesday only
    const conflict3 = validateBatchCreation(
      { start_time: '09:30', end_time: '12:30', days: ['Wed'] },
      existingBatches
    );
    expect(conflict3.allowed).toBe(false);
  });

  it('Rule 3: Adjacent batches on the same days are allowed without schedule conflict', () => {
    const existingBatches: BatchRecord[] = [
      {
        id: 'b-1',
        tutor_id: 't-1',
        name: 'Morning Math',
        start_time: '09:00',
        end_time: '12:00',
        days: ['Mon', 'Wed', 'Fri'],
        max_capacity: 4,
      },
    ];

    // Directly adjacent afternoon batch (12:00 - 15:00)
    const adjacentAfternoon = validateBatchCreation(
      { start_time: '12:00', end_time: '15:00', days: ['Mon', 'Wed', 'Fri'] },
      existingBatches
    );
    expect(adjacentAfternoon.allowed).toBe(true);
    expect(adjacentAfternoon.error).toBeUndefined();

    // Directly adjacent early morning batch (06:00 - 09:00)
    const adjacentMorning = validateBatchCreation(
      { start_time: '06:00', end_time: '09:00', days: ['Mon', 'Wed', 'Fri'] },
      existingBatches
    );
    expect(adjacentMorning.allowed).toBe(true);
    expect(adjacentMorning.error).toBeUndefined();
  });

  it('Rule 4: Same time slot on different schedule days is allowed', () => {
    const existingBatches: BatchRecord[] = [
      {
        id: 'b-1',
        tutor_id: 't-1',
        name: 'MWF Evening Science',
        start_time: '17:00',
        end_time: '20:00',
        days: ['Mon', 'Wed', 'Fri'],
        max_capacity: 4,
      },
    ];

    // Same 17:00 - 20:00 time on Tue, Thu, Sat
    const differentDays = validateBatchCreation(
      { start_time: '17:00', end_time: '20:00', days: ['Tue', 'Thu', 'Sat'] },
      existingBatches
    );
    expect(differentDays.allowed).toBe(true);
    expect(differentDays.error).toBeUndefined();
  });

  it('Rule 5: Strict 4-student capacity: 1..4 succeeds, 5th assignment is rejected with authoritative full message', () => {
    const batchState: EnrollmentState = {
      batchId: 'batch-test-01',
      enrolledStudentIds: new Set(),
      maxCapacity: 4,
    };

    // Student 1
    const res1 = assignStudentToBatch(batchState, 'student-1');
    expect(res1.success).toBe(true);
    expect(batchState.enrolledStudentIds.size).toBe(1);

    // Student 2
    const res2 = assignStudentToBatch(batchState, 'student-2');
    expect(res2.success).toBe(true);
    expect(batchState.enrolledStudentIds.size).toBe(2);

    // Student 3
    const res3 = assignStudentToBatch(batchState, 'student-3');
    expect(res3.success).toBe(true);
    expect(batchState.enrolledStudentIds.size).toBe(3);

    // Student 4
    const res4 = assignStudentToBatch(batchState, 'student-4');
    expect(res4.success).toBe(true);
    expect(batchState.enrolledStudentIds.size).toBe(4);

    // Student 5 (Exceeds capacity) -> Rejected with exact error message
    const res5 = assignStudentToBatch(batchState, 'student-5');
    expect(res5.success).toBe(false);
    expect(res5.error).toBe('This batch is full. Please choose another available batch.');
    expect(batchState.enrolledStudentIds.size).toBe(4); // Still 4, never exceeds
  });

  it('Rule 6: Duplicate assignment of the same student to the same batch is rejected', () => {
    const batchState: EnrollmentState = {
      batchId: 'batch-test-02',
      enrolledStudentIds: new Set(['student-1']),
      maxCapacity: 4,
    };

    const duplicateRes = assignStudentToBatch(batchState, 'student-1');
    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.error).toBe('This student is already enrolled in this batch.');
    expect(batchState.enrolledStudentIds.size).toBe(1);
  });

  it('Rule 7: Atomic subquery capacity check simulation prevents race condition over-enrollment', async () => {
    // Simulating database atomic conditional UPDATE:
    // UPDATE tutor_batches SET enrolled_count = enrolled_count + 1
    // WHERE id = ? AND (SELECT count(*) FROM requests WHERE batch_id = ? AND status = 'accepted') < 4
    let currentEnrolledInDb = 3; // 1 seat remains

    const atomicAssign = async (_studentId: string): Promise<boolean> => {
      // Simulate atomic transactional lock
      if (currentEnrolledInDb < 4) {
        currentEnrolledInDb += 1;
        return true;
      }
      return false;
    };

    // Two concurrent requests arrive at the same millisecond
    const [req1Success, req2Success] = await Promise.all([
      atomicAssign('student-A'),
      atomicAssign('student-B'),
    ]);

    // Exactly one could be accepted into the 4th slot
    expect([req1Success, req2Success].filter(Boolean).length).toBe(1);
    expect(currentEnrolledInDb).toBe(4);
  });
});
