export type OrderStatus = 'PENDING' | 'AWAITING_ROUTE' | 'IN_ROUTE' | 'DELIVERED' | 'CANCELED';
export type RouteStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELED';
export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'OFFLINE';

export interface OrderDto {
  id: string;
  customer: {
    name: string;
    phone: string;
    trackingToken: string;
  };
  deliveryAddress: {
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  notes?: string;
  status: OrderStatus;
  routeId?: string;
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverDto {
  id: string;
  name: string;
  vehicle: string;
  status: DriverStatus;
  region: string;
}

export interface CreateDriverDto {
  name: string;
  vehicle: string;
  region: string;
  status?: DriverDto['status'];
}

export interface RouteDto {
  id: string;
  region: string;
  origin: string;
  destination: string;
  status: RouteStatus;
  driverId?: string;
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  score: number;
  stops: Array<{
    orderId: string;
    customerName: string;
    address: string;
    sequence: number;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    latitude?: number;
    longitude?: number;
  }>;
  locationHistory: Array<{
    latitude: number;
    longitude: number;
    recordedAt: string;
  }>;
  occurrences: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export interface CalculationResult {
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  score: number;
  orderedStops: Array<{
    latitude: number;
    longitude: number;
    priority?: string;
    orderId?: string;
    sequence: number;
  }>;
  calculationSource: string;
}
