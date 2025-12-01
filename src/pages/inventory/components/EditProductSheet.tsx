import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Product } from "@/types/inventory";
import { toast } from "sonner";

import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"
import { Save, Loader2 } from "lucide-react";

// Reuse schema logic (simplified for brevity)
const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  variants: z.array(z.object({
    id: z.number().optional(), // Important for updates
    sku: z.string(),
    price: z.coerce.number(),
    cost_price: z.coerce.number(),
    stock_quantity: z.coerce.number(),
  }))
});

interface EditProductSheetProps {
    product: Product | null;
    open: boolean;
    onClose: () => void;
}

export function EditProductSheet({ product, open, onClose }: EditProductSheetProps) {
    
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: { name: "", description: "", variants: [] }
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "variants"
    });

    // Load product data when opened
    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                description: product.description || "",
                variants: product.variants.map(v => ({
                    id: v.id,
                    sku: v.sku,
                    price: v.price,
                    cost_price: v.cost_price,
                    stock_quantity: v.stock_quantity
                }))
            });
        }
    }, [product, form]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.put(`/products/${product?.id}`, data);
        },
        onSuccess: () => {
            toast.success("Product Updated");
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onClose();
        }
    });

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="w-[400px] sm:w-[600px]">
                <SheetHeader>
                    <SheetTitle>Edit Product</SheetTitle>
                    <SheetDescription>Make changes to product details and pricing.</SheetDescription>
                </SheetHeader>
                
                <ScrollArea className="h-[calc(100vh-8rem)] mt-4 pr-4 mx-2" >
                    <form id="edit-form" onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input {...form.register('name')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input {...form.register('description')} />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="font-medium">Variants</h3>
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-3 border rounded-md space-y-3 bg-slate-50">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline">{form.watch(`variants.${index}.sku`)}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Selling Price</Label>
                                            <Input type="number" {...form.register(`variants.${index}.price`)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Cost Price</Label>
                                            <Input type="number" {...form.register(`variants.${index}.cost_price`)} />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-xs">Stock Level</Label>
                                            <Input type="number" {...form.register(`variants.${index}.stock_quantity`)} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </form>
                </ScrollArea>

                <div className="mt-4 flex justify-end">
                     <Button type="submit" form="edit-form" disabled={updateMutation.isPending}>
                        {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                     </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}