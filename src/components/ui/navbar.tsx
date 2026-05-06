'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/radix-popover'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'

const NAV_LINKS = [
    { href: '#features',    label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing',     label: 'Pricing' },
]

function MobileNav({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <button className="block size-8 md:hidden" aria-label="Toggle menu">
                    <div className="relative flex items-center justify-center">
                        <div className="relative size-4">
                            <span className={cn('bg-[#111111] absolute left-0 block h-0.5 w-4 transition-all duration-150', open ? 'top-[0.4rem] -rotate-45' : 'top-1')} />
                            <span className={cn('bg-[#111111] absolute left-0 block h-0.5 w-4 transition-all duration-150', open ? 'top-[0.4rem] rotate-45' : 'top-2.5')} />
                        </div>
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="bg-white no-scrollbar h-(--radix-popover-content-available-height) w-(--radix-popover-content-available-width) overflow-y-auto rounded-none border-none p-0 shadow-lg"
                align="start" side="bottom" alignOffset={-16} sideOffset={0}
            >
                <div className="flex flex-col gap-1 px-5 py-5">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}
                            className="text-base font-medium text-[#111111] py-2.5 border-b border-[#F3F4F6] last:border-0"
                            onClick={() => setOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="#"
                        className="text-base font-medium text-[#111111] py-2.5"
                        onClick={() => setOpen(false)}
                    >
                        Resources
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}

interface SiteNavbarProps {
    signInHref?: string
    getStartedHref?: string
}

export default function SiteNavbar({
    signInHref = '/login',
    getStartedHref = '/signup',
}: SiteNavbarProps) {
    const [mobileOpen, setMobileOpen] = React.useState(false)

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-[#E5E7EB]">
            <nav className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Left — logo + mobile hamburger */}
                <div className="flex items-center gap-3 shrink-0">
                    <MobileNav open={mobileOpen} setOpen={setMobileOpen} />
                    <Logo href="/" />
                </div>

                {/* Center — desktop nav links */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.href} href={link.href}
                            className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111111] transition-colors rounded-lg hover:bg-[#F9FAFB] whitespace-nowrap"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[#111111] transition-colors rounded-lg hover:bg-[#F9FAFB]">
                        Resources
                        <ChevronDown className="h-3.5 w-3.5 mt-px" />
                    </button>
                </div>

                {/* Right — auth buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <Link href={signInHref}
                        className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-full border border-[#E5E7EB] bg-white text-sm font-medium text-[#111111] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-colors whitespace-nowrap"
                    >
                        Sign In
                    </Link>
                    <Link href={getStartedHref}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-5 rounded-full bg-[#2563EB] text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        Get Started
                        <span className="text-sm">→</span>
                    </Link>
                </div>
            </nav>
        </header>
    )
}
