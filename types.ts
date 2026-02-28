
export interface ItineraryResponse {
  destination: string;
  duration: string;
  totalEstimatedCost: string;
  bestVisitingTime: string;
  riskScore: number;
  safetyAdvice: string;
  days: {
    day: number;
    title: string;
    activities: string[];
    meals: string[];
    transport: string;
  }[];
}

export type TravelType = 'Domestic' | 'International' | 'Group' | 'Honeymoon' | 'Adventure' | 'Luxury' | 'Budget' | 'Family' | 'Weekend' | 'Ultra-Luxury';

export interface TravelPackage {
  id: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  price: number;
  currency: 'INR' | 'USD' | 'EUR' | 'THB' | 'AED' | 'JPY' | 'GBP' | 'SGD';
  rating: number;
  image: string;
  gallery?: string[];
  type: 'Domestic' | 'International' | 'Group' | 'Honeymoon' | 'Adventure' | 'Luxury' | 'Budget' | 'Family' | 'Weekend' | 'Ultra-Luxury';
  description: string;
  highlights?: string[];
  itineraryDetails?: { day: number; title: string; content: string }[];
  inclusions?: string[];
  exclusions?: string[];
  bookingCount?: number; // For trending logic
  viewCount?: number;    // For trending logic
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

export interface PriceAlert {
  id: string;
  type: 'destination' | 'package';
  targetIdOrName: string;
  targetPrice?: number;
  createdAt: Date;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  recommendations: string[];
  transportation?: 'Walking' | 'Public Transport' | 'Taxi' | 'Rental Car';
  notes?: string;
  shops?: string[];
}

export interface TravelInsurance {
  id: string;
  provider: string;
  coverageType: 'Basic' | 'Premium' | 'Ultimate';
  price: number;
  description: string;
}

export interface TripPlan {
  destination: string;
  duration: number;
  budget: string;
  vibe: string;
  destinationOverview: string;
  estimatedBudget: string;
  bestTimeToVisit: string;
  hotelSuggestion?: string;
  highlights: {
    adventure: string;
    food: string;
    culture: string;
    nature: string;
    relaxation: string;
  };
  budgetBreakdown: {
    stay: number;
    transport: number;
    activities: number;
    food: number;
  };
  travelTips: string[];
  packingSuggestions: string[];
  safetyAdvice: string;
  weather: {
    temp: string;
    condition: string;
  };
  itinerary: ItineraryDay[];
  selectedInsurance?: TravelInsurance;
  savedAt?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  preferences?: string[];
  avatar?: string;
  token?: string;
  savedPackages?: string[]; // IDs of bookmarked packages
  priceAlerts?: PriceAlert[];
}

export interface Booking {
  id: string;
  packageId: string;
  packageTitle: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  flight?: any;
  hotel?: any;
  addons?: string[];
  paymentId?: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  pricing?: {
    base: number;
    taxes: number;
    service: number;
    vehicleCharge: number;
    otherAddonsTotal: number;
    classSurcharge: number;
    total: number;
  };
  numTravelers: number;
  selectedVehicle: string | null;
}

export enum Page {
  Home = 'home',
  Planner = 'planner',
  Packages = 'packages',
  Booking = 'booking',
  Profile = 'profile',
  Auth = 'auth',
  PackageDetails = 'package_details',
  About = 'about',
  Contact = 'contact'
}
