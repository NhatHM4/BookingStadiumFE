"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCreateStadium } from "@/hooks/use-owner";
import { StadiumForm } from "@/components/owner/StadiumForm";
import { toast } from "sonner";
import type { StadiumFormData } from "@/lib/validations/owner";

export default function CreateStadiumPage() {
  const router = useRouter();
  const createStadium = useCreateStadium();

  const handleSubmit = async (data: StadiumFormData) => {
    try {
      await createStadium.mutateAsync({
        name: data.name,
        address: data.address,
        district: data.district || undefined,
        city: data.city || undefined,
        description: data.description || undefined,
        imageUrl: data.imageUrl || undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        openTime: data.openTime || undefined,
        closeTime: data.closeTime || undefined,
      });
      toast.success("Tạo sân thành công! Chờ admin duyệt.");
      router.push("/owner/stadiums");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Tạo sân thất bại");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link
        href="/owner/stadiums"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>
      <h1 className="text-2xl font-bold mb-6">Tạo sân mới</h1>
      <StadiumForm
        onSubmit={handleSubmit}
        isLoading={createStadium.isPending}
        submitLabel="Tạo sân"
      />
    </div>
  );
}
