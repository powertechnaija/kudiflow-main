import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Loader2, CreditCard, Banknote, Check, ChevronsUpDown, StickyNote, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Customer {
  id: number;
  name: string;
}

export function CheckoutDialog() {
  const [open, setOpen] = useState(false);
  
  // Quick Add Customer State
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);

  const { cart, cartTotal, clearCart } = useCartStore();
  
  const queryClient = useQueryClient();

  // 1. Fetch Customers
  const { data: customers } = useQuery({
      queryKey: ['customers-list'],
      queryFn: async () => {
          const res = await api.get<{ data: Customer[] }>('/customers?per_page=100');
          return res.data.data;
      },
      enabled: open // Only fetch when dialog opens
  });

  // 2. Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      if (paymentMethod === 'credit' && !customerId) {
          throw new Error("Please select a customer for Credit Sales.");
      }
      const payload = {
        customer_id: customerId,
        items: cart.map(item => ({ variant_id: item.id, quantity: item.quantity })),
        payment_method: paymentMethod 
      };
      const res = await api.post("/orders", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Invoice #${data.invoice_number} created.` );
      clearCart();
      setOpen(false);
      setCustomerId(null);
      setPaymentMethod("cash");
    },
    onError: (error: any) => {
      toast.warning(error.message || "Error processing sale.");
    }
  });

  // 3. Quick Add Customer Mutation
  const addCustomerMutation = useMutation({
    mutationFn: async () => {
        if(!newCustomerName) throw new Error("Name is required");
        const res = await api.post("/customers", { name: newCustomerName, phone: newCustomerPhone });
        return res.data;
    },
    onSuccess: (newCustomer) => {
        toast.success("Customer Added");
        queryClient.invalidateQueries({ queryKey: ['customers-list'] }); // Refresh list
        setCustomerId(newCustomer.id); // Auto-select new customer
        setAddCustomerOpen(false); // Close small dialog
        setNewCustomerName("");
        setNewCustomerPhone("");
    },
    onError: () => toast.error("Name is required.")
  });

  const total = cartTotal();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full text-lg shadow-lg hover:scale-[1.02] transition-transform" disabled={cart.length === 0}>
            Pay ₦{total.toLocaleString()}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>Confirm total and select payment.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-5 py-4">
            {/* Total Display */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50 border-indigo-100">
              <span className="font-semibold text-indigo-900">Total Amount</span>
              <span className="text-2xl font-bold text-indigo-700">₦{total.toLocaleString()}</span>
            </div>

            {/* Customer Selection Row */}
            <div className="grid gap-2">
              <Label>Customer (Optional)</Label>
              <div className="flex gap-2">
                <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={customerOpen} className="justify-between flex-1">
                      {customerId ? customers?.find((c) => c.id === customerId)?.name : "Select customer..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search customer..." />
                      <CommandList>
                        <CommandEmpty>No customer found.</CommandEmpty>
                        <CommandGroup>
                          {customers?.map((customer) => (
                            <CommandItem
                              key={customer.id}
                              value={customer.name}
                              onSelect={() => {
                                setCustomerId(customer.id === customerId ? null : customer.id);
                                setCustomerOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", customerId === customer.id ? "opacity-100" : "opacity-0")} />
                              {customer.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                {/* QUICK ADD BUTTON */}
                <Button size="icon" variant="outline" onClick={() => setAddCustomerOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Payment Method Grid */}
            <RadioGroup defaultValue="cash" onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-3">
              <div>
                <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
                <Label htmlFor="cash" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                  <Banknote className="mb-2 h-6 w-6" />
                  <span className="text-xs font-semibold">Cash</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                <Label htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                  <CreditCard className="mb-2 h-6 w-6" />
                  <span className="text-xs font-semibold">Card</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
                <Label htmlFor="credit" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all">
                  <StickyNote className="mb-2 h-6 w-6" />
                  <span className="text-xs font-semibold">Credit</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button className="w-full" size="lg" onClick={() => checkoutMutation.mutate()} disabled={checkoutMutation.isPending}>
              {checkoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NESTED DIALOG: QUICK ADD CUSTOMER */}
      <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
        <DialogContent className="sm:max-w-[350px]">
            <DialogHeader>
                <DialogTitle>Quick Add Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="John Doe" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Phone (Optional)</Label>
                    <Input placeholder="080..." value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setAddCustomerOpen(false)}>Cancel</Button>
                <Button onClick={() => addCustomerMutation.mutate()} disabled={addCustomerMutation.isPending}>
                    Save & Select
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
