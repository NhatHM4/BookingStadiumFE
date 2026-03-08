"use client";

import Link from "next/link";
import { MapPin, Star, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FieldTypeLabel } from "@/types/enums";
import { formatPrice, formatTimeRange, getImageUrl } from "@/lib/utils";
import type { StadiumResponse } from "@/types/index";

interface StadiumCardProps {
  stadium: StadiumResponse;
}

export function StadiumCard({ stadium }: StadiumCardProps) {
  return (
    <Link href={`/stadiums/${stadium.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {stadium.imageUrl ? (
            <img
              src={getImageUrl(stadium.imageUrl) || undefined}
              alt={stadium.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <span className="text-4xl">⚽</span>
            </div>
          )}

          {/* Field count badge */}
          {stadium.fieldCount > 0 && (
            <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0">
              {stadium.fieldCount} sân
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Name */}
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {stadium.name}
          </h3>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">
              {stadium.address}
              {stadium.district && `, ${stadium.district}`}
              {stadium.city && `, ${stadium.city}`}
            </span>
          </div>

          {/* Opening hours */}
          {stadium.openTime && stadium.closeTime && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatTimeRange(stadium.openTime, stadium.closeTime)}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">
              {stadium.avgRating > 0 ? stadium.avgRating.toFixed(1) : "Mới"}
            </span>
            {stadium.reviewCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({stadium.reviewCount})
              </span>
            )}
          </div>

          {/* Description hint */}
          {stadium.description && (
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[140px]">
              {stadium.description}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

// Skeleton loader
export function StadiumCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </CardFooter>
    </Card>
  );
}
