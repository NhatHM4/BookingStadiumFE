"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  stadiumSchema,
  type StadiumFormData,
} from "@/lib/validations/owner";
import { uploadStadiumImage } from "@/lib/api/images";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import type { StadiumResponse } from "@/types/index";

interface StadiumFormProps {
  initialData?: StadiumResponse | null;
  onSubmit: (data: StadiumFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function StadiumForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Lưu",
}: StadiumFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getImageUrl(initialData?.imageUrl)
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StadiumFormData>({
    resolver: zodResolver(stadiumSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          address: initialData.address,
          district: initialData.district || "",
          city: initialData.city || "",
          description: initialData.description || "",
          imageUrl: initialData.imageUrl || "",
          latitude: initialData.latitude || 0,
          longitude: initialData.longitude || 0,
          openTime: initialData.openTime || "",
          closeTime: initialData.closeTime || "",
        }
      : {
          name: "",
          address: "",
          district: "",
          city: "",
          description: "",
          imageUrl: "",
          openTime: "06:00",
          closeTime: "22:00",
        },
  });

  console.log("Watching imageUrl:", watch("imageUrl"));

  const currentImageUrl = watch("imageUrl");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Upload to server
    setUploading(true);
    try {
      const result = await uploadStadiumImage(
        file,
        initialData?.id || undefined
      );
      const path = result.data.path;
      console.log("Uploaded image path:", path);
      setValue("imageUrl", path);
      setPreviewUrl(getImageUrl(path));
      toast.success("Upload ảnh thành công");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Upload ảnh thất bại");
      // Revert preview
      setPreviewUrl(getImageUrl(initialData?.imageUrl));
      setValue("imageUrl", initialData?.imageUrl || "");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "");
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên sân *</Label>
            <Input id="name" placeholder="VD: Sân bóng ABC" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ *</Label>
            <Input
              id="address"
              placeholder="VD: 123 Nguyễn Văn A, Q.1"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Thành phố</Label>
              <Input id="city" placeholder="VD: Hồ Chí Minh" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input id="district" placeholder="VD: Quận 1" {...register("district")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả về sân..."
              {...register("description")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Giờ hoạt động & Ảnh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openTime">Giờ mở cửa</Label>
              <Input id="openTime" type="time" {...register("openTime")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closeTime">Giờ đóng cửa</Label>
              <Input id="closeTime" type="time" {...register("closeTime")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ảnh sân</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* Hidden field for imageUrl value */}
            <input type="hidden" {...register("imageUrl")} />

            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
                {uploading && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Nhấn để chọn ảnh</span>
                    <span className="text-xs">JPG, PNG - Tối đa 5MB</span>
                  </>
                )}
              </button>
            )}

            {previewUrl && !uploading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Đổi ảnh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tọa độ (tùy chọn)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register("latitude", { setValueAs: (v: string) => v === "" ? undefined : Number(v) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register("longitude", { setValueAs: (v: string) => v === "" ? undefined : Number(v) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
