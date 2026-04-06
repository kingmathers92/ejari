export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: "GUEST" | "HOST" | "ADMIN";
  idVerified: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  description: string;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  isActive: boolean;
  createdAt: string;
  host: Pick<User, "id" | "fullName" | "idVerified" | "avatarUrl" | "createdAt">;
  photos: PropertyPhoto[];
  avgRating?: number | null;
  reviewCount?: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer: Pick<User, "fullName" | "avatarUrl">;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  nights?: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentStatus: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  createdAt: string;
  property?: Pick<Property, "id" | "title" | "city" | "photos">;
  guest?: Pick<User, "fullName" | "phone">;
  payment?: Payment;
  invoice?: Invoice;
  messages?: Message[];
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "REFUNDED" | "FAILED";
  payUrl?: string;
  paidAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  amountHT: number;
  tva: number;
  total: number;
  issuedAt: string;
}

export interface Message {
  id: string;
  content: string;
  isRead: boolean;
  sentAt: string;
  sender: Pick<User, "id" | "fullName" | "avatarUrl">;
}

export interface DashboardStats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthRevenue: number;
  activeProperties: number;
}

export interface SearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  minPrice?: string;
  maxPrice?: string;
}

export interface CreateBookingInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
}