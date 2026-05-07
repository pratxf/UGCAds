'use client';
import React from 'react';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Check, Star, Zap } from 'lucide-react';
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
	oneTime?: boolean;
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
	const [frequency, setFrequency] = React.useState<FREQUENCY>('yearly');

	return (
		<div
			className={cn(
				'flex w-full flex-col items-center justify-center space-y-8 p-4',
				props.className,
			)}
			{...props}
		>
			{/* Header */}
			<div className="mx-auto max-w-2xl space-y-3 text-center">
				<h2 className="text-3xl font-bold tracking-tight text-[#111111] md:text-4xl lg:text-5xl">
					{heading}
				</h2>
				{description && (
					<p className="text-[#6B7280] text-sm md:text-base">
						{description}
					</p>
				)}
			</div>

			<PricingFrequencyToggle
				frequency={frequency}
				setFrequency={setFrequency}
			/>

			<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
			<div className="flex w-fit rounded-full border border-[#E5E7EB] bg-[#F7F7F5] p-1">
				{frequencies.map((freq) => (
					<button
						key={freq}
						onClick={() => setFrequency(freq)}
						className="relative px-5 py-2 text-sm capitalize"
					>
						<span className={cn(
							"relative z-10 flex items-center gap-1.5 transition-colors duration-300",
							frequency === freq ? "text-white font-medium" : "text-[#6B7280]"
						)}>
							{freq}
							{freq === 'yearly' && (
								<span className="rounded-full bg-[#10B981] text-white px-1.5 py-0.5 text-[9px] font-bold leading-none uppercase">
									20% off
								</span>
							)}
						</span>
						{frequency === freq && (
							<motion.span
								layoutId="pricing-frequency"
								transition={{ type: 'spring', duration: 0.4 }}
								className="absolute inset-0 z-0 rounded-full bg-[#111111]"
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
	const isOneTime = plan.oneTime;
	const isHighlighted = plan.highlighted;

	return (
		<div
			className={cn(
				'relative flex w-full flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1',
				isHighlighted
					? 'border-[#111111] bg-[#111111] text-white shadow-xl shadow-black/20'
					: 'border-[#E5E7EB] bg-white shadow-sm hover:shadow-md',
				className,
			)}
			{...props}
		>
			{isHighlighted && (
				<div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
					<span className="inline-flex items-center gap-1 rounded-full bg-[#111111] px-3 py-1 text-xs font-semibold text-white shadow-sm">
						<Star className="h-3 w-3 fill-white" />
						Most Popular
					</span>
				</div>
			)}

			<div className="rounded-t-2xl p-5 border-b border-inherit">
				<div className="flex items-center justify-between mb-1">
					<div className={cn("text-base font-semibold", isHighlighted ? "text-white" : "text-[#111111]")}>
						{plan.name}
					</div>
					{isOneTime && (
						<span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
							One-time
						</span>
					)}
					{frequency === 'yearly' && !isOneTime && (
						<span className={cn(
							"rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
							isHighlighted ? "bg-white/20 text-white" : "bg-green-100 text-green-700"
						)}>
							{Math.round(
								((plan.price.monthly * 12 - plan.price.yearly) / plan.price.monthly / 12) * 100,
							)}% off
						</span>
					)}
				</div>
				<p className={cn("text-xs mb-3", isHighlighted ? "text-white/60" : "text-[#6B7280]")}>{plan.info}</p>
				<div className="flex items-end gap-1">
					{isOneTime ? (
						<>
							<span className={cn("text-3xl font-bold", isHighlighted ? "text-white" : "text-[#111111]")}>${plan.price.monthly}</span>
							<span className={cn("mb-1 text-sm", isHighlighted ? "text-white/60" : "text-[#6B7280]")}>one-time</span>
						</>
					) : frequency === 'yearly' ? (
						<>
							<span className={cn("text-3xl font-bold", isHighlighted ? "text-white" : "text-[#111111]")}>${Math.round(plan.price.yearly / 12)}</span>
							<span className={cn("mb-1 text-sm", isHighlighted ? "text-white/60" : "text-[#6B7280]")}>/month</span>
							<span className={cn("mb-1 ml-1 text-xs line-through", isHighlighted ? "text-white/40" : "text-[#9CA3AF]")}>${plan.price.monthly}</span>
						</>
					) : (
						<>
							<span className={cn("text-3xl font-bold", isHighlighted ? "text-white" : "text-[#111111]")}>${plan.price.monthly}</span>
							<span className={cn("mb-1 text-sm", isHighlighted ? "text-white/60" : "text-[#6B7280]")}>/month</span>
						</>
					)}
				</div>
				{frequency === 'yearly' && !isOneTime && (
					<p className={cn("text-[11px] mt-1", isHighlighted ? "text-white/50" : "text-[#10B981]")}>
						Billed annually · Save ${plan.price.monthly * 12 - plan.price.yearly}
					</p>
				)}
			</div>

			<div className="space-y-3 px-5 py-5 flex-1">
				{plan.features.map((feature, index) => (
					<div key={index} className="flex items-start gap-2.5">
						<div className={cn(
							"mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
							isHighlighted ? "bg-white/20" : "bg-blue-50"
						)}>
							<Check className={cn("h-2.5 w-2.5", isHighlighted ? "text-white" : "text-[#2563EB]")} strokeWidth={3} />
						</div>
						{feature.tooltip ? (
							<TooltipProvider>
								<Tooltip>
									<TooltipTrigger
										className={cn(
											'cursor-pointer border-b border-dashed text-left text-sm',
											isHighlighted ? "border-white/30 text-white/80" : "border-[#9CA3AF] text-[#6B7280]"
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
							<p className={cn("text-sm", isHighlighted ? "text-white/80" : "text-[#6B7280]")}>{feature.text}</p>
						)}
					</div>
				))}
			</div>

			<div className="mt-auto w-full border-t border-inherit p-5">
				{isHighlighted ? (
					<Link
						href={plan.btn.href}
						className="flex w-full items-center justify-center rounded-full bg-white py-3 text-sm font-semibold text-[#111111] hover:bg-gray-100 transition-colors active:scale-[0.98]"
					>
						{plan.btn.text}
						<span className="ml-2">→</span>
					</Link>
				) : isOneTime ? (
					<Link
						href={plan.btn.href}
						className="flex w-full items-center justify-center rounded-full bg-[#2563EB] py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20 active:scale-[0.98]"
					>
						{plan.btn.text}
						<span className="ml-2">→</span>
					</Link>
				) : (
					<Link
						href={plan.btn.href}
						className="flex w-full items-center justify-center rounded-full py-3 text-sm font-semibold border border-[#E5E7EB] bg-[#F7F7F5] text-[#111111] hover:bg-[#E5E7EB] transition-colors active:scale-[0.98]"
					>
						{plan.btn.text}
						<span className="ml-2">→</span>
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
