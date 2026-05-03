import { cn } from "@/lib/utils";

export const GradientBackground4 = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("absolute inset-0 h-full w-full", className)}
      style={{
        background: [
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(125,57,235,0.18) 0%, transparent 65%)",
          "radial-gradient(ellipse 50% 30% at 80% 80%, rgba(198,255,51,0.04) 0%, transparent 60%)",
        ].join(", "),
      }}
    />
  );
};
