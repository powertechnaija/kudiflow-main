import { useState } from "react";
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import api from "@/lib/axios"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm , useFieldArray} from "react-hook-form"
import * as z from "zod"
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from 'sonner'
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Icons
import {
    Plus, Trash2, Save, Package,
    Barcode, Tag, Layers, RefreshCcw,
    TrendingUp, AlertCircle
  } from "lucide-react";


import { cn } from "@/lib/utils"; // Assuming your utility function 'cn' is defined here

const variantSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    barcode: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    stock_quantity: z.coerce.number().min(0, "Stock cannot be negative"),
    cost_price: z.coerce.number().min(0, "Cost cannot be negative"),
    price: z.coerce.number().min(0.01, "Price is required"),
  });

const productSchema = z.object({
    name: z.string().min(2, "Product name is required"),
    description: z.string().optional(),
    variants: z.array(variantSchema).min(1, "At least one variant is required"),
  });
type ProductFormValues = z.infer<typeof productSchema>;


export function AddProductDialog({ children }: { children: React.ReactNode }) {

    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
          name: "",
          description: "",
          variants: [{
            sku: "",
            barcode: "",
            size: "",
            color: "",
            stock_quantity: 0,
            cost_price: 0,
            price: 0
          }]
        },
   });

   const { fields, append, remove } = useFieldArray({
    name: "variants",
    control: form.control,
  });
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      // Backend expects: { name, description, variants: [...] }
      const res = await api.post("/products", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Inventory and financial records have been updated." );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.warning(error.response?.data?.message || "Please check your inputs." );
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    createProductMutation.mutate(data);
  };

  // Helper: Generate random SKU
  const generateSKU = (index: number) => {
    const random = Math.floor(1000 + Math.random() * 9000);
    form.setValue(`variants.${index}.sku`, `SKU-${random}`);
  };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-10xl max-h-[95vh] flex flex-col p-0 gap-0 overflow-y-auto">

          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                 <Package className="w-5 h-5" />
              </div>
              <div>
                  <DialogTitle className="text-xl">Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter product details, variants, and initial stock levels.
                  </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Form Body */}
          <ScrollArea className="rounded-md border">
              <Form {...form}>
              <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-8">

                  {/* Section: Basic Details */}
                  <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-primary" />
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">General Information</h3>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                  <FormItem className="col-span-2 md:col-span-1">
                                  <FormLabel>Product Name</FormLabel>
                                  <FormControl>
                                      <Input placeholder="e.g. Vintage Leather Jacket" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                  </FormItem>
                              )}
                          />
                           <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                  <FormItem className="col-span-2 md:col-span-1">
                                  <FormLabel>Description (Optional)</FormLabel>
                                  <FormControl>
                                      <Textarea placeholder="Details about material, origin..." className="h-10 min-h-[40px] resize-none" {...field} />
                                  </FormControl>
                                  </FormItem>
                              )}
                          />
                      </div>
                  </div>

                  <Separator />

                  {/* Section: Variants */}
                  <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-primary" />
                              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Variants & Pricing</h3>
                          </div>
                          <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => append({ sku: "", barcode: "", size: "", color: "", stock_quantity: 0, cost_price: 0, price: 0 })}
                          >
                              <Plus className="w-4 h-4 mr-2" /> Add Variant
                          </Button>
                      </div>

                      <div className="space-y-4">
                          {fields.map((field, index) => {
                              // Calculate margin for visual feedback
                              const cost = form.watch(`variants.${index}.cost_price`) || 0;
                              const price = form.watch(`variants.${index}.price`) || 0;
                              const profit = price - cost;
                              const isLoss = profit < 0;

                              return (
                              <div key={field.id} className="relative p-4 rounded-lg border bg-card text-card-foreground shadow-sm animate-in slide-in-from-top-2">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                      {/* 1. SKU & Barcode */}
                                      <div className="col-span-2 md:col-span-2 space-y-3">
                                          <FormField
                                              control={form.control}
                                              name={`variants.${index}.sku`}
                                              render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel className="text-xs">SKU</FormLabel>
                                                      <div className="flex gap-2">
                                                          <FormControl><Input placeholder="SKU-123" {...field} /></FormControl>
                                                          <TooltipProvider>
                                                              <Tooltip>
                                                                  <TooltipTrigger asChild>
                                                                      <Button type="button" variant="ghost" size="icon" onClick={() => generateSKU(index)}>
                                                                          <RefreshCcw className="w-3 h-3" />
                                                                      </Button>
                                                                  </TooltipTrigger>
                                                                  <TooltipContent>Generate SKU</TooltipContent>
                                                              </Tooltip>
                                                          </TooltipProvider>
                                                      </div>
                                                      <FormMessage />
                                                  </FormItem>
                                              )}
                                          />
                                          <FormField
                                              control={form.control}
                                              name={`variants.${index}.barcode`}
                                              render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel className="text-xs flex items-center gap-1">
                                                          <Barcode className="w-3 h-3" /> Barcode
                                                      </FormLabel>
                                                      <FormControl><Input placeholder="Scan or type..." {...field} /></FormControl>
                                                  </FormItem>
                                              )}
                                          />
                                      </div>

                                      {/* 2. Attributes (Size/Color) */}
                                      <div className="col-span-2 md:col-span-2 space-y-3">
                                          <FormField
                                              control={form.control}
                                              name={`variants.${index}.size`}
                                              render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel className="text-xs">Size</FormLabel>
                                                      <FormControl><Input placeholder="e.g. XL" {...field} /></FormControl>
                                                  </FormItem>
                                              )}
                                          />
                                          <FormField
                                              control={form.control}
                                              name={`variants.${index}.color`}
                                              render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel className="text-xs">Color</FormLabel>
                                                      <FormControl><Input placeholder="e.g. Red" {...field} /></FormControl>
                                                  </FormItem>
                                              )}
                                          />
                                      </div>

                                      {/* 3. Financials (Cost & Price) */}
                                      <div className="col-span-2 md:col-span-2 space-y-3">
                                          <div className="grid grid-cols-2 gap-3">
                                              <FormField
                                                  control={form.control}
                                                  name={`variants.${index}.cost_price`}
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel className="text-xs text-muted-foreground">Cost Price</FormLabel>
                                                          <FormControl>
                                                              <div className="relative">
                                                                  <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">₦</span>
                                                                  <Input type="number" className="pl-6" placeholder="0.00" {...field} />
                                                              </div>
                                                          </FormControl>
                                                      </FormItem>
                                                  )}
                                              />
                                              <FormField
                                                  control={form.control}
                                                  name={`variants.${index}.price`}
                                                  render={({ field }) => (
                                                      <FormItem>
                                                          <FormLabel className="text-xs font-semibold text-green-600">Selling Price</FormLabel>
                                                          <FormControl>
                                                               <div className="relative">
                                                                  <span className="absolute left-2 top-2.5 text-xs text-muted-foreground">₦</span>
                                                                  <Input type="number" className="pl-6 font-semibold" placeholder="0.00" {...field} />
                                                              </div>
                                                          </FormControl>
                                                          <FormMessage />
                                                      </FormItem>
                                                  )}
                                              />
                                          </div>
                                          {/* Margin Indicator */}
                                          <div className={cn("text-xs flex items-center gap-1", isLoss ? "text-red-500" : "text-green-600")}>
                                              <TrendingUp className="w-3 h-3" />
                                              <span>Profit: ₦{profit.toLocaleString()}</span>
                                              {isLoss && <span className="font-bold ml-1">(Loss!)</span>}
                                          </div>
                                      </div>

                                      {/* 4. Stock */}
                                      <div className="col-span-2 md:col-span-1 space-y-3">
                                          <FormField
                                              control={form.control}
                                              name={`variants.${index}.stock_quantity`}
                                              render={({ field }) => (
                                                  <FormItem>
                                                      <FormLabel className="text-xs">Quantity</FormLabel>
                                                      <FormControl><Input type="number" className="bg-slate-50" {...field} /></FormControl>
                                                  </FormItem>
                                              )}
                                          />
                                      </div>
                                  </div>

                                  {/* Remove Button (Only if > 1 variant) */}
                                  {fields.length > 1 && (
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="absolute top-2 right-2 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                                          onClick={() => remove(index)}
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </Button>
                                  )}
                              </div>
                          )})}
                      </div>
                  </div>
              </form>
              </Form>
          </ScrollArea>

          {/* Footer Actions */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/20 sm:justify-between">
              <div className="flex items-center text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>Financial journal entries will be generated automatically.</span>
              </div>
              <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button
                      type="submit"
                      form="product-form"
                      disabled={createProductMutation.isPending}
                      className="gap-2"
                  >
                      {createProductMutation.isPending ? "Saving..." : <><Save className="w-4 h-4" /> Save Product</>}
                  </Button>
              </div>
          </DialogFooter>

        </DialogContent>
      </Dialog>
    )
}