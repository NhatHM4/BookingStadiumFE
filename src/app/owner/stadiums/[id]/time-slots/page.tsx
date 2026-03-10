"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStadium, useFields, useTimeSlots } from "@/hooks/use-stadiums";
import {
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
} from "@/hooks/use-owner";
import { FieldTypeLabel } from "@/types/enums";
import { timeSlotSchema, type TimeSlotFormData } from "@/lib/validations/owner";
import { formatPrice } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import type { TimeSlotResponse } from "@/types/index";

export default function ManageTimeSlotsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const stadiumId = parseInt(id, 10);

  const { data: stadium } = useStadium(stadiumId);
  const { data: fields, isLoading: loadingFields } = useFields(stadiumId);
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

  const activeFieldId = selectedFieldId || (fields?.[0]?.id ?? null);
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots(activeFieldId);

  const [showCreate, setShowCreate] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlotResponse | null>(null);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link
        href="/owner/stadiums"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Quay lại
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khung giờ</h1>
          {stadium && (
            <p className="text-sm text-muted-foreground mt-1">{stadium.name}</p>
          )}
        </div>
      </div>

      {/* Field selector */}
      {loadingFields ? (
        <LoadingSpinner text="Đang tải sân con..." />
      ) : !fields || fields.length === 0 ? (
        <EmptyState
          title="Chưa có sân con"
          description="Thêm sân con trước khi tạo khung giờ"
          action={
            <Link href={`/owner/stadiums/${stadiumId}/fields`}>
              <Button>Quản lý sân con</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <Label className="shrink-0">Sân con:</Label>
            {activeFieldId ? (
              <Select
                value={String(activeFieldId)}
                onValueChange={(v) => setSelectedFieldId(Number(v))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn sân con" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name} ({FieldTypeLabel[f.fieldType]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="w-48 h-10 bg-muted animate-pulse rounded-md" />
            )}

            {activeFieldId && (
              <>
                <QuickTimeSlotsDialog
                  fieldId={activeFieldId}
                  open={showQuickCreate}
                  onOpenChange={setShowQuickCreate}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Zap className="h-4 w-4 mr-1" />
                      Tạo nhanh
                    </Button>
                  }
                />
                <TimeSlotFormDialog
                  fieldId={activeFieldId}
                  open={showCreate}
                  onOpenChange={setShowCreate}
                  trigger={
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm
                    </Button>
                  }
                />
              </>
            )}
          </div>

          {/* Time slots list */}
          {loadingSlots ? (
            <LoadingSpinner text="Đang tải khung giờ..." />
          ) : !timeSlots || timeSlots.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Chưa có khung giờ"
              description="Thêm khung giờ cho sân con này"
            />
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <Card key={slot.id}>
                  <CardContent className="py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${slot.isActive ? "bg-green-500" : "bg-red-500"
                            }`}
                        />
                        <div>
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-sm text-muted-foreground ml-3">
                            {formatPrice(slot.price)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TimeSlotFormDialog
                          fieldId={activeFieldId!}
                          slot={slot}
                          open={editingSlot?.id === slot.id}
                          onOpenChange={(v) => setEditingSlot(v ? slot : null)}
                          trigger={
                            <Button size="sm" variant="ghost">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DeleteSlotButton slotId={slot.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TimeSlotFormDialog({
  fieldId,
  slot,
  open,
  onOpenChange,
  trigger,
}: {
  fieldId: number;
  slot?: TimeSlotResponse;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: React.ReactElement;
}) {
  const createSlot = useCreateTimeSlot();
  const updateSlot = useUpdateTimeSlot();
  const isEdit = !!slot;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimeSlotFormData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: slot
      ? { startTime: slot.startTime, endTime: slot.endTime, price: slot.price }
      : { startTime: "", endTime: "", price: 0 },
  });

  const onSubmit = async (data: TimeSlotFormData) => {
    try {
      if (isEdit) {
        await updateSlot.mutateAsync({ id: slot.id, data });
        toast.success("Cập nhật khung giờ thành công");
      } else {
        await createSlot.mutateAsync({ fieldId, data });
        toast.success("Thêm khung giờ thành công");
        reset();
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const isPending = createSlot.isPending || updateSlot.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa khung giờ" : "Thêm khung giờ"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật giờ và giá" : "Thêm khung giờ mới"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giờ bắt đầu *</Label>
              <Input type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Giờ kết thúc *</Label>
              <Input type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Giá (VNĐ) *</Label>
            <Input type="number" {...register("price", { valueAsNumber: true })} />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuickTimeSlotsDialog({
  fieldId,
  open,
  onOpenChange,
  trigger,
}: {
  fieldId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: React.ReactElement;
}) {
  const createSlot = useCreateTimeSlot();
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("23:00");
  const [slotDuration, setSlotDuration] = useState(60); // minutes
  const [basePrice, setBasePrice] = useState(200000);
  const [generatedSlots, setGeneratedSlots] = useState<TimeSlotFormData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    const slots: TimeSlotFormData[] = [];

    // Parse start and end times
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const nextMinutes = currentMinutes + slotDuration;
      if (nextMinutes > endMinutes) break;

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      slots.push({
        startTime: formatTime(currentMinutes),
        endTime: formatTime(nextMinutes),
        price: basePrice,
      });

      currentMinutes = nextMinutes;
    }

    setGeneratedSlots(slots);
    setIsGenerating(false);
  };

  const handleCreateAll = async () => {
    try {
      // Create all slots in parallel
      await Promise.all(
        generatedSlots.map((slot) =>
          createSlot.mutateAsync({ fieldId, data: slot })
        )
      );
      toast.success(`Đã tạo ${generatedSlots.length} khung giờ`);
      onOpenChange(false);
      setGeneratedSlots([]);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Tạo thất bại");
    }
  };

  const handleUpdateSlot = (index: number, field: keyof TimeSlotFormData, value: string | number) => {
    const updated = [...generatedSlots];
    updated[index] = { ...updated[index], [field]: value };
    setGeneratedSlots(updated);
  };

  const handleRemoveSlot = (index: number) => {
    setGeneratedSlots(generatedSlots.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo nhanh khung giờ</DialogTitle>
          <DialogDescription>
            Tạo nhiều khung giờ cùng lúc dựa trên khoảng thời gian
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Giờ bắt đầu</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Giờ kết thúc</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Thời lượng mỗi slot (phút)</Label>
              <Select
                value={String(slotDuration)}
                onValueChange={(v) => setSlotDuration(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="60">60 phút (1 giờ)</SelectItem>
                  <SelectItem value="90">90 phút (1.5 giờ)</SelectItem>
                  <SelectItem value="120">120 phút (2 giờ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Giá mặc định (VNĐ)</Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} className="w-full" variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Tạo danh sách
          </Button>

          {/* Generated slots preview */}
          {generatedSlots.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Danh sách khung giờ ({generatedSlots.length})</Label>
                <span className="text-sm text-muted-foreground">
                  Chỉnh sửa nếu cần
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {generatedSlots.map((slot, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) =>
                        handleUpdateSlot(idx, "startTime", e.target.value)
                      }
                      className="w-28"
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) =>
                        handleUpdateSlot(idx, "endTime", e.target.value)
                      }
                      className="w-28"
                    />
                    <Input
                      type="number"
                      value={slot.price}
                      onChange={(e) =>
                        handleUpdateSlot(idx, "price", Number(e.target.value))
                      }
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRemoveSlot(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          {generatedSlots.length > 0 && (
            <Button onClick={handleCreateAll} disabled={createSlot.isPending}>
              {createSlot.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Tạo ${generatedSlots.length} khung giờ`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSlotButton({ slotId }: { slotId: number }) {
  const deleteSlot = useDeleteTimeSlot();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteSlot.mutateAsync(slotId);
      toast.success("Đã xóa khung giờ");
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Xóa thất bại");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa khung giờ?</DialogTitle>
          <DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteSlot.isPending}>
            {deleteSlot.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
