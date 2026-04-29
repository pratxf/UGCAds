import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  Icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

interface FeatureCardProps extends Feature {
  className?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ Icon, title, description, className }, ref) => {
    const titleId = React.useId();
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-start gap-4 p-6 rounded-2xl border bg-black/5 shadow-lg backdrop-blur-lg transition-all duration-300 ease-in-out hover:scale-105 hover:border-accent-foreground/20 hover:bg-black/10 dark:bg-black/30 dark:hover:bg-black/50",
          className
        )}
        aria-labelledby={titleId}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-secondary text-secondary-foreground">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <h3 id={titleId} className="text-lg font-bold leading-none tracking-tight text-card-foreground">
            {title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

interface FeatureGridProps extends React.ComponentProps<'section'> {
  sectionTitle: string;
  sectionDescription: string;
  features: Feature[];
}

export const FeatureGrid = React.forwardRef<HTMLElement, FeatureGridProps>(
  ({ sectionTitle, sectionDescription, features = [], className, ...props }, ref) => {
    const titleId = React.useId();

    return (
      <section
        ref={ref}
        className={cn("w-full py-12", className)}
        aria-labelledby={titleId}
        {...props}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id={titleId} className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl md:text-5xl">
              {sectionTitle}
            </h2>
            <p className="mt-4 text-muted-foreground md:text-xl">
              {sectionDescription}
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
    );
  }
);
FeatureGrid.displayName = "FeatureGrid";
