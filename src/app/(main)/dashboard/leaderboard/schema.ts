import { z } from "zod";

export const leaderboardEntrySchema = z.object({
  userId: z.number(),
  rank: z.number(),
  username: z.string(),
  profilePictureUrl: z.string().nullable(),
  country: z.string().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).nullable().optional(),
  points: z.number().optional(), // alltime & weekly
  streak: z.number().optional(), // streak
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
