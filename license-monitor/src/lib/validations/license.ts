import { z } from "zod";

export const licenseSchema = z.object({
  workerId: z.string().min(1, "Worker is required"),
  licenseTypeId: z.string().min(1, "License type is required"),
  code: z.string().optional().or(z.literal("")),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  notes: z.string().optional().or(z.literal("")),
});

export type LicenseFormData = z.infer<typeof licenseSchema>;
