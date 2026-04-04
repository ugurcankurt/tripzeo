/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from "@/lib/supabase/server"
import { getGoogleAdsCustomer } from "@/lib/google-ads"
import { enums } from "google-ads-api"

/**
 * Generates or updates a Google Ads Group and Responsive Search Ad for an experience.
 * Target ROAS is set to 12.0 (1200%) as per user requirement.
 */
export async function generateAdAction(experienceId: string) {
    const supabase = await createClient()

    // 1. Fetch Experience Data
    const { data: experience, error: fetchError } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', experienceId)
        .single()

    if (fetchError || !experience) {
        console.error("Marketing: Experience not found for ad generation", experienceId)
        return { error: "Experience not found" }
    }

    try {
        const customer = getGoogleAdsCustomer()

        // 2. Ensure "Tripzeo Experiences" Campaign exists
        // We'll search for it by name
        const campaignName = "Tripzeo Experiences"
        const campaigns = await customer.report({
            entity: 'campaign',
            attributes: ['campaign.id', 'campaign.name'],
            constraints: [
                { 'campaign.name': campaignName },
                { 'campaign.status': enums.CampaignStatus.ENABLED }
            ],
            limit: 1
        })

        let campaignResourceName: string

        if (campaigns.length === 0) {
            // Create Campaign with Target ROAS 12.0
            // Note: A budget is also required for a campaign
            // For now, we'll assume a default budget exists or create a minimal one
            
            // 2a. Create Budget first if needed (usually required)
            const budgetOperation = {
                name: `Tripzeo Default Budget ${Date.now()}`,
                amount_micros: 50000000, // 50 units (e.g. $50)
                delivery_method: enums.BudgetDeliveryMethod.STANDARD,
            }
            const budgetResponse = await customer.campaignBudgets.create([budgetOperation])
            const budgetResourceName = budgetResponse.results[0].resource_name as string

            const campaignOperation = {
                name: campaignName,
                advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
                status: enums.CampaignStatus.ENABLED,
                campaign_budget: budgetResourceName,
                target_roas: {
                    target_roas: 12.0 // 1200%
                },
                network_settings: {
                    target_google_search: true,
                    target_search_network: true,
                    target_content_network: false,
                    target_partner_search_network: false,
                }
            }
            const campaignResponse = await customer.campaigns.create([campaignOperation])
            campaignResourceName = campaignResponse.results[0].resource_name as string
            console.log("Marketing: Created new campaign", campaignResourceName)
        } else {
            campaignResourceName = (campaigns[0] as any).campaign.resource_name
        }

        // 3. Create Ad Group for this experience
        // We use a unique name format: [ID] Experience Title
        const adGroupName = `[${experience.id.slice(0, 8)}] ${experience.title}`
        
        // Check if Ad Group already exists to avoid duplicates
        const existingAdGroups = await customer.report({
            entity: 'ad_group',
            attributes: ['ad_group.id', 'ad_group.name'],
            constraints: [
                { 'ad_group.name': adGroupName },
                { 'ad_group.status': enums.AdGroupStatus.ENABLED }
            ],
            limit: 1
        })

        let adGroupResourceName: string

        if (existingAdGroups.length === 0) {
            const adGroupOperation = {
                name: adGroupName,
                campaign: campaignResourceName,
                status: enums.AdGroupStatus.ENABLED,
                type: enums.AdGroupType.SEARCH_STANDARD,
            }
            const adGroupResponse = await customer.adGroups.create([adGroupOperation])
            adGroupResourceName = adGroupResponse.results[0].resource_name as string
            console.log("Marketing: Created new Ad Group", adGroupResourceName)
        } else {
            adGroupResourceName = (existingAdGroups[0] as any).ad_group.resource_name
            console.log("Marketing: Ad Group already exists, updating ad...")
        }

        // 4. Create Responsive Search Ad
        // We'll generate headlines and descriptions from experience data
        // Final URL construction
        const countrySlug = experience.location_country.toLowerCase().replace(/ /g, '-')
        const citySlug = experience.location_city.toLowerCase().replace(/ /g, '-')
        const titleSlug = experience.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const finalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tripzeo.com'}/${countrySlug}/${citySlug}/${titleSlug}-${experience.id}`

        const adGroupAdOperation = {
            ad_group: adGroupResourceName,
            status: enums.AdGroupAdStatus.ENABLED,
            ad: {
                responsive_search_ad: {
                    headlines: [
                        { text: experience.title.slice(0, 30) },
                        { text: `Book in ${experience.location_city}`.slice(0, 30) },
                        { text: "Tripzeo Local Experiences".slice(0, 30) },
                        { text: `Best Price: ${experience.price} ${experience.currency || 'USD'}`.slice(0, 30) }
                    ],
                    descriptions: [
                        { text: experience.description.slice(0, 90) },
                        { text: `Join this amazing experience in ${experience.location_city}. Book now on Tripzeo!`.slice(0, 90) }
                    ],
                },
                final_urls: [finalUrl],
            },
        }

        // Note: Creating an ad might fail if an identical ad exists or if headlines are too long.
        // The .slice(0, 30) and .slice(0, 90) handles the Google Ads character limits.
        
        await customer.adGroupAds.create([adGroupAdOperation])
        console.log("Marketing: Ad created/updated successfully for", experience.title)

        return { success: true }

    } catch (error: any) {
        console.error("Marketing: Google Ads Error:", JSON.stringify(error, null, 2))
        
        // Detailed error reporting for debugging
        const detailedError = error.errors 
            ? error.errors.map((e: any) => e.message || e.error_code).join(", ") 
            : error.message || JSON.stringify(error)

        return { error: detailedError || "Failed to generate Google Ad" }
    }
}
