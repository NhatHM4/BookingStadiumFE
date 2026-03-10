"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Search,
    ArrowLeft,
    CalendarDays,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useLookupBooking } from "@/hooks/use-bookings";
import { formatPrice, formatDate } from "@/lib/utils";
import { DepositStatusLabel, DepositStatus } from "@/types/enums";

function LookupContent() {
    const searchParams = useSearchParams();
    const codeParam = searchParams.get("code") || "";

    const [inputCode, setInputCode] = useState(codeParam);
    const [searchCode, setSearchCode] = useState(codeParam);

    const { data: booking, isLoading, error } = useLookupBooking(searchCode);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = inputCode.trim().toUpperCase();
        if (trimmed) {
            setSearchCode(trimmed);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link
                href="/stadiums"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
            >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Quay lại
            </Link>

            <div className="mb-6">
                <h1 className="text-2xl font-bold">Tra cứu đơn đặt sân</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Nhập mã đặt sân để xem thông tin đơn hàng
                </p>
            </div>

            {/* Search form */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1">
                            <Label htmlFor="bookingCode" className="sr-only">
                                Mã đặt sân
                            </Label>
                            <Input
                                id="bookingCode"
                                placeholder="VD: BK20250315A1B2C3"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                className="font-mono"
                            />
                        </div>
                        <Button type="submit" disabled={!inputCode.trim() || isLoading}>
                            <Search className="h-4 w-4 mr-2" />
                            Tra cứu
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Loading */}
            {isLoading && <LoadingSpinner text="Đang tra cứu..." />}

            {/* Error */}
            {error && searchCode && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <h3 className="font-semibold text-lg mb-1">Không tìm thấy đơn đặt sân</h3>
                        <p className="text-sm text-muted-foreground">
                            Mã <span className="font-mono font-bold">{searchCode}</span> không tồn tại.
                            Vui lòng kiểm tra lại mã đặt sân.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Result */}
            {booking && !isLoading && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Chi tiết đơn đặt sân</CardTitle>
                            <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Mã: <span className="font-mono font-bold">{booking.bookingCode}</span>
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Guest info */}
                        {booking.isGuestBooking && (
                            <>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Thông tin khách
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{booking.guestName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{booking.guestPhone}</span>
                                        </div>
                                        {booking.guestEmail && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{booking.guestEmail}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Booking info */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Sân</p>
                                    <p className="font-medium">
                                        {booking.stadiumName} - {booking.fieldName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Ngày</p>
                                    <p className="font-medium">{formatDate(booking.bookingDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Giờ</p>
                                    <p className="font-medium">
                                        {booking.startTime} - {booking.endTime}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment info */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tổng giá</span>
                                <span className="font-bold">{formatPrice(booking.totalPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Đặt cọc</span>
                                <span className="font-medium">{formatPrice(booking.depositAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Còn lại</span>
                                <span className="font-medium">{formatPrice(booking.remainingAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Trạng thái cọc</span>
                                <StatusBadge status={booking.depositStatus} />
                            </div>
                        </div>

                        {booking.note && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                                    <p className="text-sm">{booking.note}</p>
                                </div>
                            </>
                        )}

                        <Separator />
                        <p className="text-xs text-muted-foreground">
                            Ngày tạo: {formatDate(booking.createdAt)}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function BookingLookupPage() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <LookupContent />
        </Suspense>
    );
}
