import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useProductStore } from "@/store/useProductStore";
import { Product } from "@/types/inventory";
import { AddProductDialog } from "./components/AddProductDialog";
import { cn } from "@/lib/utils";

import { 
    Search, Plus, MoreHorizontal, Loader2, AlertCircle, 
    Filter, Download, RefreshCcw 
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";

export default function InventoryList() {
    const [search, setSearch] = useState("");
    
    // Zustand Store
    const { 
        filteredProducts, 
        setProducts, 
        searchProducts, 
        setLoading, 
    } = useProductStore();

    // --- THE FIX IS HERE ---
    const { data, isFetching, refetch, isError } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            // We tell Axios the response is an object containing a 'data' array
            const res = await api.get<{ data: Product[] }>('/products?per_page=100'); 
            // We return specifically the array inside the 'data' key
            return res.data.data; 
        },
        staleTime: 1000 * 60 * 5, 
    });
    // -----------------------

    // Sync API Data with Store
    useEffect(() => {
        if (data) {
            setProducts(data);
        }
        setLoading(isFetching);
    }, [data, isFetching, setProducts, setLoading]);

    // Handle Local Search
    useEffect(() => {
        searchProducts(search);
    }, [search, searchProducts]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
                    <p className="text-muted-foreground">
                        Manage {filteredProducts.length} products, track stock levels, and organize variants.
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                    </Button>
                    <AddProductDialog>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </AddProductDialog>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-background/95 backdrop-blur">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, SKU, or barcode..."
                        className="pl-9 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="shadow-sm border-muted/40">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Product List</CardTitle>
                    <CardDescription>Real-time stock levels across all variants.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[300px]">Product Details</TableHead>
                                <TableHead>Variants (SKU)</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total Stock</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isFetching && !data ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                            <p>Loading inventory...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-red-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="h-8 w-8" />
                                            <p>Failed to load products. Check API connection.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        {search ? "No products match your search." : "No products found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <ProductRow key={product.id} product={product} />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function ProductRow({ product }: { product: Product }) {
    const totalStock = product.variants.reduce((acc, v) => acc + v.stock_quantity, 0);
    const hasMultiple = product.variants.length > 1;
    const minPrice = Math.min(...product.variants.map(v => Number(v.price)));
    const maxPrice = Math.max(...product.variants.map(v => Number(v.price)));
    
    const isLowStock = totalStock < 10;
    const isOutOfStock = totalStock === 0;

    return (
        <TableRow className="hover:bg-gray-50/50 transition-colors">
            <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">{product.name}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                        {product.description || "No description provided"}
                    </span>
                </div>
            </TableCell>
            <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1.5">
                    {product.variants.slice(0, 3).map(v => (
                        <div key={v.id} className="flex items-center gap-2 text-xs">
                            <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                                {v.sku}
                            </Badge>
                            <span className="text-muted-foreground">
                                {v.size && v.color ? `${v.size} / ${v.color}` : (v.size || v.color || "Standard")}
                            </span>
                        </div>
                    ))}
                    {product.variants.length > 3 && (
                        <span className="text-xs text-muted-foreground italic pl-1">
                            +{product.variants.length - 3} more variants...
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="align-top py-4">
                <div className="font-medium">
                    {hasMultiple && minPrice !== maxPrice ? (
                        <span>₦{minPrice.toLocaleString()} - ₦{maxPrice.toLocaleString()}</span>
                    ) : (
                        <span>₦{minPrice.toLocaleString()}</span>
                    )}
                </div>
            </TableCell>
            <TableCell className="align-top py-4">
                 <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{totalStock}</span>
                    <span className="text-xs text-muted-foreground">Units</span>
                 </div>
            </TableCell>
            <TableCell className="align-top py-4 text-right">
                {isOutOfStock ? (
                    <Badge variant="destructive">Out of Stock</Badge>
                ) : isLowStock ? (
                    <Badge variant="secondary" className="text-orange-600 bg-orange-50 border-orange-200">
                        Low Stock
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                        In Stock
                    </Badge>
                )}
            </TableCell>
            <TableCell className="align-top py-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit Product</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}