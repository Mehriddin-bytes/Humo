import { Badge } from "@/components/ui/badge";
import { getLicenseStatus } from "@/lib/license-status";

interface StatusBadgeProps {
  expiryDate: Date;
  licenseStatus?: string;
}

export function StatusBadge({ expiryDate, licenseStatus }: StatusBadgeProps) {
  const { label, variant } = getLicenseStatus(new Date(expiryDate), licenseStatus);
  return <Badge variant={variant}>{label}</Badge>;
}
