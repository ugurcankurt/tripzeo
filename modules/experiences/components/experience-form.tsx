"use client"
import { useTransition, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { experienceSchema, ExperienceFormValues } from "../schema"
import { createExperience, updateExperience } from "../actions"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLocation } from "@/hooks/use-location"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Clock, MapPin, Image as ImageIcon, Info, DollarSign, Settings } from "lucide-react"

import { ExperienceFormData } from "@/types/experiences"

import { Tables } from "@/types/supabase"

interface ExperienceFormProps {
    initialData?: Partial<ExperienceFormData>
    categories?: Tables<'categories'>[]
    commissionRate?: number
    fixedCategory?: string
}

// Helper to generate time options in 15-minute intervals
const generateTimeOptions = () => {
    const options = []
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < 60; j += 15) {
            const hour = i.toString().padStart(2, '0')
            const minute = j.toString().padStart(2, '0')
            options.push(`${hour}:${minute}`)
        }
    }
    return options
}

const timeOptions = generateTimeOptions()

export function ExperienceForm({ initialData }: ExperienceFormProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const form = useForm<ExperienceFormValues>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            currency: initialData?.currency || "USD",
            duration_minutes: initialData?.duration_minutes || 60,
            location_city: initialData?.location_city || "",
            location_country: initialData?.location_country || "",
            location_state: initialData?.location_state || "",
            location_address: initialData?.location_address || "",
            start_time: initialData?.start_time || "09:00",
            end_time: initialData?.end_time || "17:00",
            capacity: initialData?.capacity || 1,
            images: initialData?.images || [],
            is_active: initialData?.is_active ?? true,
            is_cancellable: initialData?.is_cancellable ?? true,

        },
    })

    const {
        countries,
        states,
        cities,
        selectedCountry,
        selectedState,
        selectedCity,
        handleCountryChange,
        handleStateChange,
        handleCityChange,
        setSelectedCity,
        loadingCountries,
        loadingStates,
        loadingCities,
        hasStates
    } = useLocation({
        initialCountry: initialData?.location_country,
        initialState: initialData?.location_state,
        initialCity: initialData?.location_city
    })

    // Sync location hook selection with form
    useEffect(() => {
        if (selectedCountry) form.setValue('location_country', selectedCountry)
        if (selectedState) form.setValue('location_state', selectedState)
        if (selectedCity) form.setValue('location_city', selectedCity)
    }, [selectedCountry, selectedState, selectedCity, form])

    // Watch start_time and duration_minutes to calculate end_time
    const startTime = form.watch('start_time')
    const durationMinutes = form.watch('duration_minutes')

    useEffect(() => {
        if (startTime && durationMinutes) {
            const [hours, minutes] = startTime.split(':').map(Number)
            const totalMinutes = hours * 60 + minutes + Number(durationMinutes)

            const endHours = Math.floor(totalMinutes / 60) % 24
            const endMinutes = totalMinutes % 60

            const formattedEndHours = endHours.toString().padStart(2, '0')
            const formattedEndMinutes = endMinutes.toString().padStart(2, '0')

            form.setValue('end_time', `${formattedEndHours}:${formattedEndMinutes}`)
        }
    }, [startTime, durationMinutes, form])



    const supabase = createClient()

    // Helper to delete images from storage
    const deleteImagesFromStorage = async (urls: string[]) => {
        for (const urlStr of urls) {
            try {
                const url = new URL(urlStr)
                const pathParts = url.pathname.split('/public/')
                if (pathParts.length > 1) {
                    const fullPath = pathParts[1]
                    const bucket = fullPath.split('/')[0]
                    const filePath = fullPath.substring(bucket.length + 1)
                    if (bucket && filePath) {
                        await supabase.storage.from(bucket).remove([filePath])
                    }
                }
            } catch (error) {
                console.error("Error deleting image:", error)
                // Continue deleting others even if one fails
            }
        }
    }

    async function processImages(images: (string | File)[]): Promise<string[]> {
        const processedUrls: string[] = []

        for (const item of images) {
            if (typeof item === 'string') {
                processedUrls.push(item)
            } else if (item instanceof File) {
                // It's a file, we need to upload it
                const fileName = item.name // Already has unique name from ImageUpload
                const filePath = `experiences/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('public_assets')
                    .upload(filePath, item)

                if (uploadError) {
                    console.error("Upload error:", uploadError)
                    throw new Error("Failed to upload image")
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('public_assets')
                    .getPublicUrl(filePath)

                processedUrls.push(publicUrl)
            }
        }
        return processedUrls
    }

    function onSubmit(data: ExperienceFormValues) {
        startTransition(async () => {
            try {
                // Upload any pending files first
                let finalImageUrls: string[] = []
                try {
                    finalImageUrls = await processImages(data.images)
                } catch (error) {
                    toast.error("Failed to upload images")
                    return
                }

                // Replace the mixed array with pure string array for the action
                const submissionData = {
                    ...data,
                    images: finalImageUrls
                }

                // Compare initial images with current images to find deletions
                const initialImages = (initialData?.images || []).filter(img => typeof img === 'string') as string[]
                const currentImages = data.images.filter(img => typeof img === 'string') as string[]

                // Find images that were in initialData but are NOT in current submission
                const imagesToDelete = initialImages.filter(url => !currentImages.includes(url))

                if (imagesToDelete.length > 0) {
                    await deleteImagesFromStorage(imagesToDelete)
                }

                if (initialData && initialData.id) {
                    const result = await updateExperience(initialData.id, submissionData)
                    if (result.error) {
                        toast.error(result.error)
                    } else {
                        toast.success("Experience updated successfully")
                        router.push('/vendor')
                        router.refresh()
                    }
                } else {
                    const result = await createExperience(submissionData)
                    if (result.error) {
                        toast.error(result.error)
                    } else {
                        toast.success("Experience created successfully")
                        router.push('/vendor')
                        router.refresh()
                    }
                }
            } catch (error) {
                console.error("Submit error:", error)
                toast.error("Something went wrong")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{initialData ? "Edit Experience" : "Create Experience"}</h1>
                    <p className="text-muted-foreground mt-2">
                        {initialData ? "Update your experience details below." : "Fill in the details to create a new experience for travelers."}
                    </p>
                </div>
                <div className="flex gap-2">
                    {/* Buttons consolidated to sticky sidebar */}
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COLUMN (2/3 width) - Main Content */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Basic Info Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-primary" />
                                        <CardTitle>Basic Details</CardTitle>
                                    </div>
                                    <CardDescription>
                                        What is your experience about?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Experience Title</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isPending} placeholder="e.g. Traditional Turkish Cooking Class" {...field} value={(field.value as string) ?? ''} className="text-lg md:text-xl font-medium" />
                                                </FormControl>
                                                <FormDescription>Catchy title that describes your experience.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea disabled={isPending} placeholder="Describe the experience in detail..." className="min-h-[200px]" {...field} value={(field.value as string) ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Location Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <CardTitle>Location</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Where will this experience take place?
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <FormLabel>Country</FormLabel>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                onChange={handleCountryChange}
                                                value={selectedCountry}
                                                disabled={isPending}
                                            >
                                                <option value="">Select Country</option>
                                                {loadingCountries ? <option disabled>Loading...</option> : countries.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>

                                        {hasStates && (
                                            <div className="space-y-2">
                                                <FormLabel>State/Province</FormLabel>
                                                <select
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    onChange={handleStateChange}
                                                    value={selectedState}
                                                    disabled={loadingStates || isPending}
                                                >
                                                    <option value="">Select State</option>
                                                    {loadingStates ? <option disabled>Loading...</option> : states.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <FormLabel>City</FormLabel>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                onChange={handleCityChange}
                                                value={selectedCity}
                                                disabled={!selectedCountry || loadingCities || isPending}
                                            >
                                                <option value="">Select City</option>
                                                {loadingCities ? <option disabled>Loading...</option> : cities.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="location_address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street Address</FormLabel>
                                                <FormControl>
                                                    <Input disabled={isPending} placeholder="Full meeting point address" {...field} value={(field.value as string) ?? ''} />
                                                </FormControl>
                                                <FormDescription>Exact address for guests to meet.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            {/* Schedule & Capacity Card (Moved from Right) */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-primary" />
                                        <CardTitle>Schedule & Capacity</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Manage timing and group size.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField<ExperienceFormValues>
                                            control={form.control}
                                            name="duration_minutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duration (min)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" disabled={isPending} {...field} value={(field.value as number) ?? ''} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField<ExperienceFormValues>
                                            control={form.control}
                                            name="capacity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Capacity</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" disabled={isPending} {...field} value={(field.value as number) ?? ''} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">Standard Hours</FormLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField<ExperienceFormValues>
                                                control={form.control}
                                                name="start_time"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Start Time</FormLabel>
                                                        <Select disabled={isPending} onValueChange={field.onChange} value={field.value as string} defaultValue={field.value as string}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select start time" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {timeOptions.map((time) => (
                                                                    <SelectItem key={time} value={time}>
                                                                        {time}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField<ExperienceFormValues>
                                                control={form.control}
                                                name="end_time"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">End Time (Auto)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                disabled={true}
                                                                className="bg-muted opacity-100" // Ensure visibility
                                                                {...field}
                                                                value={(field.value as string) ?? ''}
                                                                readOnly
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Imagery Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                        <CardTitle>Visuals</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Upload high-quality images to attract guests.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="images"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value as (string | File)[]}
                                                        disabled={isPending}
                                                        onChange={(urls) => field.onChange(urls)}
                                                    // onRemove removed to enforce safe deletion on save
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN (1/3 width) - Sidebar Settings */}
                        <div className="space-y-8 sticky top-6 h-fit">

                            {/* Pricing Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        <CardTitle>Pricing</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Set your price per person.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                                        {/* Ideally dynamic symbol based on currency */}
                                                        <Input type="number" className="pl-7" disabled={isPending} {...field} value={(field.value as number) ?? ''} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                </CardContent>
                            </Card>

                            {/* Settings Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle>Settings</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Configure experience options.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="is_cancellable"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/10">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">Free Cancellation</FormLabel>
                                                    <FormDescription className="text-xs">Allow changes.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value as boolean}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField<ExperienceFormValues>
                                        control={form.control}
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-muted/10">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">Publish</FormLabel>
                                                    <FormDescription className="text-xs">Visible to public.</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value as boolean}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isPending}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <div className="pt-4">
                                <Button type="submit" size="lg" className="w-full font-semibold" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                                    {isPending ? "Saving..." : initialData ? "Save Changes" : "Create Experience"}
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => router.back()} disabled={isPending}>
                                    Cancel
                                </Button>
                                <p className="text-xs text-center text-muted-foreground mt-4 px-4">
                                    By creating this experience, you agree to our Vendor Terms of Service.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
