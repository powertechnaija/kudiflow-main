import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useCartStore } from "@/store/useCartStore";
import type { Product, ProductVariant as Variant } from "@/types/inventory";
import { CheckoutDialog } from "./components/CheckoutDialog";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, ShoppingCart, PackageOpen, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"; 
export default function POSPage() {
    const [search, setSearch] = useState("");
    const { 
        cart, addToCart, removeFromCart, updateQuantity, cartTotal 
    } = useCartStore();

    // --- FIX: Correctly unwrap the Laravel Paginated Response ---
    const { data: products, isLoading } = useQuery({
        queryKey: ['pos-products', search],
        queryFn: async () => {
            const params = search ? { 'filter[search]': search } : {};
            // Request 100 items for the grid to populate sufficiently
            const res = await api.get<{ data: Product[] }>('/products?per_page=100', { params });
            return res.data.data; // Return the array inside 'data'
        }
    });

    const handleProductClick = (product: Product) => {
        if (product.variants.length === 1) {
            addToCart(product, product.variants[0]);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-background">
            
            {/* LEFT: PRODUCT GRID */}
            <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 border-r bg-muted/10">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Scan barcode or search products..."
                        className="pl-10 h-12 text-lg shadow-sm bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Grid */}
                <ScrollArea className="flex-1 -mx-4 px-4">
                    {isLoading ? (
                         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <p>Loading catalog...</p>
                        </div>
                    ) : products?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <PackageOpen className="h-12 w-12 mb-2 opacity-50" />
                            <p>No products found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                            {products?.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onAdd={addToCart}
                                    onSingleClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* RIGHT: CART SIDEBAR */}
            <div className="w-full md:w-[420px] flex flex-col bg-white h-full shadow-2xl z-20 border-l">
                <div className="p-4 border-b bg-indigo-50/50">
                    <h2 className="font-bold text-lg flex items-center gap-2 text-indigo-900">
                        <ShoppingCart className="w-5 h-5 text-indigo-600" />
                        Current Order
                    </h2>
                </div>

                <ScrollArea className="flex-1 p-4 bg-white">
                {cart.length === 0 ? (
                         // ... Empty State ...
                         <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50">
                            <ShoppingCart className="h-16 w-16 mb-4" />
                            <p>Cart is empty</p>
                         </div>
                    ) : (
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item.cartId} className="flex gap-3 items-start p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium text-sm leading-none line-clamp-1">{item.productName}</p>
                                        <div className="text-xs text-muted-foreground flex gap-2">
                                            <span className="font-mono bg-muted px-1 rounded">{item.sku}</span>
                                            {item.size && <span>• {item.size}</span>}
                                            {item.color && <span>• {item.color}</span>}
                                        </div>
                                        {/* Added Stock Indicator in Cart */}
                                        <div className="text-[10px] text-orange-600 font-medium">
                                            Max: {item.stock_quantity}
                                        </div>
                                        <div className="font-bold text-sm text-indigo-600">₦{Number(item.price).toLocaleString()}</div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center shadow-sm border rounded-md h-8 bg-background">
                                            <Button 
                                                variant="ghost" size="icon" className="h-8 w-8 rounded-r-none hover:bg-slate-100"
                                                onClick={() => updateQuantity(item.cartId, -1)}
                                                disabled={item.quantity <= 1} // Disable minus if qty is 1
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                            <Button 
                                                variant="ghost" size="icon" className="h-8 w-8 rounded-l-none hover:bg-slate-100"
                                                onClick={() => updateQuantity(item.cartId, 1)}
                                                // --- DISABLE PLUS IF LIMIT REACHED ---
                                                disabled={item.quantity >= item.stock_quantity}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                                            onClick={() => removeFromCart(item.cartId)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-6 bg-slate-50 border-t space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>₦{cartTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Tax</span>
                            <span>₦0.00</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between font-bold text-xl text-foreground">
                            <span>Total</span>
                            <span>₦{cartTotal().toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <CheckoutDialog />
                </div>
            </div>
        </div>
    );
}

// --- Sub-Component: Product Card ---
interface ProductCardProps {
    product: Product;
    onAdd: (p: Product, v: Variant) => void;
    onSingleClick: () => void;
}
function ProductCard({ product, onAdd, onSingleClick }: ProductCardProps) {
    const hasMultipleVariants = product.variants.length > 1;
    const totalStock = product.variants.reduce((acc, v) => acc + v.stock_quantity, 0);
    const isOutOfStock = totalStock <= 0;

    const CardBody = (
        <Card className={cn(
            "h-full transition-all group border",
            isOutOfStock 
                ? "opacity-60 cursor-not-allowed bg-slate-50" 
                : "cursor-pointer hover:border-indigo-500 hover:shadow-md active:scale-95"
        )}>
            <CardContent className="p-4 space-y-3">
                <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <span className="text-3xl font-bold text-slate-300 group-hover:text-indigo-300 uppercase select-none">
                        {product.name.substring(0, 2)}
                    </span>
                </div>
                <div>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight h-10">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                         <span className="font-bold text-sm text-indigo-700">
                            ₦{Number(product.variants[0]?.price).toLocaleString()}
                        </span>
                        {isOutOfStock ? (
                             <Badge variant="destructive" className="text-[10px] px-1.5">Out of Stock</Badge>
                        ) : (
                             <Badge variant={totalStock < 10 ? "secondary" : "outline"} className="text-[10px] px-1.5">
                                {totalStock} Left
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // If Out of Stock, don't allow interactions
    if (isOutOfStock) {
        return <div>{CardBody}</div>;
    }

    if (hasMultipleVariants) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>{CardBody}</DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Select Variant</div>
                    {product.variants.map(variant => {
                        const isVariantOOS = variant.stock_quantity <= 0;
                        return (
                            <DropdownMenuItem 
                                key={variant.id} 
                                onClick={(e) => {
                                    if (isVariantOOS) {
                                        e.preventDefault();
                                        return;
                                    }
                                    onAdd(product, variant);
                                }}
                                className={cn("justify-between", isVariantOOS ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}
                                disabled={isVariantOOS} // Disable individual variant
                            >
                                <span className="flex flex-col">
                                    <span>{variant.size || variant.color || variant.sku}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {isVariantOOS ? "Out of Stock" : `Qty: ${variant.stock_quantity}`}
                                    </span>
                                </span>
                                <span className="font-bold">₦{Number(variant.price).toLocaleString()}</span>
                            </DropdownMenuItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Single variant click
    return <div onClick={onSingleClick}>{CardBody}</div>;
}
