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

export type FeedbackType = 'COMMENT' | 'FEEDBACK' | 'COMPLAINT';

export interface FeedbackDto {
  id?: number;
  name?: string;
  email?: string | null;
  phone: string;
  comment: string;
  type: FeedbackType;
  archived?: boolean;
  createdAt?: string; 
}

