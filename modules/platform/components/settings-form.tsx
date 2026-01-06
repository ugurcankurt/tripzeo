'use client'

import { useState } from 'react'
import { updatePlatformSetting } from '@/modules/platform/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Tables } from "@/types/supabase"

interface SettingsFormProps {
    settings: Pick<Tables<'platform_settings'>, 'key' | 'value' | 'description'>[]
}

export function SettingsForm({ settings }: SettingsFormProps) {
    const [loading, setLoading] = useState<string | null>(null)

    const handleUpdate = async (key: string, value: string) => {
        setLoading(key)
        const numericValue = parseFloat(value)

        if (isNaN(numericValue)) {
            toast.error('Invalid number format')
            setLoading(null)
            return
        }

        const result = await updatePlatformSetting(key, numericValue)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Setting updated successfully')
        }
        setLoading(null)
    }

    return (
        <div className="space-y-6">
            {settings.map((setting) => (
                <div key={setting.key} className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-center">
                        <div>
                            <Label className="text-base font-semibold">{setting.key}</Label>
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <Input
                            defaultValue={setting.value}
                            type="number"
                            step="0.01"
                            className="max-w-[200px]"
                            id={`input-${setting.key}`}
                        />
                        <Button
                            disabled={loading === setting.key}
                            onClick={() => {
                                const input = document.getElementById(`input-${setting.key}`) as HTMLInputElement
                                handleUpdate(setting.key, input.value)
                            }}
                        >
                            {loading === setting.key && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update
                        </Button>
                    </div>
                </div>
            ))}

            {settings.length === 0 && (
                <p className="text-muted-foreground">No settings found. Please run the database migration.</p>
            )}
        </div>
    )
}
