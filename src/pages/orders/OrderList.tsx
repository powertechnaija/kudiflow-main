import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { format } from "date-fns";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
    id: number;
    product_variant_id: number;
    quantity: number;
    price: number;
    variant: {
        sku: string;
        size: string;
        color: string;
    }
}

interface Order {
    id: number;
    invoice_number: string;
    total_amount: number;
    status: string;
    created_at: string;
    customer?: { name: string };
    items: OrderItem[];
}

export default function OrderList() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isReturnOpen, setIsReturnOpen] = useState(false);
    
    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await api.get<{ data: Order[] }>('/orders');
            return res.data.data;
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                    <p className="text-muted-foreground">View sales history and process returns.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="p-4"><CardTitle>Sales History</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
                            ) : orders?.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono font-medium">{order.invoice_number}</TableCell>
                                    <TableCell>{format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')}</TableCell>
                                    <TableCell>{order.customer?.name || 'Walk-in Customer'}</TableCell>
                                    <TableCell className="font-bold">₦{Number(order.total_amount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(order); setIsReturnOpen(true); }}>
                                            <RotateCcw className="w-4 h-4 mr-1" /> Return
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Details Dialog */}
            {selectedOrder && !isReturnOpen && (
                <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invoice #{selectedOrder.invoice_number}</DialogTitle>
                            <DialogDescription>Sale details</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedOrder.items.map(item => (
                                <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                                    <div>
                                        <div className="font-medium">{item.variant.sku}</div>
                                        <div className="text-muted-foreground text-xs">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="font-bold">₦{Number(item.price * item.quantity).toLocaleString()}</div>
                                </div>
                            ))}
                            <div className="flex justify-between font-bold text-lg pt-2">
                                <span>Total</span>
                                <span>₦{Number(selectedOrder.total_amount).toLocaleString()}</span>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Return Dialog */}
            {selectedOrder && isReturnOpen && (
                <ReturnDialog 
                    order={selectedOrder} 
                    open={isReturnOpen} 
                    onClose={() => { setIsReturnOpen(false); setSelectedOrder(null); }} 
                />
            )}
        </div>
    );
}

// --- Sub-Component: Return Dialog ---
function ReturnDialog({ order, open, onClose }: { order: Order, open: boolean, onClose: () => void }) {
    const [returnItems, setReturnItems] = useState<{ [key: number]: number }>({});
    const [reason, setReason] = useState("");
   
    const queryClient = useQueryClient();

    const returnMutation = useMutation({
        mutationFn: async () => {
            const items = Object.entries(returnItems)
                .filter(([_, qty]) => qty > 0)
                .map(([variantId, qty]) => ({ variant_id: variantId, quantity: qty }));

            if (items.length === 0) throw new Error("Select items to return");
            
            await api.post('/returns', { order_id: order.id, items, reason });
        },
        onSuccess: () => {
            toast.success("Inventory and Ledger updated." );
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            onClose();
        },
        onError: (err: any) => toast.warning(err.message || "Error processing return.")
    });

    const handleQtyChange = (variantId: number, max: number, val: string) => {
        const qty = Math.min(Math.max(0, parseInt(val) || 0), max);
        setReturnItems(prev => ({ ...prev, [variantId]: qty }));
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Process Return</DialogTitle>
                    <DialogDescription>Select items to return to inventory.</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{item.variant.sku}</div>
                                    <div className="text-xs text-muted-foreground">Sold: {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs">Return Qty:</Label>
                                    <Input 
                                        type="number" 
                                        className="w-16 h-8"
                                        min={0}
                                        max={item.quantity}
                                        value={returnItems[item.product_variant_id] || 0}
                                        onChange={(e) => handleQtyChange(item.product_variant_id, item.quantity, e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Reason for Return</Label>
                        <Input placeholder="e.g. Wrong size, Damaged" value={reason} onChange={e => setReason(e.target.value)} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={() => returnMutation.mutate()} disabled={returnMutation.isPending}>
                        {returnMutation.isPending ? "Processing..." : "Confirm Return"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}