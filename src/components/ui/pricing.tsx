'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CheckCircleIcon, StarIcon } from 'lucide-react';
import Link from 'next/link';
import { motion, type Transition } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
	name: string;
	info: string;
	price: {
		monthly: number;
		yearly: number;
	};
	features: {
		text: string;
		tooltip?: string;
	}[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
	plans: Plan[];
	heading: string;
	description?: string;
}

export function PricingSection({
	plans,
	heading,
	description,
	...props
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<FREQUENCY>('monthly');

	return (
		<div
			className={cn(
				'flex w-full flex-col items-center justify-center space-y-5 p-4',
				props.className,
			)}
			{...props}
		>
			<div className="mx-auto max-w-xl space-y-2">
				<h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
					{heading}
				</h2>
				{description && (
					<p className="text-muted-foreground text-center text-sm md:text-base">
						{description}
					</p>
				)}
			</div>
			<PricingFrequencyToggle
				frequency={frequency}
				setFrequency={setFrequency}
			/>
			<div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
				{plans.map((plan) => (
					<PricingCard plan={plan} key={plan.name} frequency={frequency} />
				))}
			</div>
		</div>
	);
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
	frequency: FREQUENCY;
	setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
	frequency,
	setFrequency,
	...props
}: PricingFrequencyToggleProps) {
	return (
		<div className={cn('mx-auto flex w-fit items-center gap-2', props.className)} {...props}>
			<div className="bg-muted/30 flex w-fit rounded-full border p-1">
				{frequencies.map((freq) => (
					<button
						key={freq}
						onClick={() => setFrequency(freq)}
						className="relative px-4 py-1 text-sm capitalize"
					>
						<span className={cn(
							"relative z-10 flex items-center gap-1.5 transition-colors duration-300",
							frequency === freq ? "text-background font-medium" : "text-muted-foreground"
						)}>
							{freq}
							{freq === 'yearly' && (
								<span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-[9px] font-bold leading-none uppercase">
									20% off
								</span>
							)}
						</span>
					{frequency === freq && (
						<motion.span
							layoutId="frequency"
							transition={{ type: 'spring', duration: 0.4 }}
							className="bg-foreground absolute inset-0 z-0 rounded-full"
						/>
					)}
				</button>
			))}
		</div>
	</div>
	);
}

type PricingCardProps = React.ComponentProps<'div'> & {
	plan: Plan;
	frequency?: FREQUENCY;
};

export function PricingCard({
	plan,
	className,
	frequency = frequencies[0],
	...props
}: PricingCardProps) {
	return (
		<div
			key={plan.name}
			className={cn(
				'relative flex w-full flex-col rounded-lg border bg-card',
				className,
			)}
			{...props}
		>
			{plan.highlighted && (
				<BorderTrail
					style={{
						boxShadow:
							'0px 0px 60px 30px rgb(255 255 255 / 50%), 0 0 100px 60px rgb(0 0 0 / 50%), 0 0 140px 90px rgb(0 0 0 / 50%)',
					}}
					size={100}
				/>
			)}
			<div
				className="rounded-t-lg border-b p-4"
			>
				<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
					{plan.highlighted && (
						<p className="bg-background flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
							<StarIcon className="h-3 w-3 fill-current" />
							Popular
						</p>
					)}
					{frequency === 'yearly' && (
						<p className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
							{Math.round(
								((plan.price.monthly * 12 - plan.price.yearly) /
									plan.price.monthly /
									12) *
									100,
							)}
							% off
						</p>
					)}
				</div>

				<div className="text-lg font-medium">{plan.name}</div>
				<p className="text-muted-foreground text-sm font-normal">{plan.info}</p>
				<h3 className="mt-2 flex items-end gap-1">
					{frequency === 'yearly' ? (
						<>
							<span className="text-3xl font-bold">${Math.round(plan.price.yearly / 12)}</span>
							<span className="text-muted-foreground">/month</span>
							<span className="text-muted-foreground/50 ml-1 text-sm line-through">
								${plan.price.monthly}
							</span>
						</>
					) : (
						<>
							<span className="text-3xl font-bold">${plan.price.monthly}</span>
							<span className="text-muted-foreground">/month</span>
						</>
					)}
				</h3>
				{frequency === 'yearly' && (
					<p className="text-primary text-[11px] mt-1">Billed annually · Save 20%</p>
				)}
			</div>
			<div
				className="text-muted-foreground space-y-4 px-4 py-6 text-sm"
			>
				{plan.features.map((feature, index) => (
					<div key={index} className="flex items-center gap-2">
						<CheckCircleIcon className="text-foreground h-4 w-4 shrink-0" />
						{feature.tooltip ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										className={cn(
											'cursor-pointer border-b border-dashed text-left',
										)}
									>
										{feature.text}
									</TooltipTrigger>
									<TooltipContent>
										<p>{feature.tooltip}</p>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						) : (
							<p>{feature.text}</p>
						)}
					</div>
				))}
			</div>
			<div className="mt-auto w-full border-t p-4">
				{plan.highlighted ? (
					<Link href={plan.btn.href} className="block w-full rounded-full p-[2px] rotatingGradient active:scale-[0.98] transition-transform">
						<span className="flex w-full items-center justify-center rounded-full bg-background py-3 text-sm font-semibold text-foreground">
							{plan.btn.text}
							<span className="ml-2">&rarr;</span>
						</span>
					</Link>
				) : (
					<Link
						href={plan.btn.href}
						className="flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] border border-border bg-white/5 text-foreground hover:bg-white/10 hover:border-white/20"
					>
						{plan.btn.text}
						<span className="ml-2">&rarr;</span>
					</Link>
				)}
			</div>
		</div>
	);
}

type BorderTrailProps = {
	className?: string;
	size?: number;
	transition?: Transition;
	delay?: number;
	onAnimationComplete?: () => void;
	style?: React.CSSProperties;
};

export function BorderTrail({
	className,
	size = 60,
	transition,
	delay,
	onAnimationComplete,
	style,
}: BorderTrailProps) {
	const BASE_TRANSITION = {
		repeat: Infinity,
		duration: 5,
		ease: 'linear' as const,
	};

	return (
		<div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
			<motion.div
				className={cn('absolute aspect-square bg-zinc-500', className)}
				style={{
					width: size,
					offsetPath: `rect(0 auto auto 0 round ${size}px)`,
					...style,
				}}
				animate={{
					offsetDistance: ['0%', '100%'],
				}}
				transition={{
					...(transition ?? BASE_TRANSITION),
					delay: delay,
				}}
				onAnimationComplete={onAnimationComplete}
			/>
		</div>
	);
}
