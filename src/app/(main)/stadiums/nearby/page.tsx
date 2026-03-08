"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNearbyStadiums } from "@/hooks/use-stadiums";
import { StadiumCard, StadiumCardSkeleton } from "@/components/stadium/StadiumCard";
import { EmptyState } from "@/components/shared/EmptyState";

export default function NearbyStadiumsPage() {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(5);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const { data: stadiums, isLoading } = useNearbyStadiums(lat, lng, radius);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Bạn đã từ chối quyền truy cập vị trí");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Không thể xác định vị trí của bạn");
            break;
          case error.TIMEOUT:
            setGeoError("Yêu cầu vị trí đã hết thời gian");
            break;
          default:
            setGeoError("Có lỗi khi xác định vị trí");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Sân bóng gần bạn
        </h1>
        <p className="text-muted-foreground">
          Tìm sân bóng trong khu vực xung quanh bạn
        </p>
      </div>

      {/* Location controls */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 flex items-center gap-3">
              {lat !== null && lng !== null ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Vị trí: {lat.toFixed(4)}, {lng.toFixed(4)}
                  </span>
                </div>
              ) : geoError ? (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{geoError}</span>
                </div>
              ) : null}
            </div>

            <div className="flex items-end gap-3">
              <div className="w-32">
                <Label htmlFor="radius" className="text-sm">
                  Bán kính (km)
                </Label>
                <Input
                  id="radius"
                  type="number"
                  min={1}
                  max={50}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
              <Button
                variant="outline"
                onClick={requestLocation}
                disabled={isLocating}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {isLocating ? "Đang xác định..." : "Cập nhật vị trí"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {lat === null || lng === null ? (
        <EmptyState
          icon={MapPin}
          title="Cho phép truy cập vị trí"
          description="Vui lòng cho phép trình duyệt truy cập vị trí của bạn để tìm sân gần đây"
          action={
            <Button onClick={requestLocation} disabled={isLocating}>
              <Navigation className="h-4 w-4 mr-2" />
              Chia sẻ vị trí
            </Button>
          }
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <StadiumCardSkeleton key={i} />
          ))}
        </div>
      ) : stadiums && stadiums.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Tìm thấy {stadiums.length} sân trong bán kính {radius}km
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stadiums.map((stadium) => (
              <StadiumCard key={stadium.id} stadium={stadium} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={MapPin}
          title="Không tìm thấy sân"
          description={`Không có sân bóng nào trong bán kính ${radius}km. Hãy thử tăng bán kính tìm kiếm.`}
        />
      )}
    </div>
  );
}
