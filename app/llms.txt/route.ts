import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

export const revalidate = 86400 // Cache for 24 hours

export async function GET() {
    const supabase = await createClient()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tripzeo.com'

    // 1. Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('is_active', true)

    // 2. Fetch All Active Experiences
    const { data: experiences, error } = await supabase
        .from('experiences')
        .select(`
            id, 
            title, 
            description, 
            price, 
            location_city, 
            location_country,
            category
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching experiences for llms.txt:', error)
    }

    let content = `# Tripzeo AI Context

> Tripzeo is a platform for discovering and booking unique local experiences, services and activities hosted by experts.

## Core Pages
- [Home](${baseUrl}) - The main landing page.
- [Search](${baseUrl}/search) - Browse all available experiences.
- [Login](${baseUrl}/login) - User login.
- [Register](${baseUrl}/register) - User registration.

## Experience Categories
`

    categories?.forEach(cat => {
        content += `- [${cat.name}](${baseUrl}/category/${cat.slug}): Browse ${cat.name} experiences\n`
    })

    content += `\n## All Experiences\n`

    experiences?.forEach((exp: any) => {
        const countrySlug = slugify(exp.location_country || 'turkey')
        const citySlug = slugify(exp.location_city)
        const titleSlug = slugify(exp.title)
        const url = `${baseUrl}/${countrySlug}/${citySlug}/${titleSlug}-${exp.id}`

        content += `### [${exp.title}](${url})
- **Location:** ${exp.location_city}, ${exp.location_country}
- **Category:** ${exp.category || 'General'}
- **Price:** $${exp.price}
- **Summary:** ${exp.description ? exp.description.slice(0, 150).replace(/\n/g, ' ') + '...' : 'No description'}

`
    })

    return new Response(content, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    })
}
