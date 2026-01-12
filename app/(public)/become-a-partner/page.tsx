import { PartnerRegisterForm } from "@/modules/auth/components/partner-register-form";
import { CheckCircle2, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BecomePartnerPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Side - Content/Marketing */}
                    <div className="flex-1 bg-white py-8 md:py-8 px-8 md:px-8 rounded-4xl flex flex-col justify-center">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight flex flex-wrap items-center gap-x-3 gap-y-2">
                                <span>Earn with</span>
                                <div className="flex items-center gap-1">
                                    <Image src="/tripzeo.svg" alt="Tripzeo" width={32} height={32} className="h-8 w-auto md:h-10" />
                                    <span className="text-[#FF4F30] font-semibold">tripzeo</span>
                                </div>
                            </h1>
                            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                                Join our affiliate program and earn <strong className="text-gray-900">10% commission</strong> on every booking made through your unique referral link.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                        <TrendingUp className="h-6 w-6 text-[#FF4F30]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">High Commission Rate</h3>
                                        <p className="text-gray-600">Get industry-leading 10% commission on all experiences booked by your audience.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-[#FF4F30]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">30-Day Cookie Life</h3>
                                        <p className="text-gray-600">We track referrals for 30 days. If they book within a month, you get paid.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                                        <Users className="h-6 w-6 text-[#FF4F30]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Real-Time Dashboard</h3>
                                        <p className="text-gray-600">Track clicks, conversions, and earnings instantly in your dedicated partner dashboard.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex-1 bg-gray-50 flex items-center justify-end">
                        <div className="w-full max-w-xl bg-white rounded-4xl shadow-xl p-8 border border-gray-100">
                            <PartnerRegisterForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
