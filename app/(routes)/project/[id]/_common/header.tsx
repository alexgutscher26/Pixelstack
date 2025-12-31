import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  MoonIcon,
  SunIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDeleteProject, useUpdateProject } from "@/features/use-project-id";

const Header = ({ projectName }: { projectName?: string }) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const params = useParams();
  const projectId = (params?.id as string) || "";
  const update = useUpdateProject(projectId);
  const del = useDeleteProject(projectId);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [nextName, setNextName] = useState(projectName ?? "");
  const isValid = nextName.trim().length > 0 && nextName.trim() !== (projectName ?? "").trim();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const canDelete = deleteText.trim().toUpperCase() === "DELETE";

  return (
    <div className="sticky top-0">
      <header className="border-border/40 bg-card/50 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Logo />
            <Button
              size="icon-sm"
              variant="ghost"
              className="bg-muted! rounded-full"
              onClick={() => router.push("/")}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <p className="max-w-[200px] truncate font-medium">
              {projectName || "Untitled Project"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8 rounded-full"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <SunIcon
                className={cn("absolute h-5 w-5 transition", isDark ? "scale-100" : "scale-0")}
              />
              <MoonIcon
                className={cn("absolute h-5 w-5 transition", isDark ? "scale-0" : "scale-100")}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setNextName(projectName ?? "");
                    setIsRenameOpen(true);
                  }}
                >
                  <PencilIcon className="size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setDeleteText("");
                    setIsDeleteOpen(true);
                  }}
                  data-variant="destructive"
                >
                  <Trash2Icon className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>Choose a clear, concise name for your project.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={nextName}
            onChange={(e) => setNextName(e.target.value)}
            placeholder="Enter project name"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsRenameOpen(false)}
              disabled={update.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isValid) return;
                update.mutate({ name: nextName.trim() }, { onSuccess: () => setIsRenameOpen(false) });
              }}
              disabled={!isValid || update.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Type DELETE to confirm. This action permanently removes the project and its frames.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Type DELETE to confirm"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={del.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!canDelete || del.isPending}
              onClick={() => {
                if (!canDelete) return;
                del.mutate(undefined, {
                  onSuccess: () => {
                    setIsDeleteOpen(false);
                    router.push("/");
                  },
                });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
