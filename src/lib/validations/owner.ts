import { z } from "zod";

export const stadiumSchema = z.object({
  name: z.string().min(2, "Tên sân tối thiểu 2 ký tự").max(100, "Tên sân tối đa 100 ký tự"),
  address: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
  district: z.string().optional(),
  city: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export type StadiumFormData = z.infer<typeof stadiumSchema>;

export const fieldSchema = z.object({
  name: z.string().min(1, "Tên sân con không được trống"),
  fieldType: z.enum(["FIVE_A_SIDE", "SEVEN_A_SIDE", "ELEVEN_A_SIDE", ""], {
    message: "Chọn loại sân",
  }),
  defaultPrice: z.number().min(0, "Giá không hợp lệ"),
  parentFieldId: z.number().nullable().optional(),
});

export type FieldFormData = z.infer<typeof fieldSchema>;

export const timeSlotSchema = z.object({
  startTime: z.string().min(1, "Chọn giờ bắt đầu"),
  endTime: z.string().min(1, "Chọn giờ kết thúc"),
  price: z.number().min(0, "Giá không hợp lệ"),
});

export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

export const depositPolicySchema = z.object({
  depositPercent: z.number().min(0).max(100, "Tối đa 100%"),
  refundBeforeHours: z.number().min(0).optional(),
  refundPercent: z.number().min(0).max(100).optional(),
  lateCancelRefundPercent: z.number().min(0).max(100).optional(),
  recurringDiscountPercent: z.number().min(0).max(100).optional(),
  minRecurringSessions: z.number().min(1).optional(),
  isDepositRequired: z.boolean().optional(),
});

export type DepositPolicyFormData = z.infer<typeof depositPolicySchema>;
