export interface CarRide {
  id?: string;
  order: number;
  date: string;
  start: string;
  ziel: string;
  anlass: string;
  km: number | null;
  wayBack: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CarRideYear {
  id?: string;
  year: number;
  createdAt: string;
}
