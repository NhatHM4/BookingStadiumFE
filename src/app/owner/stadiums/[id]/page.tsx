"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStadium } from "@/hooks/use-stadiums";
import { useUpdateStadium } from "@/hooks/use-owner";
import { StadiumForm } from "@/components/owner/StadiumForm";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";
import type { StadiumFormData } from "@/lib/validations/owner";

export default function EditStadiumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const stadiumId = parseInt(id, 10);
  const router = useRouter();

  const { data: stadium, isLoading } = useStadium(stadiumId);
  const updateStadium = useUpdateStadium();

  const handleSubmit = async (data: StadiumFormData) => {
    try {
      await updateStadium.mutateAsync({
        id: stadiumId,
        data: {
          name: data.name,
          address: data.address,
          district: data.district || undefined,
          city: data.city || undefined,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
          openTime: data.openTime || undefined,
          closeTime: data.closeTime || undefined,
        },
      });
      toast.success("Cập nhật sân thành công!");
      router.push("/owner/stadiums");
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

  if (!stadium) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Không tìm thấy sân</p>
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
      <h1 className="text-2xl font-bold mb-6">Sửa sân: {stadium.name}</h1>
      <StadiumForm
        initialData={stadium}
        onSubmit={handleSubmit}
        isLoading={updateStadium.isPending}
        submitLabel="Cập nhật"
      />
    </div>
  );
}
