import { z } from "zod";

export type Timespan = "weekly" | "monthly";

export const leaderboardEntrySchema = z.object({
  userId: z.number(),
  rank: z.number(),
  username: z.string(),
  profilePictureUrl: z.string().nullable(),
  country: z.string().nullable(),
  points: z.number().optional(), // alltime, weekly, monthly
  streak: z.number().optional(), // streak
  isNotified: z.boolean().optional(), // Ditambahkan
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
