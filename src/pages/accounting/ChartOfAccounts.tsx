import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ChartOfAccounts() {
    const { data: accounts, isLoading } = useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await api.get('/accounting/accounts');
            return res.data;
        }
    });

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'asset': return 'bg-blue-100 text-blue-800';
            case 'liability': return 'bg-red-100 text-red-800';
            case 'equity': return 'bg-purple-100 text-purple-800';
            case 'revenue': return 'bg-green-100 text-green-800';
            case 'expense': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Chart of Accounts</h2>
            <Card>
                <CardHeader><CardTitle>General Ledger Accounts</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Type</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} className="text-center h-24"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                            ) : accounts?.map((acc: any) => (
                                <TableRow key={acc.id}>
                                    <TableCell className="font-mono">{acc.code}</TableCell>
                                    <TableCell className="font-medium">{acc.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getTypeColor(acc.type)}>
                                            {acc.type.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}