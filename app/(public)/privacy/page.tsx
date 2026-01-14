
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Tripzeo",
    description: "Learn how Tripzeo collects, uses, and protects your personal data.",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyPage() {
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero / Header Section matching Tripzeo aesthetic */}
            <div className="relative w-full bg-primary text-white rounded-b-[2.5rem] overflow-hidden mb-12">
                <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')]"></div>
                <div className="container mx-auto px-6 py-24 md:py-32 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Privacy Policy</h1>
                    <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
                        We value your trust and are committed to protecting your personal information.
                    </p>
                    <div className="mt-8 inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-secondary bg-chart-5 backdrop-blur-sm text-sm text-white">
                        Last Updated: January 11, 2026
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-lg prose-stone dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
          prose-p:leading-relaxed prose-li:marker:text-primary">

                    <p className="lead text-xl text-muted-foreground mb-12">
                        At Tripzeo ("we," "us," or "our"), we value your privacy and are committed to protecting your personal data.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
                        or use our services as a Guest or a Host.
                    </p>

                    <div className="not-prose rounded-2xl border bg-muted/30 p-6 md:p-8 mb-12">
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-full min-h-[3rem] bg-primary rounded-full hidden md:block"></div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Legal Disclaimer</h3>
                                <p className="text-muted-foreground">
                                    This document is drafted for informational purposes based on our technical operations.
                                    Please consult with a legal professional to ensure full compliance with applicable laws (such as KVKK in Turkey or GDPR in Europe).
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information that you provide directly to us, information we obtain automatically when you visit the platform,
                        and information from third-party sources.
                    </p>

                    <h3>1.1 Information You Provide to Us</h3>
                    <ul>
                        <li>
                            <strong>Account Information:</strong> When you register, we collect your <strong>Full Name</strong>, <strong>Email Address</strong>, and <strong>Phone Number</strong>.
                        </li>
                        <li>
                            <strong>Profile Data:</strong> You may provide additional details such as a <strong>Bio</strong>, <strong>Avatar/Profile Photo</strong>, and location details (Address, City, Country).
                        </li>
                        <li>
                            <strong>Identity Verification:</strong> For Hosts (and in some cases Guests), we may collect identity documents (Government ID, Selfie) to verify your identity.
                            Our system tracks your <code>verification_status</code> (e.g., pending, verified).
                        </li>
                        <li>
                            <strong>Financial Information:</strong>
                            <ul>
                                <li>For Hosts: To process payouts, we collect banking details including <strong>IBAN</strong>, <strong>Bank Name</strong>, <strong>Account Holder Name</strong>, and optionally a <strong>Wise Recipient ID</strong>.</li>
                                <li>For Guests: Payment details are processed securely by our third-party payment processor (Iyzipay). We do not store your full credit card numbers on our servers.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Communications:</strong> We store messages you send to other users via our internal messaging system, as well as reviews and ratings you leave for Experiences or Guests.
                        </li>
                    </ul>

                    <h3>1.2 Information We Collect Automatically</h3>
                    <ul>
                        <li>
                            <strong>Usage Data:</strong> We collect info about your interactions with the Platform, such as pages viewed, searches made, and bookings.
                        </li>
                        <li>
                            <strong>Device & Log Data:</strong> IP address, browser type, operating system, and timestamp of access.
                        </li>
                        <li>
                            <strong>Cookies:</strong> We use cookies to maintain your session and improve user experience.
                        </li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>We use the collected data for the following purposes:</p>
                    <ul>
                        <li><strong>Service Provision:</strong> To facilitate bookings, process payments, and manage listing availability.</li>
                        <li><strong>Verification & Security:</strong> To verify user identities, prevent fraud, and ensure the safety of our community.</li>
                        <li><strong>Communication:</strong> To send booking confirmations, updates, security alerts, and support messages.</li>
                        <li><strong>Payments & Payouts:</strong> To collect payments from Guests (via Iyzipay) and transfer earnings to Hosts (deducting our commission fees).</li>
                        <li><strong>Platform Improvement:</strong> To analyze usage trends and improve usability.</li>
                        <li><strong>Legal Compliance:</strong> To comply with legal obligations, such as tax reporting and law enforcement requests.</li>
                    </ul>

                    <h2>3. Sharing of Information</h2>
                    <p>We do not sell your personal data. We share information only in the following circumstances:</p>

                    <h3>3.1 Between Hosts and Guests</h3>
                    <p>
                        When a booking is confirmed, necessary information (e.g., Guest name, Host contact details, meeting location) is shared between the parties to facilitate the Experience.
                    </p>

                    <h3>3.2 Service Providers</h3>
                    <p>
                        We work with third-party service providers to help us operate the Platform:
                    </p>
                    <ul>
                        <li><strong>Payment Processing:</strong> We usage <strong>Iyzipay</strong> and other financial partners to process payments and payouts. Transaction data (Payment IDs, Transaction IDs) is shared to complete financial operations.</li>
                        <li><strong>Analytics & Hosting:</strong> Providers that assist with cloud infrastructure and traffic analysis.</li>
                    </ul>

                    <h3>3.3 Legal Requirements</h3>
                    <p>
                        We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).
                    </p>

                    <h2>4. Your Rights</h2>
                    <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                    <ul>
                        <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                        <li><strong>Correction:</strong> Update or correct inaccuracies in your data.</li>
                        <li><strong>Deletion:</strong> Request deletion of your account and personal data (subject to retention requirements for legal/financial records).</li>
                        <li><strong>Restriction:</strong> Object to or restrict the processing of your data.</li>
                    </ul>
                    <p>
                        To exercise these rights, please contact us using the details below.
                    </p>

                    <h2>5. Data Retention</h2>
                    <p>
                        We retain your personal data for as long as your account is active or as needed to provide you with our Services.
                        We also retain data to comply with legal obligations (e.g., keeping transaction records for tax purposes), resolve disputes, and enforce our agreements.
                    </p>

                    <h2>6. Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                        However, no method of transmission over the Internet is 100% secure.
                    </p>

                    <h2>7. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy or our data practices, please contact us at:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> info@tripzeo.com</li>
                        <li><strong>Address:</strong> Sultanmurat mah. Oyuklu Sok. No:4/7 Küçükçekmece/İstanbul/Türkiye</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
