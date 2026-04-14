import { z } from "zod";

export const teamSchema = z.object({
  name: z
    .string()
    .min(2, "Tên đội tối thiểu 2 ký tự")
    .max(100, "Tên đội tối đa 100 ký tự"),
  phone: z
    .string()
    .min(10, "SĐT tối thiểu 10 số")
    .max(15, "SĐT tối đa 15 số")
    .regex(/^[0-9+()\-\s]+$/, "SĐT không hợp lệ"),
  logoUrl: z
    .string()
    .url("URL logo không hợp lệ")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  preferredFieldType: z
    .enum(["FIVE_A_SIDE", "SEVEN_A_SIDE", "ELEVEN_A_SIDE"])
    .optional(),
  skillLevel: z
    .enum(["ANY", "BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"])
    .optional(),
  city: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
});

export type TeamFormData = z.infer<typeof teamSchema>;

export const addMemberSchema = z.object({
  name: z.string().min(2, "Tên thành viên tối thiểu 2 ký tự"),
  phone: z
    .string()
    .min(10, "SĐT tối thiểu 10 số")
    .max(15, "SĐT tối đa 15 số")
    .regex(/^[0-9+()\-\s]+$/, "SĐT không hợp lệ")
    .optional()
    .or(z.literal("")),
});

export type AddMemberFormData = z.infer<typeof addMemberSchema>;

export const matchRequestSchema = z.object({
  bookingId: z.number().min(1, "Chọn booking"),
  teamId: z.number().min(1, "Chọn đội"),
  requiredSkillLevel: z
    .enum(["ANY", "BEGINNER", "INTERMEDIATE", "ADVANCED", "PRO"])
    .optional(),
  costSharing: z
    .enum(["EQUAL_SPLIT", "HOST_PAY", "OPPONENT_PAY", "CUSTOM"])
    .optional(),
  hostSharePercent: z.number().min(0).max(100).optional(),
  opponentSharePercent: z.number().min(0).max(100).optional(),
  message: z.string().max(500).optional(),
  contactPhone: z.string().max(20).optional(),
});

export type MatchRequestFormData = z.infer<typeof matchRequestSchema>;

export const matchResponseSchema = z.object({
  teamId: z.number().min(1, "Chọn đội"),
  message: z.string().max(500).optional(),
});

export type MatchResponseFormData = z.infer<typeof matchResponseSchema>;
