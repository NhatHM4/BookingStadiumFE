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
    User,
    Phone,
    Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStadium, useFields, useAvailableSlots } from "@/hooks/use-stadiums";
import { createGuestBooking } from "@/lib/api/bookings";
import { FieldTypeLabel } from "@/types/enums";
import { formatPrice, formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { toast } from "sonner";
import type { AvailableSlotResponse, BookingResponse } from "@/types/index";

function GuestBookingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const fieldIdParam = searchParams.get("fieldId");
    const timeSlotIdParam = searchParams.get("timeSlotId");
    const dateParam = searchParams.get("date");
    const stadiumIdParam = searchParams.get("stadiumId");

    const [selectedFieldId, setSelectedFieldId] = useState<number | null>(
        fieldIdParam ? parseInt(fieldIdParam, 10) : null
    );
    const [selectedSlot, setSelectedSlot] = useState<{
        slot: AvailableSlotResponse;
        date: string;
    } | null>(null);
    const [note, setNote] = useState("");
    const [guestName, setGuestName] = useState("");
    const [guestPhone, setGuestPhone] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);
    const [step, setStep] = useState<"select" | "confirm" | "success">(
        fieldIdParam && timeSlotIdParam && dateParam ? "confirm" : "select"
    );

    const { data: stadium } = useStadium(
        stadiumIdParam ? parseInt(stadiumIdParam, 10) : (selectedFieldId ?? 0)
    );
    const { data: fields } = useFields(
        stadiumIdParam ? parseInt(stadiumIdParam, 10) : (selectedFieldId ?? 0)
    );
    const { data: preFilledSlots } = useAvailableSlots(
        selectedFieldId,
        dateParam
    );

    const preFilledSlot = preFilledSlots?.find(
        (s) => s.timeSlotId === Number(timeSlotIdParam)
    );

    const activeSlot = selectedSlot || (preFilledSlot && dateParam ? { slot: preFilledSlot, date: dateParam } : null);
    const activeField = fields?.find((f) => f.id === selectedFieldId);

    const handleSlotSelect = (slot: AvailableSlotResponse, date: string) => {
        setSelectedSlot({ slot, date });
    };

    const handleConfirm = () => {
        if (!activeSlot || !selectedFieldId) return;
        setStep("confirm");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeSlot || !selectedFieldId) return;

        // Validation
        if (!guestName.trim()) {
            toast.error("Vui lòng nhập tên của bạn");
            return;
        }
        if (!guestPhone.trim()) {
            toast.error("Vui lòng nhập số điện thoại");
            return;
        }
        if (!/^[0-9]{10}$/.test(guestPhone.trim())) {
            toast.error("Số điện thoại không hợp lệ (10 chữ số)");
            return;
        }
        if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
            toast.error("Email không hợp lệ");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createGuestBooking({
                fieldId: selectedFieldId,
                timeSlotId: activeSlot.slot.timeSlotId,
                bookingDate: activeSlot.date,
                note: note.trim() || undefined,
                guestName: guestName.trim(),
                guestPhone: guestPhone.trim(),
                guestEmail: guestEmail.trim() || undefined,
            });

            if (result.data) {
                setBookingResult(result.data);
                setStep("success");
                toast.success("Đặt sân thành công!");
            }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "Đặt sân thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (step === "success" && bookingResult) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Card className="text-center">
                    <CardContent className="pt-8 pb-8 space-y-4">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold">Đặt sân thành công!</h2>
                        <p className="text-muted-foreground">
                            Mã đặt sân: <span className="font-mono font-bold text-foreground">{bookingResult.bookingCode}</span>
                        </p>
                        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2 text-left">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tên khách</span>
                                <span className="font-medium">{bookingResult.guestName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">SĐT</span>
                                <span className="font-medium">{bookingResult.guestPhone}</span>
                            </div>
                            {bookingResult.guestEmail && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium">{bookingResult.guestEmail}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sân</span>
                                <span className="font-medium">{bookingResult.stadiumName} - {bookingResult.fieldName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ngày</span>
                                <span className="font-medium">{formatDate(bookingResult.bookingDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Giờ</span>
                                <span className="font-medium">{bookingResult.startTime} - {bookingResult.endTime}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tổng giá</span>
                                <span className="font-bold">{formatPrice(bookingResult.totalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Cần đặt cọc</span>
                                <span className="font-bold text-primary">{formatPrice(bookingResult.depositAmount)}</span>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-left">
                            <p className="font-medium text-amber-800 mb-2">⏰ Lưu ý quan trọng:</p>
                            <ul className="text-amber-700 space-y-1 list-disc list-inside">
                                <li>Vui lòng đặt cọc trong vòng 30 phút để giữ chỗ</li>
                                <li>Chủ sân sẽ liên hệ qua số điện thoại: <strong>{bookingResult.guestPhone}</strong></li>
                                <li>Vui lòng giữ mã đặt sân: <strong>{bookingResult.bookingCode}</strong></li>
                            </ul>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Link href={`/bookings/lookup?code=${bookingResult.bookingCode}`}>
                                <Button>Tra cứu đơn đặt sân</Button>
                            </Link>
                            <Link href="/stadiums">
                                <Button variant="outline">Tìm sân khác</Button>
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

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Đặt sân (Khách)</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Đặt sân nhanh không cần đăng nhập
                </p>
            </div>

            {step === "select" && (
                <div className="space-y-6">
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
                            fieldName={activeField?.name || `Sân #${selectedFieldId}`}
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
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Booking form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="guestName">
                                            Tên của bạn <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="guestName"
                                                placeholder="VD: Nguyễn Văn A"
                                                value={guestName}
                                                onChange={(e) => setGuestName(e.target.value)}
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guestPhone">
                                            Số điện thoại <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="guestPhone"
                                                type="tel"
                                                placeholder="VD: 0912345678"
                                                value={guestPhone}
                                                onChange={(e) => setGuestPhone(e.target.value)}
                                                required
                                                pattern="[0-9]{10}"
                                                className="pl-10"
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Chủ sân sẽ liên hệ qua số này
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guestEmail">Email (tùy chọn)</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="guestEmail"
                                                type="email"
                                                placeholder="VD: email@example.com"
                                                value={guestEmail}
                                                onChange={(e) => setGuestEmail(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                                        <Textarea
                                            id="note"
                                            placeholder="VD: Cần chuẩn bị trước 15 phút..."
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>💡 Gợi ý:</strong> Đăng nhập để quản lý lịch sử đặt sân và tham gia ráp kèo!{" "}
                                    <Link href="/login" className="underline font-medium">
                                        Đăng nhập ngay
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Summary sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-lg">Tóm tắt đặt sân</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Sân</p>
                                            <p className="font-medium">
                                                {activeField?.name || `Sân #${selectedFieldId}`}
                                            </p>
                                            {activeField && (
                                                <Badge variant="secondary" className="mt-1">
                                                    {FieldTypeLabel[activeField.fieldType]}
                                                </Badge>
                                            )}
                                        </div>
                                        <Separator />
                                        <div className="flex items-start gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Ngày</p>
                                                <p className="font-medium">{formatDate(activeSlot.date)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Giờ</p>
                                                <p className="font-medium">
                                                    {activeSlot.slot.startTime} - {activeSlot.slot.endTime}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Giá sân</span>
                                                <span className="font-medium">
                                                    {formatPrice(activeSlot.slot.price)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-primary">
                                                <span className="text-sm font-medium">Cần đặt cọc (30%)</span>
                                                <span className="font-bold">
                                                    {formatPrice(activeSlot.slot.price * 0.3)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            size="lg"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                "Xác nhận đặt sân"
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setStep("select")}
                                            disabled={isSubmitting}
                                        >
                                            Quay lại
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}

export default function GuestBookingPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <GuestBookingContent />
        </Suspense>
    );
}
