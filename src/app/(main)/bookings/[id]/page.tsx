"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Banknote,
  X,
  Star,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useBooking,
  useBookingDeposits,
  useCancelBooking,
  useCreateDeposit,
  useCreateReview,
} from "@/hooks/use-bookings";
import {
  BookingStatus,
  BookingStatusLabel,
  DepositStatusLabel,
  DepositTransactionStatusLabel,
  PaymentMethod,
  PaymentMethodLabel,
} from "@/types/enums";
import {
  depositSchema,
  reviewSchema,
  type DepositFormData,
  type ReviewFormData,
} from "@/lib/validations/booking";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const bookingId = parseInt(id, 10);

  const { data: booking, isLoading, error } = useBooking(bookingId);
  const { data: deposits } = useBookingDeposits(bookingId);
  const cancelBooking = useCancelBooking();
  const createDeposit = useCreateDeposit();
  const createReview = useCreateReview();

  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="Đang tải chi tiết đơn..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn</h2>
        <Link href="/bookings">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const canDeposit = booking.status === BookingStatus.PENDING;
  const canCancel =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.DEPOSIT_PAID ||
    booking.status === BookingStatus.CONFIRMED;
  const canReview = booking.status === BookingStatus.COMPLETED;

  const statusColorMap: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [BookingStatus.DEPOSIT_PAID]: "bg-blue-100 text-blue-800",
    [BookingStatus.CONFIRMED]: "bg-green-100 text-green-800",
    [BookingStatus.COMPLETED]: "bg-emerald-100 text-emerald-800",
    [BookingStatus.CANCELLED]: "bg-red-100 text-red-800",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/bookings"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại lịch sử đặt sân
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chi tiết đặt sân</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            {booking.bookingCode}
          </p>
        </div>
        <Badge className={statusColorMap[booking.status]} variant="outline">
          {BookingStatusLabel[booking.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin đặt sân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow icon={MapPin} label="Sân">
                <Link href={`/stadiums/${booking.stadiumId}`} className="text-primary hover:underline">
                  {booking.stadiumName}
                </Link>
                {" — "}
                {booking.fieldName}
              </InfoRow>
              <InfoRow icon={CalendarDays} label="Ngày">
                {formatDate(booking.bookingDate)}
              </InfoRow>
              <InfoRow icon={Clock} label="Giờ">
                {booking.startTime} - {booking.endTime}
              </InfoRow>
              {booking.note && (
                <InfoRow icon={Info} label="Ghi chú">
                  {booking.note}
                </InfoRow>
              )}
              {booking.isMatchRequest && (
                <Badge variant="secondary">🎯 Đang tìm đối thủ</Badge>
              )}
              {booking.cancelledAt && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="text-red-700 font-medium">
                    Đã hủy: {formatDateTime(booking.cancelledAt)}
                  </p>
                  {booking.cancelReason && (
                    <p className="text-red-600 mt-1">
                      Lý do: {booking.cancelReason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deposit history */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Lịch sử đặt cọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deposits && deposits.length > 0 ? (
                <div className="space-y-3">
                  {deposits.map((deposit) => (
                    <div
                      key={deposit.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {formatPrice(deposit.amount)}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {deposit.depositType === "REFUND"
                              ? "Hoàn tiền"
                              : "Đặt cọc"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {DepositTransactionStatusLabel[deposit.status]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {PaymentMethodLabel[deposit.paymentMethod]} ·{" "}
                          {formatDateTime(deposit.createdAt)}
                        </p>
                        {deposit.transactionCode && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Mã GD: {deposit.transactionCode}
                          </p>
                        )}
                      </div>
                      <div>
                        {deposit.status === "CONFIRMED" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {deposit.status === "REJECTED" && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        {deposit.status === "PENDING" && (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có giao dịch cọc nào
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chi phí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá sân</span>
                <span className="font-medium">{formatPrice(booking.totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Đặt cọc</span>
                <span className="font-medium text-primary">
                  {formatPrice(booking.depositAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Còn lại</span>
                <span>{formatPrice(booking.remainingAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trạng thái cọc</span>
                <Badge variant="secondary">
                  {DepositStatusLabel[booking.depositStatus]}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              {canDeposit && (
                <DepositDialog
                  bookingId={bookingId}
                  depositAmount={booking.depositAmount}
                  open={showDepositDialog}
                  onOpenChange={setShowDepositDialog}
                  createDeposit={createDeposit}
                />
              )}

              {canReview && (
                <ReviewDialog
                  bookingId={bookingId}
                  open={showReviewDialog}
                  onOpenChange={setShowReviewDialog}
                  createReview={createReview}
                />
              )}

              {canCancel && (
                <CancelDialog
                  bookingId={bookingId}
                  open={showCancelDialog}
                  onOpenChange={setShowCancelDialog}
                  cancelBooking={cancelBooking}
                />
              )}

              <p className="text-xs text-muted-foreground text-center">
                Tạo lúc: {formatDateTime(booking.createdAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ========================
// Sub-components
// ========================

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm font-medium">{children}</p>
      </div>
    </div>
  );
}

function DepositDialog({
  bookingId,
  depositAmount,
  open,
  onOpenChange,
  createDeposit,
}: {
  bookingId: number;
  depositAmount: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createDeposit: ReturnType<typeof useCreateDeposit>;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const onSubmit = async (data: DepositFormData) => {
    try {
      await createDeposit.mutateAsync({
        bookingId,
        data: {
          paymentMethod: data.paymentMethod as PaymentMethod,
          transactionCode: data.transactionCode || undefined,
          note: data.note || undefined,
        },
      });
      toast.success("Đặt cọc thành công! Chờ chủ sân xác nhận.");
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Đặt cọc thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button className="w-full"><Banknote className="h-4 w-4 mr-2" />Đặt cọc ({formatPrice(depositAmount)})</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đặt cọc</DialogTitle>
          <DialogDescription>
            Số tiền cần đặt cọc:{" "}
            <span className="font-bold text-primary">
              {formatPrice(depositAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Phương thức thanh toán *</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PaymentMethod).map((method) => (
                      <SelectItem key={method} value={method}>
                        {PaymentMethodLabel[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Mã giao dịch</Label>
            <Input
              placeholder="VD: TXN123456"
              {...register("transactionCode")}
            />
          </div>
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              placeholder="VD: Đã chuyển khoản qua Vietcombank..."
              {...register("note")}
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createDeposit.isPending}>
              {createDeposit.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận đặt cọc"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({
  bookingId,
  open,
  onOpenChange,
  cancelBooking,
}: {
  bookingId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cancelBooking: ReturnType<typeof useCancelBooking>;
}) {
  const handleCancel = async () => {
    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success("Đã hủy đặt sân");
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Hủy thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="destructive" className="w-full"><X className="h-4 w-4 mr-2" />Hủy đặt sân</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Xác nhận hủy
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn hủy đơn đặt sân này? Hành động này không thể hoàn
            tác. Tiền cọc sẽ được hoàn theo chính sách của sân.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Không, giữ lại
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
          >
            {cancelBooking.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang hủy...
              </>
            ) : (
              "Xác nhận hủy"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewDialog({
  bookingId,
  open,
  onOpenChange,
  createReview,
}: {
  bookingId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  createReview: ReturnType<typeof useCreateReview>;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { bookingId, rating: 0 },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: ReviewFormData) => {
    try {
      await createReview.mutateAsync({
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment || undefined,
      });
      toast.success("Đánh giá thành công!");
      reset();
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Đánh giá thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button variant="outline" className="w-full"><Star className="h-4 w-4 mr-2" />Đánh giá</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đánh giá sân</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn để giúp người khác
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Đánh giá *</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setValue("rating", i + 1)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      i < (hoverRating || currentRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                </button>
              ))}
              {currentRating > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  {currentRating}/5
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="text-sm text-destructive">
                {errors.rating.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Nhận xét</Label>
            <Textarea
              placeholder="Chia sẻ trải nghiệm của bạn..."
              {...register("comment")}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createReview.isPending}>
              {createReview.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi đánh giá"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
