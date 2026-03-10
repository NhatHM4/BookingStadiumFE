"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Clock,
  Star,
  Users,
  ArrowLeft,
  Info,
  Layers,
  Shield,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStadium, useFields, useDepositPolicy } from "@/hooks/use-stadiums";
import { FieldTypeLabel } from "@/types/enums";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { ReviewList } from "@/components/stadium/ReviewList";
import type { AvailableSlotResponse } from "@/types/index";

export default function StadiumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const stadiumId = parseInt(id, 10);

  const { data: session } = useSession();
  const { data: stadium, isLoading, error } = useStadium(stadiumId);
  const { data: fields } = useFields(stadiumId);
  const { data: depositPolicy } = useDepositPolicy(stadiumId);

  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    slot: AvailableSlotResponse;
    date: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>("fields");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="Đang tải thông tin sân..." />
      </div>
    );
  }

  if (error || !stadium) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Không tìm thấy sân</h2>
        <p className="text-muted-foreground mb-4">
          Sân bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/stadiums">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const handleSlotSelect = (slot: AvailableSlotResponse, date: string) => {
    setSelectedSlot({ slot, date });
  };

  console.log("render stadium detail page with stadium:", stadium);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/stadiums"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại danh sách sân
      </Link>

      {/* Header section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Stadium image */}
        <div className="lg:col-span-1">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
            {stadium.imageUrl ? (
              <Image
                src={getImageUrl(stadium.imageUrl)!}
                alt={stadium.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Layers className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Stadium info */}
        <div className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl lg:text-3xl font-bold">{stadium.name}</h1>
            <Badge
              variant={
                stadium.status === "APPROVED" ? "default" : "secondary"
              }
            >
              {stadium.status === "APPROVED" ? "Hoạt động" : stadium.status}
            </Badge>
          </div>

          <div className="space-y-2 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">{stadium.address}</span>
            </div>
            {(stadium.openTime || stadium.closeTime) && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  {stadium.openTime} - {stadium.closeTime}
                </span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-foreground">
                  {stadium.avgRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-sm">
                  ({stadium.reviewCount} đánh giá)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">{stadium.fieldCount} sân</span>
              </div>
            </div>
          </div>

          {stadium.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stadium.description}
            </p>
          )}

          {/* Owner info */}
          <Separator className="my-4" />
          <div className="text-sm text-muted-foreground">
            <span>Chủ sân: </span>
            <span className="font-medium text-foreground">
              {stadium.ownerName}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Fields, Slots, Reviews, Deposit Policy */}
      <Tabs defaultValue="fields" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="fields">
            <Layers className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Sân
          </TabsTrigger>
          <TabsTrigger value="slots">
            <Clock className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Khung giờ
          </TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Đánh giá
          </TabsTrigger>
          <TabsTrigger value="policy">
            <Shield className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Chính sách
          </TabsTrigger>
        </TabsList>

        {/* Fields tab */}
        <TabsContent value="fields">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields && fields.length > 0 ? (
              fields.map((field) => (
                <Card
                  key={field.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedFieldId === field.id
                    ? "ring-2 ring-primary"
                    : ""
                    }`}
                  onClick={() => {
                    setSelectedFieldId(field.id);
                    setActiveTab("slots");
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{field.name}</h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="secondary">
                            {FieldTypeLabel[field.fieldType]}
                          </Badge>
                          {field.childFieldCount > 0 && (
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              <Link2 className="h-3 w-3 mr-1" />
                              Sân ghép ({field.childFieldCount} sân con)
                            </Badge>
                          )}
                          {field.parentFieldId !== null && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Sân con
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div
                        className={`h-3 w-3 rounded-full ${field.isActive ? "bg-green-500" : "bg-red-500"
                          }`}
                        title={field.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Giá mặc định:{" "}
                      <span className="font-medium text-foreground">
                        {formatPrice(field.defaultPrice)}
                      </span>
                    </div>
                    {field.parentFieldId !== null && fields && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Thuộc nhóm: {fields.find((f) => f.id === field.parentFieldId)?.name}
                      </p>
                    )}
                    {field.childFieldCount > 0 && fields && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Ghép từ: {fields.filter((f) => f.parentFieldId === field.id).map((f) => f.name).join(", ")}
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="w-full mt-3"
                      variant={
                        selectedFieldId === field.id ? "default" : "outline"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFieldId(field.id);
                        setActiveTab("slots");
                      }}
                    >
                      {selectedFieldId === field.id
                        ? "Đã chọn"
                        : "Xem khung giờ"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Chưa có sân nào
              </div>
            )}
          </div>
        </TabsContent>

        {/* Time Slots tab */}
        <TabsContent value="slots">
          {selectedFieldId ? (
            <SlotPicker
              fieldId={selectedFieldId}
              fieldName={
                fields?.find((f) => f.id === selectedFieldId)?.name || ""
              }
              onSlotSelect={handleSlotSelect}
              selectedSlotId={selectedSlot?.slot.timeSlotId}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Vui lòng chọn một sân ở tab &quot;Sân&quot; trước để xem
                  khung giờ trống
                </p>
              </CardContent>
            </Card>
          )}

          {/* Selected slot summary */}
          {selectedSlot && (
            <Card className="mt-4 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Khung giờ đã chọn</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedSlot.date} | {selectedSlot.slot.startTime} -{" "}
                      {selectedSlot.slot.endTime}
                    </p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {formatPrice(selectedSlot.slot.price)}
                    </p>
                  </div>
                  <Link
                    href={
                      session
                        ? `/bookings/new?fieldId=${selectedFieldId}&timeSlotId=${selectedSlot.slot.timeSlotId}&date=${selectedSlot.date}`
                        : `/bookings/guest?fieldId=${selectedFieldId}&timeSlotId=${selectedSlot.slot.timeSlotId}&date=${selectedSlot.date}&stadiumId=${stadiumId}`
                    }
                  >
                    <Button>Đặt sân ngay</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reviews tab */}
        <TabsContent value="reviews">
          <ReviewList stadiumId={stadiumId} />
        </TabsContent>

        {/* Deposit Policy tab */}
        <TabsContent value="policy">
          {depositPolicy ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Chính sách đặt cọc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PolicyItem
                    label="Yêu cầu đặt cọc"
                    value={
                      depositPolicy.isDepositRequired
                        ? "Có"
                        : "Không"
                    }
                  />
                  <PolicyItem
                    label="Phần trăm đặt cọc"
                    value={`${depositPolicy.depositPercent}%`}
                  />
                  <PolicyItem
                    label="Hủy trước (giờ)"
                    value={`${depositPolicy.refundBeforeHours} giờ`}
                  />
                  <PolicyItem
                    label="Hoàn tiền khi hủy sớm"
                    value={`${depositPolicy.refundPercent}%`}
                  />
                  <PolicyItem
                    label="Hoàn tiền khi hủy muộn"
                    value={`${depositPolicy.lateCancelRefundPercent}%`}
                  />
                  <PolicyItem
                    label="Giảm giá đặt định kỳ"
                    value={`${depositPolicy.recurringDiscountPercent}%`}
                  />
                  <PolicyItem
                    label="Số buổi tối thiểu (định kỳ)"
                    value={`${depositPolicy.minRecurringSessions} buổi`}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Chưa có chính sách đặt cọc cho sân này
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PolicyItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );
}
