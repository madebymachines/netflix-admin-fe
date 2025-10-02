import { z } from "zod";

export const verificationSchema = z.object({
  id: z.number(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "NOT_VERIFIED"]),
  type: z.enum(["MEMBER_GYM", "RECEIPT"]),
  receiptImageUrl: z.string().url(),
  submittedAt: z.string().datetime(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
  }),
});

export type Verification = z.infer<typeof verificationSchema>;
