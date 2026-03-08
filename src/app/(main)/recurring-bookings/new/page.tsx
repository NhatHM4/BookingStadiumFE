"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Repeat,
  CheckCircle,
  Loader2,
  CalendarDays,
  Search,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStadiums, useFields, useTimeSlots } from "@/hooks/use-stadiums";
import { useCreateRecurringBooking } from "@/hooks/use-recurring";
import { FieldTypeLabel, RecurrenceTypeLabel } from "@/types/enums";
import { formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { RecurrenceType } from "@/types/enums";
import {
  recurringBookingSchema,
  type RecurringBookingFormData,
} from "@/lib/validations/recurring";
import { toast } from "sonner";

function RecurringBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStadiumId, setSelectedStadiumId] = useState<number | null>(
    searchParams.get("stadiumId")
      ? parseInt(searchParams.get("stadiumId")!, 10)
      : null
  );
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(
    searchParams.get("fieldId")
      ? parseInt(searchParams.get("fieldId")!, 10)
      : null
  );
  const [step, setStep] = useState<"form" | "success">("form");
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stadiums, isLoading: loadingStadiums } = useStadiums({
    name: searchQuery || undefined,
  });
  const { data: fields } = useFields(selectedStadiumId || 0);
  const { data: timeSlots } = useTimeSlots(selectedFieldId);

  const createRecurring = useCreateRecurringBooking();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RecurringBookingFormData>({
    resolver: zodResolver(recurringBookingSchema),
    defaultValues: {
      fieldId: selectedFieldId || undefined,
      recurrenceType: "WEEKLY",
    },
  });

  const watchedFieldId = watch("fieldId");
  const watchedTimeSlotId = watch("timeSlotId");

  const selectedTimeSlot = timeSlots?.find(
    (ts) => ts.id === watchedTimeSlotId
  );

  const onSubmit = async (data: RecurringBookingFormData) => {
    try {
      const result = await createRecurring.mutateAsync({
        ...data,
        recurrenceType: data.recurrenceType as RecurrenceType,
      });
      if (result.data) {
        setCreatedId(result.data.id);
        setStep("success");
        toast.success("Đặt sân định kỳ thành công!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Đặt sân thất bại");
    }
  };

  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Đặt sân định kỳ thành công!</h2>
          <p className="text-muted-foreground mb-6">
            Lịch đặt sân lặp lại đã được tạo. Vui lòng đợi chủ sân xác nhận.
          </p>
          <div className="flex gap-3 justify-center">
            {createdId && (
              <Link href={`/recurring-bookings/${createdId}`}>
                <Button>Xem chi tiết</Button>
              </Link>
            )}
            <Link href="/recurring-bookings">
              <Button variant="outline">Danh sách</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/recurring-bookings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Đặt sân định kỳ</h1>
          <p className="text-sm text-muted-foreground">
            Tạo lịch đặt sân lặp lại hàng tuần hoặc hàng tháng
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Select Stadium */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Chọn sân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {loadingStadiums ? (
              <LoadingSpinner size="sm" text="Đang tải..." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {stadiums?.content?.map((stadium) => (
                  <button
                    key={stadium.id}
                    type="button"
                    onClick={() => {
                      setSelectedStadiumId(stadium.id);
                      setSelectedFieldId(null);
                      setValue("fieldId", 0);
                      setValue("timeSlotId", 0);
                    }}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedStadiumId === stadium.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                  >
                    <p className="font-medium text-sm truncate">
                      {stadium.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {stadium.address}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Field */}
        {selectedStadiumId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Chọn sân con</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {fields
                  ?.filter((f) => f.isActive)
                  .map((field) => (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        setValue("fieldId", field.id);
                        setValue("timeSlotId", 0);
                      }}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        watchedFieldId === field.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      }`}
                    >
                      <p className="font-medium text-sm">{field.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {FieldTypeLabel[field.fieldType]} •{" "}
                        {formatPrice(field.defaultPrice)}
                      </p>
                    </button>
                  ))}
              </div>
              {errors.fieldId && (
                <p className="text-sm text-destructive mt-2">
                  {errors.fieldId.message}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Time Slot */}
        {selectedFieldId && timeSlots && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Chọn khung giờ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots
                  .filter((ts) => ts.isActive)
                  .map((ts) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => setValue("timeSlotId", ts.id)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        watchedTimeSlotId === ts.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-accent"
                      }`}
                    >
                      <p className="font-medium text-sm">
                        {ts.startTime} - {ts.endTime}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(ts.price)}
                      </p>
                    </button>
                  ))}
              </div>
              {errors.timeSlotId && (
                <p className="text-sm text-destructive mt-2">
                  {errors.timeSlotId.message}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Recurrence settings */}
        {watchedTimeSlotId > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Cài đặt lịch lặp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Loại lặp</Label>
                <Select
                  value={watch("recurrenceType")}
                  onValueChange={(v) =>
                    setValue(
                      "recurrenceType",
                      (v ?? "WEEKLY") as "WEEKLY" | "MONTHLY"
                    )
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Chọn..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">
                      {RecurrenceTypeLabel.WEEKLY}
                    </SelectItem>
                    <SelectItem value="MONTHLY">
                      {RecurrenceTypeLabel.MONTHLY}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.recurrenceType && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.recurrenceType.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Ngày bắt đầu</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className="mt-1"
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endDate">Ngày kết thúc</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className="mt-1"
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
                <Textarea
                  id="note"
                  {...register("note")}
                  placeholder="Ghi chú thêm..."
                  className="mt-1"
                />
                {errors.note && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.note.message}
                  </p>
                )}
              </div>

              {/* Summary */}
              {selectedTimeSlot && (
                <>
                  <Separator />
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-medium">Tóm tắt:</p>
                    <p>
                      Khung giờ: {selectedTimeSlot.startTime} -{" "}
                      {selectedTimeSlot.endTime}
                    </p>
                    <p>Giá/buổi: {formatPrice(selectedTimeSlot.price)}</p>
                    <p>
                      Loại lặp:{" "}
                      {RecurrenceTypeLabel[watch("recurrenceType") || "WEEKLY"]}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link href="/recurring-bookings">
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={createRecurring.isPending}
          >
            {createRecurring.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            <Repeat className="h-4 w-4 mr-2" />
            Đặt định kỳ
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewRecurringBookingPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Đang tải..." />}>
      <RecurringBookingContent />
    </Suspense>
  );
}
