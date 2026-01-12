import {
    User,
    Briefcase,
    ShieldCheck,
    CreditCard,
    CalendarCheck,
    Settings,
    LucideIcon
} from "lucide-react"

export type HelpCategorySlug = 'guest' | 'host' | 'account' | 'trust' | 'payments' | 'cancellations'

export interface HelpCategoryDef {
    slug: HelpCategorySlug
    title: string
    description: string
    icon: LucideIcon
}

export const HELP_CATEGORIES: HelpCategoryDef[] = [
    {
        slug: 'guest',
        title: "Guest Basics",
        description: "Booking, payment, and experience details.",
        icon: User
    },
    {
        slug: 'host',
        title: "Hosting",
        description: "Creating listings, verification, and earnings.",
        icon: Briefcase
    },
    {
        slug: 'payments',
        title: "Payments & Fees",
        description: "Pricing breakdowns, receipts, and currencies.",
        icon: CreditCard
    },
    {
        slug: 'trust',
        title: "Trust & Safety",
        description: "Verification, insurance, and community standards.",
        icon: ShieldCheck
    },
    {
        slug: 'cancellations',
        title: "Cancellations & Refunds",
        description: "Policies, timelines, and non-refundable fees.",
        icon: CalendarCheck
    },
    {
        slug: 'account',
        title: "Account Settings",
        description: "Profile management, notifications, and privacy.",
        icon: Settings
    }
]

export interface HelpItem {
    id: string
    slug: string
    question: string
    answer: string
    category: HelpCategorySlug
    keywords?: string[]
}

export const HELP_ITEMS: HelpItem[] = [
    // --- GUEST ---
    {
        id: 'g-1',
        slug: 'how-to-book',
        category: 'guest',
        question: "How do I book an experience?",
        answer: "Browse experiences by city or category. Once you find one, select your date and the number of guests. You will see a breakdown of the total price. Click 'Book' to proceed to checkout. Your booking status will be 'Pending' until the host approves it.",
        keywords: ['reservation', 'buy', 'process']
    },
    {
        id: 'g-2',
        slug: 'booking-approval',
        category: 'guest',
        question: "Does the host need to approve my booking?",
        answer: "Yes. After you complete the checkout, a pre-authorization is placed on your card. The Host has 24 hours to accept your request. If they decline or do not respond, the hold is released and you are not charged.",
        keywords: ['pending', 'acceptance', 'wait']
    },
    {
        id: 'g-3',
        slug: 'guest-service-fee',
        category: 'guest',
        question: "What is the Service Fee?",
        answer: "Tripzeo charges a Guest Service Fee (typically 5%) to cover platform operations. Currently, this fee is fully refundable if you cancel more than 24 hours before the experience.",
        keywords: ['tax', 'extra', 'cost']
    },
    {
        id: 'g-4',
        slug: 'tickets-qr',
        category: 'guest',
        question: "Where is my ticket?",
        answer: "Once your booking is confirmed, a QR code is generated in your 'My Orders' section. You can show this QR code to your Host upon arrival to check in.",
        keywords: ['qr code', 'check in', 'entry']
    },
    {
        id: 'g-5',
        slug: 'leaving-reviews',
        category: 'guest',
        question: "How do I review an experience?",
        answer: "After your experience is marked as 'Completed', you will receive a notification to leave a review. You can rate your experience (1-5 stars) and write a comment to help future guests.",
        keywords: ['rating', 'star', 'feedback']
    },
    {
        id: 'g-6',
        slug: 'contact-host',
        category: 'guest',
        question: "Can I contact the host?",
        answer: "Yes. Once you have a confirmed booking, you can message your host directly through the Tripzeo inbox to coordinate meeting details.",
        keywords: ['chat', 'message', 'ask']
    },

    // --- PAYMENTS ---
    {
        id: 'p-1',
        slug: 'payment-methods',
        category: 'payments',
        question: "What payment methods are accepted?",
        answer: "We securely process payments via Iyzipay. We accept major credit and debit cards including Visa, Mastercard, and American Express. We do not accept cash payments.",
        keywords: ['card', 'amex', 'visa', 'cash']
    },
    {
        id: 'p-3',
        slug: 'receipts-invoices',
        category: 'payments',
        question: "Do I get a receipt or invoice?",
        answer: "Yes. Once your payment is processed, a receipt is automatically sent to your registered email address. You can also view your payment history in the 'My Orders' section.",
        keywords: ['invoice', 'bill', 'email', 'history']
    },
    {
        id: 'p-2',
        slug: 'when-charged',
        category: 'payments',
        question: "When is my card charged?",
        answer: "A pre-authorization hold is placed when you submit a booking request. The actual charge (capture) occurs only after the Host accepts your booking.",
        keywords: ['bill', 'invoice', 'hold']
    },
    {
        id: 'p-4',
        slug: 'refund-timeline',
        category: 'payments',
        question: "How long do refunds take?",
        answer: "Refunds are processed immediately by our system. However, depending on your bank's processing times, it may take 3-10 business days for the funds to appear in your account.",
        keywords: ['time', 'days', 'return']
    },
    {
        id: 'p-5',
        slug: 'payment-declined',
        category: 'payments',
        question: "Why was my payment declined?",
        answer: "Payments may be declined for insufficient funds, expired cards, or bank security blocks (3D Secure failures). Please contact your bank first or try a different card.",
        keywords: ['fail', 'error', '3d secure']
    },

    // --- CANCELLATIONS ---
    {
        id: 'c-1',
        slug: 'cancellation-policy',
        category: 'cancellations',
        question: "Can I cancel my booking?",
        answer: "Yes, but refunds depend on the Host's policy status (Flexible, Moderate, or Strict) and when you cancel. IMPORTANT: You cannot cancel a booking within 24 hours of the experience start time.",
        keywords: ['refund', 'change', '24 hours']
    },
    {
        id: 'c-2',
        slug: 'host-cancellation',
        category: 'cancellations',
        question: "What happens if the Host cancels?",
        answer: "If a Host cancels, you receive a 100% refund immediately. We will also facilitate finding a replacement experience.",
        keywords: ['host cancel', 'full refund']
    },
    {
        id: 'c-3',
        slug: 'rescheduling',
        category: 'cancellations',
        question: "Can I reschedule my booking?",
        answer: "Currently, we do not support direct Date Changes. To reschedule, you must cancel your existing booking (if eligible) and make a new reservation for the desired date.",
        keywords: ['change', 'date', 'move', 'postpone']
    },
    {
        id: 'c-4',
        slug: 'force-majeure',
        category: 'cancellations',
        question: "What about emergencies?",
        answer: "In cases of Force Majeure (natural disasters, severe weather, travel bans), please Contact Support immediately. We handle these situations on a case-by-case basis to ensure fairness.",
        keywords: ['emergency', 'weather', 'disaster']
    },

    // --- HOST ---
    {
        id: 'h-1',
        slug: 'host-fees',
        category: 'host',
        question: "How much does it cost to list?",
        answer: "Listing is free. When you receive a booking, Tripzeo deducts a commission (approx. 12-15%) from your payout to cover payment processing and marketing costs.",
        keywords: ['commission', 'pricing', 'percentage']
    },
    {
        id: 'h-2',
        slug: 'payouts',
        category: 'host',
        question: "How do I get paid?",
        answer: "Payouts are sent via bank transfer (IBAN) or Wise. You must add your bank details (Bank Name, IBAN, Account Holder) in your profile. Payouts are typically processed 24 hours after the experience is successfully completed.",
        keywords: ['bank', 'iban', 'transfer', 'money', 'wise']
    },
    {
        id: 'h-2-b',
        slug: 'payout-currencies',
        category: 'host',
        question: "What currencies can I use?",
        answer: "All experiences are listed in USD ($). However, payouts can be processed in USD, EUR, or TRY depending on your bank account details. We handle the conversion automatically.",
        keywords: ['usd', 'eur', 'try', 'exchange']
    },
    {
        id: 'h-3',
        slug: 'host-verification',
        category: 'host',
        question: "Do I need to be verified?",
        answer: "Yes. To ensure safety, all Hosts must complete profile verification, including phone number and government ID checks, before their listings go live.",
        keywords: ['id', 'check', 'safety']
    },
    {
        id: 'h-4',
        slug: 'manage-availability',
        category: 'host',
        question: "Can I block dates?",
        answer: "Yes. You have a full dashboard where you can manage availability, block specific dates, or set custom pricing for high-demand periods.",
        keywords: ['calendar', 'dates', 'block']
    },
    {
        id: 'h-5',
        slug: 'edit-listing',
        category: 'host',
        question: "How do I edit my listing?",
        answer: "Go to your Vendor Dashboard and select 'My Experiences'. Click the 'Edit' button on the listing you want to change. You can update photos, prices, and descriptions at any time.",
        keywords: ['update', 'change', 'photos', 'modify']
    },
    {
        id: 'h-6',
        slug: 'accepting-bookings',
        category: 'host',
        question: "How do I accept a booking?",
        answer: "When a guest books, you receive a notification via email and SMS. Go to 'Bookings' in your dashboard to 'Approve' or 'Decline' the request within 24 hours.",
        keywords: ['approve', 'decline', 'request']
    },
    {
        id: 'h-8',
        slug: 'host-profile-visibility',
        category: 'host',
        question: "What information is on my Host Profile?",
        answer: "Your public Host Profile displays your First Name, Profile Photo, Bio, Verification Badge, and Reviews from past guests. You can edit your bio and photo in 'Settings' to make a great first impression.",
        keywords: ['bio', 'photo', 'public', 'reputation']
    },
    {
        id: 'h-9',
        slug: 'contacting-guests',
        category: 'host',
        question: "How do I contact a guest?",
        answer: "Once a booking is confirmed, you can use the secure 'Inbox' in your dashboard to message the guest. We recommend using this for all trip coordination to keep a record of communication.",
        keywords: ['message', 'chat', 'phone', 'coordinate']
    },

    // --- TRUST & SAFETY ---
    {
        id: 't-1',
        slug: 'id-verification',
        category: 'trust',
        question: "Why do I need to provide ID?",
        answer: "ID verification builds trust. We require it for Hosts to prevent fraud and ensure that the person delivering the experience matches their profile.",
        keywords: ['passport', 'driver license']
    },
    {
        id: 't-2',
        slug: 'safety-tips',
        category: 'trust',
        question: "Is my payment information safe?",
        answer: "Yes. All payments are processed by Iyzipay, a licensed payment institution. Tripzeo never stores your full credit card details.",
        keywords: ['security', 'encryption', 'pci']
    },

    // --- ACCOUNT ---
    {
        id: 'a-1',
        slug: 'reset-password',
        category: 'account',
        question: "I forgot my password",
        answer: "Click 'Login' and then 'Forgot Password'. Enter your registered email address, and we will send you a secure link to reset it.",
        keywords: ['login', 'access', 'email']
    },
    {
        id: 'a-2',
        slug: 'profile-info',
        category: 'account',
        question: "How do I update my profile?",
        answer: "Go to your Dashboard > Settings. You can update your bio, profile photo, and contact information. Note that changing your name may require re-verification.",
        keywords: ['edit', 'photo', 'name']
    }
]
