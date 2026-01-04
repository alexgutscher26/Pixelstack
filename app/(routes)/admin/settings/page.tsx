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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Admin Settings</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Configure integrations and system settings
        </p>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Dribbble Integration</h2>
          <p className="text-[var(--muted-foreground)] mb-6">
            Connect your Dribbble account to fetch real-time design trends and inspiration
            for AI-generated designs.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-lg">
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
                className={`h-3 w-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            {!isConnected ? (
              <Button
                onClick={handleConnectDribbble}
                disabled={isChecking}
                className="w-full"
              >
                Connect Dribbble Account
              </Button>
            ) : (
              <Button
                onClick={handleDisconnectDribbble}
                variant="outline"
                className="w-full"
              >
                Disconnect Dribbble
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Setup Instructions
            </h3>
            <ol className="text-sm text-[var(--muted-foreground)] space-y-2 list-decimal list-inside">
              <li>
                Register your app at{" "}
                <a
                  href="https://dribbble.com/account/applications/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Dribbble Applications
                </a>
              </li>
              <li>
                Set Callback URL to:{" "}
                <code className="bg-[var(--background)] px-2 py-1 rounded">
                  {typeof window !== "undefined"
                    ? `${window.location.origin}/api/dribbble/callback`
                    : "YOUR_DOMAIN/api/dribbble/callback"}
                </code>
              </li>
              <li>
                Add <code className="bg-[var(--background)] px-2 py-1 rounded">DRIBBBLE_CLIENT_ID</code> and{" "}
                <code className="bg-[var(--background)] px-2 py-1 rounded">DRIBBBLE_CLIENT_SECRET</code> to your{" "}
                <code className="bg-[var(--background)] px-2 py-1 rounded">.env</code> file
              </li>
              <li>Click "Connect Dribbble Account" above</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
