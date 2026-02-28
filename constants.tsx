
import { TravelPackage, TravelInsurance, Testimonial } from './types';

export const COLORS = {
  primary: 'from-indigo-600 to-purple-700',
  secondary: 'from-teal-400 to-cyan-500',
  accent: 'text-amber-400',
  bg: 'bg-gray-950',
  card: 'bg-white/5 backdrop-blur-xl border border-white/10'
};

export const MOCK_PACKAGES: TravelPackage[] = [
  // DOMESTIC - INDIA
  {
    id: 'kashmir-1',
    slug: 'heaven-on-earth-kashmir',
    title: 'Heaven on Earth: Kashmir',
    destination: 'Kashmir',
    duration: '6 Days',
    price: 35000,
    currency: 'INR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1566833917409-f8602077cc72?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1626078436897-6060965d109d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1621360157019-3c15c0e27464?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Domestic',
    description: 'A magical journey through the valleys of Gulmarg, Pahalgam, and Dal Lake.',
    highlights: ['Dal Lake Shikara', 'Gulmarg Gondola', 'Pahalgam Valley', 'Local Cuisine'],
    bookingCount: 450,
    viewCount: 1200
  },
  {
    id: 'shimla-1',
    slug: 'shimla-heritage-walk',
    title: 'Shimla Heritage Walk',
    destination: 'Shimla',
    duration: '3 Days',
    price: 12000,
    currency: 'INR',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1562670338-d1e41074bf6f?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1562670338-d1e41074bf6f?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1597079910443-60c43fc4f729?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1615456453916-2c18dfd38a0c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599427303058-f06cb9e980ee?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Weekend',
    description: 'Explore the colonial architecture, mall road, and scenic ridges.',
    highlights: ['The Ridge', 'Jakhoo Temple', 'Kufri Zoo', 'Heritage Toy Train'],
    bookingCount: 200,
    viewCount: 550
  },
  {
    id: 'paris-1',
    slug: 'romantic-paris-tour',
    title: 'Romantic Paris Tour',
    destination: 'Paris',
    duration: '7 Days',
    price: 1800,
    currency: 'EUR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1502602898657-3e91724ae33e?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1502602898657-3e91724ae33e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1471623322304-7e9c9b9ce272?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Honeymoon',
    description: 'The ultimate luxury experience in the city of lights and love.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine Cruise', 'Champagne Lunch'],
    bookingCount: 920,
    viewCount: 3000
  },
  {
    id: 'dubai-1',
    slug: 'dubai-desert-luxury',
    title: 'Dubai Desert Luxury',
    destination: 'Dubai',
    duration: '5 Days',
    price: 4500,
    currency: 'AED',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1546412414-8035e1776c9a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1528702748617-c64d49f918af?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Luxury',
    description: 'Stay in iconic 7-star hotels and explore the futuristic skyline.',
    highlights: ['Burj Khalifa', 'Desert Safari', 'Palm Jumeirah', 'Luxury Shopping'],
    bookingCount: 850,
    viewCount: 4000
  },
  {
    id: 'thailand-1',
    slug: 'phuket-island-hopping',
    title: 'Phuket Island Hopping',
    destination: 'Thailand',
    duration: '6 Days',
    price: 15000,
    currency: 'THB',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'International',
    description: 'Experience the crystal clear waters and vibrant nightlife of Phuket.',
    highlights: ['Phi Phi Islands', 'Big Buddha', 'Street Food Tour', 'Night Markets'],
    bookingCount: 760,
    viewCount: 1400
  },
  {
    id: 'bali-1',
    slug: 'bali-tropical-haven',
    title: 'Bali Tropical Haven',
    destination: 'Bali',
    duration: '8 Days',
    price: 1200,
    currency: 'USD',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1573843225234-ad21c9a172ec?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Honeymoon',
    description: 'Lush rice terraces, spiritual temples, and luxury beach villas.',
    highlights: ['Ubud Swings', 'Uluwatu Temple', 'Seminyak Beaches', 'Private Villa'],
    bookingCount: 1200,
    viewCount: 5000
  },
  {
    id: 'swiss-1',
    slug: 'swiss-alps-grand-tour',
    title: 'Swiss Alps Grand Tour',
    destination: 'Switzerland',
    duration: '10 Days',
    price: 3500,
    currency: 'EUR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1502404646524-c4611a4cf873?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1502404646524-c4611a4cf873?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Luxury',
    description: 'Panoramic train rides through the heart of the snow-capped Alps.',
    highlights: ['Jungfraujoch', 'Lucerne Lake', 'Mount Titlis', 'Swiss Chocolate'],
    bookingCount: 340,
    viewCount: 1800
  },
  {
    id: 'tokyo-1',
    slug: 'tokyo-neon-tradition',
    title: 'Tokyo Neon & Tradition',
    destination: 'Tokyo',
    duration: '6 Days',
    price: 320000,
    currency: 'JPY',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1536220976194-f816cb1b9b1d?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'International',
    description: 'From Shinjuku skyscrapers to the serene Senso-ji temple.',
    highlights: ['Shibuya Crossing', 'Mount Fuji', 'Sushi Workshop', 'Imperial Palace'],
    bookingCount: 500,
    viewCount: 2200
  },
  {
    id: 'london-1',
    slug: 'london-royal-heritage',
    title: 'London Royal Heritage',
    destination: 'London',
    duration: '5 Days',
    price: 1600,
    currency: 'GBP',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'International',
    description: 'Buckingham Palace, the Big Ben, and high tea in Kensington.',
    highlights: ['Tower Bridge', 'London Eye', 'British Museum', 'Royal Parks'],
    bookingCount: 430,
    viewCount: 1900
  },
  {
    id: 'rome-1',
    slug: 'the-eternal-city-rome',
    title: 'The Eternal City: Rome',
    destination: 'Rome',
    duration: '4 Days',
    price: 1400,
    currency: 'EUR',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1529260839194-81aad2067bb1?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1531572751581-f74bf68b5c2e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Adventure',
    description: 'Colosseum walks, Vatican art, and authentic Italian gastronomy.',
    highlights: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Gelato Tour'],
    bookingCount: 600,
    viewCount: 2500
  },
  {
    id: 'maldives-1',
    slug: 'maldives-overwater-bliss',
    title: 'Maldives Overwater Bliss',
    destination: 'Maldives',
    duration: '5 Days',
    price: 5500,
    currency: 'USD',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Ultra-Luxury',
    description: 'Private villas over turquoise waters with endless horizons.',
    highlights: ['Snorkeling', 'Romantic Dinners', 'Spa Wellness', 'Sunset Cruise'],
    bookingCount: 880,
    viewCount: 4500
  },
  {
    id: 'ny-1',
    slug: 'new-york-skyline-tour',
    title: 'New York Skyline Tour',
    destination: 'New York',
    duration: '4 Days',
    price: 1900,
    currency: 'USD',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1485871982741-77e41263d67d?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'International',
    description: 'Times Square energy and a walk through Central Park.',
    highlights: ['Empire State', 'Statue of Liberty', 'Broadway Show', 'Chelsea Market'],
    bookingCount: 400,
    viewCount: 1800
  },
  {
    id: 'jaipur-1',
    slug: 'jaipur-the-pink-city',
    title: 'Jaipur: The Pink City',
    destination: 'Jaipur',
    duration: '3 Days',
    price: 15000,
    currency: 'INR',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544237562-ad1163012880?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Domestic',
    description: 'Forts, palaces, and a vibrant local culture in Rajasthan.',
    highlights: ['Amer Fort', 'Hawa Mahal', 'City Palace', 'Chokhi Dhani'],
    bookingCount: 300,
    viewCount: 1200
  },
  // GOA PACKAGES
  {
    id: 'goa-1',
    slug: 'goa-beach-holiday',
    title: 'Goa Beach Holiday',
    destination: 'Goa',
    duration: '4 Days',
    price: 15000,
    currency: 'INR',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Domestic',
    description: 'Sun, sand, and sea! Experience the vibrant beaches of North and South Goa.',
    highlights: ['Baga Beach', 'Fort Aguada', 'Old Goa Churches', 'Water Sports'],
    bookingCount: 650,
    viewCount: 2100
  },
  {
    id: 'goa-2',
    slug: 'goa-honeymoon-special',
    title: 'Goa Honeymoon Special',
    destination: 'Goa',
    duration: '5 Days',
    price: 28000,
    currency: 'INR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1573843225234-ad21c9a172ec?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Honeymoon',
    description: 'A romantic getaway with private beach dinners and luxury resort stays.',
    highlights: ['Candlelight Dinner', 'Private Yacht Cruise', 'Spa Sessions', 'South Goa Beaches'],
    bookingCount: 420,
    viewCount: 1800
  },
  {
    id: 'goa-4',
    slug: 'goa-weekend-getaway',
    title: 'Goa Weekend Getaway',
    destination: 'Goa',
    duration: '3 Days',
    price: 9000,
    currency: 'INR',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Weekend',
    description: 'Quick escape to the party capital of India. Best of North Goa nightlife.',
    highlights: ['Tito\'s Lane', 'Chapora Fort', 'Vagator Beach', 'Beach Shacks'],
    bookingCount: 890,
    viewCount: 3200
  },
  {
    id: 'goa-5',
    slug: 'goa-luxury-stay',
    title: 'Goa Luxury Stay',
    destination: 'Goa',
    duration: '4 Days',
    price: 55000,
    currency: 'INR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1573843225234-ad21c9a172ec?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1573843225234-ad21c9a172ec?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Luxury',
    description: 'Indulge in the finest hospitality at Goa\'s premier 5-star beach resorts.',
    highlights: ['Infinity Pool', 'Private Beach Access', 'Fine Dining', 'Personal Butler'],
    bookingCount: 280,
    viewCount: 1100
  },
  // RAJASTHAN PACKAGES
  {
    id: 'rajasthan-1',
    slug: 'royal-rajasthan-tour',
    title: 'Royal Rajasthan Tour',
    destination: 'Rajasthan',
    duration: '8 Days',
    price: 45000,
    currency: 'INR',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1545051905-39115d3b090e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Domestic',
    description: 'Experience the grandeur of Rajasthan\'s palaces and forts in this comprehensive tour.',
    highlights: ['Umaid Bhawan Palace', 'Mehrangarh Fort', 'Lake Pichola', 'Amber Fort'],
    bookingCount: 340,
    viewCount: 1400
  },
  {
    id: 'rajasthan-2',
    slug: 'jaipur-jodhpur-udaipur-package',
    title: 'Jaipur–Jodhpur–Udaipur Package',
    destination: 'Rajasthan',
    duration: '7 Days',
    price: 38000,
    currency: 'INR',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1615880484746-a134be9a275a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Domestic',
    description: 'The Golden Triangle of Rajasthan. Explore the Pink, Blue, and White cities.',
    highlights: ['Hawa Mahal', 'Blue City Walk', 'City Palace Udaipur', 'Local Markets'],
    bookingCount: 560,
    viewCount: 2200
  },
  {
    id: 'rajasthan-3',
    slug: 'rajasthan-desert-safari',
    title: 'Rajasthan Desert Safari',
    destination: 'Rajasthan',
    duration: '5 Days',
    price: 22000,
    currency: 'INR',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1545051905-39115d3b090e?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1545051905-39115d3b090e?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Adventure',
    description: 'Venture into the Thar Desert for camel safaris and camping under the stars.',
    highlights: ['Sam Sand Dunes', 'Camel Safari', 'Folk Dance & Music', 'Jaisalmer Fort'],
    bookingCount: 410,
    viewCount: 1900
  },
  {
    id: 'rajasthan-4',
    slug: 'rajasthan-heritage-culture-trip',
    title: 'Rajasthan Heritage & Culture Trip',
    destination: 'Rajasthan',
    duration: '6 Days',
    price: 32000,
    currency: 'INR',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1615880484746-a134be9a275a?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Domestic',
    description: 'Immerse yourself in the rich traditions, arts, and history of the Rajputana era.',
    highlights: ['Pushkar Lake', 'Brahma Temple', 'Local Handicrafts', 'Puppet Shows'],
    bookingCount: 320,
    viewCount: 1300
  },
  {
    id: 'rajasthan-5',
    slug: 'rajasthan-family-tour',
    title: 'Rajasthan Family Tour',
    destination: 'Rajasthan',
    duration: '6 Days',
    price: 42000,
    currency: 'INR',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1615880484746-a134be9a275a?auto=format&fit=crop&q=80&w=1000',
    gallery: [
      'https://images.unsplash.com/photo-1615880484746-a134be9a275a?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=1000'
    ],
    type: 'Family',
    description: 'A family-friendly journey through the colorful cities and majestic forts of Rajasthan.',
    highlights: ['Elephant Ride', 'Light & Sound Show', 'Vintage Car Museum', 'Boating in Udaipur'],
    bookingCount: 480,
    viewCount: 1600
  },
  // Extra specific cities
  ...[
    { city: 'Singapore', img: 'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?auto=format&fit=crop&q=80&w=1000', cur: 'SGD', price: 1800, gallery: ['https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1562763563-49cabb8f450c?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Barcelona', img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1500, gallery: ['https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Istanbul', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=1000', cur: 'USD', price: 1400, gallery: ['https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Reykjavik', img: 'https://images.unsplash.com/photo-1504829857797-ddff29c27947?auto=format&fit=crop&q=80&w=1000', cur: 'USD', price: 2800, gallery: ['https://images.unsplash.com/photo-1504829857797-ddff29c27947?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Cairo', img: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=1000', cur: 'USD', price: 1100, gallery: ['https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Prague', img: 'https://images.unsplash.com/photo-1541849548-2060201ad4c6?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1300, gallery: ['https://images.unsplash.com/photo-1541849548-2060201ad4c6?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1590759223965-060ee47ad438?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Vienna', img: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1600, gallery: ['https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1558229987-a2267b2d56d7?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Sydney', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1000', cur: 'USD', price: 2200, gallery: ['https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Venice', img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1700, gallery: ['https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Athens', img: 'https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1200, gallery: ['https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1555990544-1bd6c813931c?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Lisbon', img: 'https://images.unsplash.com/photo-1548141281-706596357425?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1400, gallery: ['https://images.unsplash.com/photo-1548141281-706596357425?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1534376338064-2475fb9b28c3?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Amsterdam', img: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&q=80&w=1000', cur: 'EUR', price: 1550, gallery: ['https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1534384334709-7330ca046bd7?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Bangkok', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579367?auto=format&fit=crop&q=80&w=1000', cur: 'THB', price: 18000, gallery: ['https://images.unsplash.com/photo-1508009603885-50cf7c579367?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Udaipur', img: 'https://images.unsplash.com/photo-1615880484746-a134be9a275a?auto=format&fit=crop&q=80&w=1000', cur: 'INR', price: 21000, gallery: ['https://images.unsplash.com/photo-1615880484746-a134be9a275a?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1591154706845-4299407aa7c1?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Lonavala', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&q=80&w=1000', cur: 'INR', price: 9500, gallery: ['https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1616781296184-7667d710037a?auto=format&fit=crop&q=80&w=1000'] },
    { city: 'Munnar', img: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1000', cur: 'INR', price: 18500, gallery: ['https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1000', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=1000'] },
  ].map((item, i) => {
    const type = ['Luxury', 'Family', 'Adventure', 'Honeymoon'][i % 4];
    const title = `${type} Escape to ${item.city}`;
    return {
      id: `pkg-final-${i}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: title,
      destination: item.city,
    duration: `${5 + (i % 3)} Days`,
    price: item.price,
    currency: item.cur as any,
    rating: 4.4 + (Math.random() * 0.5),
    image: item.img,
    gallery: (item as any).gallery,
    type: ['Luxury', 'Family', 'Adventure', 'Honeymoon'][i % 4] as any,
    highlights: ['City Tour', 'Luxury Stay', 'Local Experiences', 'Expert Guide'],
    description: `Experience the best of ${item.city} with a curated itinerary designed for comfort and discovery.`,
    bookingCount: Math.floor(Math.random() * 500),
    viewCount: Math.floor(Math.random() * 2000)
    };
  })
].map(pkg => ({
  ...pkg,
  price: Math.round(pkg.price * 1.1 * 100) / 100
}));

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Jenkins',
    role: 'Solo Traveler',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: 'Destinix made my trip to Japan absolutely seamless. The AI planner suggested spots I would have never found on my own!',
    rating: 5
  },
  {
    id: 't2',
    name: 'Marcus Chen',
    role: 'Adventure Enthusiast',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    content: 'The level of personalization is insane. I wanted a high-octane trip in Switzerland and they delivered beyond my expectations.',
    rating: 5
  }
];

export const INSURANCE_OPTIONS: TravelInsurance[] = [
  { id: 'ins-1', provider: 'Global Guard', coverageType: 'Basic', price: 49, description: 'Essential medical coverage.' },
  { id: 'ins-2', provider: 'SafeTravel Pro', coverageType: 'Premium', price: 89, description: 'Comprehensive medical.' },
  { id: 'ins-3', provider: 'Destinix Elite Care', coverageType: 'Ultimate', price: 149, description: 'All-inclusive coverage.' }
];

export const CATEGORIES = [
  'All', 'International', 'Domestic', 'Honeymoon', 'Family', 'Adventure', 'Luxury', 'Budget', 'Weekend', 'Group'
];

export const MOODS = [
  { id: 'Honeymoon', label: 'Honeymoon', icon: '❤️' },
  { id: 'Adventure', label: 'Adventure', icon: '⛰️' },
  { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'Luxury', label: 'Luxury', icon: '✨' },
  { id: 'Budget', label: 'Budget', icon: '💸' },
  { id: 'International', label: 'International', icon: '🌍' }
];

export const TOP_DESTINATIONS = [
  { name: 'Goa', count: '600+', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800' },
  { name: 'Rajasthan', count: '450+', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&q=80&w=800' },
  { name: 'Kashmir', count: '120+', image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Paris', count: '300+', image: 'https://images.unsplash.com/photo-1502602898657-3e91724ae33e?auto=format&fit=crop&q=80&w=800' },
  { name: 'Dubai', count: '250+', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Thailand', count: '400+', image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&q=80&w=800' },
  { name: 'Manali', count: '80+', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800' },
  { name: 'Bali', count: '500+', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' }
];
