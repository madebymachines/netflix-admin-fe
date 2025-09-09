import { z } from "zod";

export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  username: z.string(),
  profilePictureUrl: z.string().nullable(),
  country: z.string().nullable(),
  points: z.number().optional(), // alltime & weekly
  streak: z.number().optional(), // streak
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;