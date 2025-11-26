import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/axios";
import { toast } from "sonner"
import { Loader2, CreditCard, Banknote, User, Check, ChevronsUpDown, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Customer {
  id: number;
  name: string;
}

export function CheckoutDialog() {
  const [open, setOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customerOpen, setCustomerOpen] = useState(false);

  const { cart, cartTotal, clearCart } = useCartStore();
  

  // Fetch Customers for Dropdown
  const { data: customers } = useQuery({
      queryKey: ['customers-list'],
      queryFn: async () => {
          const res = await api.get<{ data: Customer[] }>('/customers?per_page=100');
          return res.data.data;
      },
      enabled: open // Only fetch when dialog opens
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Validation: Credit sales MUST have a customer
      if (paymentMethod === 'credit' && !customerId) {
          throw new Error("Please select a customer for Credit Sales (Store Credit).");
      }

      const payload = {
        customer_id: customerId,
        items: cart.map(item => ({
          variant_id: item.id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod 
      };
      
      const res = await api.post("/orders", payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(
 `Invoice #${data.invoice_number || 'Generated'} created successfully.`);
      clearCart();
      setOpen(false);
      setCustomerId(null);
      setPaymentMethod("cash");
    },
    onError: (error: any) => {
      // Check if it's our validation error or API error
      const msg = error.message || error.response?.data?.message || "Could not process sale.";
      toast.warming(msg);
    }
  });

  const total = cartTotal();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full text-lg shadow-lg hover:scale-[1.02] transition-transform" disabled={cart.length === 0}>
          Pay ₦{total.toLocaleString()}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
          <DialogDescription>
            Confirm total amount and select payment method.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          
          {/* Total Display */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-indigo-50 border-indigo-100">
             <span className="font-semibold text-indigo-900">Total Amount</span>
             <span className="text-2xl font-bold text-indigo-700">₦{total.toLocaleString()}</span>
          </div>

          {/* Customer Selection */}
          <div className="grid gap-2">
            <Label>Customer (Optional)</Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="justify-between w-full"
                >
                  {customerId
                    ? customers?.find((c) => c.id === customerId)?.name
                    : "Select customer..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
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
                            setCustomerId(customer.id === customerId ? null : customer.id)
                            setCustomerOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              customerId === customer.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {customer.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Method Grid */}
          <RadioGroup defaultValue="cash" onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-3">
            
            {/* Cash */}
            <div>
              <RadioGroupItem value="cash" id="cash" className="peer sr-only" />
              <Label
                htmlFor="cash"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <Banknote className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Cash</span>
              </Label>
            </div>

            {/* Card / Transfer */}
            <div>
              <RadioGroupItem value="card" id="card" className="peer sr-only" />
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <CreditCard className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Transfer/Card</span>
              </Label>
            </div>

            {/* Store Credit */}
            <div>
              <RadioGroupItem value="credit" id="credit" className="peer sr-only" />
              <Label
                htmlFor="credit"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <StickyNote className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Store Credit</span>
              </Label>
            </div>
          </RadioGroup>

          {/* Validation Warning for Credit */}
          {paymentMethod === 'credit' && !customerId && (
              <p className="text-xs text-red-500 font-medium text-center animate-pulse">
                  * A customer must be selected for store credit.
              </p>
          )}
        </div>

        <DialogFooter>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={() => checkoutMutation.mutate()}
            disabled={checkoutMutation.isPending || (paymentMethod === 'credit' && !customerId)}
          >
            {checkoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}