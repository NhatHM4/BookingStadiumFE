"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Navigation, Upload, X, ImageIcon } from "lucide-react";
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

function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function toCoordinatePair(latRaw: string, lngRaw: string) {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (!isValidCoordinate(lat, lng)) return null;
  return { lat, lng };
}

function extractCoordinatesFromMapInput(input: string) {
  const text = input.trim();
  if (!text) return null;

  const plainMatch = text.match(
    /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
  );
  if (plainMatch) return toCoordinatePair(plainMatch[1], plainMatch[2]);

  const atMatch = text.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (atMatch) return toCoordinatePair(atMatch[1], atMatch[2]);

  const dMatch = text.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (dMatch) return toCoordinatePair(dMatch[1], dMatch[2]);

  try {
    const url = new URL(text);
    const queryKeys = ["q", "query", "ll", "center"];

    for (const key of queryKeys) {
      const value = url.searchParams.get(key);
      if (!value) continue;
      const pair = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (pair) {
        const result = toCoordinatePair(pair[1], pair[2]);
        if (result) return result;
      }
    }

    const mlat = url.searchParams.get("mlat");
    const mlon = url.searchParams.get("mlon");
    if (mlat && mlon) {
      const osmResult = toCoordinatePair(mlat, mlon);
      if (osmResult) return osmResult;
    }

    const hashMapMatch = url.hash.match(
      /#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/
    );
    if (hashMapMatch) {
      return toCoordinatePair(hashMapMatch[1], hashMapMatch[2]);
    }
  } catch {
    return null;
  }

  return null;
}

export function StadiumForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Lưu",
}: StadiumFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapLink, setMapLink] = useState("");
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
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
          latitude: initialData.latitude ?? undefined,
          longitude: initialData.longitude ?? undefined,
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

  const currentLatitude = watch("latitude");
  const currentLongitude = watch("longitude");

  const applyCoordinates = useCallback(
    (lat: number, lng: number) => {
      setValue("latitude", Number(lat.toFixed(7)), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("longitude", Number(lng.toFixed(7)), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue]
  );

  const handleExtractFromMapLink = () => {
    const extracted = extractCoordinatesFromMapInput(mapLink);
    if (!extracted) {
      setLocationError(
        "Không đọc được tọa độ từ link. Hãy dùng link có @lat,lng hoặc q=lat,lng."
      );
      setLocationMessage(null);
      return;
    }

    applyCoordinates(extracted.lat, extracted.lng);
    setLocationError(null);
    setLocationMessage(
      `Đã lấy tọa độ: ${extracted.lat.toFixed(7)}, ${extracted.lng.toFixed(7)}`
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ định vị");
      setLocationMessage(null);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        applyCoordinates(lat, lng);
        setLocationError(null);
        setLocationMessage(
          `Đã lấy vị trí hiện tại: ${lat.toFixed(7)}, ${lng.toFixed(7)}`
        );
      },
      () => {
        setIsLocating(false);
        setLocationError("Không thể lấy vị trí hiện tại");
        setLocationMessage(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    setUploading(true);
    try {
      const result = await uploadStadiumImage(
        file,
        initialData?.id || undefined
      );
      const path = result.data.path;
      setValue("imageUrl", path);
      setPreviewUrl(getImageUrl(path));
      toast.success("Upload ảnh thành công");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Upload ảnh thất bại");
      setPreviewUrl(getImageUrl(initialData?.imageUrl));
      setValue("imageUrl", initialData?.imageUrl || "");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mapLink">Link Google Maps / OpenStreetMap</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="mapLink"
                placeholder="Dán link map hoặc nhập lat,lng"
                value={mapLink}
                onChange={(e) => {
                  setMapLink(e.target.value);
                  setLocationError(null);
                  setLocationMessage(null);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleExtractFromMapLink}
              >
                Lấy tọa độ từ link
              </Button>
            </div>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
            >
              <Navigation className="h-4 w-4 mr-1.5" />
              {isLocating ? "Đang lấy vị trí..." : "Dùng vị trí hiện tại"}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...register("latitude", {
                  setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...register("longitude", {
                  setValueAs: (v: string) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setValue("latitude", undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setValue("longitude", undefined, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                setLocationMessage(null);
                setLocationError(null);
              }}
            >
              Xóa tọa độ
            </Button>

            {locationMessage && (
              <p className="text-sm text-green-600">{locationMessage}</p>
            )}
            {locationError && (
              <p className="text-sm text-destructive">{locationError}</p>
            )}
            {typeof currentLatitude === "number" &&
              typeof currentLongitude === "number" && (
                <a
                  href={`https://www.google.com/maps?q=${currentLatitude},${currentLongitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Mở tọa độ hiện tại trên Google Maps
                </a>
              )}
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
