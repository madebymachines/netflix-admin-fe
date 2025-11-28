import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  country: z.string().nullable(),
  purchaseStatus: z.enum(["NOT_VERIFIED", "PENDING", "APPROVED", "REJECTED"]),
  isBanned: z.boolean(),
  createdAt: z.string().datetime(),
  // Menambahkan stats.totalChallenges (nullable karena bisa jadi userStats belum ada)
  stats: z
    .object({
      totalChallenges: z.number(),
    })
    .nullable()
    .optional(),
});

export type User = z.infer<typeof userSchema>;
