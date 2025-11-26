import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GeneralLedger() {
    // Pagination could be added here
    const { data, isLoading } = useQuery({
        queryKey: ['ledger'],
        queryFn: async () => {
            const res = await api.get('/accounting/ledger?per_page=50');
            return res.data;
        }
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">General Ledger</h2>
            <Card>
                <CardHeader><CardTitle>Journal Entries</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Ref</TableHead>
                                <TableHead>Account</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Debit</TableHead>
                                <TableHead className="text-right">Credit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center h-24"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                            ) : data?.data?.map((entry: any) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="text-xs text-muted-foreground">{format(new Date(entry.journal_entry.date), 'dd MMM yyyy')}</TableCell>
                                    <TableCell className="font-mono text-xs">{entry.journal_entry.reference_number}</TableCell>
                                    <TableCell className="font-medium text-sm">{entry.account.name}</TableCell>
                                    <TableCell className="text-sm">{entry.journal_entry.description}</TableCell>
                                    <TableCell className="text-right font-mono">{Number(entry.debit) > 0 ? `₦${Number(entry.debit).toLocaleString()}` : '-'}</TableCell>
                                    <TableCell className="text-right font-mono">{Number(entry.credit) > 0 ? `₦${Number(entry.credit).toLocaleString()}` : '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}