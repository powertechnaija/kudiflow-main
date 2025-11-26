import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History } from "lucide-react";

export function ProductHistoryDialog({ productId, open, onClose }: { productId: number | null, open: boolean, onClose: () => void }) {
    const { data: history, isLoading } = useQuery({
        queryKey: ['product-history', productId],
        queryFn: async () => {
            if (!productId) return [];
            const res = await api.get(`/products/${productId}/history`);
            return res.data;
        },
        enabled: !!productId && open
    });

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" /> Product Audit Trail
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : history?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No history recorded.</p>
                    ) : (
                        <div className="space-y-4">
                            {history?.map((record: any) => (
                                <div key={record.id} className="border-l-2 border-indigo-200 pl-4 py-1">
                                    <div className="text-sm font-semibold">{record.action}</div>
                                    <div className="text-xs text-muted-foreground">{record.details}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">
                                        by {record.user?.name} on {format(new Date(record.created_at), 'dd MMM yyyy HH:mm')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}