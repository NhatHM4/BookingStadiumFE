import { z } from "zod";

export const recurringBookingSchema = z.object({
  fieldId: z.number({ message: "Chọn sân" }).min(1, "Chọn sân"),
  timeSlotId: z.number({ message: "Chọn khung giờ" }).min(1, "Chọn khung giờ"),
  recurrenceType: z.enum(["WEEKLY", "MONTHLY"], {
    message: "Chọn loại lịch lặp",
  }),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Chọn ngày kết thúc"),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

export type RecurringBookingFormData = z.infer<typeof recurringBookingSchema>;
