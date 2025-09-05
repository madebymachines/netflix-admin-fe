import { z } from "zod";

export const verificationSchema = z.object({
  id: z.number(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "NOT_VERIFIED"]),
  receiptImageUrl: z.string().url(),
  submittedAt: z.string().datetime(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export type Verification = z.infer<typeof verificationSchema>;
