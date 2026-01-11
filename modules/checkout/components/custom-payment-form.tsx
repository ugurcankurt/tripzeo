'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Cards from "react-credit-cards-2"
import "react-credit-cards-2/dist/es/styles-compiled.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, Lock, ShieldCheck } from "lucide-react"
import { processDirectPayment } from "@/modules/checkout/actions"
import { sendAddPaymentInfo } from "@/lib/analytics"

// Schema
const paymentSchema = z.object({
    cardHolderName: z.string().min(3, "Card holder name is required"),
    cardNumber: z.string().min(19, "Card number must be 16 digits").refine((val) => val.replace(/\D/g, "").length === 16, "Invalid card number"),
    expireMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month (MM)"),
    expireYear: z.string().regex(/^\d{2}$/, "Invalid year (YY)"),
    cvc: z.string().regex(/^\d{3,4}$/, "Invalid CVC"),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface CustomPaymentFormProps {
    bookingId: string
    price: number
    currency: string
}

export function CustomPaymentForm({ bookingId, price, currency }: CustomPaymentFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // State for Visual Card
    const [cardState, setCardState] = useState({
        number: "",
        expiry: "",
        cvc: "",
        name: "",
        focus: "" as any,
    })

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        trigger,
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        mode: "onChange",
    })

    // --- Handlers ---

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setCardState((prev) => ({ ...prev, focus: e.target.name }))
    }

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove all non-digits
        let val = e.target.value.replace(/\D/g, "")

        // Limit to 16 digits
        if (val.length > 16) val = val.slice(0, 16)

        // Add space every 4 digits
        const formatted = val.match(/.{1,4}/g)?.join(" ") || val

        // Update Form
        setValue("cardNumber", formatted)
        trigger("cardNumber")

        // Update Visual Card (strip spaces for the visual component)
        setCardState((prev) => ({ ...prev, number: val }))
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue("cardHolderName", val)
        setCardState((prev) => ({ ...prev, name: val }))
    }

    const handleMonthChange = (val: string) => {
        setValue("expireMonth", val)
        trigger("expireMonth")
        setCardState((prev) => {
            const currentYear = prev.expiry.slice(2, 4) || ""
            return { ...prev, expiry: val + currentYear }
        })
    }

    const handleYearChange = (val: string) => {
        const shortYear = val.slice(2, 4)
        setValue("expireYear", shortYear)
        trigger("expireYear")
        setCardState((prev) => {
            const currentMonth = prev.expiry.slice(0, 2) || ""
            return { ...prev, expiry: currentMonth + shortYear }
        })
    }

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 4)
        setValue("cvc", val)
        setCardState((prev) => ({ ...prev, cvc: val }))
    }

    // --- Submit ---

    const onSubmit = async (data: PaymentFormData) => {
        setIsLoading(true)

        // Track Add Payment Info
        sendAddPaymentInfo([{
            item_id: bookingId, // We use booking ID as item ID here since we don't have full item details in this component easily without props drill
            item_name: 'Experience Booking',
            price: price,
            quantity: 1
        }], price, currency, 'Credit Card')

        try {
            const result = await processDirectPayment(bookingId, {
                cardHolderName: data.cardHolderName,
                cardNumber: data.cardNumber.replace(/\s/g, ""), // Send raw digits
                expireMonth: data.expireMonth,
                expireYear: "20" + data.expireYear,
                cvc: data.cvc,
            })

            if (result.error) {
                toast.error(result.error)
            } else if (result.success && result.redirectUrl) {
                toast.success("Payment successful!")
                router.push(result.redirectUrl)
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-end pb-2">
            </div>

            {/* Visual Card Display */}
            <div className="flex justify-center pb-4">
                <Cards
                    number={cardState.number}
                    expiry={cardState.expiry}
                    cvc={cardState.cvc}
                    name={cardState.name}
                    focused={cardState.focus}
                />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Card Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cardHolderName" className="text-sm font-medium">
                            Holder Name
                        </Label>
                        <Input
                            id="cardHolderName"
                            placeholder="Holder Name"
                            {...register("cardHolderName")}
                            name="name"
                            onChange={handleNameChange}
                            onFocus={handleFocus}
                            className={`h-11 ${errors.cardHolderName ? "border-destructive" : ""}`}
                        />
                        {errors.cardHolderName && (
                            <p className="text-xs text-destructive">{errors.cardHolderName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm font-medium">
                            Card Number
                        </Label>
                        <div className="relative">
                            <Input
                                id="cardNumber"
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9\s]*"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                {...register("cardNumber")}
                                name="number"
                                onChange={handleCardNumberChange}
                                onFocus={handleFocus}
                                className={`h-11 pl-11 font-mono ${errors.cardNumber ? "border-destructive" : ""}`}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <CreditCard className="h-4 w-4" />
                            </div>
                        </div>
                        {errors.cardNumber && (
                            <p className="text-xs text-destructive">{errors.cardNumber.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Month</Label>
                            <Select onValueChange={handleMonthChange}>
                                <SelectTrigger className={`h-11 w-full ${errors.expireMonth ? "border-destructive" : ""}`}>
                                    <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                            {String(i + 1).padStart(2, "0")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.expireMonth && (
                                <p className="text-xs text-destructive">{errors.expireMonth.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Year</Label>
                            <Select onValueChange={handleYearChange}>
                                <SelectTrigger className={`h-11 w-full ${errors.expireYear ? "border-destructive" : ""}`}>
                                    <SelectValue placeholder="YY" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem key={i} value={String(2025 + i)}>
                                            {2025 + i}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.expireYear && (
                                <p className="text-xs text-destructive">{errors.expireYear.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cvc" className="text-sm font-medium">CVC</Label>
                            <div className="relative w-full">
                                <Input
                                    id="cvc"
                                    type="tel"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder="•••"
                                    maxLength={4}
                                    {...register("cvc")}
                                    name="cvc"
                                    onChange={handleCvcChange}
                                    onFocus={handleFocus}
                                    className={`h-11 w-full pl-11 font-mono text-center ${errors.cvc ? "border-destructive" : ""}`}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    <Lock className="h-4 w-4" />
                                </div>
                            </div>
                            {errors.cvc && (
                                <p className="text-xs text-destructive">{errors.cvc.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button type="submit" className="h-12 w-full text-base font-medium" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay {currency} {price}</>
                        )}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs">Protected with 256-bit SSL encryption</span>
                    </div>
                </div>
            </form>
        </div>
    )
}
