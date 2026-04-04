import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateAdAction } from "@/modules/marketing/actions"

export async function GET() {
    const supabase = await createClient()
    
    // 1. Get a sample experience
    const { data: experience, error: fetchError } = await supabase
        .from('experiences')
        .select('id, title')
        .limit(1)
        .single()
    
    if (fetchError || !experience) {
        return NextResponse.json({ error: "No experience found in database to test with." }, { status: 404 })
    }
    
    console.log(`Testing Google Ads generation for: ${experience.title} (${experience.id})`)
    
    // 2. Call the ad generation action
    const result = await generateAdAction(experience.id)
    
    if (result.error) {
        return NextResponse.json({ 
            success: false, 
            message: "Google Ads generation failed", 
            details: result.error,
            experience: experience.title
        })
    }
    
    return NextResponse.json({ 
        success: true, 
        message: "Google Ads generation successful! Check your Google Ads panel.",
        experience: experience.title,
        adGroupId: experience.id.slice(0, 8) // Based on our naming convention
    })
}
