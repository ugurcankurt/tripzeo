
import {
    Button,
    Column,
    Row,
    Section,
    Text,
    Hr,
    Link,
} from "@react-email/components";
import TripZeoEmailLayout from "./layout";

interface BookingConfirmedEmailProps {
    userName: string;
    experienceTitle: string;
    bookingDate: string;
    startTime: string;
    guests: number;
    location: string;
    bookingId: string;
    price: string;
    hostName: string;
    hostEmail: string;
    hostPhone: string;
}

export const BookingConfirmedEmail = ({
    userName,
    experienceTitle,
    bookingDate,
    startTime,
    guests,
    location,
    bookingId,
    price,
    hostName,
    hostEmail,
    hostPhone,
}: BookingConfirmedEmailProps) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tripzeo.com";

    return (
        <TripZeoEmailLayout preview="Booking Confirmed">
            <Section className="px-[20px]">
                <Text className="text-black text-[14px] leading-[24px]">
                    Hello {userName},
                </Text>
                <Text className="text-black text-[18px] leading-[28px] font-semibold mt-4">
                    Booking Confirmed!
                </Text>
                <Text className="text-black text-[14px] leading-[24px]">
                    Your booking for <strong>{experienceTitle}</strong> in Istanbul has been confirmed!
                </Text>

                <Section className="bg-gray-50 rounded-lg p-4 my-6 border border-gray-100">
                    <Row className="mb-2">
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Date</Text>
                            <Text className="text-black text-[14px] font-medium m-0">{bookingDate}</Text>
                        </Column>
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Time</Text>
                            <Text className="text-black text-[14px] font-medium m-0">{startTime}</Text>
                        </Column>
                    </Row>
                    <Hr className="border-gray-200 my-2" />
                    <Row className="mb-2">
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Guests</Text>
                            <Text className="text-black text-[14px] font-medium m-0">{guests} People</Text>
                        </Column>
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Total</Text>
                            <Text className="text-black text-[14px] font-medium m-0">{price}</Text>
                        </Column>
                    </Row>
                    <Hr className="border-gray-200 my-2" />
                    <Row>
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Meeting Point</Text>
                            <Text className="text-black text-[14px] font-medium m-0">{location}</Text>
                        </Column>
                    </Row>
                </Section>

                <Section className="bg-gray-50 rounded-lg p-4 my-6 border border-gray-100">
                    <Text className="text-black text-[16px] leading-[24px] font-semibold mb-4 mt-0">
                        Host Information
                    </Text>
                    <Row className="mb-2">
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Host Name</Text>
                            <Text className="text-black text-[14px] font-medium m-0">{hostName}</Text>
                        </Column>
                    </Row>
                    <Hr className="border-gray-200 my-2" />
                    <Row className="mb-2">
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Email</Text>
                            <Text className="text-black text-[14px] font-medium m-0">
                                <Link href={`mailto:${hostEmail}`} className="text-blue-600 no-underline">{hostEmail}</Link>
                            </Text>
                        </Column>
                    </Row>
                    <Hr className="border-gray-200 my-2" />
                    <Row>
                        <Column>
                            <Text className="text-gray-500 text-[12px] font-medium uppercase m-0">Phone</Text>
                            <Text className="text-black text-[14px] font-medium m-0">
                                <Link href={`tel:${hostPhone}`} className="text-blue-600 no-underline">{hostPhone}</Link>
                            </Text>
                        </Column>
                    </Row>
                </Section>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3 w-full sm:w-auto"
                        href={`${baseUrl}/account/orders`}
                    >
                        View Details
                    </Button>
                </Section>
            </Section>
        </TripZeoEmailLayout>
    );
};

export default BookingConfirmedEmail;
