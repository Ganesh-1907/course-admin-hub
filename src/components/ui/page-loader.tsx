import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

type PageLoaderProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
};

const sizeClassMap = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} satisfies Record<NonNullable<PageLoaderProps["size"]>, string>;

export const PageLoader = ({
  label,
  size = "lg",
  fullScreen = false,
  className,
}: PageLoaderProps) => (
  <div
    className={cn(
      "flex items-center justify-center",
      fullScreen ? "min-h-screen" : "w-full py-12",
      className,
    )}
    aria-live="polite"
    aria-busy="true"
  >
    <div className="flex flex-col items-center gap-3">
      <Loader className={cn("animate-spin text-primary", sizeClassMap[size])} />
      {label ? <p className="text-sm text-muted-foreground">{label}</p> : null}
    </div>
  </div>
);

export default PageLoader;
