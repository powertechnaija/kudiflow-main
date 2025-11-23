import {
    PlusCircle,
    UserPlus,
    Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CheckoutDialog } from "./components/CheckoutDialog"


export default function POSPage() {
    return (
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                    <Card className="sm:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle>Point of Sale</CardTitle>
                            <CardDescription className="max-w-lg text-balance leading-relaxed">
                                Select products to add them to the cart.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button>Create New Product</Button>
                        </CardFooter>
                    </Card>
                    {/** Your product cards will go here */}
                </div>
            </div>
            <div>
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-start bg-muted/50">
                        <div className="grid gap-0.5">
                            <CardTitle className="group flex items-center gap-2 text-lg">
                                Cart
                            </CardTitle>
                            <CardDescription>Select products to add to the cart.</CardDescription>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                                    New Customer
                                </span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 text-sm">
                         <div className="grid gap-3">
                            <div className="font-semibold">Order Details</div>
                            <ul className="grid gap-3">
                                {/** Cart items will go here */}
                            </ul>
                            <Separator className="my-2" />
                            <ul className="grid gap-3">
                                <li className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>$0.00</span>
                                </li>
                                <li className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Tax</span>
                                    <span>$0.00</span>
                                </li>
                                <li className="flex items-center justify-between font-semibold">
                                    <span className="text-muted-foreground">Total</span>
                                    <span>$0.00</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                        <CheckoutDialog />
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
