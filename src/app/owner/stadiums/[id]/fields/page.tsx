"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFields, useStadium } from "@/hooks/use-stadiums";
import { useCreateField, useUpdateField, useDeleteField } from "@/hooks/use-owner";
import { FieldType, FieldTypeLabel } from "@/types/enums";
import { fieldSchema, type FieldFormData } from "@/lib/validations/owner";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { uploadStadiumImage } from "@/lib/api/images";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { toast } from "sonner";
import type { FieldResponse } from "@/types/index";

export default function ManageFieldsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const stadiumId = parseInt(id, 10);

  const { data: stadium } = useStadium(stadiumId);
  const { data: fields, isLoading } = useFields(stadiumId);

  const [showCreate, setShowCreate] = useState(false);
  const [editingField, setEditingField] = useState<FieldResponse | null>(null);

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
          <h1 className="text-2xl font-bold">Quản lý sân con</h1>
          {stadium && (
            <p className="text-sm text-muted-foreground mt-1">
              {stadium.name}
            </p>
          )}
        </div>
        <FieldFormDialog
          stadiumId={stadiumId}
          fields={fields}
          open={showCreate}
          onOpenChange={setShowCreate}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm sân con
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <LoadingSpinner text="Đang tải..." />
      ) : !fields || fields.length === 0 ? (
        <EmptyState
          title="Chưa có sân con"
          description="Thêm sân con (sân 5, sân 7, sân 11) để khách có thể đặt"
        />
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {field.imageUrl ? (
                      <img
                        src={getImageUrl(field.imageUrl) || undefined}
                        alt={field.name}
                        className="h-14 w-20 rounded-md object-cover border"
                      />
                    ) : (
                      <div className="h-14 w-20 rounded-md border bg-muted flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div
                      className={`h-3 w-3 rounded-full ${field.isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                    />
                    <div>
                      <h3 className="font-semibold">{field.name}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary">
                          {FieldTypeLabel[field.fieldType]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatPrice(field.defaultPrice)}
                        </span>
                        {field.childFieldCount > 0 && (
                          <Badge variant="outline" className="text-blue-600 border-blue-300">
                            Sân ghép ({field.childFieldCount} sân con)
                          </Badge>
                        )}
                        {field.parentFieldId !== null && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300">
                            Sân con của:{" "}
                            {fields.find((f) => f.id === field.parentFieldId)?.name || `#${field.parentFieldId}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FieldFormDialog
                      stadiumId={stadiumId}
                      fields={fields}
                      field={field}
                      open={editingField?.id === field.id}
                      onOpenChange={(v) =>
                        setEditingField(v ? field : null)
                      }
                      trigger={
                        <Button size="sm" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <DeleteFieldButton fieldId={field.id} fieldName={field.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldFormDialog({
  stadiumId,
  fields,
  field,
  open,
  onOpenChange,
  trigger,
}: {
  stadiumId: number;
  fields?: FieldResponse[];
  field?: FieldResponse;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trigger: React.ReactElement;
}) {
  const createField = useCreateField();
  const updateField = useUpdateField();
  const isEdit = !!field;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getImageUrl(field?.imageUrl)
  );

  // Potential parents: fields that have no parent themselves (exclude current field and its children)
  const potentialParents = (fields || []).filter(
    (f) => f.parentFieldId === null && f.id !== field?.id
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: field
      ? {
        name: field.name,
        fieldType: field.fieldType,
        defaultPrice: field.defaultPrice,
        imageUrl: field.imageUrl || "",
        parentFieldId: field.parentFieldId ?? null,
      }
      : { name: "", fieldType: "", defaultPrice: 0, imageUrl: "", parentFieldId: null },
  });

  const currentImageUrl = watch("imageUrl");

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
      const result = await uploadStadiumImage(file, stadiumId);
      const path = result.data.path;
      setValue("imageUrl", path);
      setPreviewUrl(getImageUrl(path));
      toast.success("Upload ảnh sân con thành công");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Upload ảnh thất bại");
      setPreviewUrl(getImageUrl(field?.imageUrl));
      setValue("imageUrl", field?.imageUrl || "");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "");
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FieldFormData) => {
    try {
      if (isEdit) {
        await updateField.mutateAsync({
          id: field.id,
          data: {
            name: data.name,
            fieldType: data.fieldType as FieldType,
            defaultPrice: data.defaultPrice,
            imageUrl: data.imageUrl || undefined,
            parentFieldId: data.parentFieldId ?? null,
          },
        });
        toast.success("Cập nhật sân con thành công");
      } else {
        await createField.mutateAsync({
          stadiumId,
          data: {
            name: data.name,
            fieldType: data.fieldType as FieldType,
            defaultPrice: data.defaultPrice,
            imageUrl: data.imageUrl || undefined,
            parentFieldId: data.parentFieldId ?? null,
          },
        });
        toast.success("Thêm sân con thành công");
        reset();
        setPreviewUrl(null);
      }
      onOpenChange(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const isPending = createField.isPending || updateField.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa sân con" : "Thêm sân con"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Cập nhật thông tin sân con" : "Thêm sân con mới cho sân"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên sân con *</Label>
            <Input placeholder="VD: Sân 1" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Loại sân *</Label>
            <Controller
              name="fieldType"
              control={control}
              render={({ field: f }) => (
                <Select value={f.value || ""} onValueChange={(v) => f.onChange(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sân" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(FieldType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {FieldTypeLabel[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.fieldType && (
              <p className="text-sm text-destructive">{errors.fieldType.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Giá mặc định (VNĐ) *</Label>
            <Input type="number" {...register("defaultPrice", { valueAsNumber: true })} />
            {errors.defaultPrice && (
              <p className="text-sm text-destructive">{errors.defaultPrice.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Ảnh sân con (tùy chọn)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input type="hidden" {...register("imageUrl")} />

            {previewUrl || currentImageUrl ? (
              <div className="relative">
                <img
                  src={previewUrl || getImageUrl(currentImageUrl) || undefined}
                  alt="Preview sân con"
                  className="w-full h-44 object-cover rounded-lg border"
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
                className="w-full h-44 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Nhấn để chọn ảnh sân con</span>
                    <span className="text-xs">JPG, PNG - Tối đa 5MB</span>
                  </>
                )}
              </button>
            )}

            {(previewUrl || currentImageUrl) && !uploading && (
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
          {potentialParents.length > 0 && (
            <div className="space-y-2">
              <Label>Thuộc sân ghép (tùy chọn)</Label>
              <Controller
                name="parentFieldId"
                control={control}
                render={({ field: f }) => (
                  <Select
                    value={f.value != null ? String(f.value) : "none"}
                    onValueChange={(v) => f.onChange(v === "none" ? null : Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Không thuộc sân ghép" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không (sân độc lập)</SelectItem>
                      {potentialParents.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name} ({FieldTypeLabel[p.fieldType]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <p className="text-xs text-muted-foreground">
                Nếu sân này là sân con (VD: sân 5 ghép thành sân 7), chọn sân cha ở đây
              </p>
            </div>
          )}
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

function DeleteFieldButton({ fieldId, fieldName }: { fieldId: number; fieldName: string }) {
  const deleteField = useDeleteField();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteField.mutateAsync(fieldId);
      toast.success("Đã xóa sân con");
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
          <DialogTitle>Xóa &quot;{fieldName}&quot;?</DialogTitle>
          <DialogDescription>Hành động này không thể hoàn tác.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteField.isPending}>
            {deleteField.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
