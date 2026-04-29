'use client'

import React from 'react'
import Link from 'next/link'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/radix-popover'
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/radix-navigation-menu'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

type NavCategory = {
    name: string
    items: {
        label: string
        href: string
        active?: boolean
    }[]
}

type MobileNavProps = {
    nav: NavCategory[]
}

export function MobileNav({ nav }: MobileNavProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button
                    className="block size-8 items-center justify-start md:hidden hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent"
                >
                    <div className="relative flex items-center justify-center">
                        <div className="relative size-4">
                            <span
                                className={cn(
                                    'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                                    open ? 'top-[0.4rem] -rotate-45' : 'top-1'
                                )}
                            />
                            <span
                                className={cn(
                                    'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                                    open ? 'top-[0.4rem] rotate-45' : 'top-2.5'
                                )}
                            />
                        </div>
                        <span className="sr-only">Toggle Menu</span>
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="bg-background/90 no-scrollbar h-(--radix-popover-content-available-height) w-(--radix-popover-content-available-width) overflow-y-auto rounded-none border-none p-0 shadow-none backdrop-blur duration-100"
                align="start"
                side="bottom"
                alignOffset={-16}
                sideOffset={4}
            >
                <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
                    {nav.map((category, index) => (
                        <div className="flex flex-col gap-4" key={index}>
                            <p className="text-muted-foreground text-sm font-medium">
                                {category.name}
                            </p>
                            <div className="flex flex-col gap-3">
                                {category.items.map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className="text-2xl font-medium"
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface SiteNavbarProps {
    navigationLinks?: NavCategory[]
    signInHref?: string
    getStartedHref?: string
}

export default function SiteNavbar({
    navigationLinks = [
        {
            name: 'Menu',
            items: [
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#pricing', label: 'Pricing' },
            ],
        },
    ],
    signInHref = '/login',
    getStartedHref = '/signup',
}: SiteNavbarProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
          <nav className="mx-auto max-w-7xl flex h-14 items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 shrink-0">
                <MobileNav nav={navigationLinks} />
                <Logo href="/" />
            </div>

            <NavigationMenu className="max-md:hidden">
                <NavigationMenuList>
                    {navigationLinks[0].items.map((link, index) => (
                        <NavigationMenuItem key={index}>
                            <NavigationMenuLink
                                asChild
                                href={link.href}
                                data-active={link.active}
                                className="rounded-md px-3 py-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                            >
                                <a>{link.label}</a>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center gap-2 shrink-0">
                <Link
                    href={signInHref}
                    className="hidden sm:inline-flex items-center justify-center rounded-full text-sm font-medium h-9 px-5 border border-border bg-transparent hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                    Sign In
                </Link>
                <Link href={getStartedHref} className="relative rounded-full p-[2px] rotatingGradient">
                    <span className="inline-flex items-center justify-center rounded-full bg-background text-sm font-semibold text-foreground h-8 px-4 whitespace-nowrap">
                        Get Started
                    </span>
                </Link>
            </div>
          </nav>
        </header>
    )
}
