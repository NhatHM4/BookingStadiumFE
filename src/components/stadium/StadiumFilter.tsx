"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldType, FieldTypeLabel } from "@/types/enums";
import { useState, useCallback } from "react";

interface StadiumFilterProps {
  onFilterChange: (filters: Record<string, string>) => void;
  initialFilters?: Record<string, string>;
}

export function StadiumFilter({
  onFilterChange,
  initialFilters = {},
}: StadiumFilterProps) {
  const [name, setName] = useState(initialFilters.name || "");
  const [city, setCity] = useState(initialFilters.city || "");
  const [district, setDistrict] = useState(initialFilters.district || "");
  const [fieldType, setFieldType] = useState(initialFilters.fieldType || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = useCallback(() => {
    const filters: Record<string, string> = {};
    if (name.trim()) filters.name = name.trim();
    if (city.trim()) filters.city = city.trim();
    if (district.trim()) filters.district = district.trim();
    if (fieldType && fieldType !== "ALL") filters.fieldType = fieldType;
    onFilterChange(filters);
  }, [name, city, district, fieldType, onFilterChange]);

  const handleReset = () => {
    setName("");
    setCity("");
    setDistrict("");
    setFieldType("");
    onFilterChange({});
  };

  const hasFilters = name || city || district || (fieldType && fieldType !== "ALL");

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sân bóng..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? "bg-accent" : ""}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg border bg-card">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Thành phố</label>
            <Input
              placeholder="VD: Hồ Chí Minh"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Quận/Huyện</label>
            <Input
              placeholder="VD: Quận 1"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Loại sân</label>
            <Select value={fieldType} onValueChange={(v) => setFieldType(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Tất cả loại sân" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {Object.values(FieldType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {FieldTypeLabel[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-3 flex justify-end gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
            <Button size="sm" onClick={handleSearch}>
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
