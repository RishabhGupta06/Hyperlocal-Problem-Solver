// ============================================================
// Community Hero — localStorage Data Store
// ============================================================
// Provides CRUD operations for issues, users, votes, and comments.
// Seeds realistic demo data on first visit.
// ============================================================

const STORAGE_KEYS = {
  ISSUES: 'ch_issues',
  USERS: 'ch_users',
  CURRENT_USER: 'ch_current_user',
  VOTES: 'ch_votes',
  COMMENTS: 'ch_comments',
  INITIALIZED: 'ch_initialized',
};

// ── Categories ─────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'road', label: 'Road & Pothole', icon: '🛣️', color: '#ef4444' },
  { id: 'water', label: 'Water & Drainage', icon: '💧', color: '#3b82f6' },
  { id: 'electricity', label: 'Electricity', icon: '⚡', color: '#f59e0b' },
  { id: 'waste', label: 'Waste Management', icon: '🗑️', color: '#10b981' },
  { id: 'safety', label: 'Public Safety', icon: '🛡️', color: '#8b5cf6' },
  { id: 'park', label: 'Parks & Public Spaces', icon: '🌳', color: '#22c55e' },
  { id: 'traffic', label: 'Traffic & Signals', icon: '🚦', color: '#f97316' },
  { id: 'building', label: 'Building & Structure', icon: '🏗️', color: '#6366f1' },
  { id: 'noise', label: 'Noise Pollution', icon: '🔊', color: '#ec4899' },
  { id: 'other', label: 'Other', icon: '📋', color: '#64748b' },
];

export const STATUSES = [
  { id: 'reported', label: 'Reported', color: '#3b82f6' },
  { id: 'verified', label: 'Verified', color: '#8b5cf6' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { id: 'resolved', label: 'Resolved', color: '#10b981' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444' },
];

export const URGENCY_LEVELS = [
  { id: 'low', label: 'Low', color: '#64748b' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high', label: 'High', color: '#f97316' },
  { id: 'critical', label: 'Critical', color: '#ef4444' },
];

// ── Helpers ────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function getStorage(key) {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

// ── Event system for real-time UI updates ──────────────────
const listeners = new Map();

export function subscribe(event, callback) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(callback);
  return () => listeners.get(event)?.delete(callback);
}

function emit(event, data) {
  listeners.get(event)?.forEach(cb => cb(data));
}

// ── Seed Data ──────────────────────────────────────────────
const SEED_USERS = [
  { id: 'user_1', name: 'Rishabh Gupta', avatar: '👨‍💻', xp: 2450, level: 'Hero', reports: 34, verifications: 67, streak: 12, badges: ['first_report', 'verified_10', 'streak_7', 'community_champion', 'resolver'] },
  { id: 'user_2', name: 'Priya Sharma', avatar: '👩‍🔬', xp: 1890, level: 'Guardian', reports: 28, verifications: 45, streak: 8, badges: ['first_report', 'verified_10', 'streak_7'] },
  { id: 'user_3', name: 'Amit Patel', avatar: '👨‍🏫', xp: 3200, level: 'Legend', reports: 56, verifications: 89, streak: 21, badges: ['first_report', 'verified_10', 'verified_50', 'streak_7', 'streak_14', 'community_champion', 'resolver', 'legend'] },
  { id: 'user_4', name: 'Sneha Verma', avatar: '👩‍⚕️', xp: 980, level: 'Citizen', reports: 12, verifications: 23, streak: 3, badges: ['first_report', 'verified_10'] },
  { id: 'user_5', name: 'Rahul Kumar', avatar: '👨‍🔧', xp: 1560, level: 'Guardian', reports: 22, verifications: 38, streak: 6, badges: ['first_report', 'verified_10', 'streak_7'] },
  { id: 'user_6', name: 'Kavita Singh', avatar: '👩‍💼', xp: 720, level: 'Citizen', reports: 9, verifications: 15, streak: 2, badges: ['first_report'] },
  { id: 'user_7', name: 'Deepak Joshi', avatar: '👨‍🍳', xp: 2100, level: 'Hero', reports: 31, verifications: 52, streak: 10, badges: ['first_report', 'verified_10', 'streak_7', 'community_champion'] },
  { id: 'user_8', name: 'Meera Nair', avatar: '👩‍🎨', xp: 430, level: 'Citizen', reports: 5, verifications: 8, streak: 1, badges: ['first_report'] },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SEED_ISSUES = [
  {
    id: 'issue_1', title: 'Large pothole on MG Road near City Mall',
    description: 'A deep pothole approximately 2 feet wide has formed on MG Road, right in front of City Mall. Multiple vehicles have been damaged. This has been getting worse over the past 2 weeks, especially after recent rains.',
    category: 'road', status: 'verified', urgency: 'high',
    location: { lat: 28.6139, lng: 77.2090, address: 'MG Road, near City Mall, Sector 14' },
    reportedBy: 'user_1', reportedAt: daysAgo(5),
    upvotes: 23, downvotes: 1, verifications: 15,
    statusHistory: [
      { status: 'reported', date: daysAgo(5), by: 'user_1' },
      { status: 'verified', date: daysAgo(3), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_2', title: 'Water pipeline burst in Sector 22',
    description: 'Major water pipeline burst causing flooding on the main street of Sector 22. Water is continuously leaking and has made the road slippery. Several shops are affected.',
    category: 'water', status: 'in_progress', urgency: 'critical',
    location: { lat: 28.6200, lng: 77.2150, address: 'Main Street, Sector 22' },
    reportedBy: 'user_2', reportedAt: daysAgo(2),
    upvotes: 45, downvotes: 0, verifications: 28,
    statusHistory: [
      { status: 'reported', date: daysAgo(2), by: 'user_2' },
      { status: 'verified', date: daysAgo(1), by: 'system' },
      { status: 'in_progress', date: daysAgo(0), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_3', title: 'Streetlight not working for 3 weeks',
    description: 'The streetlight at the corner of Park Avenue and 5th Street has been non-functional for over 3 weeks. The area becomes very dark at night, creating safety concerns for pedestrians.',
    category: 'electricity', status: 'reported', urgency: 'medium',
    location: { lat: 28.6080, lng: 77.2020, address: 'Park Avenue & 5th Street, Sector 8' },
    reportedBy: 'user_3', reportedAt: daysAgo(21),
    upvotes: 12, downvotes: 2, verifications: 8,
    statusHistory: [
      { status: 'reported', date: daysAgo(21), by: 'user_3' },
    ],
    image: null,
  },
  {
    id: 'issue_4', title: 'Garbage dumping near school playground',
    description: 'Illegal garbage dumping has been happening near the Government School playground in Sector 15. The waste is attracting stray animals and creating unhygienic conditions for school children.',
    category: 'waste', status: 'resolved', urgency: 'high',
    location: { lat: 28.6250, lng: 77.1980, address: 'Near Govt. School, Sector 15' },
    reportedBy: 'user_4', reportedAt: daysAgo(14),
    upvotes: 38, downvotes: 0, verifications: 22,
    statusHistory: [
      { status: 'reported', date: daysAgo(14), by: 'user_4' },
      { status: 'verified', date: daysAgo(12), by: 'system' },
      { status: 'in_progress', date: daysAgo(8), by: 'admin' },
      { status: 'resolved', date: daysAgo(3), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_5', title: 'Broken traffic signal at Rajiv Chowk',
    description: 'The traffic signal at Rajiv Chowk intersection is malfunctioning — it stays red on all sides. This is causing massive traffic jams during rush hours and near-miss accidents.',
    category: 'traffic', status: 'in_progress', urgency: 'critical',
    location: { lat: 28.6328, lng: 77.2197, address: 'Rajiv Chowk, Central Delhi' },
    reportedBy: 'user_5', reportedAt: daysAgo(1),
    upvotes: 67, downvotes: 0, verifications: 41,
    statusHistory: [
      { status: 'reported', date: daysAgo(1), by: 'user_5' },
      { status: 'verified', date: daysAgo(0), by: 'system' },
      { status: 'in_progress', date: daysAgo(0), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_6', title: 'Damaged park bench and broken swings',
    description: 'Multiple benches are broken and 2 swings are damaged in Central Park, Sector 18. The park is heavily used by families with children. The broken equipment poses injury risks.',
    category: 'park', status: 'verified', urgency: 'medium',
    location: { lat: 28.6180, lng: 77.2280, address: 'Central Park, Sector 18' },
    reportedBy: 'user_6', reportedAt: daysAgo(7),
    upvotes: 19, downvotes: 1, verifications: 11,
    statusHistory: [
      { status: 'reported', date: daysAgo(7), by: 'user_6' },
      { status: 'verified', date: daysAgo(5), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_7', title: 'Open manhole cover missing on Ring Road',
    description: 'A manhole cover is completely missing on the service road along Ring Road near Sector 12 exit. This is extremely dangerous, especially at night. A two-wheeler rider narrowly escaped yesterday.',
    category: 'safety', status: 'verified', urgency: 'critical',
    location: { lat: 28.6050, lng: 77.2350, address: 'Ring Road Service Road, near Sector 12' },
    reportedBy: 'user_7', reportedAt: daysAgo(3),
    upvotes: 54, downvotes: 0, verifications: 33,
    statusHistory: [
      { status: 'reported', date: daysAgo(3), by: 'user_7' },
      { status: 'verified', date: daysAgo(2), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_8', title: 'Overflowing sewage drain in Sector 9',
    description: 'The main sewage drain in Sector 9, Block C is overflowing onto the road. The stench is unbearable and it\'s creating health hazards for the residents. This happens every monsoon season.',
    category: 'water', status: 'reported', urgency: 'high',
    location: { lat: 28.6100, lng: 77.1920, address: 'Block C, Sector 9' },
    reportedBy: 'user_8', reportedAt: daysAgo(1),
    upvotes: 31, downvotes: 0, verifications: 18,
    statusHistory: [
      { status: 'reported', date: daysAgo(1), by: 'user_8' },
    ],
    image: null,
  },
  {
    id: 'issue_9', title: 'Illegal construction blocking footpath',
    description: 'A commercial establishment has illegally extended its structure onto the public footpath on Market Road, Sector 11. Pedestrians are forced to walk on the main road, risking their safety.',
    category: 'building', status: 'reported', urgency: 'medium',
    location: { lat: 28.6220, lng: 77.2050, address: 'Market Road, Sector 11' },
    reportedBy: 'user_1', reportedAt: daysAgo(4),
    upvotes: 16, downvotes: 3, verifications: 9,
    statusHistory: [
      { status: 'reported', date: daysAgo(4), by: 'user_1' },
    ],
    image: null,
  },
  {
    id: 'issue_10', title: 'Continuous honking near hospital zone',
    description: 'Despite being a designated no-honking zone, vehicles continuously honk near District Hospital in Sector 6. This disturbs patients and violates noise pollution norms.',
    category: 'noise', status: 'verified', urgency: 'medium',
    location: { lat: 28.6300, lng: 77.2100, address: 'Near District Hospital, Sector 6' },
    reportedBy: 'user_2', reportedAt: daysAgo(10),
    upvotes: 25, downvotes: 4, verifications: 14,
    statusHistory: [
      { status: 'reported', date: daysAgo(10), by: 'user_2' },
      { status: 'verified', date: daysAgo(8), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_11', title: 'Pothole cluster on highway service road',
    description: 'A series of 5-6 potholes have formed on the NH-48 service road near Sector 3 exit. The road surface has completely deteriorated. Cars have to swerve dangerously to avoid them.',
    category: 'road', status: 'in_progress', urgency: 'high',
    location: { lat: 28.5980, lng: 77.2000, address: 'NH-48 Service Road, Sector 3' },
    reportedBy: 'user_3', reportedAt: daysAgo(8),
    upvotes: 42, downvotes: 0, verifications: 27,
    statusHistory: [
      { status: 'reported', date: daysAgo(8), by: 'user_3' },
      { status: 'verified', date: daysAgo(6), by: 'system' },
      { status: 'in_progress', date: daysAgo(2), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_12', title: 'Fallen tree blocking residential lane',
    description: 'A large neem tree fell during last night\'s storm and is blocking the entire lane in Block D, Sector 21. Residents cannot drive in or out. Some electric wires are also tangled.',
    category: 'safety', status: 'resolved', urgency: 'critical',
    location: { lat: 28.6270, lng: 77.2230, address: 'Block D, Sector 21' },
    reportedBy: 'user_5', reportedAt: daysAgo(6),
    upvotes: 58, downvotes: 0, verifications: 35,
    statusHistory: [
      { status: 'reported', date: daysAgo(6), by: 'user_5' },
      { status: 'verified', date: daysAgo(6), by: 'system' },
      { status: 'in_progress', date: daysAgo(5), by: 'admin' },
      { status: 'resolved', date: daysAgo(4), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_13', title: 'Street dogs menace near children\'s park',
    description: 'A pack of aggressive street dogs has been terrorizing visitors at the children\'s park in Sector 17. Two children were chased yesterday. Animal control has not responded to complaints.',
    category: 'safety', status: 'reported', urgency: 'high',
    location: { lat: 28.6160, lng: 77.2170, address: 'Children\'s Park, Sector 17' },
    reportedBy: 'user_4', reportedAt: daysAgo(2),
    upvotes: 29, downvotes: 2, verifications: 16,
    statusHistory: [
      { status: 'reported', date: daysAgo(2), by: 'user_4' },
    ],
    image: null,
  },
  {
    id: 'issue_14', title: 'Water supply contamination in Sector 20',
    description: 'Residents of Sector 20 are receiving yellowish, foul-smelling water from the municipal supply since last week. Several residents have complained of stomach issues. Water testing is urgently needed.',
    category: 'water', status: 'in_progress', urgency: 'critical',
    location: { lat: 28.6190, lng: 77.2300, address: 'Sector 20, Block A-E' },
    reportedBy: 'user_7', reportedAt: daysAgo(7),
    upvotes: 72, downvotes: 0, verifications: 48,
    statusHistory: [
      { status: 'reported', date: daysAgo(7), by: 'user_7' },
      { status: 'verified', date: daysAgo(6), by: 'system' },
      { status: 'in_progress', date: daysAgo(4), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_15', title: 'Abandoned vehicle blocking parking area',
    description: 'An old, rusted car has been abandoned in the community parking of Sector 13 for over a month. It is occupying two parking spots and has become an eyesore.',
    category: 'other', status: 'resolved', urgency: 'low',
    location: { lat: 28.6230, lng: 77.2120, address: 'Community Parking, Sector 13' },
    reportedBy: 'user_6', reportedAt: daysAgo(30),
    upvotes: 8, downvotes: 1, verifications: 5,
    statusHistory: [
      { status: 'reported', date: daysAgo(30), by: 'user_6' },
      { status: 'verified', date: daysAgo(25), by: 'system' },
      { status: 'in_progress', date: daysAgo(15), by: 'admin' },
      { status: 'resolved', date: daysAgo(10), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_16', title: 'Electric pole leaning dangerously',
    description: 'An electric pole near the market area of Sector 10 is leaning at approximately 30 degrees. Sparking has been observed during rain. This is a major electrocution hazard.',
    category: 'electricity', status: 'verified', urgency: 'critical',
    location: { lat: 28.6120, lng: 77.2080, address: 'Market Area, Sector 10' },
    reportedBy: 'user_3', reportedAt: daysAgo(4),
    upvotes: 36, downvotes: 0, verifications: 24,
    statusHistory: [
      { status: 'reported', date: daysAgo(4), by: 'user_3' },
      { status: 'verified', date: daysAgo(3), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_17', title: 'Garbage bins overflowing for a week',
    description: 'The community garbage bins at Block B, Sector 16 have not been emptied for over a week. Garbage is spilling onto the road and the stench is affecting nearby residents.',
    category: 'waste', status: 'reported', urgency: 'high',
    location: { lat: 28.6170, lng: 77.1960, address: 'Block B, Sector 16' },
    reportedBy: 'user_8', reportedAt: daysAgo(3),
    upvotes: 21, downvotes: 0, verifications: 13,
    statusHistory: [
      { status: 'reported', date: daysAgo(3), by: 'user_8' },
    ],
    image: null,
  },
  {
    id: 'issue_18', title: 'Damaged speed breaker causing accidents',
    description: 'The speed breaker near Sector 7 intersection has been partially destroyed, leaving sharp edges of concrete exposed. Multiple two-wheelers have had accidents here.',
    category: 'road', status: 'resolved', urgency: 'high',
    location: { lat: 28.6090, lng: 77.2140, address: 'Main Road, Sector 7 Intersection' },
    reportedBy: 'user_1', reportedAt: daysAgo(20),
    upvotes: 33, downvotes: 1, verifications: 20,
    statusHistory: [
      { status: 'reported', date: daysAgo(20), by: 'user_1' },
      { status: 'verified', date: daysAgo(18), by: 'system' },
      { status: 'in_progress', date: daysAgo(12), by: 'admin' },
      { status: 'resolved', date: daysAgo(7), by: 'admin' },
    ],
    image: null,
  },
  {
    id: 'issue_19', title: 'Waterlogging at underpass during rain',
    description: 'The underpass connecting Sector 4 and Sector 5 gets severely waterlogged during even moderate rainfall. Vehicles get stuck regularly. The drainage system appears to be completely blocked.',
    category: 'water', status: 'verified', urgency: 'high',
    location: { lat: 28.6040, lng: 77.2060, address: 'Underpass, Sector 4-5 connector' },
    reportedBy: 'user_2', reportedAt: daysAgo(9),
    upvotes: 47, downvotes: 0, verifications: 31,
    statusHistory: [
      { status: 'reported', date: daysAgo(9), by: 'user_2' },
      { status: 'verified', date: daysAgo(7), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_20', title: 'Playground occupied by unauthorized vendors',
    description: 'The community playground in Sector 19 has been encroached upon by unauthorized food vendors. Children no longer have space to play. The vendors leave behind waste daily.',
    category: 'park', status: 'reported', urgency: 'medium',
    location: { lat: 28.6210, lng: 77.2250, address: 'Community Playground, Sector 19' },
    reportedBy: 'user_5', reportedAt: daysAgo(6),
    upvotes: 14, downvotes: 2, verifications: 7,
    statusHistory: [
      { status: 'reported', date: daysAgo(6), by: 'user_5' },
    ],
    image: null,
  },
  {
    id: 'issue_21', title: 'Crack in residential building wall',
    description: 'A significant crack has appeared on the outer wall of Block F, Apartment 12 in Sector 23. The crack extends from the 2nd to 4th floor. Structural integrity assessment is needed urgently.',
    category: 'building', status: 'verified', urgency: 'critical',
    location: { lat: 28.6280, lng: 77.2180, address: 'Block F, Sector 23' },
    reportedBy: 'user_7', reportedAt: daysAgo(2),
    upvotes: 41, downvotes: 0, verifications: 26,
    statusHistory: [
      { status: 'reported', date: daysAgo(2), by: 'user_7' },
      { status: 'verified', date: daysAgo(1), by: 'system' },
    ],
    image: null,
  },
  {
    id: 'issue_22', title: 'Construction noise during restricted hours',
    description: 'A construction site in Sector 24 is operating heavy machinery between 10 PM and 6 AM, violating municipal noise regulations. Residents have lost sleep for the past 2 weeks.',
    category: 'noise', status: 'in_progress', urgency: 'medium',
    location: { lat: 28.6310, lng: 77.2270, address: 'Construction Site, Sector 24' },
    reportedBy: 'user_4', reportedAt: daysAgo(14),
    upvotes: 28, downvotes: 1, verifications: 17,
    statusHistory: [
      { status: 'reported', date: daysAgo(14), by: 'user_4' },
      { status: 'verified', date: daysAgo(12), by: 'system' },
      { status: 'in_progress', date: daysAgo(5), by: 'admin' },
    ],
    image: null,
  },
];

const SEED_COMMENTS = [
  { id: 'c1', issueId: 'issue_1', userId: 'user_2', text: 'I drive through here every day. It\'s getting worse! My car got damaged last week.', createdAt: daysAgo(4) },
  { id: 'c2', issueId: 'issue_1', userId: 'user_5', text: 'Same thing happened to me. When will the authorities act?', createdAt: daysAgo(3) },
  { id: 'c3', issueId: 'issue_2', userId: 'user_1', text: 'The water department was informed. They said a team is being dispatched.', createdAt: daysAgo(1) },
  { id: 'c4', issueId: 'issue_5', userId: 'user_3', text: 'This is causing a 45-minute delay during peak hours. Traffic police need to be deployed.', createdAt: daysAgo(0) },
  { id: 'c5', issueId: 'issue_7', userId: 'user_1', text: 'This is extremely dangerous! I almost fell in last night while walking.', createdAt: daysAgo(2) },
  { id: 'c6', issueId: 'issue_14', userId: 'user_4', text: 'We\'ve been buying packaged water for a week now. This is unacceptable.', createdAt: daysAgo(5) },
  { id: 'c7', issueId: 'issue_4', userId: 'user_7', text: 'Thanks to everyone who reported this! The area has been cleaned.', createdAt: daysAgo(3) },
  { id: 'c8', issueId: 'issue_12', userId: 'user_6', text: 'The tree has been removed and the wires have been fixed. Great response time!', createdAt: daysAgo(4) },
];

// ── Initialize ─────────────────────────────────────────────
export function initializeStore() {
  if (typeof window === 'undefined') return;
  if (getStorage(STORAGE_KEYS.INITIALIZED)) return;

  setStorage(STORAGE_KEYS.ISSUES, SEED_ISSUES);
  setStorage(STORAGE_KEYS.USERS, SEED_USERS);
  setStorage(STORAGE_KEYS.CURRENT_USER, 'user_1');
  setStorage(STORAGE_KEYS.COMMENTS, SEED_COMMENTS);
  setStorage(STORAGE_KEYS.VOTES, {});
  setStorage(STORAGE_KEYS.INITIALIZED, true);
}

// ── Issues CRUD ────────────────────────────────────────────
export function getIssues(filters = {}) {
  initializeStore();
  let issues = getStorage(STORAGE_KEYS.ISSUES) || [];

  if (filters.category) {
    issues = issues.filter(i => i.category === filters.category);
  }
  if (filters.status) {
    issues = issues.filter(i => i.status === filters.status);
  }
  if (filters.urgency) {
    issues = issues.filter(i => i.urgency === filters.urgency);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    issues = issues.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.location.address.toLowerCase().includes(q)
    );
  }

  // Sort
  if (filters.sortBy === 'upvotes') {
    issues.sort((a, b) => b.upvotes - a.upvotes);
  } else if (filters.sortBy === 'oldest') {
    issues.sort((a, b) => new Date(a.reportedAt) - new Date(b.reportedAt));
  } else {
    // Default: newest first
    issues.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  }

  return issues;
}

export function getIssueById(id) {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  return issues.find(i => i.id === id) || null;
}

export function createIssue(issueData) {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  const newIssue = {
    id: generateId(),
    ...issueData,
    reportedBy: getCurrentUser()?.id || 'user_1',
    reportedAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    verifications: 0,
    statusHistory: [
      { status: 'reported', date: new Date().toISOString(), by: getCurrentUser()?.id || 'user_1' },
    ],
  };
  issues.unshift(newIssue);
  setStorage(STORAGE_KEYS.ISSUES, issues);
  emit('issues_updated', newIssue);

  // Award XP for reporting
  const { addXP } = require('./gamification');
  addXP(getCurrentUser()?.id || 'user_1', 50, 'Reported an issue');

  return newIssue;
}

export function updateIssueStatus(id, newStatus) {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  const idx = issues.findIndex(i => i.id === id);
  if (idx === -1) return null;

  issues[idx].status = newStatus;
  issues[idx].statusHistory.push({
    status: newStatus,
    date: new Date().toISOString(),
    by: getCurrentUser()?.id || 'user_1',
  });
  setStorage(STORAGE_KEYS.ISSUES, issues);
  emit('issues_updated', issues[idx]);
  return issues[idx];
}

export function upvoteIssue(id) {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  const votes = getStorage(STORAGE_KEYS.VOTES) || {};
  const userId = getCurrentUser()?.id || 'user_1';
  const voteKey = `${userId}_${id}`;

  if (votes[voteKey] === 'up') return null; // Already upvoted

  const idx = issues.findIndex(i => i.id === id);
  if (idx === -1) return null;

  if (votes[voteKey] === 'down') {
    issues[idx].downvotes = Math.max(0, issues[idx].downvotes - 1);
  }

  issues[idx].upvotes += 1;
  votes[voteKey] = 'up';

  setStorage(STORAGE_KEYS.ISSUES, issues);
  setStorage(STORAGE_KEYS.VOTES, votes);
  emit('issues_updated', issues[idx]);
  return issues[idx];
}

export function verifyIssue(id) {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  const idx = issues.findIndex(i => i.id === id);
  if (idx === -1) return null;

  issues[idx].verifications += 1;

  // Auto-verify if enough verifications
  if (issues[idx].verifications >= 5 && issues[idx].status === 'reported') {
    issues[idx].status = 'verified';
    issues[idx].statusHistory.push({
      status: 'verified',
      date: new Date().toISOString(),
      by: 'community',
    });
  }

  setStorage(STORAGE_KEYS.ISSUES, issues);
  emit('issues_updated', issues[idx]);

  // Award XP for verification
  const { addXP } = require('./gamification');
  addXP(getCurrentUser()?.id || 'user_1', 20, 'Verified an issue');

  return issues[idx];
}

// ── Users ──────────────────────────────────────────────────
export function getUsers() {
  initializeStore();
  return getStorage(STORAGE_KEYS.USERS) || [];
}

export function getUserById(id) {
  initializeStore();
  const users = getStorage(STORAGE_KEYS.USERS) || [];
  return users.find(u => u.id === id) || null;
}

export function getCurrentUser() {
  initializeStore();
  const userId = getStorage(STORAGE_KEYS.CURRENT_USER);
  return getUserById(userId);
}

export function updateUser(id, updates) {
  initializeStore();
  const users = getStorage(STORAGE_KEYS.USERS) || [];
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  setStorage(STORAGE_KEYS.USERS, users);
  emit('users_updated', users[idx]);
  return users[idx];
}

// ── Comments ───────────────────────────────────────────────
export function getComments(issueId) {
  initializeStore();
  const comments = getStorage(STORAGE_KEYS.COMMENTS) || [];
  return comments
    .filter(c => c.issueId === issueId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

export function addComment(issueId, text) {
  initializeStore();
  const comments = getStorage(STORAGE_KEYS.COMMENTS) || [];
  const newComment = {
    id: generateId(),
    issueId,
    userId: getCurrentUser()?.id || 'user_1',
    text,
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  setStorage(STORAGE_KEYS.COMMENTS, comments);
  emit('comments_updated', newComment);

  // Award XP for commenting
  const { addXP } = require('./gamification');
  addXP(getCurrentUser()?.id || 'user_1', 10, 'Commented on an issue');

  return newComment;
}

// ── Stats ──────────────────────────────────────────────────
export function getStats() {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  const total = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const inProgress = issues.filter(i => i.status === 'in_progress').length;
  const reported = issues.filter(i => i.status === 'reported').length;
  const verified = issues.filter(i => i.status === 'verified').length;
  const critical = issues.filter(i => i.urgency === 'critical').length;

  const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes, 0);
  const totalVerifications = issues.reduce((sum, i) => sum + i.verifications, 0);

  // Resolution rate
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Average resolution time (for resolved issues)
  const resolvedIssues = issues.filter(i => i.status === 'resolved');
  let avgResolutionDays = 0;
  if (resolvedIssues.length > 0) {
    const totalDays = resolvedIssues.reduce((sum, issue) => {
      const reportedDate = new Date(issue.statusHistory[0].date);
      const resolvedDate = new Date(issue.statusHistory[issue.statusHistory.length - 1].date);
      return sum + (resolvedDate - reportedDate) / (1000 * 60 * 60 * 24);
    }, 0);
    avgResolutionDays = Math.round(totalDays / resolvedIssues.length);
  }

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map(cat => ({
    ...cat,
    count: issues.filter(i => i.category === cat.id).length,
  })).filter(c => c.count > 0);

  // Status breakdown
  const statusBreakdown = STATUSES.map(s => ({
    ...s,
    count: issues.filter(i => i.status === s.id).length,
  }));

  return {
    total, resolved, inProgress, reported, verified, critical,
    totalUpvotes, totalVerifications, resolutionRate,
    avgResolutionDays, categoryBreakdown, statusBreakdown,
  };
}

// ── Trends (for charts) ───────────────────────────────────
export function getIssueTrends() {
  initializeStore();
  const issues = getStorage(STORAGE_KEYS.ISSUES) || [];
  const days = 30;
  const trends = [];

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const reportedCount = issues.filter(issue => {
      const rd = new Date(issue.reportedAt).toISOString().split('T')[0];
      return rd === dateStr;
    }).length;

    const resolvedCount = issues.filter(issue => {
      const resolvedEntry = issue.statusHistory.find(h => h.status === 'resolved');
      if (!resolvedEntry) return false;
      return new Date(resolvedEntry.date).toISOString().split('T')[0] === dateStr;
    }).length;

    trends.push({ date: dayLabel, reported: reportedCount, resolved: resolvedCount });
  }

  return trends;
}
