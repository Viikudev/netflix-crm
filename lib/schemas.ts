import * as z from "zod";

export const createServiceSchema = z.object({
  serviceName: z.string().min(1, "Required"),
  price: z.number().nonnegative(),
  imageUrl: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
});

export type CreateServiceValues = z.infer<typeof createServiceSchema>;
