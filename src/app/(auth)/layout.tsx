import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      {children}
      <Toaster position="top-right" richColors />
    </div>
  );
}
