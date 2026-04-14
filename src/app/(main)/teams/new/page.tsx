"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateTeam } from "@/hooks/use-teams";
import { teamSchema, type TeamFormData } from "@/lib/validations/team";
import { FieldTypeLabel, SkillLevelLabel } from "@/types/enums";
import { FieldType, SkillLevel } from "@/types/enums";
import { toast } from "sonner";
import { Controller } from "react-hook-form";

export default function CreateTeamPage() {
  const router = useRouter();
  const createTeam = useCreateTeam();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", phone: "" },
  });

  const onSubmit = async (data: TeamFormData) => {
    try {
      const result = await createTeam.mutateAsync({
        name: data.name,
        phone: data.phone,
        logoUrl: data.logoUrl || undefined,
        description: data.description || undefined,
        preferredFieldType: data.preferredFieldType as FieldType | undefined,
        skillLevel: data.skillLevel as SkillLevel | undefined,
        city: data.city || undefined,
        district: data.district || undefined,
      });
      toast.success("Tạo đội thành công!");
      router.push(`/teams/${result.data.id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Tạo đội thất bại");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/teams"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      <h1 className="text-2xl font-bold mb-6">Tạo đội mới</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin đội</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên đội *</Label>
              <Input id="name" {...register("name")} placeholder="VD: FC Sao Vàng" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại đội *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="VD: 0912345678"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Giới thiệu về đội bóng..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL Logo</Label>
              <Input
                id="logoUrl"
                {...register("logoUrl")}
                placeholder="https://..."
              />
              {errors.logoUrl && (
                <p className="text-sm text-destructive">
                  {errors.logoUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cấu hình đội</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Loại sân ưa thích</Label>
                <Controller
                  control={control}
                  name="preferredFieldType"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v ?? undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại sân" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FieldTypeLabel).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Trình độ</Label>
                <Controller
                  control={control}
                  name="skillLevel"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v ?? undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SkillLevelLabel).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input id="city" {...register("city")} placeholder="VD: Hà Nội" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Quận/Huyện</Label>
                <Input
                  id="district"
                  {...register("district")}
                  placeholder="VD: Cầu Giấy"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={createTeam.isPending}>
            {createTeam.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
              "Tạo đội"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
