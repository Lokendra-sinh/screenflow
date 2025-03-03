"use client";

import { useSession } from "@/providers/SessionProvider";
import { cn } from "@/lib/utils";

export function SessionStatusIndicator() {
  const { sessionId } = useSession();
  const isActive = !!sessionId;

  return (
    <div className="flex items-center gap-2 ml-2">
      <div className="relative flex h-3 w-3">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full",
            isActive ? "bg-green-500" : "bg-red-500"
          )}
        />
        {isActive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        )}
      </div>
    </div>
  );
}