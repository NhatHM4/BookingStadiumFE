"use client";

import { useState } from "react";
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
  const today = new Date();
  const [dateOffset, setDateOffset] = useState(0);
  const currentDate = addDays(today, dateOffset);
  const dateStr = externalDate || format(currentDate, "yyyy-MM-dd");

  const { data: slots, isLoading } = useAvailableSlots(fieldId, dateStr);

  // Generate 7-day date selector
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, dateOffset + i);
    return {
      date: format(d, "yyyy-MM-dd"),
      dayName: format(d, "EEE", { locale: vi }),
      dayNum: format(d, "dd"),
      monthName: format(d, "MM"),
      isToday: i === 0 && dateOffset === 0,
    };
  });

  const internalDate = format(currentDate, "yyyy-MM-dd");

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={dateOffset <= 0}
            onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 grid grid-cols-7 gap-1">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => {
                  const diff =
                    Math.round(
                      (new Date(d.date).getTime() - today.getTime()) /
                        (1000 * 60 * 60 * 24) +1
                    );
                  setDateOffset(diff);
                }}
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

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setDateOffset(dateOffset + 7)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.timeSlotId}
                disabled={!slot.isAvailable}
                onClick={() => onSlotSelect?.(slot, dateStr)}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg border text-sm transition-all",
                  slot.isAvailable
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
                    slot.isAvailable
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
                    Đã đặt
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
