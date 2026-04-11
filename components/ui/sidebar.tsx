import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

function SidebarProvider({
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-provider"
      style={style as React.CSSProperties}
      className={cn("flex min-h-screen w-full", className)}
      {...props}
    />
  );
}

function Sidebar({ className, ...props }: React.ComponentProps<"aside">) {
  return (
    <aside
      data-slot="sidebar"
      className={cn(
        "hidden h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:w-[var(--sidebar-width)] md:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex-1 overflow-y-auto", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn("mt-auto", className)}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("px-3", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn("flex list-none flex-col gap-1.5", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("list-none", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "group/menu-button flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[0.98rem] font-medium transition outline-none duration-200 select-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/60 focus-visible:ring-offset-0 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        false:
          "text-sidebar-foreground/70 hover:bg-white/[0.03] hover:text-sidebar-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

function SidebarMenuButton({
  className,
  active,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={active ? "true" : undefined}
      className={cn(sidebarMenuButtonVariants({ active, className }))}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("flex min-h-screen min-w-0 flex-1 flex-col", className)}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
};
