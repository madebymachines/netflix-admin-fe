import { z } from "zod";

export const submissionSchema = z.object({
  id: z.number(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  eventType: z.string(),
  pointsEarn: z.number(),
  submissionImageUrl: z.string().url(),
  createdAt: z.string().datetime(),
  isFlagged: z.boolean().optional(),
  flagReason: z.string().nullable().optional(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
  }),
});

export type Submission = z.infer<typeof submissionSchema>;
