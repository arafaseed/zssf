export interface Activity {
  activityId: number;
  activityName: string;
  description?: string;
  price: number;
  venueId?: number;
}

export interface Venue {
  venueId: number;
  venueName: string;
  capacity: number;
  description?: string[];
  venueType?: string | null;
  address?: string | null;
  venueImages: string[];
  buildingId: number;
  optionalServiceIds?: number[];
  activityIds: number[];
  assignedStaffIds?: number[];
  bookingIds?: number[];
}

export interface Building {
  buildingId: number;
  buildingName: string;
  address: string;
  venues: Venue[];
}
export interface Activity {
  activityId: number;
  activityName: string;
  description?: string;
  price: number;
  venueId?: number;
}

export interface Venue {
  venueId: number;
  venueName: string;
  capacity: number;
  description?: string[];
  venueType?: string | null;
  address?: string | null;
  venueImages: string[];
  buildingId: number;
  optionalServiceIds?: number[];
  activityIds: number[];
  assignedStaffIds?: number[];
  bookingIds?: number[];
}

export interface Building {
  buildingId: number;
  buildingName: string;
  address: string;
  venues: Venue[];
}

// export interface Venue {
//   venueId: number;
//   venueName: string;
//   capacity: number;
//   description: string[];
//   venueType: string | null;
//   address?: string | null;
//   venueImages: string[];
//   buildingId: number;
//   optionalServiceIds: number[];
//   activityIds: number[];
// }

export interface Building {
  buildingId: number;
  buildingName: string;
  address: string;
}

export interface Activity {
  activityId: number;
  activityName: string;
  description?: string;
  price: number;
  venueId?: number;
}

export interface OptionalService {
  serviceId: number;
  optionalServiceName: string;
  description?: string;
  price: number;
  venueId?: number;
}
