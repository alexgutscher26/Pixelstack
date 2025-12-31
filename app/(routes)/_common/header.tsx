"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogOutIcon, MoonIcon, SunIcon, MonitorIcon, CheckIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useSearchParams } from "next/navigation";

const Header = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();
  const isDark = (resolvedTheme ?? theme) === "dark";
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectURL =
    pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
  return (
    <div className="sticky top-0 right-0 left-0 z-30">
      <header className="h-16 border-b bg-background py-4">
        <div
          className="w-full max-w-6xl mx-auto
         flex items-center justify-between"
        >
          <Logo />

          <div
            className="hidden flex-1 items-center
          justify-center gap-8 md:flex"
          >
            <Link href="/" className="text-foreground-muted text-sm">
              Home
            </Link>
            <Link href="/" className="text-foreground-muted text-sm">
              Pricing
            </Link>
          </div>

          <div
            className="flex flex-1 items-center
           justify-end gap-3

          "
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative rounded-full h-8 w-8"
                >
                  <SunIcon
                    className={cn(
                      "absolute h-5 w-5 transition",
                      isDark ? "scale-100" : "scale-0"
                    )}
                  />
                  <MoonIcon
                    className={cn(
                      "absolute h-5 w-5 transition",
                      isDark ? "scale-0" : "scale-100"
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("system")} className="justify-between">
                  System
                  {theme === "system" && <CheckIcon className="size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between">
                  Light
                  {resolvedTheme === "light" && <CheckIcon className="size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between">
                  Dark
                  {resolvedTheme === "dark" && <CheckIcon className="size-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar
                    className="h-8 w-8
                  shrink-0 rounded-full"
                  >
                    <AvatarImage
                      src={user?.picture || ""}
                      alt={user?.given_name || ""}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.given_name?.charAt(0)}
                      {user?.family_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutLink className="w-full flex items-center">
                      <LogOutIcon className="size-4" />
                      Logout
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginLink postLoginRedirectURL={redirectURL}>
                <Button>Sign in</Button>
              </LoginLink>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
