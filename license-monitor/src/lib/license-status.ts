import { differenceInDays } from "date-fns";
import type { LicenseStatusInfo } from "@/types";

export function getLicenseStatus(
  expiryDate: Date,
  licenseStatus?: string
): LicenseStatusInfo {
  // If the license has been replaced by a newer one
  if (licenseStatus === "replaced") {
    return {
      status: "replaced",
      daysUntil: differenceInDays(expiryDate, new Date()),
      label: "Replaced",
      variant: "secondary",
    };
  }

  const now = new Date();
  const diff = differenceInDays(expiryDate, now);

  if (diff < 0) {
    return {
      status: "expired",
      daysUntil: diff,
      label: "Expired",
      variant: "destructive",
    };
  }
  if (diff <= 30) {
    return {
      status: "critical",
      daysUntil: diff,
      label: `${diff}d left`,
      variant: "destructive",
    };
  }
  if (diff <= 60) {
    return {
      status: "warning",
      daysUntil: diff,
      label: `${diff}d left`,
      variant: "orange",
    };
  }
  if (diff <= 90) {
    return {
      status: "caution",
      daysUntil: diff,
      label: `${diff}d left`,
      variant: "yellow",
    };
  }
  return {
    status: "valid",
    daysUntil: diff,
    label: "Valid",
    variant: "success",
  };
}

export function getWorstStatus(
  licenses: { expiryDate: Date; status?: string }[]
): LicenseStatusInfo | null {
  // Only consider active licenses for worst status
  const activeLicenses = licenses.filter((l) => l.status !== "replaced");
  if (activeLicenses.length === 0) return null;

  let worst: LicenseStatusInfo | null = null;
  for (const license of activeLicenses) {
    const status = getLicenseStatus(new Date(license.expiryDate));
    if (!worst || status.daysUntil < worst.daysUntil) {
      worst = status;
    }
  }
  return worst;
}
