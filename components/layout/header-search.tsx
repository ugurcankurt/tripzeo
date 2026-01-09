"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter, useSearchParams } from "next/navigation"

export function HeaderSearch() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            setOpen(false)
            router.push(`/search?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <>
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center relative w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary z-10" />
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for cities or experiences..."
                    className="pl-10 pr-4 rounded-full bg-muted/20 backdrop-blur-md border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-all hover:bg-muted/40 focus:bg-background"
                />
            </form>

            {/* Mobile Search Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] top-[20%] translate-y-0">
                    <DialogHeader>
                        <DialogTitle>Search Tripzeo</DialogTitle>
                        <DialogDescription>
                            Find the best experiences near you.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSearch} className="grid gap-4 py-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary z-10" />
                            <Input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for cities or experiences..."
                                className="pl-10 pr-4 rounded-full bg-muted"
                            />
                        </div>
                        <Button type="submit">
                            Search
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
