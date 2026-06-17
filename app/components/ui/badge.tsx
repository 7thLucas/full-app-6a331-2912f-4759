import { cn } from "~/lib/utils";

type BadgeVariant = "waiting" | "in-consultation" | "done" | "cancelled" | "urgent" | "active" | "completed" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  waiting: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-consultation": "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
  urgent: "bg-red-100 text-red-700 border-red-200",
  active: "bg-teal-100 text-teal-800 border-teal-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  default: "bg-slate-100 text-slate-600 border-slate-200",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    waiting: "bg-yellow-400",
    "in-consultation": "bg-blue-500",
    done: "bg-emerald-500",
    cancelled: "bg-slate-400",
    urgent: "bg-red-500",
    active: "bg-teal-500",
    completed: "bg-emerald-500",
  };
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        colors[status] ?? "bg-slate-400"
      )}
    />
  );
}
