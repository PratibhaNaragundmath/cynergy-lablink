import { 
  BookingRequest, 
  LabResource, 
  ScoreBreakdown, 
  AlternativeSlot, 
  AllocationWeights 
} from '../../types';

export const DEFAULT_WEIGHTS: AllocationWeights = {
  deadlineUrgency: 0.30,   // 30%
  suitability: 0.25,       // 25%
  academicPriority: 0.20,  // 20%
  waitingTime: 0.15,       // 15%
  fairnessHistory: 0.10,   // 10%
};

/**
 * Checks if two time windows on the same date overlap
 */
export function isTimeOverlapping(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && endA > startB;
}

/**
 * Validates whether a requested booking conflicts with maintenance windows
 */
export function hasMaintenanceConflict(
  resource: LabResource,
  date: string,
  startTime: string,
  endTime: string
): boolean {
  if (!resource.maintenanceWindows || resource.maintenanceWindows.length === 0) {
    return false;
  }

  const requestedStart = `${date}T${startTime}:00`;
  const requestedEnd = `${date}T${endTime}:00`;

  return resource.maintenanceWindows.some((window) => {
    return requestedStart < window.end && requestedEnd > window.start;
  });
}

/**
 * Detects conflicts between a candidate booking and existing approved or pending bookings
 */
export function detectConflicts(
  candidate: {
    resourceId: string;
    requestedDate: string;
    startTime: string;
    endTime: string;
    id?: string;
  },
  existingBookings: BookingRequest[]
): {
  hasConflict: boolean;
  conflictingBookingIds: string[];
} {
  const conflicting = existingBookings.filter((b) => {
    // Only check against other bookings for the same resource on the same date
    if (b.resourceId !== candidate.resourceId) return false;
    if (b.requestedDate !== candidate.requestedDate) return false;
    if (b.id && candidate.id && b.id === candidate.id) return false;
    // Disregard cancelled or rejected bookings
    if (b.status === 'cancelled' || b.status === 'rejected') return false;

    return isTimeOverlapping(candidate.startTime, candidate.endTime, b.startTime, b.endTime);
  });

  return {
    hasConflict: conflicting.length > 0,
    conflictingBookingIds: conflicting.map((b) => b.id),
  };
}

/**
 * Computes Deadline Urgency Score (0 - 30 points)
 * Projects with immediate deadlines (< 3 days) receive maximum priority.
 */
export function calculateDeadlineScore(
  deadlineDateStr: string,
  requestedDateStr: string,
  maxPoints: number = 30
): number {
  const deadline = new Date(deadlineDateStr).getTime();
  const requested = new Date(requestedDateStr).getTime();

  const diffDays = Math.ceil((deadline - requested) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    // Past deadline or same day crisis
    return Math.round(maxPoints * 0.95);
  } else if (diffDays <= 2) {
    // Critical urgency (within 48 hours)
    return Math.round(maxPoints * 1.0);
  } else if (diffDays <= 5) {
    // High urgency (3-5 days)
    return Math.round(maxPoints * 0.85);
  } else if (diffDays <= 10) {
    // Moderate urgency (within 10 days)
    return Math.round(maxPoints * 0.65);
  } else if (diffDays <= 20) {
    // Standard timeframe
    return Math.round(maxPoints * 0.45);
  } else {
    // Far out in the future
    return Math.round(maxPoints * 0.25);
  }
}

/**
 * Computes Suitability Score (0 - 25 points)
 * Evaluates semantic match between project requirements and equipment capabilities/specs.
 */
export function calculateSuitabilityScore(
  requirements: string,
  projectDesc: string,
  resource: LabResource,
  maxPoints: number = 25
): number {
  const combinedText = `${requirements} ${projectDesc}`.toLowerCase();
  
  let matches = 0;
  const keywords = [
    ...resource.capabilities.map((c) => c.toLowerCase()),
    ...Object.values(resource.specifications).map((s) => s.toLowerCase()),
    resource.category.toLowerCase(),
  ];

  for (const kw of keywords) {
    const tokens = kw.split(/[\s,/-]+/).filter((t) => t.length > 3);
    for (const token of tokens) {
      if (combinedText.includes(token)) {
        matches++;
        break;
      }
    }
  }

  const matchRatio = keywords.length > 0 ? Math.min(1.0, (matches + 1) / Math.max(3, keywords.length * 0.5)) : 0.8;
  return Math.round(maxPoints * Math.max(0.4, matchRatio));
}

/**
 * Computes Academic/Project Priority Score (0 - 20 points)
 */
export function calculateAcademicPriorityScore(
  academicLevel: 'undergraduate' | 'postgraduate' | 'phd_research' | 'hackathon',
  justification: string,
  maxPoints: number = 20
): number {
  let baseMultiplier = 0.6; // default 12/20

  switch (academicLevel) {
    case 'hackathon':
      baseMultiplier = 0.95; // Hackathon submissions are time-bound
      break;
    case 'phd_research':
      baseMultiplier = 0.90;
      break;
    case 'postgraduate':
      baseMultiplier = 0.80;
      break;
    case 'undergraduate':
      baseMultiplier = 0.70;
      break;
  }

  // Bonus for detailed justifications
  if (justification && justification.length > 80) {
    baseMultiplier = Math.min(1.0, baseMultiplier + 0.1);
  }

  return Math.round(maxPoints * baseMultiplier);
}

/**
 * Computes Waiting Time Score (0 - 15 points)
 * Requests that have waited longer in pending status get priority.
 */
export function calculateWaitingTimeScore(
  createdAtStr: string,
  maxPoints: number = 15
): number {
  const created = new Date(createdAtStr).getTime();
  const now = Date.now();
  const waitingHours = Math.max(0, (now - created) / (1000 * 60 * 60));

  if (waitingHours > 48) {
    return maxPoints; // Waited > 2 days
  } else if (waitingHours > 24) {
    return Math.round(maxPoints * 0.85);
  } else if (waitingHours > 12) {
    return Math.round(maxPoints * 0.70);
  } else if (waitingHours > 4) {
    return Math.round(maxPoints * 0.50);
  } else {
    return Math.round(maxPoints * 0.30);
  }
}

/**
 * Computes Fairness & Previous Access Score (0 - 10 points)
 * Penalizes students who have frequently monopolized high-demand equipment.
 * Gives full points (10/10) to first-time or infrequent requesters.
 */
export function calculateFairnessScore(
  studentId: string,
  resourceId: string,
  historicalBookings: BookingRequest[],
  maxPoints: number = 10
): number {
  // Count approved bookings by this student for this resource in past 14 days
  const studentApproved = historicalBookings.filter(
    (b) => b.studentId === studentId && b.resourceId === resourceId && b.status === 'approved'
  );

  if (studentApproved.length === 0) {
    return maxPoints; // 10/10 - Excellent fairness (first-time requester)
  } else if (studentApproved.length === 1) {
    return Math.round(maxPoints * 0.75); // 8/10
  } else if (studentApproved.length === 2) {
    return Math.round(maxPoints * 0.50); // 5/10
  } else {
    return Math.round(maxPoints * 0.20); // 2/10 - Deprioritize monopolization
  }
}

/**
 * Full Evaluation & Scoring Engine
 */
export function evaluateBookingRequest(
  request: {
    studentId: string;
    resourceId: string;
    projectTitle: string;
    projectDescription: string;
    requirements: string;
    deadline: string;
    requestedDate: string;
    startTime: string;
    endTime: string;
    academicLevel: 'undergraduate' | 'postgraduate' | 'phd_research' | 'hackathon';
    priorityJustification: string;
    createdAt?: string;
    id?: string;
  },
  resource: LabResource,
  allBookings: BookingRequest[],
  weights: AllocationWeights = DEFAULT_WEIGHTS
): {
  scoreBreakdown: ScoreBreakdown;
  allocationScore: number;
  allocationExplanation: string;
  hasConflict: boolean;
  conflictingBookingIds: string[];
  alternativeSlots: AlternativeSlot[];
} {
  const createdAt = request.createdAt || new Date().toISOString();

  // 1. Calculate weighted scores
  const deadlineScore = calculateDeadlineScore(
    request.deadline,
    request.requestedDate,
    Math.round(weights.deadlineUrgency * 100)
  );

  const suitabilityScore = calculateSuitabilityScore(
    request.requirements,
    request.projectDescription,
    resource,
    Math.round(weights.suitability * 100)
  );

  const academicPriorityScore = calculateAcademicPriorityScore(
    request.academicLevel,
    request.priorityJustification,
    Math.round(weights.academicPriority * 100)
  );

  const waitingTimeScore = calculateWaitingTimeScore(
    createdAt,
    Math.round(weights.waitingTime * 100)
  );

  const fairnessScore = calculateFairnessScore(
    request.studentId,
    request.resourceId,
    allBookings,
    Math.round(weights.fairnessHistory * 100)
  );

  const totalScore = Math.min(
    100,
    Math.max(0, deadlineScore + suitabilityScore + academicPriorityScore + waitingTimeScore + fairnessScore)
  );

  const scoreBreakdown: ScoreBreakdown = {
    deadlineScore,
    suitabilityScore,
    academicPriorityScore,
    waitingTimeScore,
    fairnessScore,
    totalScore,
  };

  // 2. Check conflicts
  const conflictCheck = detectConflicts(
    {
      resourceId: request.resourceId,
      requestedDate: request.requestedDate,
      startTime: request.startTime,
      endTime: request.endTime,
      id: request.id,
    },
    allBookings
  );

  const maintenanceConflict = hasMaintenanceConflict(
    resource,
    request.requestedDate,
    request.startTime,
    request.endTime
  );

  const hasConflict = conflictCheck.hasConflict || maintenanceConflict;

  // 3. Alternative Slots Generator
  const alternativeSlots = generateAlternativeSlots(
    request,
    resource,
    allBookings
  );

  // 4. Generate transparent human-readable explanation
  const explanationParts: string[] = [];

  if (deadlineScore >= 25) {
    explanationParts.push(`deadline is imminent (${request.deadline}) requiring urgent allocation`);
  } else if (deadlineScore >= 18) {
    explanationParts.push(`project deadline is approaching steadily`);
  }

  if (suitabilityScore >= 20) {
    explanationParts.push(`high technical alignment with ${resource.name} capabilities`);
  }

  if (fairnessScore >= 8) {
    explanationParts.push(`student has no recent bookings on this scarce equipment`);
  } else {
    explanationParts.push(`fairness adjustment applied due to prior reservations`);
  }

  if (hasConflict) {
    explanationParts.push(`an overlapping reservation or maintenance window was detected, but alternative viable slots have been calculated`);
  } else {
    explanationParts.push(`the selected time window is currently conflict-free`);
  }

  const allocationExplanation = `Scored ${totalScore}/100: Recommended because ${explanationParts.join(', ')}.`;

  return {
    scoreBreakdown,
    allocationScore: totalScore,
    allocationExplanation,
    hasConflict,
    conflictingBookingIds: conflictCheck.conflictingBookingIds,
    alternativeSlots,
  };
}

/**
 * Generates viable non-conflicting alternative slots ranked by feasibility
 */
export function generateAlternativeSlots(
  request: {
    resourceId: string;
    requestedDate: string;
    startTime: string;
    endTime: string;
    id?: string;
  },
  resource: LabResource,
  allBookings: BookingRequest[]
): AlternativeSlot[] {
  const alternatives: AlternativeSlot[] = [];

  // Parse start and end hours
  const [reqStartH, reqStartM] = request.startTime.split(':').map(Number);
  const [reqEndH, reqEndM] = request.endTime.split(':').map(Number);
  const durationMinutes = (reqEndH * 60 + reqEndM) - (reqStartH * 60 + reqStartM);

  const baseDate = new Date(request.requestedDate);

  // Check candidate offsets: Same day (+2 hrs, +4 hrs, -2 hrs), Next day (+1 day), Day after (+2 days)
  const candidateOffsets: Array<{ dayOffset: number; startHour: number; label: string }> = [
    { dayOffset: 0, startHour: reqEndH, label: 'Same day (immediately after conflicting block)' },
    { dayOffset: 0, startHour: 9, label: 'Same day morning session' },
    { dayOffset: 0, startHour: 14, label: 'Same day afternoon session' },
    { dayOffset: 1, startHour: reqStartH, label: 'Next day (same time slot)' },
    { dayOffset: 1, startHour: 10, label: 'Next day morning' },
    { dayOffset: 2, startHour: reqStartH, label: 'Two days later (optimal window)' },
  ];

  for (const candidate of candidateOffsets) {
    const candidateDateObj = new Date(baseDate);
    candidateDateObj.setDate(candidateDateObj.getDate() + candidate.dayOffset);
    const dateStr = candidateDateObj.toISOString().split('T')[0];

    const slotStartH = candidate.startHour;
    const slotEndH = slotStartH + Math.floor(durationMinutes / 60);
    const slotEndM = (durationMinutes % 60);

    // Ensure within resource operational hours (e.g. 08:00 to 20:00)
    if (slotStartH < 8 || slotEndH > 20 || (slotEndH === 20 && slotEndM > 0)) {
      continue;
    }

    const startTimeStr = `${String(slotStartH).padStart(2, '0')}:00`;
    const endTimeStr = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

    // Skip if it's identical to the original requested slot
    if (dateStr === request.requestedDate && startTimeStr === request.startTime) {
      continue;
    }

    // Check if free from bookings
    const conflict = detectConflicts(
      {
        resourceId: request.resourceId,
        requestedDate: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        id: request.id,
      },
      allBookings
    );

    const maintConflict = hasMaintenanceConflict(resource, dateStr, startTimeStr, endTimeStr);

    if (!conflict.hasConflict && !maintConflict) {
      alternatives.push({
        id: `alt-${candidate.dayOffset}-${slotStartH}`,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        feasibilityRank: alternatives.length + 1,
        reason: candidate.label,
      });

      if (alternatives.length >= 3) break; // Limit to top 3 recommendations
    }
  }

  return alternatives;
}
