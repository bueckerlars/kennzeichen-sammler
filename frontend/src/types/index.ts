export interface User {
  id: string;
  username: string;
}

export interface LicensePlate {
  id: string;
  code: string;
  city: string;
  region?: string;
  state: string;
}

export interface UserCollection {
  id: string;
  userId: string;
  licensePlateId: string;
  spottedDate: string;
  createdAt: string;
  licensePlate?: LicensePlate;
}

export interface Statistics {
  total: number;
  collected: number;
  missing: number;
  percentage: number;
  byState: StateStatistics[];
}

export interface StateStatistics {
  state: string;
  total: number;
  collected: number;
  missing: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  count: number;
}

