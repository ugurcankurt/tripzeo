
import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import * as React from "react";

interface TripZeoEmailLayoutProps {
    preview?: string;
    children: React.ReactNode;
}

export const TripZeoEmailLayout = ({
    preview,
    children,
}: TripZeoEmailLayoutProps) => {
    return (
        <Html>
            <Tailwind>
                <Head />
                <Preview>{preview}</Preview>
                <Body className="bg-white my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px] mb-[32px]">
                            <div className="flex items-center justify-center gap-1.5">
                                <Img
                                    src={`${process.env.NEXT_PUBLIC_APP_URL}/tripzeo.svg`}
                                    width="28"
                                    height="28"
                                    alt="TripZeo"
                                    className="block"
                                />
                                <Text className="text-[24px] font-semibold tracking-tighter text-stone-900 m-0 ml-2">
                                    tripzeo
                                </Text>
                            </div>
                        </Section>

                        {children}

                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

                        <Section>
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                This email was sent by the TripZeo platform.
                            </Text>
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                <Link href={process.env.NEXT_PUBLIC_APP_URL} className="text-blue-600 no-underline">
                                    TripZeo
                                </Link>{" "}
                                - Discover and share your experiences.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default TripZeoEmailLayout;
