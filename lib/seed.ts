import type {
  AuditLog,
  Category,
  Claim,
  DemoData,
  FoundItem,
  LostReport,
  Match,
  Notification,
  User,
} from './types';
import { scorePair } from './matching';

export const CAMPUS_LOCATIONS = [
  'Central Library',
  'Academic Block',
  'Admin Block',
  'Sports Complex',
  'Boys Hostel',
  'Girls Hostel',
  'Canteen',
  'OAT',
  'Mechanical Workshop',
] as const;

export const DESKS = [
  'Central Lost and Found Desk',
  'Central Library Desk',
  'Admin Block Help Desk',
  'Sports Complex Office',
  'Boys Hostel Office',
  'Girls Hostel Office',
] as const;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Builds a fresh copy of the demo data with dates relative to `now`. */
export function createSeedData(now: Date = new Date()): DemoData {
  const at = (days: number, hours = 0) =>
    new Date(now.getTime() - days * DAY - hours * HOUR).toISOString();

  const users: User[] = [
    {
      id: 'u-aarav',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@dtu.ac.in',
      phone: '+91 98110 24118',
      role: 'student',
      rollNo: '24/CO/118',
    },
    {
      id: 'u-priya',
      name: 'Priya Nair',
      email: 'priya.nair@dtu.ac.in',
      phone: '+91 98710 23045',
      role: 'student',
      rollNo: '23/EC/045',
    },
    {
      id: 'u-rohan',
      name: 'Rohan Verma',
      email: 'rohan.verma@dtu.ac.in',
      phone: '+91 99580 25207',
      role: 'student',
      rollNo: '25/ME/207',
    },
    {
      id: 'u-meera',
      name: 'Dr. Meera Iyer',
      email: 'meera.iyer@dtu.ac.in',
      phone: '+91 98180 40211',
      role: 'staff',
    },
    {
      id: 'u-sunil',
      name: 'Sunil Kumar',
      email: 'sunil.kumar@dtu.ac.in',
      phone: '+91 98990 11420',
      role: 'desk',
    },
    {
      id: 'u-kavita',
      name: 'Kavita Rao',
      email: 'kavita.rao@dtu.ac.in',
      phone: '+91 98100 30577',
      role: 'admin',
    },
  ];

  const categories: Category[] = [
    { id: 'cat-electronics', name: 'Electronics' },
    { id: 'cat-books', name: 'Books' },
    { id: 'cat-bags', name: 'Bags' },
    { id: 'cat-accessories', name: 'Accessories' },
    { id: 'cat-cards', name: 'Cards and IDs' },
    { id: 'cat-clothing', name: 'Clothing' },
    { id: 'cat-keys', name: 'Keys' },
    { id: 'cat-others', name: 'Others' },
  ];

  const lostReports: LostReport[] = [
    {
      id: 'LR-0001',
      userId: 'u-aarav',
      categoryId: 'cat-electronics',
      title: 'iPhone 13',
      description:
        'Blue iPhone 13 in a clear case with a sticker on the back. Lock screen shows a photo of a beach.',
      locationLost: 'Academic Block',
      dateLost: at(1, 6),
      status: 'matched',
    },
    {
      id: 'LR-0002',
      userId: 'u-aarav',
      categoryId: 'cat-electronics',
      title: 'Scientific calculator',
      description: 'Casio fx-991ES Plus. My name is written on the back cover in marker.',
      locationLost: 'Mechanical Workshop',
      dateLost: at(5),
      status: 'matched',
    },
    {
      id: 'LR-0003',
      userId: 'u-aarav',
      categoryId: 'cat-electronics',
      title: 'Wired earphones',
      description: 'White wired earphones with a 3.5 mm jack, kept in a small black pouch.',
      locationLost: 'Central Library',
      dateLost: at(19),
      status: 'closed',
    },
    {
      id: 'LR-0004',
      userId: 'u-priya',
      categoryId: 'cat-clothing',
      title: 'Grey hoodie',
      description: 'Plain grey zip hoodie, size M. Left pocket is torn.',
      locationLost: 'Girls Hostel',
      dateLost: at(10),
      status: 'open',
    },
    {
      id: 'LR-0005',
      userId: 'u-priya',
      categoryId: 'cat-books',
      title: 'Engineering Drawing textbook',
      description: 'N.D. Bhatt, Engineering Drawing. Name written on the first page.',
      locationLost: 'Academic Block',
      dateLost: at(13),
      status: 'open',
    },
    {
      id: 'LR-0006',
      userId: 'u-priya',
      categoryId: 'cat-bags',
      title: 'Black backpack',
      description: 'Black Wildcraft backpack with a laptop sleeve and a steel bottle in the side pocket.',
      locationLost: 'OAT',
      dateLost: at(2, 3),
      status: 'matched',
    },
    {
      id: 'LR-0007',
      userId: 'u-rohan',
      categoryId: 'cat-keys',
      title: 'Hostel room keys',
      description: 'Two keys on a red keyring with a paper tag for room 214.',
      locationLost: 'Boys Hostel',
      dateLost: at(0, 9),
      status: 'matched',
    },
    {
      id: 'LR-0008',
      userId: 'u-rohan',
      categoryId: 'cat-accessories',
      title: 'Brown leather wallet',
      description: 'Brown leather wallet with a metro card and some cash.',
      locationLost: 'Canteen',
      dateLost: at(4),
      status: 'matched',
    },
    {
      id: 'LR-0009',
      userId: 'u-meera',
      categoryId: 'cat-others',
      title: 'Steel water bottle',
      description: 'Milton 1 litre steel bottle with a small dent near the base.',
      locationLost: 'Admin Block',
      dateLost: at(8),
      status: 'open',
    },
    {
      id: 'LR-0010',
      userId: 'u-meera',
      categoryId: 'cat-cards',
      title: 'ID card holder',
      description: 'Black lanyard with a staff ID card holder. Library card kept behind the ID.',
      locationLost: 'Admin Block',
      dateLost: at(6, 2),
      status: 'matched',
    },
  ];

  const foundItems: FoundItem[] = [
    {
      id: 'FI-0001',
      reportedBy: 'u-sunil',
      handedInBy: 'Library attendant',
      categoryId: 'cat-electronics',
      title: 'Wired earphones',
      publicDescription: 'White wired earphones in a black pouch, found on a reading table.',
      hiddenDetails: 'Pouch zip has a small tear. Left earbud has a scratch.',
      locationFound: 'Central Library',
      dateFound: at(18),
      heldAt: 'Central Library Desk',
      status: 'returned',
    },
    {
      id: 'FI-0002',
      reportedBy: 'u-sunil',
      handedInBy: 'Sports Complex staff',
      categoryId: 'cat-others',
      title: 'Steel water bottle',
      publicDescription: 'Steel water bottle left near the badminton courts.',
      hiddenDetails: "Initials 'AK' scratched under the base.",
      locationFound: 'Sports Complex',
      dateFound: at(41),
      heldAt: 'Sports Complex Office',
      status: 'in_custody',
    },
    {
      id: 'FI-0003',
      reportedBy: 'u-rohan',
      handedInBy: 'Rohan Verma',
      categoryId: 'cat-electronics',
      title: 'iPhone 13',
      publicDescription: 'Blue smartphone in a clear case, found on a bench outside lecture hall LT-3.',
      hiddenDetails: 'Sticker on the back of the case. Beach photo on the lock screen. Small crack at the bottom left corner.',
      locationFound: 'Academic Block',
      dateFound: at(1),
      heldAt: 'Admin Block Help Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0004',
      reportedBy: 'u-sunil',
      handedInBy: 'Security guard, Gate 2',
      categoryId: 'cat-bags',
      title: 'Black backpack',
      publicDescription: 'Black backpack with a laptop sleeve, left near the OAT steps after an event.',
      hiddenDetails: "Wildcraft brand. Notebook inside with 'Priya' on the cover. Steel bottle in the side pocket.",
      locationFound: 'OAT',
      dateFound: at(2),
      heldAt: 'Admin Block Help Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0005',
      reportedBy: 'u-sunil',
      handedInBy: 'Workshop instructor',
      categoryId: 'cat-electronics',
      title: 'Scientific calculator',
      publicDescription: 'Casio scientific calculator, found on a workbench in the drawing hall.',
      hiddenDetails: "Name 'Aarav S.' written on the back cover in black marker.",
      locationFound: 'Mechanical Workshop',
      dateFound: at(4, 4),
      heldAt: 'Admin Block Help Desk',
      status: 'claim_pending',
    },
    {
      id: 'FI-0006',
      reportedBy: 'u-sunil',
      handedInBy: 'Hostel warden',
      categoryId: 'cat-keys',
      title: 'Hostel room keys',
      publicDescription: 'Two keys on a red keyring, found near the mess entrance.',
      hiddenDetails: "Paper tag on the ring with '214' written on it.",
      locationFound: 'Boys Hostel',
      dateFound: at(0, 5),
      heldAt: 'Boys Hostel Office',
      status: 'in_custody',
    },
    {
      id: 'FI-0007',
      reportedBy: 'u-sunil',
      categoryId: 'cat-cards',
      title: 'ID card holder',
      publicDescription: 'Black lanyard with a card holder, found in the Admin Block lobby.',
      hiddenDetails: 'Staff ID inside, name partly visible. Library card kept behind it.',
      locationFound: 'Admin Block',
      dateFound: at(6),
      heldAt: 'Admin Block Help Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0008',
      reportedBy: 'u-sunil',
      handedInBy: 'Canteen staff',
      categoryId: 'cat-clothing',
      title: 'Grey hoodie',
      publicDescription: 'Grey zip hoodie, size M, left on a chair in the canteen.',
      hiddenDetails: 'Left pocket torn. Blue pen in the right pocket.',
      locationFound: 'Canteen',
      dateFound: at(2),
      heldAt: 'Admin Block Help Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0009',
      reportedBy: 'u-sunil',
      categoryId: 'cat-books',
      title: 'Engineering Drawing textbook',
      publicDescription: 'Engineering Drawing textbook found on a reading table, second floor.',
      hiddenDetails: 'Name written on the first page. Pencil notes in chapter 4.',
      locationFound: 'Central Library',
      dateFound: at(5),
      heldAt: 'Central Library Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0010',
      reportedBy: 'u-meera',
      handedInBy: 'Dr. Meera Iyer',
      categoryId: 'cat-accessories',
      title: 'Brown leather wallet',
      publicDescription: 'Brown leather wallet found near the canteen billing counter.',
      hiddenDetails: 'Metro card inside and a passport size photo in the front slot.',
      locationFound: 'Canteen',
      dateFound: at(3, 2),
      heldAt: 'Admin Block Help Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0011',
      reportedBy: 'u-sunil',
      handedInBy: 'Workshop instructor',
      categoryId: 'cat-others',
      title: 'Black umbrella',
      publicDescription: 'Folding black umbrella left at the Mechanical Workshop entrance.',
      hiddenDetails: 'Wooden handle with a small crack. One spoke bent.',
      locationFound: 'Mechanical Workshop',
      dateFound: at(37),
      heldAt: 'Admin Block Help Desk',
      status: 'in_custody',
    },
    {
      id: 'FI-0012',
      reportedBy: 'u-priya',
      handedInBy: 'Priya Nair',
      categoryId: 'cat-accessories',
      title: 'Spectacles in a hard case',
      publicDescription: 'Black frame spectacles in a blue hard case, found in the common room.',
      hiddenDetails: 'Prescription lenses. Light scratch on the right lens.',
      locationFound: 'Girls Hostel',
      dateFound: at(7),
      heldAt: 'Girls Hostel Office',
      status: 'in_custody',
    },
  ];

  // Seeded matches are scored by the real engine so the numbers are consistent.
  const seedPairs: [string, string, Match['status'], string][] = [
    ['LR-0001', 'FI-0003', 'suggested', at(0, 18)],
    ['LR-0002', 'FI-0005', 'confirmed', at(4)],
    ['LR-0003', 'FI-0001', 'confirmed', at(18)],
    ['LR-0006', 'FI-0004', 'suggested', at(1, 20)],
    ['LR-0007', 'FI-0006', 'suggested', at(0, 4)],
    ['LR-0008', 'FI-0010', 'suggested', at(3)],
    ['LR-0010', 'FI-0007', 'suggested', at(5, 20)],
  ];

  const matches: Match[] = seedPairs.map(([lostId, foundId, status, matchedOn], i) => {
    const lost = lostReports.find((r) => r.id === lostId)!;
    const found = foundItems.find((f) => f.id === foundId)!;
    const result = scorePair(lost, found) ?? {
      matchScore: 0,
      breakdown: { category: 0, location: 0, date: 0, keywords: 0 },
    };
    return {
      id: `M-${String(i + 1).padStart(4, '0')}`,
      lostReportId: lostId,
      foundItemId: foundId,
      ...result,
      status,
      matchedOn,
    };
  });

  const claims: Claim[] = [
    {
      id: 'CL-0001',
      foundItemId: 'FI-0001',
      userId: 'u-aarav',
      lostReportId: 'LR-0003',
      proofOfOwnership:
        'White earphones in a black pouch. The pouch zip has a small tear. Bought in August from the campus store.',
      lostOn: at(19),
      lostAt: 'Central Library',
      status: 'handed_over',
      submittedOn: at(17, 6),
      handoverDate: at(16),
      handedOverBy: 'u-sunil',
    },
    {
      id: 'CL-0002',
      foundItemId: 'FI-0005',
      userId: 'u-aarav',
      lostReportId: 'LR-0002',
      proofOfOwnership:
        "My name 'Aarav S.' is written on the back cover in black marker. I can show the purchase bill.",
      lostOn: at(5),
      lostAt: 'Mechanical Workshop',
      status: 'submitted',
      submittedOn: at(3, 5),
    },
  ];

  const note = (
    id: string,
    userId: string,
    text: string,
    createdAt: string,
    read = false,
  ): Notification => ({ id, userId, text, createdAt, read, channel: 'email and SMS, simulated' });

  const notifications: Notification[] = [
    note('N-0001', 'u-aarav', 'Possible match for your report LR-0001: iPhone 13 found at Academic Block.', at(0, 18)),
    note('N-0002', 'u-aarav', 'Claim CL-0002 submitted. The desk will review it.', at(3, 5)),
    note('N-0003', 'u-aarav', 'Claim CL-0001 approved. Collect FI-0001 from Central Library Desk with your college ID.', at(16, 20), true),
    note('N-0004', 'u-aarav', 'FI-0001 handed over at Central Library Desk. Report LR-0003 is now closed.', at(16), true),
    note('N-0005', 'u-priya', 'Possible match for your report LR-0006: Black backpack found at OAT.', at(1, 20)),
    note('N-0006', 'u-priya', 'Report LR-0004 received. We will tell you when a possible match comes in.', at(10), true),
    note('N-0007', 'u-rohan', 'Possible match for your report LR-0007: Hostel room keys found at Boys Hostel.', at(0, 4)),
    note('N-0008', 'u-rohan', 'Possible match for your report LR-0008: Brown leather wallet found at Canteen.', at(3)),
    note('N-0009', 'u-meera', 'Possible match for your report LR-0010: ID card holder found at Admin Block.', at(5, 20)),
    note('N-0010', 'u-sunil', 'New claim CL-0002 for FI-0005 needs verification.', at(3, 5)),
    note('N-0011', 'u-sunil', 'FI-0006 logged at Boys Hostel Office.', at(0, 5), true),
    note('N-0012', 'u-kavita', '2 found items have been in custody for more than 30 days.', at(0, 2)),
  ];

  const log = (
    id: string,
    actorId: string,
    action: string,
    entity: AuditLog['entity'],
    entityId: string,
    timestamp: string,
  ): AuditLog => ({ id, actorId, action, entity, entityId, timestamp });

  const auditLogs: AuditLog[] = [
    log('A-0001', 'u-sunil', 'Logged found item', 'FoundItem', 'FI-0001', at(18)),
    log('A-0002', 'u-aarav', 'Submitted claim', 'Claim', 'CL-0001', at(17, 6)),
    log('A-0003', 'u-sunil', 'Approved claim', 'Claim', 'CL-0001', at(16, 20)),
    log('A-0004', 'u-sunil', 'Recorded handover', 'Claim', 'CL-0001', at(16)),
    log('A-0005', 'u-aarav', 'Confirmed match', 'Match', 'M-0002', at(4)),
    log('A-0006', 'u-aarav', 'Submitted claim', 'Claim', 'CL-0002', at(3, 5)),
    log('A-0007', 'u-rohan', 'Reported found item', 'FoundItem', 'FI-0003', at(1)),
    log('A-0008', 'u-sunil', 'Logged found item', 'FoundItem', 'FI-0006', at(0, 5)),
  ];

  return {
    users,
    categories,
    lostReports,
    foundItems,
    matches,
    claims,
    notifications,
    auditLogs,
    settings: { matchThreshold: 60, unclaimedDays: 30 },
  };
}
