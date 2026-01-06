"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const searchParams = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if Dribbble is connected
    checkDribbbleConnection();

    // Handle OAuth callback messages
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "dribbble_connected") {
      toast.success("Dribbble connected successfully!");
      setIsConnected(true);
    } else if (error) {
      const errorMessages: Record<string, string> = {
        no_code: "No authorization code received",
        invalid_state: "Invalid state parameter",
        not_configured: "Dribbble credentials not configured",
        token_exchange_failed: "Failed to exchange token",
        unknown: "An unknown error occurred",
      };
      toast.error(errorMessages[error] || "Failed to connect Dribbble");
    }
  }, [searchParams]);

  const checkDribbbleConnection = async () => {
    try {
      const response = await fetch("/api/dribbble/status");
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error("Error checking Dribbble connection:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnectDribbble = () => {
    window.location.href = "/api/dribbble/connect";
  };

  const handleDisconnectDribbble = async () => {
    try {
      const response = await fetch("/api/dribbble/disconnect", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Dribbble disconnected");
        setIsConnected(false);
      } else {
        toast.error("Failed to disconnect Dribbble");
      }
    } catch (error) {
      console.error("Error disconnecting Dribbble:", error);
      toast.error("Failed to disconnect Dribbble");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-4xl font-bold">Admin Settings</h1>
        <p className="mb-8 text-[var(--muted-foreground)]">
          Configure integrations and system settings
        </p>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="mb-4 text-2xl font-semibold">Dribbble Integration</h2>
          <p className="mb-6 text-[var(--muted-foreground)]">
            Connect your Dribbble account to fetch real-time design trends and inspiration for
            AI-generated designs.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-[var(--background)] p-4">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {isChecking
                    ? "Checking..."
                    : isConnected
                      ? "Connected - Fetching live design trends"
                      : "Not connected - Using curated trends"}
                </p>
              </div>
              <div
                className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
              />
            </div>

            {!isConnected ? (
              <Button onClick={handleConnectDribbble} disabled={isChecking} className="w-full">
                Connect Dribbble Account
              </Button>
            ) : (
              <Button onClick={handleDisconnectDribbble} variant="outline" className="w-full">
                Disconnect Dribbble
              </Button>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <h3 className="mb-2 font-semibold text-blue-600 dark:text-blue-400">
              Setup Instructions
            </h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-[var(--muted-foreground)]">
              <li>
                Register your app at{" "}
                <a
                  href="https://dribbble.com/account/applications/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  Dribbble Applications
                </a>
              </li>
              <li>
                Set Callback URL to:{" "}
                <code className="rounded bg-[var(--background)] px-2 py-1">
                  YOUR_DOMAIN/api/dribbble/callback
                </code>
                <br />
                <span className="text-xs">
                  (e.g., http://localhost:3000/api/dribbble/callback for development)
                </span>
              </li>
              <li>
                Add{" "}
                <code className="rounded bg-[var(--background)] px-2 py-1">DRIBBBLE_CLIENT_ID</code>{" "}
                and{" "}
                <code className="rounded bg-[var(--background)] px-2 py-1">
                  DRIBBBLE_CLIENT_SECRET
                </code>{" "}
                to your <code className="rounded bg-[var(--background)] px-2 py-1">.env</code> file
              </li>
              <li>Click &quot;Connect Dribbble Account&quot; above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
