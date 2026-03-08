import { z } from "zod";

export const depositSchema = z.object({
  paymentMethod: z.enum(["CASH", "TRANSFER", "MOMO", "ZALOPAY"], {
    message: "Vui lòng chọn phương thức thanh toán",
  }),
  transactionCode: z.string().optional(),
  note: z.string().optional(),
});

export type DepositFormData = z.infer<typeof depositSchema>;

export const reviewSchema = z.object({
  bookingId: z.number(),
  rating: z
    .number({ message: "Vui lòng chọn số sao" })
    .min(1, "Vui lòng chọn ít nhất 1 sao")
    .max(5, "Tối đa 5 sao"),
  comment: z.string().optional(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

export type CancelBookingFormData = z.infer<typeof cancelBookingSchema>;
