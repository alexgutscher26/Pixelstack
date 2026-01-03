import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import Logo from "@/components/logo";
import { messages } from "@/constant/messages";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  MoonIcon,
  SunIcon,
  MoreHorizontalIcon,
  EyeIcon,
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
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandFontFamily?: string;
}

const Header = ({
  projectName = "Untitled Project",
  brandLogoUrl,
  brandPrimaryColor,
  brandFontFamily,
}: HeaderProps) => {
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
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(brandLogoUrl || "");
  const [primaryColor, setPrimaryColor] = useState(brandPrimaryColor || "");
  const [fontFamily, setFontFamily] = useState(brandFontFamily || "");

  // Sync nextName when projectName changes or dialog opens
  useEffect(() => {
    if (isRenameOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNextName(projectName);
    }
  }, [isRenameOpen, projectName]);
  const handleBrandDialogOpenChange = (open: boolean) => {
    setIsBrandKitOpen(open);
    if (open) {
      setLogoUrl(brandLogoUrl || "");
      setPrimaryColor(brandPrimaryColor || "");
      setFontFamily(brandFontFamily || "");
    }
  };

  // Validation
  const isRenameValid = nextName.trim().length > 0 && nextName.trim() !== projectName.trim();
  const isDeleteValid = deleteText.trim().toUpperCase() === "DELETE";
  const isBrandValid =
    (logoUrl.trim().length > 0 || primaryColor.trim().length > 0 || fontFamily.trim().length > 0) &&
    !isUpdating;

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
  const handleBrandKitSave = () => {
    updateProject(
      {
        brandLogoUrl: logoUrl.trim() || undefined,
        brandPrimaryColor: primaryColor.trim() || undefined,
        brandFontFamily: fontFamily.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsBrandKitOpen(false);
        },
      }
    );
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
              aria-label={messages.header.goBackToProjects}
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
              aria-label={`${messages.header.ariaSwitchToPrefix}${isDark ? messages.common.light : messages.common.dark}${messages.header.ariaModeSuffix}`}
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
                  aria-label={messages.header.projectOptionsAria}
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push(`/project/${projectId}/view`)}
                >
                  <EyeIcon className="mr-2 size-4" />
                  View Only
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsBrandKitOpen(true)}
                >
                  <PencilIcon className="mr-2 size-4" />
                  Brand Kit
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setIsRenameOpen(true)}>
                  <PencilIcon className="mr-2 size-4" />
                  {messages.common.rename}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsFeedbackOpen(true)}
                >
                  <MoreHorizontalIcon className="mr-2 size-4" />
                  {messages.header.sendFeedback}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2Icon className="mr-2 size-4" />
                  {messages.common.delete}
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
            <DialogTitle>{messages.header.renameProjectTitle}</DialogTitle>
            <DialogDescription>{messages.header.renameProjectDescription}</DialogDescription>
          </DialogHeader>

          <Input
            
            value={nextName}
            onChange={(e) => setNextName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            placeholder={messages.header.renameDialogPlaceholder}
            disabled={isUpdating}
            maxLength={100}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameOpen(false)} disabled={isUpdating}>
              {messages.common.cancel}
            </Button>
            <Button onClick={handleRename} disabled={!isRenameValid || isUpdating}>
              {isUpdating ? messages.common.saving : messages.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.header.deleteProjectTitle}</DialogTitle>
            <DialogDescription>
              {messages.header.deleteProjectDescriptionPrefix}
              <span className="font-semibold">{messages.header.deleteConfirmWord}</span>
              {messages.header.deleteProjectDescriptionSuffix}
              <span className="font-semibold">{projectName}</span>
              {" and all its frames."}
            </DialogDescription>
          </DialogHeader>

          <Input
            
            placeholder={messages.header.deleteConfirmPlaceholder}
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            onKeyDown={handleDeleteKeyDown}
            disabled={isDeleting}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              {messages.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={!isDeleteValid || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? messages.common.deleting : messages.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.header.feedbackDialogTitle}</DialogTitle>
            <DialogDescription>{messages.header.feedbackDialogDescription}</DialogDescription>
          </DialogHeader>
          <Input placeholder={messages.header.feedbackSubjectPlaceholder} maxLength={120} />
          <div className="space-y-2">
            <span className="text-muted-foreground text-xs">
              {messages.header.feedbackDescribeIssueLabel}
            </span>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={messages.header.feedbackTextareaPlaceholder}
              maxLength={2000}
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsFeedbackOpen(false)}>
              {messages.common.cancel}
            </Button>
            <Button onClick={handleSendFeedback} disabled={!isFeedbackValid}>
              {messages.common.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBrandKitOpen} onOpenChange={handleBrandDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Brand Kit</DialogTitle>
            <DialogDescription>Define logo, primary color, and font family</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Logo URL</span>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Primary Color (Hex)</span>
              <div className="flex items-center gap-2">
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3b82f6"
                  disabled={isUpdating}
                />
                <div
                  className="h-8 w-8 rounded-md border"
                  style={{ backgroundColor: primaryColor || "#ffffff" }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-xs">Font Family</span>
              <Input
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                placeholder='"Plus Jakarta Sans"'
                disabled={isUpdating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBrandKitOpen(false)} disabled={isUpdating}>
              {messages.common.cancel}
            </Button>
            <Button onClick={handleBrandKitSave} disabled={!isBrandValid || isUpdating}>
              {isUpdating ? messages.common.saving : messages.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
