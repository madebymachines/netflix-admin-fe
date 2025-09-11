import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  country: z.string().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).nullable(),
  purchaseStatus: z.enum(["NOT_VERIFIED", "PENDING", "APPROVED", "REJECTED"]),
  isBanned: z.boolean(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;
