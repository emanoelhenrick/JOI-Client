import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
      <div
        className={cn("animate-pulse rounded-md bg-primary/5 invisible", className)}
        {...props}
      />
  )
}

export { Skeleton }
