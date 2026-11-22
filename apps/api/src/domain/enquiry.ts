import { z } from "zod";

export const enquiryInputSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((value) => value || undefined),
  message: z.string().trim().min(10).max(2000),
});

export type EnquiryInput = z.infer<typeof enquiryInputSchema>;
