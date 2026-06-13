import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Transport = 'plane' | 'train' | 'car' | 'ship';
export type Accommodation = 'hotel' | 'hostel' | 'camping' | 'homestay';
export type CompanionType = 'adult' | 'child' | 'infant';
export type Priority = 'required' | 'recommended' | 'optional';
export type Permission = 'view' | 'edit';
export type RiskType = 'warning' | 'danger' | 'info';

export interface Companion {
  type: CompanionType;
  count: number;
}

export interface GenerateParams {
  destination: string;
  days: number;
  season: Season;
  transport: Transport;
  accommodation: Accommodation;
  companions: Companion[];
}

export interface PackingItemInput {
  id: string;
  name: string;
  category: string;
  priority: Priority;
  weight?: number;
  isLiquid?: boolean;
  isPacked?: boolean;
  quantity?: number;
  note?: string;
  expiryDate?: string;
}

export interface PackingListResponse {
  id: string;
  name: string;
  destination: string;
  days: number;
  season: string;
  transport: string;
  accommodation: string;
  companions: Companion[];
  items: PackingItemInput[];
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeightEstimate {
  totalWeight: number;
  byCategory: CategoryWeight[];
  withinLimit: boolean;
  limit: number;
  overWeight: number;
}

export interface CategoryWeight {
  category: string;
  weight: number;
  items: Array<{
    name: string;
    weight: number;
    count: number;
  }>;
}

export interface RiskAlert {
  type: RiskType;
  category: string;
  item: string;
  message: string;
  suggestion: string;
}

export interface ShoppingItem {
  name: string;
  category: string;
  quantity: number;
  priority: Priority;
  reason: string;
}

export interface ReturnPackingItem {
  name: string;
  category: string;
  quantity: number;
  note: string;
}

export interface AirlineTip {
  airline: string;
  freeCheckedBag: string;
  freeCarryOn: string;
  overweightFee: string;
  liquidRestriction: string;
  specialItems: string[];
}

export interface AnalysisReport {
  completionRate: number;
  totalItems: number;
  packedItems: number;
  risks: RiskAlert[];
  weightEstimate: WeightEstimate;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
