"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStadium, useFields, useAvailableSlots } from "@/hooks/use-stadiums";
import { useCreateBooking } from "@/hooks/use-bookings";
import { FieldTypeLabel } from "@/types/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { toast } from "sonner";
import type { AvailableSlotResponse, FieldResponse } from "@/types/index";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const fieldIdParam = searchParams.get("fieldId");
  const timeSlotIdParam = searchParams.get("timeSlotId");
  const dateParam = searchParams.get("date");

  // If we have all params we come from stadium detail, otherwise user needs to pick
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(
    fieldIdParam ? parseInt(fieldIdParam, 10) : null
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    slot: AvailableSlotResponse;
    date: string;
  } | null>(null);
  const [note, setNote] = useState("");
  const [isMatchRequest, setIsMatchRequest] = useState(false);
  const [step, setStep] = useState<"select" | "confirm" | "success">(
    fieldIdParam && timeSlotIdParam && dateParam ? "confirm" : "select"
  );

  // For pre-filled flow, we need the available slots to get price info
  const { data: preFilledSlots } = useAvailableSlots(
    selectedFieldId,
    dateParam
  );

  // Get pre-filled slot from available slots
  const preFilledSlot = preFilledSlots?.find(
    (s) => s.timeSlotId === Number(timeSlotIdParam)
  );

  // Determine stadiumId from fields or from selectedFieldId
  // We need a way to get stadium info — let's get fields by checking existing data
  const createBooking = useCreateBooking();

  // If preFilledSlot is available but selectedSlot is not set, set it
  if (preFilledSlot && !selectedSlot && dateParam) {
    // Will be set on first render after data loads
  }

  const activeSlot = selectedSlot || (preFilledSlot && dateParam ? { slot: preFilledSlot, date: dateParam } : null);

  const handleSlotSelect = (slot: AvailableSlotResponse, date: string) => {
    setSelectedSlot({ slot, date });
  };

  const handleConfirm = () => {
    if (!activeSlot || !selectedFieldId) return;
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!activeSlot || !selectedFieldId) return;

    try {
      const result = await createBooking.mutateAsync({
        fieldId: selectedFieldId,
        timeSlotId: activeSlot.slot.timeSlotId,
        bookingDate: activeSlot.date,
        note: note || undefined,
        isMatchRequest,
      });

      if (result.data) {
        setStep("success");
        toast.success("Đặt sân thành công!");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Đặt sân thất bại");
    }
  };

  // Success state
  if (step === "success" && createBooking.data?.data) {
    const booking = createBooking.data.data;
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Đặt sân thành công!</h2>
            <p className="text-muted-foreground">
              Mã đặt sân: <span className="font-mono font-bold text-foreground">{booking.bookingCode}</span>
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sân</span>
                <span className="font-medium">{booking.stadiumName} - {booking.fieldName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày</span>
                <span className="font-medium">{formatDate(booking.bookingDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giờ</span>
                <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng giá</span>
                <span className="font-bold">{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cần đặt cọc</span>
                <span className="font-bold text-primary">{formatPrice(booking.depositAmount)}</span>
              </div>
            </div>
            <p className="text-sm text-amber-600">
              ⏰ Vui lòng đặt cọc trong vòng 30 phút để giữ chỗ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href={`/bookings/${booking.id}`}>
                <Button>Đặt cọc ngay</Button>
              </Link>
              <Link href="/bookings">
                <Button variant="outline">Xem lịch sử đặt sân</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/stadiums"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      <h1 className="text-2xl font-bold mb-6">Đặt sân bóng</h1>

      {step === "select" && (
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Chọn sân và khung giờ bạn muốn đặt
          </p>

          {/* Field Selector - only show if no pre-selected field */}
          {!selectedFieldId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chọn sân</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Vui lòng truy cập trang chi tiết sân để chọn sân và khung giờ
                </p>
                <Link href="/stadiums">
                  <Button variant="outline" className="mt-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    Tìm sân
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Slot Picker */}
          {selectedFieldId && (
            <SlotPicker
              fieldId={selectedFieldId}
              fieldName={`Sân #${selectedFieldId}`}
              onSlotSelect={handleSlotSelect}
              selectedSlotId={activeSlot?.slot.timeSlotId}
            />
          )}

          {activeSlot && (
            <div className="flex justify-end">
              <Button size="lg" onClick={handleConfirm}>
                Tiếp tục xác nhận
              </Button>
            </div>
          )}
        </div>
      )}

      {step === "confirm" && activeSlot && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin đặt sân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Ghi chú (tùy chọn)</Label>
                  <Textarea
                    placeholder="VD: Đặt cho team ABC, cần chuẩn bị trước 15 phút..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="matchRequest"
                    checked={isMatchRequest}
                    onChange={(e) => setIsMatchRequest(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <Label htmlFor="matchRequest" className="cursor-pointer text-sm">
                    Đăng tìm đối thủ (ráp kèo)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận đặt sân"
                )}
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Tóm tắt đơn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(activeSlot.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {activeSlot.slot.startTime} - {activeSlot.slot.endTime}
                  </span>
                </div>
                {isMatchRequest && (
                  <Badge variant="secondary">🎯 Tìm đối thủ</Badge>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Giá sân</span>
                  <span>{formatPrice(activeSlot.slot.price)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingNewPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Đang tải..." />}>
      <BookingContent />
    </Suspense>
  );
}
