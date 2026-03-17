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
    const queryString = params.toString();
    router.push(queryString ? `/stadiums?${queryString}` : "/stadiums");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-sky-100 bg-white/85 p-2 shadow-[0_16px_45px_rgba(14,116,144,0.12)] backdrop-blur sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-600/70" />
        <Input
          type="text"
          placeholder="Nhập tên sân, khu vực..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-11 rounded-xl border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-11 rounded-xl bg-sky-600 px-6 text-white hover:bg-sky-700"
      >
        Tìm kiếm
      </Button>
    </form>
  );
}
