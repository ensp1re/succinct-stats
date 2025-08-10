import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-pink-100 dark:bg-pink-950/20", className)}
      {...props}
    />
  )
}

export { Skeleton }