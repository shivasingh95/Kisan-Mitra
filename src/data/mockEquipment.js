// src/data/mockEquipment.js — Mock Equipment data for KrishiMitra RaaS (Robot-as-a-Service)
// Equipment Rental platform — owners list gear, farmers book it by the hour.

/** Equipment type definitions */
export const EQUIPMENT_TYPES = [
  { id: 'drone',     label: 'Drone',              hindi: 'ड्रोन',           icon: '🚁', unit: 'acre', platformFee: 15 },
  { id: 'tractor',   label: 'Tractor',            hindi: 'ट्रैक्टर',         icon: '🚜', unit: 'hour', platformFee: 15 },
  { id: 'harvester', label: 'Combine Harvester',  hindi: 'कम्बाइन हार्वेस्टर', icon: '⚙️', unit: 'acre', platformFee: 15 },
  { id: 'sprayer',   label: 'Power Sprayer',      hindi: 'पावर स्प्रेयर',    icon: '💧', unit: 'hour', platformFee: 15 },
  { id: 'seeder',    label: 'Seed Drill',         hindi: 'बीज ड्रिल',       icon: '🌱', unit: 'acre', platformFee: 15 },
  { id: 'tiller',   label: 'Rotavator/Tiller',   hindi: 'रोटावेटर',         icon: '🔄', unit: 'hour', platformFee: 15 },
];

export function getEquipmentType(id) {
  return EQUIPMENT_TYPES.find(e => e.id === id) || { id, label: id, hindi: id, icon: '🔧', unit: 'hour', platformFee: 15 };
}

/** Equipment Owner source types */
export const OWNER_SOURCES = [
  { id: 'iti_student',  label: 'ITI/Agriculture College Student', icon: '🎓' },
  { id: 'farmer',       label: 'Progressive Farmer',              icon: '👨‍🌾' },
  { id: 'agri_company', label: 'Agri-Equipment Company',          icon: '🏭' },
  { id: 'mnrega',       label: 'MNREGA Worker',                   icon: '🛠️' },
  { id: 'kvk',          label: 'KVK Partner Network',             icon: '🏛️' },
];

/** Mock Equipment Owners */
export const MOCK_OWNERS = [
  {
    ownerId:      'o001',
    name:         'Vikram Joshi',
    nameHindi:    'विक्रम जोशी',
    phone:        '+91 94111 22334',
    village:      'Indore',
    district:     'Indore',
    sourceType:   'iti_student',
    rating:       4.9,
    completedJobs: 38,
    avatar:       '🧑‍🔧',
    upiId:        'vikram.joshi@upi',
    verified:     true,
  },
  {
    ownerId:      'o002',
    name:         'Ram Kishan Patel',
    nameHindi:    'राम किशन पटेल',
    phone:        '+91 98765 43210',
    village:      'Sehore',
    district:     'Sehore',
    sourceType:   'farmer',
    rating:       4.7,
    completedJobs: 23,
    avatar:       '👨‍🌾',
    upiId:        'ramkishan.p@upi',
    verified:     true,
  },
  {
    ownerId:      'o003',
    name:         'AgriTech Solutions Pvt Ltd',
    nameHindi:    'एग्रीटेक सॉल्यूशंस',
    phone:        '+91 73456 78901',
    village:      'Bhopal',
    district:     'Bhopal',
    sourceType:   'agri_company',
    rating:       4.8,
    completedJobs: 142,
    avatar:       '🏭',
    upiId:        'agritech.solutions@upi',
    verified:     true,
  },
  {
    ownerId:      'o004',
    name:         'Sunita Bai',
    nameHindi:    'सुनीता बाई',
    phone:        '+91 80234 56789',
    village:      'Dewas',
    district:     'Dewas',
    sourceType:   'mnrega',
    rating:       4.6,
    completedJobs: 15,
    avatar:       '👩‍🌾',
    upiId:        'sunita.bai@upi',
    verified:     true,
  },
];

/** Time slots available per day */
export const TIME_SLOTS = [
  { id: 's1', label: '6 AM – 8 AM',   start: 6,  end: 8  },
  { id: 's2', label: '8 AM – 10 AM',  start: 8,  end: 10 },
  { id: 's3', label: '10 AM – 12 PM', start: 10, end: 12 },
  { id: 's4', label: '2 PM – 4 PM',   start: 14, end: 16 },
  { id: 's5', label: '4 PM – 6 PM',   start: 16, end: 18 },
];

/** Mock Equipment listings */
export const MOCK_EQUIPMENT = [
  {
    equipId:       'eq001',
    ownerId:       'o001',
    type:          'drone',
    brand:         'Garuda Aerospace',
    model:         'Garuda-G10',
    coveragePerHour: 10, // acres/hour
    ratePerHour:   280,
    description:   'DGCA-certified 10-litre agricultural spraying drone. Covers 10 acres/hour. Ideal for pesticide & fertilizer spraying.',
    descriptionHi: 'DGCA प्रमाणित 10 लीटर कृषि स्प्रे ड्रोन। 10 एकड़/घंटा।',
    districts:     ['Indore', 'Dewas', 'Ujjain', 'Sehore'],
    dgcaCert:      true,
    dgcaCertNo:    'DGCA-2025-MP-4892',
    isAvailable:   true,
    photos:        [],
    availableSlots: ['s1', 's2', 's4', 's5'],
    rating:        4.9,
    totalBookings: 38,
    lat:           22.71,
    lng:           75.85,
  },
  {
    equipId:       'eq002',
    ownerId:       'o002',
    type:          'tractor',
    brand:         'Mahindra',
    model:         'Arjun 605',
    coveragePerHour: 2, // acres/hour for tilling
    ratePerHour:   450,
    description:   '60 HP Mahindra tractor with rotavator attachment. Ideal for land preparation and tilling. Available with trained operator.',
    descriptionHi: '60 HP महिंद्रा ट्रैक्टर। भूमि तैयारी के लिए उपयुक्त।',
    districts:     ['Sehore', 'Bhopal', 'Raisen', 'Vidisha'],
    dgcaCert:      false,
    isAvailable:   true,
    photos:        [],
    availableSlots: ['s1', 's2', 's3'],
    rating:        4.7,
    totalBookings: 23,
    lat:           23.20,
    lng:           77.08,
  },
  {
    equipId:       'eq003',
    ownerId:       'o003',
    type:          'harvester',
    brand:         'John Deere',
    model:         'W70 Combine',
    coveragePerHour: 4, // acres/hour
    ratePerHour:   1800,
    description:   'John Deere combine harvester. Handles wheat, soybean, maize. 4 acres/hour. Operator included.',
    descriptionHi: 'जॉन डियर कम्बाइन हार्वेस्टर। गेहूं, सोयाबीन, मक्का।',
    districts:     ['Bhopal', 'Sehore', 'Hoshangabad', 'Narsinghpur'],
    dgcaCert:      false,
    isAvailable:   true,
    photos:        [],
    availableSlots: ['s1', 's2', 's3', 's4', 's5'],
    rating:        4.8,
    totalBookings: 56,
    lat:           23.25,
    lng:           77.40,
  },
  {
    equipId:       'eq004',
    ownerId:       'o004',
    type:          'sprayer',
    brand:         'Kisankraft',
    model:         'KK-PS-628',
    coveragePerHour: 3, // acres/hour
    ratePerHour:   120,
    description:   'Power knapsack sprayer, 28-litre capacity. Covers 3 acres/hour. Good for small to medium farms.',
    descriptionHi: '28 लीटर पावर स्प्रेयर। छोटे और मध्यम खेतों के लिए।',
    districts:     ['Dewas', 'Indore', 'Ujjain'],
    dgcaCert:      false,
    isAvailable:   true,
    photos:        [],
    availableSlots: ['s1', 's2', 's3', 's4', 's5'],
    rating:        4.6,
    totalBookings: 15,
    lat:           22.96,
    lng:           76.05,
  },
  {
    equipId:       'eq005',
    ownerId:       'o001',
    type:          'drone',
    brand:         'IdeaForge',
    model:         'RYNO-8',
    coveragePerHour: 8, // acres/hour
    ratePerHour:   220,
    description:   'DGCA-certified 8-litre multi-rotor drone. Perfect for small farms. Covers 8 acres/hour.',
    descriptionHi: 'DGCA प्रमाणित 8 लीटर ड्रोन। छोटे खेतों के लिए।',
    districts:     ['Indore', 'Dewas', 'Khandwa'],
    dgcaCert:      true,
    dgcaCertNo:    'DGCA-2025-MP-4893',
    isAvailable:   true,
    photos:        [],
    availableSlots: ['s3', 's4', 's5'],
    rating:        4.8,
    totalBookings: 29,
    lat:           22.72,
    lng:           75.87,
  },
  {
    equipId:       'eq006',
    ownerId:       'o002',
    type:          'seeder',
    brand:         'Fieldking',
    model:         'Turbo Happy Seeder',
    coveragePerHour: 3, // acres/hour
    ratePerHour:   320,
    description:   'Zero-till seed drill for direct seeding. Great for wheat after rice. Saves 40% water.',
    descriptionHi: 'जीरो-टिल बीज ड्रिल। गेहूं की सीधी बुवाई।',
    districts:     ['Sehore', 'Bhopal', 'Hoshangabad'],
    dgcaCert:      false,
    isAvailable:   false, // Currently booked
    photos:        [],
    availableSlots: [],
    rating:        4.5,
    totalBookings: 12,
    lat:           23.19,
    lng:           77.10,
  },
];

/** Mock equipment bookings for demo */
export const MOCK_BOOKINGS = [
  {
    bookingId:   'bk001',
    equipId:     'eq001',
    farmerId:    'demo_farmer',
    farmerName:  'Ramesh Patidar',
    hours:       3,
    date:        new Date('2026-06-05').getTime(),
    slotId:      's2',
    slotLabel:   '8 AM – 10 AM',
    baseAmount:  840,
    platformFee: 126,
    totalPaid:   966,
    ownerReceives: 714,
    status:      'confirmed', // pending | confirmed | in_progress | completed | cancelled | disputed
    escrowHeld:  true,
    escrowAmount: 966,
    createdAt:   new Date('2026-06-01').getTime(),
  },
  {
    bookingId:   'bk002',
    equipId:     'eq002',
    farmerId:    'demo_farmer',
    farmerName:  'Ramesh Patidar',
    hours:       4,
    date:        new Date('2026-06-10').getTime(),
    slotId:      's1',
    slotLabel:   '6 AM – 8 AM',
    baseAmount:  1800,
    platformFee: 270,
    totalPaid:   2070,
    ownerReceives: 1530,
    status:      'completed',
    escrowHeld:  false,
    escrowAmount: 0,
    createdAt:   new Date('2026-05-28').getTime(),
  },
];

/** Platform fee percentage for equipment rental */
export const EQUIPMENT_PLATFORM_FEE_PCT = 15;

/** Calculate booking cost */
export function calculateBookingCost(ratePerHour, hours) {
  const base        = ratePerHour * hours;
  const platformFee = Math.round(base * EQUIPMENT_PLATFORM_FEE_PCT / 100);
  const total       = base + platformFee;
  const ownerGets   = base - platformFee;
  return { base, platformFee, total, ownerGets };
}
