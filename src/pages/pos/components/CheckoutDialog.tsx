import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"


export function CheckoutDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Checkout</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Checkout</DialogTitle>
                    <DialogDescription>
                        Complete the transaction by selecting a customer and payment method.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="customer">Customer</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {/** Customer options will go here */}
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Tax</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold">
                            <span className="text-muted-foreground">Total</span>
                            <span>$0.00</span>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid gap-2">
                        <label>Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button variant="outline">Cash</Button>
                            <Button variant="outline">Card</Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="submit">Confirm Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
