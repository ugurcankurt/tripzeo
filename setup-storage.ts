import { createClient } from "@supabase/supabase-js"
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Try to get the service role key for admin tasks
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function setupStorage() {
    if (!supabaseServiceKey) {
        console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local")
        console.log("Please create the 'avatars' and 'public_assets' buckets manually in your Supabase Dashboard.")
        return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Initializing Storage Buckets...")

    const buckets = ['avatars', 'public_assets']

    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
        })

        if (error) {
            console.log(`⚠️ Bucket '${bucket}' setup failed (might already exist):`, error.message)
        } else {
            console.log(`✅ Bucket '${bucket}' created successfully.`)
        }
    }
}

setupStorage()
