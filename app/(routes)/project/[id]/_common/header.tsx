import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { useDeleteProject, useUpdateProject } from "@/features/use-project-id";

interface HeaderProps {
  projectName?: string;
}

const Header = ({ projectName = "Untitled Project" }: HeaderProps) => {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";
  const params = useParams();
  const projectId = (params?.id as string) || "";

  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(projectId);
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject(projectId);

  // Rename dialog state
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [nextName, setNextName] = useState("");

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Sync nextName when projectName changes or dialog opens
  useEffect(() => {
    if (isRenameOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNextName(projectName);
    }
  }, [isRenameOpen, projectName]);

  // Validation
  const isRenameValid = nextName.trim().length > 0 && nextName.trim() !== projectName.trim();
  const isDeleteValid = deleteText.trim().toUpperCase() === "DELETE";

  // Handlers
  const handleRename = () => {
    if (!isRenameValid) return;

    updateProject(
      { name: nextName.trim() },
      {
        onSuccess: () => {
          setIsRenameOpen(false);
          setNextName("");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!isDeleteValid) return;

    deleteProject(undefined, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        router.push("/");
      },
    });
  };

  const isFeedbackValid = feedbackText.trim().length >= 10;
  const handleSendFeedback = async () => {
    if (!isFeedbackValid) return;
    try {
      await axios.post("/api/feedback", {
        projectId,
        message: feedbackText.trim(),
      });
      toast.success("Feedback sent");
      setIsFeedbackOpen(false);
      setFeedbackText("");
    } catch {
      toast.error("Failed to send feedback");
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isRenameValid && !isUpdating) {
      handleRename();
    }
  };

  const handleDeleteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isDeleteValid && !isDeleting) {
      handleDelete();
    }
  };

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const handleBackClick = () => {
    router.push("/");
  };

  return (
    <div className="sticky top-0 z-50">
      <header className="border-border/40 bg-card/50 border-b backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Logo />
            <Button
              size="icon-sm"
              variant="ghost"
              className="bg-muted rounded-full"
              onClick={handleBackClick}
              aria-label="Go back to projects"
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <h1 className="max-w-50 truncate text-sm font-medium md:max-w-100">{projectName}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8 rounded-full"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              <SunIcon
                className={cn(
                  "absolute h-5 w-5 transition-transform",
                  isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"
                )}
              />
              <MoonIcon
                className={cn(
                  "absolute h-5 w-5 transition-transform",
                  isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0"
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  aria-label="Project options"
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setIsRenameOpen(true)}>
                  <PencilIcon className="mr-2 size-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsFeedbackOpen(true)}
                >
                  <MoreHorizontalIcon className="mr-2 size-4" />
                  Send Feedback
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2Icon className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Rename Dialog */}
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
            onKeyDown={handleRenameKeyDown}
            placeholder="Enter project name"
            disabled={isUpdating}
            maxLength={100}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!isRenameValid || isUpdating}>
              {isUpdating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Type <span className="font-semibold">DELETE</span> to
              confirm deletion of <span className="font-semibold">{projectName}</span> and all its
              frames.
            </DialogDescription>
          </DialogHeader>

          <Input
            autoFocus
            placeholder="Type DELETE to confirm"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            onKeyDown={handleDeleteKeyDown}
            disabled={isDeleting}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!isDeleteValid || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>Report a bug or share an improvement idea.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Subject (optional)"
            maxLength={120}
          />
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">Describe the issue</span>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What went wrong? Steps to reproduce? Expected behavior?"
              maxLength={2000}
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendFeedback} disabled={!isFeedbackValid}>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
