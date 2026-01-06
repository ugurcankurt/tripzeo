'use client'

import React from 'react'
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TicketActions() {

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="flex items-center gap-3">
            <Button onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Ticket
            </Button>
        </div>
    )
}
