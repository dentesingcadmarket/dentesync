import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-pill border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-ebony-canvas text-cloud-white border-white/10 [a]:hover:bg-charcoal-surface",
        secondary:
          "bg-charcoal-surface text-cloud-white [a]:hover:bg-deep-graphite",
        destructive:
          "bg-anchor-graphite/40 text-cloud-white focus-visible:ring-anchor-graphite/30 [a]:hover:bg-anchor-graphite/60",
        outline:
          "border-border text-cloud-white [a]:hover:bg-charcoal-surface",
        ghost:
          "bg-white/[0.04] text-cloud-white hover:bg-white/[0.08]",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
        primary:
          "bg-primary text-primary-foreground [a]:hover:bg-primary/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
