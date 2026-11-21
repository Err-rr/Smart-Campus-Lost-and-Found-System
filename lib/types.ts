export type Role = 'student' | 'staff' | 'desk' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  rollNo?: string;
}

export interface Category {
  id: string;
  name: string;
}

export type LostReportStatus = 'open' | 'matched' | 'closed';

export interface LostReport {
  id: string; // LR-0001
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  locationLost: string;
  dateLost: string; // ISO
  photo?: string;
  status: LostReportStatus;
}

export type FoundItemStatus = 'in_custody' | 'claim_pending' | 'returned' | 'unclaimed';

export interface FoundItem {
  id: string; // FI-0001
  reportedBy: string; // userId
  handedInBy?: string;
  categoryId: string;
  title: string;
  publicDescription: string;
  /** Visible only to desk staff and admin. Used to verify ownership. */
  hiddenDetails: string;
  locationFound: string;
  dateFound: string; // ISO
  photo?: string;
  heldAt: string; // desk name
  status: FoundItemStatus;
}

export type MatchFactor = 'category' | 'keywords' | 'location' | 'date';

export type MatchStatus = 'suggested' | 'confirmed' | 'dismissed';

export interface Match {
  id: string;
  lostReportId: string;
  foundItemId: string;
  matchScore: number; // 0 to 100
  breakdown: Record<MatchFactor, number>;
  status: MatchStatus;
  matchedOn: string; // ISO
}

export type ClaimStatus = 'submitted' | 'approved' | 'rejected' | 'handed_over';

export interface Claim {
  id: string; // CL-0001
  foundItemId: string;
  userId: string;
  lostReportId?: string;
  proofOfOwnership: string;
  lostOn?: string; // ISO, when the claimant says it was lost
  lostAt?: string; // where the claimant says it was lost
  status: ClaimStatus;
  submittedOn: string; // ISO
  rejectionReason?: string;
  handoverDate?: string; // ISO
  handedOverBy?: string; // desk user id
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  createdAt: string; // ISO
  read: boolean;
  channel: 'email and SMS, simulated';
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entity: 'LostReport' | 'FoundItem' | 'Match' | 'Claim' | 'User' | 'Category' | 'Settings';
  entityId: string;
  timestamp: string; // ISO
  details?: string; // extra context, e.g. the new role
}

export interface Settings {
  matchThreshold: number;
  unclaimedDays: number;
}

export interface DemoData {
  users: User[];
  categories: Category[];
  lostReports: LostReport[];
  foundItems: FoundItem[];
  matches: Match[];
  claims: Claim[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  settings: Settings;
}
