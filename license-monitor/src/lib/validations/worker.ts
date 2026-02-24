import { z } from "zod";

export const workerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type WorkerFormData = z.infer<typeof workerSchema>;
