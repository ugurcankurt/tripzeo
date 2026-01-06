'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface Country {
    name: string
    code: string // cca2
    dial_code: string // idd.root + idd.suffixes[0]
    flag: string
}

interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    className?: string
    disabled?: boolean
    defaultCountryName?: string | null
}

export function PhoneInput({ value, onChange, className, disabled, defaultCountryName }: PhoneInputProps) {
    const [open, setOpen] = React.useState(false)
    const [countries, setCountries] = React.useState<Country[]>([])
    const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null)
    const [phoneNumber, setPhoneNumber] = React.useState("")

    React.useEffect(() => {
        // Fetch countries
        fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags')
            .then(res => res.json())
            .then((data: any[]) => {
                const formattedCountries = data.map(c => {
                    const root = c.idd?.root || ''
                    const suffix = c.idd?.suffixes?.[0] || ''

                    // Special handling for NANP (North American Numbering Plan) countries like US and Canada
                    // They share +1 and suffixes are area codes (3 digits), which we don't want as the main dial code
                    let dial_code = ''
                    if (root === '+1') {
                        dial_code = '+1'
                    } else {
                        dial_code = root + suffix
                    }

                    return {
                        name: c.name.common,
                        code: c.cca2,
                        dial_code: dial_code,
                        flag: c.flags.svg
                    }
                }).filter(c => c.dial_code)
                    .sort((a, b) => a.name.localeCompare(b.name))

                setCountries(formattedCountries)

                // Default to US or Turkey if available, or first one
                const defaultCountry = formattedCountries.find(c => c.code === 'US') || formattedCountries.find(c => c.code === 'TR')
                if (defaultCountry && !selectedCountry) setSelectedCountry(defaultCountry)
            })
            .catch(err => console.error("Failed to fetch countries", err))
    }, [])

    // Handle initial value parsing
    React.useEffect(() => {
        if (value && countries.length > 0) {
            // Stick to selected country if it still matches (prevents jumping between +1 countries)
            if (selectedCountry && value.startsWith(selectedCountry.dial_code)) {
                // Update phone number part only, keep country
                setPhoneNumber(value.slice(selectedCountry.dial_code.length))
                return
            }

            // Priority Check: If defaultCountryName is provided, check it first
            if (defaultCountryName) {
                const priorityCountry = countries.find(c => c.name === defaultCountryName)
                if (priorityCountry && value.startsWith(priorityCountry.dial_code)) {
                    setSelectedCountry(priorityCountry)
                    setPhoneNumber(value.slice(priorityCountry.dial_code.length))
                    return
                }
            }

            // Find country that matches the start of the phone number
            // We reverse sort by dial_code length to match longest prefix first (e.g. +1242 before +1)
            // But for shared prefixes like +1, this depends on selection.
            const matchingCountry = countries.find(c => value.startsWith(c.dial_code))
            if (matchingCountry) {
                setSelectedCountry(matchingCountry)
                setPhoneNumber(value.slice(matchingCountry.dial_code.length))
            } else {
                // If no matching country found, just set the number
                setPhoneNumber(value)
            }
        }
    }, [value, countries, selectedCountry, defaultCountryName])

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^0-9]/g, '')

        // Smart handling: if user types/pastes the country code at the start, strip it
        // Only strip if it's not the same as the start of the intended number (edge cases exist but rare for full country codes)
        if (selectedCountry) {
            const dialCodeNoPlus = selectedCountry.dial_code.replace('+', '')
            if (val.startsWith(dialCodeNoPlus)) {
                val = val.slice(dialCodeNoPlus.length)
            }
        }

        setPhoneNumber(val)
        if (selectedCountry) {
            onChange(`${selectedCountry.dial_code}${val}`)
        } else {
            onChange(val)
        }
    }

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country)
        setOpen(false)
        onChange(`${country.dial_code}${phoneNumber}`)
    }

    return (
        <div className={cn("flex gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[100px] justify-between px-3"
                        disabled={disabled}
                    >
                        {selectedCountry ? (
                            <div className="flex items-center gap-2 truncate">
                                <span className="text-lg">{selectedCountry.code === 'US' ? '🇺🇸' : selectedCountry.code === 'TR' ? '🇹🇷' : <img src={selectedCountry.flag} alt="" className="w-5 h-3 object-cover rounded-[2px]" />}</span>
                                <span className="text-muted-foreground">{selectedCountry.dial_code}</span>
                            </div>
                        ) : (
                            "Country"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {countries.map((country) => (
                                    <CommandItem
                                        key={country.code}
                                        value={country.name}
                                        onSelect={() => handleCountrySelect(country)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-lg w-6 text-center">{country.code === 'US' ? '🇺🇸' : country.code === 'TR' ? '🇹🇷' : <img src={country.flag} alt="" className="w-5 h-3 object-cover rounded-[2px] inline-block" />}</span>
                                            <span className="truncate">{country.name}</span>
                                            <span className="ml-auto text-muted-foreground text-xs">{country.dial_code}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="flex-1"
                disabled={disabled}
            />
        </div>
    )
}
