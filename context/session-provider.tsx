/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated, error } = useKindeBrowserClient();
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  // We'll track if we were ever authenticated to differentiate between
  // "initial load" and "session lost".
  const [wasAuthenticated, setWasAuthenticated] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      setWasAuthenticated(true);
      setShowExpiredModal(false);
    } else if (wasAuthenticated && !isAuthenticated) {
      // If we WERE authenticated but now we're not (and not loading),
      // the session likely expired.
      setShowExpiredModal(true);
    }
  }, [isLoading, isAuthenticated, wasAuthenticated]);

  return (
    <>
      {children}
      <Dialog
        open={showExpiredModal}
        onOpenChange={(open) => {
          if (open) setShowExpiredModal(true);
        }}
      >
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Expired</DialogTitle>
            <DialogDescription>
              Your session has expired due to inactivity. Please sign in again to continue working.
              Don't worry, your work is safe.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <LoginLink>
              <Button className="w-full sm:w-auto">Sign in to Continue</Button>
            </LoginLink>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
