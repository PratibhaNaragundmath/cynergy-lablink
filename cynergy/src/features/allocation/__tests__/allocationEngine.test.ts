import { describe, it, expect, beforeEach } from 'vitest';
import { 
  isTimeOverlapping, 
  detectConflicts, 
  calculateDeadlineScore, 
  calculateSuitabilityScore, 
  calculateFairnessScore, 
  evaluateBookingRequest,
  generateAlternativeSlots 
} from '../allocationEngine';
import { storageService } from '../../../services/storageService';
import { geminiService } from '../../../services/geminiService';
import { LabResource, BookingRequest } from '../../../types';

const mockResource: LabResource = {
  id: 'test-gpu-1',
  name: 'NVIDIA A100 GPU Workstation',
  category: 'Workstation / GPU',
  departmentId: 'dept-aids',
  departmentName: 'Artificial Intelligence & Data Science',
  description: 'Enterprise AI node with PyTorch, CUDA, and high memory.',
  specifications: {
    'GPU': 'NVIDIA A100 80GB',
    'CUDA': 'CUDA 12.4',
    'RAM': '512GB DDR4',
  },
  location: 'Turing Room 402',
  imageUrl: 'https://example.com/gpu.jpg',
  quantity: 1,
  status: 'available',
  maintenanceWindows: [
    {
      id: 'mw-test',
      start: '2026-11-28T10:00:00',
      end: '2026-11-28T14:00:00',
      reason: 'Scheduled diagnostic',
    },
  ],
  operatingHours: { start: '08:00', end: '20:00' },
  facultyContact: { name: 'Dr. Test', email: 'test@campus.edu' },
  usageInstructions: ['Use Docker only'],
  capabilities: ['PyTorch', 'TensorFlow', 'LLM Fine-tuning', 'CUDA Acceleration'],
  dailyOperationalHours: 12,
  createdAt: '2026-08-01T00:00:00Z',
};

describe('Intelligent Fair Allocation Engine', () => {
  beforeEach(() => {
    storageService.resetToSeedData();
  });

  it('1. Detection of overlapping time slots correctly identifies collisions', () => {
    // Overlapping slots
    expect(isTimeOverlapping('10:00', '14:00', '11:00', '15:00')).toBe(true);
    expect(isTimeOverlapping('10:00', '14:00', '09:00', '11:00')).toBe(true);
    expect(isTimeOverlapping('10:00', '14:00', '10:30', '13:30')).toBe(true);
  });

  it('2. Acceptance of non-overlapping slots', () => {
    // Non-overlapping slots (adjacent or separate)
    expect(isTimeOverlapping('10:00', '14:00', '14:00', '18:00')).toBe(false);
    expect(isTimeOverlapping('10:00', '14:00', '08:00', '10:00')).toBe(false);
    expect(isTimeOverlapping('10:00', '12:00', '15:00', '17:00')).toBe(false);
  });

  it('3. Allocation scoring gives highest deadline score to immediate capstones', () => {
    // Deadline in 1 day vs deadline in 30 days
    const urgentScore = calculateDeadlineScore('2026-11-25', '2026-11-24', 30);
    const relaxedScore = calculateDeadlineScore('2026-12-25', '2026-11-24', 30);

    expect(urgentScore).toBe(30); // Max points for critical deadline
    expect(relaxedScore).toBeLessThan(urgentScore);
  });

  it('4. Suitability scoring gives higher match to relevant frameworks', () => {
    const highMatch = calculateSuitabilityScore(
      'PyTorch CUDA 12.4 LLM training',
      'Training large vision transformer model',
      mockResource,
      25
    );

    const lowMatch = calculateSuitabilityScore(
      'Civil concrete tensile testing',
      'Hydraulic compression test',
      mockResource,
      25
    );

    expect(highMatch).toBeGreaterThan(lowMatch);
  });

  it('5. Fairness adjustment penalizes repeated equipment monopolization', () => {
    const historicalBookings: BookingRequest[] = [
      {
        id: 'prior-1',
        studentId: 'monopolizing-student',
        resourceId: 'test-gpu-1',
        status: 'approved',
      } as any,
      {
        id: 'prior-2',
        studentId: 'monopolizing-student',
        resourceId: 'test-gpu-1',
        status: 'approved',
      } as any,
      {
        id: 'prior-3',
        studentId: 'monopolizing-student',
        resourceId: 'test-gpu-1',
        status: 'approved',
      } as any,
    ];

    const firstTimeStudentScore = calculateFairnessScore('new-student', 'test-gpu-1', historicalBookings, 10);
    const repeatedStudentScore = calculateFairnessScore('monopolizing-student', 'test-gpu-1', historicalBookings, 10);

    expect(firstTimeStudentScore).toBe(10);
    expect(repeatedStudentScore).toBeLessThan(firstTimeStudentScore);
  });

  it('6. Alternative slot recommendations are generated when a conflict occurs', () => {
    const existingBookings: BookingRequest[] = [
      {
        id: 'existing-1',
        resourceId: 'test-gpu-1',
        requestedDate: '2026-11-25',
        startTime: '10:00',
        endTime: '14:00',
        status: 'approved',
      } as any,
    ];

    const alternatives = generateAlternativeSlots(
      {
        resourceId: 'test-gpu-1',
        requestedDate: '2026-11-25',
        startTime: '11:00',
        endTime: '15:00',
      },
      mockResource,
      existingBookings
    );

    expect(alternatives.length).toBeGreaterThan(0);
    // Check that suggested alternative does not collide with 10:00 - 14:00 on Nov 25
    const sameDay = alternatives.find((a) => a.date === '2026-11-25');
    if (sameDay) {
      expect(isTimeOverlapping(sameDay.startTime, sameDay.endTime, '10:00', '14:00')).toBe(false);
    }
  });

  it('7. Prevention of double booking through authoritative atomic validation', () => {
    const bookings = storageService.getBookings();
    
    // Attempt to approve book-flagship-1
    const res1 = storageService.approveBooking('book-flagship-1', 'faculty-1', 'Dr. Ananya Iyer');
    expect(res1.success).toBe(true);

    // Attempt to approve conflicting book-flagship-2 in overlapping slot
    const res2 = storageService.approveBooking('book-flagship-2', 'faculty-1', 'Dr. Ananya Iyer');
    expect(res2.success).toBe(false);
    expect(res2.message).toContain('already approved');
  });

  it('8. Faculty rejection requires a mandatory reason', () => {
    const emptyReasonResult = storageService.rejectBooking('book-flagship-1', '', 'faculty-1', 'Dr. Ananya Iyer');
    expect(emptyReasonResult.success).toBe(false);

    const validReasonResult = storageService.rejectBooking(
      'book-flagship-1',
      'Requires Vivado installation prerequisite.',
      'faculty-1',
      'Dr. Ananya Iyer'
    );
    expect(validReasonResult.success).toBe(true);
  });

  it('9. Gemini AI Assistant provides deterministic reasoning fallback with real resources', async () => {
    const response = await geminiService.sendMessage(
      'I need equipment for training a vision transformer deep learning model',
      []
    );

    expect(response.sender).toBe('assistant');
    expect(response.text.toLowerCase()).toContain('nvidia a100');
    expect(response.recommendedResources?.length).toBeGreaterThan(0);
  });

  it('10. Successful resource discovery and inventory count', () => {
    const resources = storageService.getResources();
    expect(resources.length).toBeGreaterThanOrEqual(12);

    const departments = storageService.getDepartments();
    expect(departments.length).toBeGreaterThanOrEqual(6);
  });
});
