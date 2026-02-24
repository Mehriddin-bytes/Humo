export type LicenseStatus = "expired" | "critical" | "warning" | "caution" | "valid" | "replaced";

export interface LicenseStatusInfo {
  status: LicenseStatus;
  daysUntil: number;
  label: string;
  variant: "destructive" | "orange" | "yellow" | "success" | "secondary";
}

export interface WorkerWithLicenses {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  licenses: LicenseWithType[];
}

export interface LicenseWithType {
  id: string;
  code: string | null;
  issueDate: Date;
  expiryDate: Date;
  status: string;
  workerId: string;
  licenseTypeId: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  licenseType: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface LicenseWithWorker extends LicenseWithType {
  worker: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    position: string | null;
  };
}

export interface DashboardStats {
  totalWorkers: number;
  totalLicenses: number;
  expired: number;
  expiring30: number;
  expiring60: number;
  expiring90: number;
  valid: number;
  licenses: LicenseWithWorker[];
}