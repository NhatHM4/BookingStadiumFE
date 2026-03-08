"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("name", query.trim());
    router.push(`/stadiums?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 flex w-full max-w-lg mx-auto"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Nhập tên sân, khu vực..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12 rounded-r-none text-base"
        />
      </div>
      <Button type="submit" size="lg" className="rounded-l-none h-12 px-6">
        Tìm kiếm
      </Button>
    </form>
  );
}
