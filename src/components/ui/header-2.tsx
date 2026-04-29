'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { Logo } from '@/components/ui/logo';

interface HeaderLink {
	label: string;
	href: string;
}

interface HeaderProps {
	links?: HeaderLink[];
	logo?: React.ReactNode;
	signInHref?: string;
	getStartedHref?: string;
}

export function Header({
	links = [
		{ label: 'Features', href: '#features' },
		{ label: 'How It Works', href: '#how-it-works' },
		{ label: 'Pricing', href: '#pricing' },
	],
	logo,
	signInHref = '/login',
	getStartedHref = '/signup',
}: HeaderProps) {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
					{ 'md:px-2': scrolled },
				)}
			>
				{logo || <Logo />}

				<div className="hidden items-center gap-2 md:flex">
					{links.map((link) => (
						<a
							key={link.label}
							href={link.href}
							className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
						>
							{link.label}
						</a>
					))}
					<Link href={signInHref}>
						<Button variant="outline" size="sm">Sign In</Button>
					</Link>
					<Link href={getStartedHref}>
						<Button size="sm">Get Started</Button>
					</Link>
				</div>

				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<a
								key={link.label}
								href={link.href}
								onClick={() => setOpen(false)}
								className="inline-flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
							>
								{link.label}
							</a>
						))}
					</div>
					<div className="flex flex-col gap-2">
						<Link href={signInHref}>
							<Button variant="outline" className="w-full">Sign In</Button>
						</Link>
						<Link href={getStartedHref}>
							<Button className="w-full">Get Started</Button>
						</Link>
					</div>
				</div>
			</div>
		</header>
	);
}
