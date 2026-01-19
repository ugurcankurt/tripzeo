
import {
    Button,
    Section,
    Text,
} from "@react-email/components";
import TripZeoEmailLayout from "./layout";

interface NotificationEmailProps {
    title: string;
    message: string;
    link?: string | null;
    userName?: string | null;
}

export const NotificationEmail = ({
    title,
    message,
    link,
    userName,
}: NotificationEmailProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tripzeo.com";

    return (
        <TripZeoEmailLayout preview={title}>
            <Section className="px-[20px]">
                <Text className="text-black text-[14px] leading-[24px]">
                    Hello {userName ? userName : ''},
                </Text>
                <Text className="text-black text-[14px] leading-[24px] font-medium">
                    {title}
                </Text>
                <Text className="text-black text-[14px] leading-[24px]">
                    {message}
                </Text>

                {link && (
                    <Section className="text-center mt-[32px] mb-[32px]">
                        <Button
                            className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                            href={`${baseUrl}${link}`}
                        >
                            View Details
                        </Button>
                    </Section>
                )}
            </Section>
        </TripZeoEmailLayout>
    );
};

export default NotificationEmail;
