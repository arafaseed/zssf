export interface JwtResponse {
  token: string;
  tokenType: string;      // "Bearer"
  staffIDN: string;       // e.g. "john.doe"
  role: 'STAFF' | 'ADMIN';
}

export interface StaffLoginRequest {
  staffIDN: string;
  password: string;
}
