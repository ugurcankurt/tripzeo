
import {
    Button,
    Section,
    Text,
    Hr,
} from "@react-email/components";
import TripZeoEmailLayout from "./layout";

interface PartnerWelcomeEmailProps {
    userName: string;
    dashboardUrl: string;
}

export const PartnerWelcomeEmail = ({
    userName,
    dashboardUrl,
}: PartnerWelcomeEmailProps) => {
    return (
        <TripZeoEmailLayout preview="Welcome to TripZeo Partner Program">
            <Section className="px-[20px]">
                <Text className="text-black text-[14px] leading-[24px]">
                    Hello {userName},
                </Text>
                <Text className="text-black text-[18px] leading-[28px] font-semibold mt-4">
                    Welcome to the Partner Program! 🚀
                </Text>
                <Text className="text-black text-[14px] leading-[24px]">
                    We are thrilled to have you on board. You can now start earning a <strong>10% commission</strong> on every booking made through your unique referral link.
                </Text>

                <Section className="bg-orange-50 rounded-lg p-6 my-6 border border-orange-100">
                    <Text className="text-black text-[16px] font-semibold m-0 mb-2">
                        Your Benefits
                    </Text>
                    <Text className="text-gray-700 text-[14px] m-0 mb-1">
                        • 10% Commission on every booking
                    </Text>
                    <Text className="text-gray-700 text-[14px] m-0 mb-1">
                        • 30-Day Cookie Tracking
                    </Text>
                    <Text className="text-gray-700 text-[14px] m-0">
                        • Real-time Earnings Dashboard
                    </Text>
                </Section>

                <Hr className="border-gray-200 my-4" />

                <Text className="text-black text-[14px] leading-[24px]">
                    Visit your dashboard to get your unique referral link and track your earnings.
                </Text>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-[#FF4F30] rounded text-white text-[14px] font-semibold no-underline text-center px-6 py-3 w-full sm:w-auto"
                        href={dashboardUrl}
                    >
                        Go to Partner Dashboard
                    </Button>
                </Section>
            </Section>
        </TripZeoEmailLayout>
    );
};

export default PartnerWelcomeEmail;
