'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export type MonthlyData = {
    name: string
    commission: number
    payout: number
    revenue: number
    month?: string
}

const chartConfig = {
    revenue: {
        label: "Total Revenue",
        color: "var(--color-chart-1)",
    },
    commission: {
        label: "Net Income",
        color: "var(--color-chart-2)",
    },
    payout: {
        label: "Payouts",
        color: "var(--color-chart-3)",
    },
}

export function FinanceCharts({ data }: { data: MonthlyData[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>
                        Gross merchandise value over the last 6 months
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <BarChart accessibilityLayer data={data}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="revenue"
                                    fill="var(--color-revenue)"
                                    radius={[4, 4, 0, 0]}
                                    name="Total Volume"
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Income & Payout Line Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Income vs Payouts</CardTitle>
                    <CardDescription>
                        Comparison of platform earnings and host payouts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <LineChart data={data}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="commission"
                                    stroke="var(--color-commission)"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Net Income"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="payout"
                                    stroke="var(--color-payout)"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Payouts"
                                />
                            </LineChart>
                        </ChartContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
