
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AdminPageHeader } from "@/components/admin/page-header"
import { getPartnerPayouts, getPartnerBalances } from "@/modules/finance/actions"
import { PayoutPartnerButton } from "@/modules/finance/components/payout-partner-button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PartnerPayoutsPage({ searchParams }: { searchParams: { status?: string } }) {
    const status = (await searchParams).status === 'history' ? 'history' : 'pending'

    // If status is 'pending', we show aggregated balances
    const balances = status === 'pending' ? await getPartnerBalances() : null

    // For history, we might still want the old list view or a different one. 
    // To keep it simple and per requirements, let's keep the old getPartnerPayouts for history
    const historyPayouts = status === 'history' ? await getPartnerPayouts('completed') : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <AdminPageHeader
                    heading="Partner Payouts"
                    text="Manage pending affiliate commissions and process payments (Threshold: $150)."
                />
            </div>

            <Tabs defaultValue={status} className="w-full">
                <TabsList>
                    <Link href="/admin/payouts/partners?status=pending">
                        <TabsTrigger value="pending">Partner Balances</TabsTrigger>
                    </Link>
                    <Link href="/admin/payouts/partners?status=history">
                        <TabsTrigger value="history">Payout History</TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>

            <div className="rounded-md border bg-white">
                {status === 'pending' ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Partner Info</TableHead>
                                <TableHead>Bank Details</TableHead>
                                <TableHead className="text-center">Pending Transactions</TableHead>
                                <TableHead className="text-right">Total Balance</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {balances?.map((balance: any) => (
                                <TableRow key={balance.partner.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{balance.partner.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{balance.partner.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold">{balance.partner.bank_name || '-'}</span>
                                                {balance.partner.bank_country && <Badge variant="outline" className="text-[10px] py-0 h-4">{balance.partner.bank_country}</Badge>}
                                            </div>
                                            <div>{balance.partner.account_holder}</div>
                                            {balance.partner.iban ? (
                                                <div className="font-mono text-[10px]">{balance.partner.iban}</div>
                                            ) : (
                                                <div className="font-mono text-[10px]">
                                                    {balance.partner.routing_number ? `RT: ${balance.partner.routing_number}` : ''}
                                                    {balance.partner.account_number ? ` ACC: ${balance.partner.account_number}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary">{balance.transactionCount}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: balance.currency || 'USD' }).format(balance.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <PayoutPartnerButton
                                            partnerId={balance.partner.id}
                                            amount={balance.amount}
                                            currency={balance.currency}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!balances || balances.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No partners with pending balances found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking</TableHead>
                                <TableHead>Transaction</TableHead>
                                <TableHead>Partner Info</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {historyPayouts?.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell>
                                        {tx.booking_id ? (
                                            <Link href={`/admin/bookings/${tx.booking_id}`} className="font-mono text-xs text-blue-600 hover:underline">
                                                #{tx.booking_id.slice(0, 8)}
                                            </Link>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{tx.id.slice(0, 8)}...</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{tx.partner?.full_name}</span>
                                            <span className="text-xs text-muted-foreground">{tx.partner?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-green-600">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency || 'USD' }).format(tx.amount)}
                                    </TableCell>
                                    <TableCell>{new Date(tx.created_at).toLocaleDateString("en-US")}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                                            Completed
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!historyPayouts || historyPayouts.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No payout history found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}
