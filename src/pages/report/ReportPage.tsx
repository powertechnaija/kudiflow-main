import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function ReportsPage() {
    return (
        <Tabs defaultValue="sales-over-time">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="sales-over-time">Sales Over Time</TabsTrigger>
                    <TabsTrigger value="top-products">Top Products</TabsTrigger>
                    <TabsTrigger value="top-customers">Top Customers</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="sales-over-time">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Over Time</CardTitle>
                        <CardDescription>
                            A chart showing the total sales over a period of time.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/** Chart will go here */}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="top-products">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>
                            A table showing the best-selling products.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/** Table will go here */}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="top-customers">
                <Card>
                    <CardHeader>
                        <CardTitle>Top Customers</CardTitle>
                        <CardDescription>
                            A table showing the customers who have spent the most.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/** Table will go here */}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
