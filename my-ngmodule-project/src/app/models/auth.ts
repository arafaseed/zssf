export interface JwtResponse {
  token: string;
  tokenType: string;      // "Bearer"
  staffIdentification: string;       // e.g. "john.doe"
  role: 'STAFF' | 'ADMIN';
}

export interface StaffLoginRequest {
  staffIdentification: string;
  password: string;
}
