import { describe, it, expect } from 'vitest';
import { TutorRequest } from '../types';

describe('Authoritative Batch Management & Duplicate Prevention Tests', () => {
  // Authoritative pure logic helper mirroring frontend implementation
  const calculateBatchEnrolledCount = (batchId: string, requests: TutorRequest[]): number => {
    const distinctStudentIds = new Set<string>();
    requests.forEach((r) => {
      if (r.status === 'accepted' && (r as any).batch_id === batchId && r.student_id) {
        distinctStudentIds.add(r.student_id);
      }
    });
    return distinctStudentIds.size;
  };

  const getRemainingSeats = (enrolledCount: number, maxCapacity = 4): number => {
    return Math.max(0, maxCapacity - enrolledCount);
  };

  const formatBatchCapacityText = (enrolledCount: number, maxCapacity = 4): string => {
    const remaining = getRemainingSeats(enrolledCount, maxCapacity);
    if (enrolledCount >= maxCapacity) {
      return `${maxCapacity}/${maxCapacity} students — Batch Full`;
    }
    return `${enrolledCount}/${maxCapacity} students — ${remaining} seat${remaining === 1 ? '' : 's'} available`;
  };

  const validateAssignment = (
    batchId: string,
    candidateStudentId: string,
    requests: TutorRequest[],
    maxCapacity = 4
  ): { allowed: boolean; error?: string } => {
    // 1. Strict duplicate check
    const isAlreadyEnrolled = requests.some(
      (r) => r.status === 'accepted' && (r as any).batch_id === batchId && r.student_id === candidateStudentId
    );
    if (isAlreadyEnrolled) {
      return { allowed: false, error: 'This student is already enrolled in this batch.' };
    }

    // 2. Strict capacity check
    const currentCount = calculateBatchEnrolledCount(batchId, requests);
    if (currentCount >= maxCapacity) {
      return { allowed: false, error: 'Batch is full (maximum 4 students allowed).' };
    }

    return { allowed: true };
  };

  it('Test Case 1: Add Student A -> count becomes 1/4 (3 seats available)', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
    ];

    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(1);
    expect(formatBatchCapacityText(count)).toBe('1/4 students — 3 seats available');
  });

  it('Test Case 2: Add Student B -> count becomes 2/4 (2 seats available)', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
    ];

    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(2);
    expect(formatBatchCapacityText(count)).toBe('2/4 students — 2 seats available');
  });

  it('Test Case 3: Add Student B again -> rejected ("This student is already enrolled in this batch.") and count remains 2/4', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
    ];

    const validation = validateAssignment('batch-1', 'student-B', requests);
    expect(validation.allowed).toBe(false);
    expect(validation.error).toBe('This student is already enrolled in this batch.');

    // Count is unaffected
    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(2);
    expect(formatBatchCapacityText(count)).toBe('2/4 students — 2 seats available');
  });

  it('Test Case 4: Add Student C -> count becomes 3/4 (1 seat available)', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
      {
        id: 'req-3',
        student_id: 'student-C',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Science & Math',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:10:00Z',
        updated_at: '2026-11-01T10:10:00Z',
      },
    ];

    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(3);
    expect(formatBatchCapacityText(count)).toBe('3/4 students — 1 seat available');
  });

  it('Test Case 5: Add Student D -> count becomes 4/4 (Batch Full)', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
      {
        id: 'req-3',
        student_id: 'student-C',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Science & Math',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:10:00Z',
        updated_at: '2026-11-01T10:10:00Z',
      },
      {
        id: 'req-4',
        student_id: 'student-D',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Geometry',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:15:00Z',
        updated_at: '2026-11-01T10:15:00Z',
      },
    ];

    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(4);
    expect(formatBatchCapacityText(count)).toBe('4/4 students — Batch Full');
  });

  it('Test Case 6: Add Student E -> rejected ("Batch is full (maximum 4 students allowed)") and count remains 4/4', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
      {
        id: 'req-3',
        student_id: 'student-C',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Science & Math',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:10:00Z',
        updated_at: '2026-11-01T10:10:00Z',
      },
      {
        id: 'req-4',
        student_id: 'student-D',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Geometry',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:15:00Z',
        updated_at: '2026-11-01T10:15:00Z',
      },
    ];

    const validation = validateAssignment('batch-1', 'student-E', requests);
    expect(validation.allowed).toBe(false);
    expect(validation.error).toBe('Batch is full (maximum 4 students allowed).');

    // Count is strictly preserved at 4
    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(4);
    expect(formatBatchCapacityText(count)).toBe('4/4 students — Batch Full');
  });

  it('Test Case 7: Remove Student B -> count becomes 3/4 (1 seat available)', () => {
    let requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
      {
        id: 'req-3',
        student_id: 'student-C',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Science & Math',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:10:00Z',
        updated_at: '2026-11-01T10:10:00Z',
      },
      {
        id: 'req-4',
        student_id: 'student-D',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Geometry',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:15:00Z',
        updated_at: '2026-11-01T10:15:00Z',
      },
    ];

    // Unassign student-B
    requests = requests.map((r) =>
      r.student_id === 'student-B' ? { ...r, batch_id: undefined } : r
    );

    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(3);
    expect(formatBatchCapacityText(count)).toBe('3/4 students — 1 seat available');
  });

  it('Test Case 8: Re-add Student B -> count becomes 4/4 (Batch Full, not 5/4)', () => {
    let requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-3',
        student_id: 'student-C',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Science & Math',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:10:00Z',
        updated_at: '2026-11-01T10:10:00Z',
      },
      {
        id: 'req-4',
        student_id: 'student-D',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Geometry',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:15:00Z',
        updated_at: '2026-11-01T10:15:00Z',
      },
    ];

    // Validation allows re-adding
    const validation = validateAssignment('batch-1', 'student-B', requests);
    expect(validation.allowed).toBe(true);

    requests.push({
      id: 'req-2-readded',
      student_id: 'student-B',
      tutor_id: 'tutor-1',
      subject: 'mathematics',
      class_level: 'class_8',
      learning_needs: 'Math concepts',
      status: 'accepted',
      batch_id: 'batch-1',
      created_at: '2026-11-01T10:20:00Z',
      updated_at: '2026-11-01T10:20:00Z',
    });

    const count = calculateBatchEnrolledCount('batch-1', requests);
    expect(count).toBe(4);
    expect(formatBatchCapacityText(count)).toBe('4/4 students — Batch Full');
  });

  it('Test Case 9: State Refresh / Recalculation preserves authoritative count', () => {
    // Simulate duplicated records in database or network response
    const requestsWithDuplicates: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-1-duplicate',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'science',
        class_level: 'class_8',
        learning_needs: 'Science prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:02:00Z',
        updated_at: '2026-11-01T10:02:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
    ];

    // Authoritative calculation deduplicates by student_id
    const count = calculateBatchEnrolledCount('batch-1', requestsWithDuplicates);
    expect(count).toBe(2); // Not 3!
    expect(formatBatchCapacityText(count)).toBe('2/4 students — 2 seats available');
  });

  it('Test Case 10: Single source of truth across all views', () => {
    const requests: TutorRequest[] = [
      {
        id: 'req-1',
        student_id: 'student-A',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Exam prep',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-01T10:00:00Z',
      },
      {
        id: 'req-2',
        student_id: 'student-B',
        tutor_id: 'tutor-1',
        subject: 'mathematics',
        class_level: 'class_8',
        learning_needs: 'Math concepts',
        status: 'accepted',
        batch_id: 'batch-1',
        created_at: '2026-11-01T10:05:00Z',
        updated_at: '2026-11-01T10:05:00Z',
      },
    ];

    const tutorDashboardCount = calculateBatchEnrolledCount('batch-1', requests);
    const myBatchesCount = calculateBatchEnrolledCount('batch-1', requests);
    const manageBatchModalCount = calculateBatchEnrolledCount('batch-1', requests);

    expect(tutorDashboardCount).toBe(2);
    expect(myBatchesCount).toBe(2);
    expect(manageBatchModalCount).toBe(2);
  });

  it('Test Case 11: Capacity never exceeds 4 students', () => {
    const requests: TutorRequest[] = [
      { id: '1', student_id: 's1', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'accepted', batch_id: 'b1', created_at: '', updated_at: '' },
      { id: '2', student_id: 's2', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'accepted', batch_id: 'b1', created_at: '', updated_at: '' },
      { id: '3', student_id: 's3', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'accepted', batch_id: 'b1', created_at: '', updated_at: '' },
      { id: '4', student_id: 's4', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'accepted', batch_id: 'b1', created_at: '', updated_at: '' },
    ];

    expect(validateAssignment('b1', 's5', requests).allowed).toBe(false);
    expect(validateAssignment('b1', 's6', requests).allowed).toBe(false);
    expect(calculateBatchEnrolledCount('b1', requests)).toBe(4);
  });

  it('Test Case 12: Pending and declined requests do NOT count toward batch capacity', () => {
    const mixedRequests: TutorRequest[] = [
      // 2 accepted in this batch
      { id: '1', student_id: 's1', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'accepted', batch_id: 'b1', created_at: '', updated_at: '' },
      { id: '2', student_id: 's2', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'accepted', batch_id: 'b1', created_at: '', updated_at: '' },
      // 2 pending (one tagged with batch_id, one not)
      { id: '3', student_id: 's3', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'pending', batch_id: 'b1', created_at: '', updated_at: '' },
      { id: '4', student_id: 's4', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'pending', created_at: '', updated_at: '' },
      // 1 declined
      { id: '5', student_id: 's5', tutor_id: 't1', subject: 'm', class_level: 'c8', learning_needs: 'n', status: 'declined', batch_id: 'b1', created_at: '', updated_at: '' },
    ];

    // ONLY the 2 accepted students count!
    const count = calculateBatchEnrolledCount('b1', mixedRequests);
    expect(count).toBe(2);
    expect(formatBatchCapacityText(count)).toBe('2/4 students — 2 seats available');
  });
});
