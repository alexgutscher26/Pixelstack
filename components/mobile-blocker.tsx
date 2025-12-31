import { Monitor } from "lucide-react";

export function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 text-center md:hidden">
      <div className="flex flex-col items-center gap-4">
        <Monitor className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Please use Desktop</h2>
        <p className="text-muted-foreground">
          This application is optimized for desktop usage. Mobile support is coming soon.
        </p>
      </div>
    </div>
  );
}
