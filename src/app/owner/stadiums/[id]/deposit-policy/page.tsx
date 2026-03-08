"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStadium, useDepositPolicy } from "@/hooks/use-stadiums";
import { useUpdateDepositPolicy } from "@/hooks/use-owner";
import {
  depositPolicySchema,
  type DepositPolicyFormData,
} from "@/lib/validations/owner";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

export default function DepositPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const stadiumId = parseInt(id, 10);

  const { data: stadium } = useStadium(stadiumId);
  const { data: policy, isLoading } = useDepositPolicy(stadiumId);
  const updatePolicy = useUpdateDepositPolicy();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositPolicyFormData>({
    resolver: zodResolver(depositPolicySchema),
    defaultValues: {
      depositPercent: 30,
      refundBeforeHours: 24,
      refundPercent: 100,
      lateCancelRefundPercent: 0,
      recurringDiscountPercent: 0,
      minRecurringSessions: 4,
      isDepositRequired: true,
    },
  });

  // Populate form when policy loads
  useEffect(() => {
    if (policy) {
      reset({
        depositPercent: policy.depositPercent,
        refundBeforeHours: policy.refundBeforeHours,
        refundPercent: policy.refundPercent,
        lateCancelRefundPercent: policy.lateCancelRefundPercent,
        recurringDiscountPercent: policy.recurringDiscountPercent,
        minRecurringSessions: policy.minRecurringSessions,
        isDepositRequired: policy.isDepositRequired,
      });
    }
  }, [policy, reset]);

  const onSubmit = async (data: DepositPolicyFormData) => {
    try {
      await updatePolicy.mutateAsync({
        stadiumId,
        data: {
          depositPercent: data.depositPercent,
          refundBeforeHours: data.refundBeforeHours,
          refundPercent: data.refundPercent,
          lateCancelRefundPercent: data.lateCancelRefundPercent,
          recurringDiscountPercent: data.recurringDiscountPercent,
          minRecurringSessions: data.minRecurringSessions,
          isDepositRequired: data.isDepositRequired,
        },
      });
      toast.success("Cập nhật chính sách cọc thành công!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link
        href="/owner/stadiums"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Chính sách đặt cọc</h1>
          {stadium && (
            <p className="text-sm text-muted-foreground">{stadium.name}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cấu hình đặt cọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDepositRequired"
                {...register("isDepositRequired")}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="isDepositRequired" className="cursor-pointer">
                Yêu cầu đặt cọc
              </Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositPercent">Phần trăm đặt cọc (%)</Label>
                <Input
                  id="depositPercent"
                  type="number"
                  min={0}
                  max={100}
                  {...register("depositPercent", { valueAsNumber: true })}
                />
                {errors.depositPercent && (
                  <p className="text-sm text-destructive">
                    {errors.depositPercent.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="refundBeforeHours">
                  Hủy trước bao nhiêu giờ (để hoàn 100%)
                </Label>
                <Input
                  id="refundBeforeHours"
                  type="number"
                  min={0}
                  {...register("refundBeforeHours", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Chính sách hoàn tiền</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refundPercent">Hoàn tiền khi hủy sớm (%)</Label>
                <Input
                  id="refundPercent"
                  type="number"
                  min={0}
                  max={100}
                  {...register("refundPercent", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateCancelRefundPercent">
                  Hoàn tiền khi hủy muộn (%)
                </Label>
                <Input
                  id="lateCancelRefundPercent"
                  type="number"
                  min={0}
                  max={100}
                  {...register("lateCancelRefundPercent", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đặt định kỳ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recurringDiscountPercent">
                  Giảm giá đặt định kỳ (%)
                </Label>
                <Input
                  id="recurringDiscountPercent"
                  type="number"
                  min={0}
                  max={100}
                  {...register("recurringDiscountPercent", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minRecurringSessions">
                  Số buổi tối thiểu (định kỳ)
                </Label>
                <Input
                  id="minRecurringSessions"
                  type="number"
                  min={1}
                  {...register("minRecurringSessions", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updatePolicy.isPending}>
            {updatePolicy.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu chính sách"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
