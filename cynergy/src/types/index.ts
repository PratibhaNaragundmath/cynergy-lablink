export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  building: string;
  labCount: number;
  contactEmail: string;
}

export type ResourceStatus = 'available' | 'in-use' | 'maintenance' | 'reserved';
export type ResourceCategory = 
  | 'Workstation / GPU' 
  | 'Embedded & IoT' 
  | 'Prototyping & Fabrication' 
  | 'Testing & Measurement' 
  | 'Robotics & Automation' 
  | 'High-Performance Computing';

export interface MaintenanceWindow {
  id: string;
  start: string; // ISO string or YYYY-MM-DD HH:mm
  end: string;
  reason: string;
}

export interface LabResource {
  id: string;
  name: string;
  category: ResourceCategory;
  departmentId: string;
  departmentName: string;
  description: string;
  specifications: Record<string, string>;
  location: string;
  imageUrl: string;
  quantity: number;
  status: ResourceStatus;
  maintenanceWindows: MaintenanceWindow[];
  operatingHours: {
    start: string; // "08:00"
    end: string;   // "20:00"
  };
  facultyContact: {
    name: string;
    email: string;
    phone?: string;
  };
  usageInstructions: string[];
  capabilities: string[];
  dailyOperationalHours: number; // e.g. 12 hours (08:00 to 20:00)
  createdAt: string;
}

export type BookingStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'alternative_suggested' 
  | 'cancelled' 
  | 'completed';

export interface ScoreBreakdown {
  deadlineScore: number;        // Max 30 points (30% weight)
  suitabilityScore: number;     // Max 25 points (25% weight)
  academicPriorityScore: number;// Max 20 points (20% weight)
  waitingTimeScore: number;     // Max 15 points (15% weight)
  fairnessScore: number;        // Max 10 points (10% weight)
  totalScore: number;           // 0 - 100
}

export interface AlternativeSlot {
  id: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  feasibilityRank: number; // 1 = best
  reason: string;
}

export interface BookingRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  resourceId: string;
  resourceName: string;
  departmentId: string;
  projectTitle: string;
  projectDescription: string;
  requirements: string;
  requiredSpecifications?: string;
  priorityJustification: string;
  academicLevel: 'undergraduate' | 'postgraduate' | 'phd_research' | 'hackathon';
  deadline: string; // YYYY-MM-DD
  requestedDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationHours: number;
  status: BookingStatus;
  allocationScore: number;
  scoreBreakdown: ScoreBreakdown;
  allocationExplanation: string;
  alternativeSlots: AlternativeSlot[];
  facultyId?: string;
  facultyName?: string;
  rejectionReason?: string;
  approvedSlot?: {
    date: string;
    startTime: string;
    endTime: string;
  };
  conflictDetected: boolean;
  conflictingBookingIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'conflict' | 'system' | 'alternative';
  read: boolean;
  relatedRequestId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetId: string;
  targetType: 'booking' | 'resource' | 'user' | 'department';
  details: string;
  timestamp: string;
}

export interface AllocationWeights {
  deadlineUrgency: number;   // 0.30
  suitability: number;       // 0.25
  academicPriority: number;  // 0.20
  waitingTime: number;       // 0.15
  fairnessHistory: number;   // 0.10
}
