"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { format, addDays } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAvailableSlots } from "@/hooks/use-stadiums";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { AvailableSlotResponse } from "@/types/index";

interface SlotPickerProps {
  fieldId: number;
  fieldName: string;
  onSlotSelect?: (slot: AvailableSlotResponse, date: string) => void;
  selectedSlotId?: number | null;
  selectedDate?: string | null;
}

export function SlotPicker({
  fieldId,
  fieldName,
  onSlotSelect,
  selectedSlotId,
  selectedDate: externalDate,
}: SlotPickerProps) {
  const SLOTS_PER_PAGE = 5;
  const today = new Date();
  const [dateOffset, setDateOffset] = useState(0);
  const [slotPage, setSlotPage] = useState(1);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const currentDate = addDays(today, dateOffset);
  const windowStartOffset = Math.floor(dateOffset / 7) * 7;
  const dateStr = externalDate || format(currentDate, "yyyy-MM-dd");

  const { data: slots, isLoading } = useAvailableSlots(fieldId, dateStr);
  const totalSlotPages = Math.max(1, Math.ceil((slots?.length || 0) / SLOTS_PER_PAGE));
  const paginatedSlots = slots?.slice(
    (slotPage - 1) * SLOTS_PER_PAGE,
    slotPage * SLOTS_PER_PAGE
  );

  useEffect(() => {
    setSlotPage(1);
  }, [fieldId, dateStr]);

  useEffect(() => {
    if (slotPage > totalSlotPages) {
      setSlotPage(totalSlotPages);
    }
  }, [slotPage, totalSlotPages]);

  // Generate 7-day date selector
  const dates = Array.from({ length: 7 }, (_, i) => {
    const offset = windowStartOffset + i;
    const d = addDays(today, offset);
    return {
      offset,
      date: format(d, "yyyy-MM-dd"),
      dayName: format(d, "EEE", { locale: vi }),
      dayNum: format(d, "dd"),
      monthName: format(d, "MM"),
      isToday: offset === 0,
    };
  });

  // Check if a slot is in the past (only on client after mount)
  const isSlotInPast = (slot: AvailableSlotResponse, dateStr: string): boolean => {
    if (!isMounted) return false; // Prevent hydration mismatch
    const now = new Date();
    const slotDateTime = new Date(`${dateStr}T${slot.startTime}`);
    return slotDateTime < now;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Khung giờ - {fieldName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              disabled={windowStartOffset <= 0}
              onClick={() => setDateOffset(Math.max(0, windowStartOffset - 7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-xs sm:text-sm text-muted-foreground text-center">
              {format(addDays(today, windowStartOffset), "dd/MM", { locale: vi })} -{" "}
              {format(addDays(today, windowStartOffset + 6), "dd/MM", { locale: vi })}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setDateOffset(windowStartOffset + 7)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile: horizontal scroller */}
          <div className="sm:hidden -mx-1 px-1 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setDateOffset(d.offset)}
                  className={cn(
                    "w-[78px] shrink-0 rounded-xl border px-2 py-2 text-center transition-colors",
                    d.date === dateStr
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-accent",
                    d.isToday && d.date !== dateStr && "ring-1 ring-primary"
                  )}
                >
                  <span className="block text-[11px] font-medium capitalize opacity-90">
                    {d.dayName}
                  </span>
                  <span className="block text-xl font-bold leading-tight">{d.dayNum}</span>
                  <span className="block text-[10px] opacity-75">T{d.monthName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop/tablet: 7-column grid */}
          <div className="hidden sm:grid grid-cols-7 gap-1">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => setDateOffset(d.offset)}
                className={cn(
                  "flex flex-col items-center p-1.5 rounded-lg text-xs transition-colors",
                  d.date === dateStr
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                  d.isToday && d.date !== dateStr && "ring-1 ring-primary"
                )}
              >
                <span className="font-medium capitalize">{d.dayName}</span>
                <span className="text-lg font-bold">{d.dayNum}</span>
                <span className="text-[10px] opacity-70">T{d.monthName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date display */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {format(new Date(dateStr), "EEEE, dd/MM/yyyy", { locale: vi })}
        </div>

        {/* Time slots grid */}
        {isLoading ? (
          <LoadingSpinner size="sm" text="Đang tải khung giờ..." />
        ) : !slots || slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Không có khung giờ nào cho ngày này
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {paginatedSlots?.map((slot) => {
                const isPast = isSlotInPast(slot, dateStr);
                const isDisabled = !slot.isAvailable || isPast;

                return (
                  <button
                    key={slot.timeSlotId}
                    disabled={isDisabled}
                    onClick={() => onSlotSelect?.(slot, dateStr)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg border text-sm transition-all",
                      !isDisabled
                        ? selectedSlotId === slot.timeSlotId
                          ? "border-primary bg-primary/10 ring-2 ring-primary"
                          : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                        : "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="font-medium">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span
                      className={cn(
                        "text-xs mt-1",
                        !isDisabled
                          ? "text-primary font-semibold"
                          : "text-muted-foreground line-through"
                      )}
                    >
                      {formatPrice(slot.price)}
                    </span>
                    {!slot.isAvailable && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] px-1.5 py-0"
                      >
                        {slot.bookedByName || "Đã đặt"}
                      </Badge>
                    )}
                    {isPast && slot.isAvailable && (
                      <Badge
                        variant="outline"
                        className="mt-1 text-[10px] px-1.5 py-0 bg-muted"
                      >
                        Đã qua
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>

            {totalSlotPages > 1 && (
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground mr-1">
                  Trang {slotPage}/{totalSlotPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={slotPage <= 1}
                  onClick={() => setSlotPage((prev) => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={slotPage >= totalSlotPages}
                  onClick={() =>
                    setSlotPage((prev) => Math.min(totalSlotPages, prev + 1))
                  }
                >
                  Sau
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
