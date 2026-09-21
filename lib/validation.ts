// lib/validation.ts — Zod schemas for all API routes
import { z } from "zod";

// ── Common
export const UserIdSchema = z.string().min(5).max(200);

// ── Prospect
export const ProspectCreateSchema = z.object({
  userId:       UserIdSchema,
  name:         z.string().min(1).max(100),
  email:        z.string().email().max(200),
  company:      z.string().max(200).optional().default(""),
  title:        z.string().max(100).optional().default(""),
  role:         z.string().max(100).optional().default(""),
  industry:     z.string().max(100).optional().default(""),
  company_size: z.string().max(50).optional().default(""),
  linkedin_url: z.string().url().max(300).optional().or(z.literal("")),
  notes:        z.string().max(2000).optional().default(""),
  ai_score:     z.number().min(0).max(100).optional().default(50),
  buying_intent:z.enum(["high","medium","low","pending"]).optional().default("medium"),
  status:       z.enum(["new","contacted","replied","meeting","closed","lost"]).optional().default("new"),
  avatar_init:  z.string().max(2).optional().default(""),
  avatar_bg:    z.string().max(200).optional().default("#1a2035"),
  avatar_color: z.string().max(50).optional().default("#C8FF00"),
});

export const ProspectUpdateSchema = z.object({
  id:           z.string().uuid(),
  userId:       UserIdSchema.optional(),
  name:         z.string().min(1).max(100).optional(),
  email:        z.string().email().max(200).optional(),
  company:      z.string().max(200).optional(),
  notes:        z.string().max(2000).optional(),
  status:       z.enum(["new","contacted","replied","meeting","closed","lost"]).optional(),
  ai_score:     z.number().min(0).max(100).optional(),
  buying_intent:z.enum(["high","medium","low","pending"]).optional(),
  sequence_id:  z.string().optional().nullable(),
});

// ── AI Request
export const AIRequestSchema = z.object({
  prompt:  z.string().min(5).max(5000),
  type:    z.string().max(50).optional(),
  system:  z.string().max(3000).optional(),
  userId:  UserIdSchema.optional(),
});

// ── Profile
export const ProfileUpdateSchema = z.object({
  userId:        UserIdSchema,
  name:          z.string().max(100).optional(),
  company:       z.string().max(200).optional(),
  role:          z.string().max(100).optional(),
  timezone:      z.string().max(100).optional(),
  phone:         z.string().max(20).optional(),
  linkedin:      z.string().url().max(300).optional().or(z.literal("")),
  notifications: z.record(z.string(), z.boolean()).optional(),
  avatar_url:    z.string().url().max(500).optional(),
});

// ── Sequence
export const SequenceCreateSchema = z.object({
  userId: UserIdSchema,
  name:   z.string().min(1).max(200),
  steps:  z.array(z.object({
    type:    z.string(),
    subject: z.string().max(200).optional(),
    body:    z.string().max(5000).optional(),
    delay:   z.number().min(0).max(365).optional(),
  })).optional().default([]),
  status: z.enum(["draft","active","paused"]).optional().default("draft"),
});

// ── Helper: safe parse with error response
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  const errors = result.error.issues.map((e: { path: (string|number)[]; message: string }) => `${e.path.join(".")}: ${e.message}`).join(", ");
  return { success: false, error: `Validation failed: ${errors}` };
}
