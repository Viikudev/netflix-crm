import * as z from "zod";

export const createServiceSchema = z.object({
  serviceName: z.string().min(1, "Required"),
  price: z.number().nonnegative(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
});

export type CreateServiceValues = z.infer<typeof createServiceSchema>;

export const createActiveAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  expirationDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date string",
  }),
});

export type CreateActiveAccountValues = z.infer<
  typeof createActiveAccountSchema
>;

export const createClientStatusSchema = z.object({
  clientName: z
    .string()
    .max(20, "El nombre del cliente debe tener como máximo 20 caracteres")
    .min(1, "Required"),
  phoneNumber: z.string().min(1, "Required"),
  activeAccountId: z.string().min(1, "Required"),
  serviceId: z.string().min(1, "Required"),
  profileName: z.string().min(1, "Required"),
  profilePIN: z.coerce
    .number()
    .int()
    .gte(1000, "Must be at least 4 digits")
    .lte(9999, "Must be no more than 4 digits"),
  status: z.enum(["ACTIVE", "EXPIRED", "NEAR_EXPIRATION"]),
  expirationDate: z.string().optional().nullable(),
});

export type CreateClientStatusValues = z.infer<typeof createClientStatusSchema>;
