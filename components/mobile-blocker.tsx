import { Monitor } from "lucide-react";

export function MobileBlocker() {
  return (
    <div className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4 text-center md:hidden">
      <div className="flex flex-col items-center gap-4">
        <Monitor className="text-muted-foreground h-16 w-16" />
        <h2 className="text-2xl font-bold">Please use Desktop</h2>
        <p className="text-muted-foreground">
          This application is optimized for desktop usage. Mobile support is coming soon.
        </p>
      </div>
    </div>
  );
}
