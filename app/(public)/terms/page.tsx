
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Tripzeo",
    description: "Read our Terms, including rules for Hosts and Guests, booking policies, and fees.",
};

export default function TermsPage() {
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
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Terms of Service</h1>
                    <p className="text-lg md:text-xl text-white max-w-2xl mx-auto">
                        Please read these terms carefully before using the Tripzeo platform.
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
                        Welcome to Tripzeo! These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "Host," or "Guest")
                        and Tripzeo governing your access to and use of the Tripzeo platform, including our website, services, and applications (collectively, the "Platform").
                    </p>

                    <div className="not-prose rounded-2xl border bg-muted/30 p-6 md:p-8 mb-12">
                        <div className="flex items-start gap-4">
                            <div className="w-1 h-full min-h-[3rem] bg-primary rounded-full hidden md:block"></div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Important Legal Notice</h3>
                                <p className="text-muted-foreground">
                                    This document is drafted for informational purposes based on current platform operations.
                                    Please consult with a legal professional to ensure full validity and enforceability under applicable laws.
                                </p>
                            </div>
                        </div>
                    </div>

                    <h2>1. Scope of Services</h2>
                    <p>
                        Tripzeo is an online marketplace that connects users who want to offer local experiences ("Hosts") with users seeking to book such experiences ("Guests").
                        Tripzeo does not own, create, sell, resell, provide, control, manage, offer, deliver, or supply any Experiences. Hosts alone are responsible for their Experiences.
                    </p>

                    <h2>2. Eligibility and Account Registration</h2>
                    <p>
                        You must be at least 18 years old to access and use the Platform. You must register an account to access certain features.
                        You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
                    </p>

                    <h2>3. Terms for Hosts</h2>

                    <h3>3.1 Creating Experiences</h3>
                    <p>
                        As a Host, you are responsible for keeping your Listing information (including photos, availability, and price) up-to-date and accurate.
                        You represent and warrant that you have all necessary licenses, permits, and insurance to host your Experience.
                    </p>

                    <h3>3.2 Fees and Payouts</h3>
                    <p>
                        Tripzeo charges a service fee (commission) for the use of the Platform.
                    </p>
                    <ul>
                        <li><strong>Host Commission:</strong> Tripzeo deducts a commission (currently <strong>15%</strong>) from the Booking Fee before remitting the payout to you.</li>
                        <li><strong>Payouts:</strong> Payouts are processed to the bank account information provided in your profile. You are responsible for any bank fees or currency conversion costs.</li>
                    </ul>

                    <h2>4. Terms for Guests</h2>

                    <h3>4.1 Booking and Payment</h3>
                    <p>
                        When you book an Experience, you agree to pay the total fees displayed, which include the Experience price set by the Host plus a <strong>Service Fee</strong> (currently <strong>5%</strong>) designated by Tripzeo.
                        Payments are processed securely via our third-party payment processor, <strong>Iyzico</strong>.
                    </p>

                    <h3>4.2 Cancellations and Refunds</h3>
                    <p>
                        Cancellation policies are determined by the specific Experience listing (`is_cancellable` status).
                        Generally, if a Guest cancels within the allowed window, a refund may be issued. Tripzeo’s Service Fee is typically non-refundable unless the Host cancels.
                    </p>

                    <h2>5. User Conduct & Prohibited Activities</h2>
                    <p>You agree not to:</p>
                    <ul>
                        <li>Use the Platform for any illegal purpose or to violate any local, state, national, or international law.</li>
                        <li>Discriminate against or harass anyone on the basis of race, national origin, religion, gender, gender identity, physical or mental disability, medical condition, marital status, age, or sexual orientation.</li>
                        <li>Submit false or misleading information.</li>
                        <li>Circumvent the Booking process to avoid paying fees ("platform circumvention").</li>
                    </ul>

                    <h2>6. Reviews and Ratings</h2>
                    <p>
                        After completing an Experience, Guests and Hosts can leave a public review and submit a star rating.
                        Reviews must be accurate and may not contain any discriminatory, offensive, defamatory, or other language that violates our Content Policy.
                        Tripzeo reserves the right to remove reviews that violate these Terms.
                    </p>

                    <h2>7. Disclaimer of Warranties</h2>
                    <p>
                        The Platform is provided "as is" and "as available." Tripzeo disclaims all warranties, express or implied, including distinct warranties of merchantability, fitness for a particular purpose, and non-infringement.
                    </p>

                    <h2>8. Limitation of Liability</h2>
                    <p>
                        To the maximum extent permitted by law, Tripzeo shall not be liable for any incidental, special, exemplary, or consequential damages,
                        including lost profits, loss of data, or goodwill, service interruption, or computer damage involved with the use of the Platform.
                    </p>

                    <h2>9. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at:
                    </p>
                    <ul>
                        <li><strong>Email:</strong> info@tripzeo.com</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
