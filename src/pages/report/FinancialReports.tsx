import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Types ---
interface PLReport {
  revenue: number;
  expenses: number;
  net_profit: number;
  breakdown: { date: string; revenue: number; expense: number }[]; // Mocked for chart
}

interface BalanceSheet {
  assets: number;
  liabilities: number;
  equity: number;
}

export default function FinancialReports() {
  // Fetch P&L
  const { data: plData, isLoading: plLoading } = useQuery({
    queryKey: ['report-pl'],
    queryFn: async () => {
      const res = await api.get<PLReport>('/reports/profit-loss');
      return res.data;
    }
  });

  // Fetch Balance Sheet
  const { data: bsData, isLoading: bsLoading } = useQuery({
    queryKey: ['report-bs'],
    queryFn: async () => {
      const res = await api.get<BalanceSheet>('/reports/balance-sheet');
      return res.data;
    }
  });

  if (plLoading || bsLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  // Mock Chart Data (Backend would ideally provide this history)
  const chartData = [
    { name: 'Mon', revenue: 4000, expense: 2400 },
    { name: 'Tue', revenue: 3000, expense: 1398 },
    { name: 'Wed', revenue: 2000, expense: 9800 }, // Loss day
    { name: 'Thu', revenue: 2780, expense: 3908 },
    { name: 'Fri', revenue: 1890, expense: 4800 },
    { name: 'Sat', revenue: 2390, expense: 3800 },
    { name: 'Sun', revenue: 3490, expense: 4300 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Performance</h2>
          <p className="text-muted-foreground">Real-time view of your business health.</p>
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue="this-month">
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{plData?.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Gross sales income</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses (COGS)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{plData?.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cost of goods sold</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${plData?.net_profit! >= 0 ? 'border-l-indigo-500' : 'border-l-orange-500'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{plData?.net_profit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations */}
      <Tabs defaultValue="pnl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pnl">Profit & Loss Trend</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet Structure</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pnl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expense</CardTitle>
              <CardDescription>Comparing revenue streams against costs over time.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₦${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRev)" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bs" className="space-y-4">
             <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Assets (What you own)</CardTitle>
                        <CardDescription>Breakdown of company value.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-center h-[200px]">
                             <div className="text-center">
                                 <div className="text-4xl font-bold text-blue-600">₦{bsData?.assets.toLocaleString()}</div>
                                 <p className="text-sm text-muted-foreground mt-2">Cash + Inventory + Receivables</p>
                             </div>
                         </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Liabilities & Equity</CardTitle>
                        <CardDescription>What you owe vs Net Worth.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <span>Liabilities (Payables)</span>
                                <span className="font-bold text-red-600">₦{bsData?.liabilities.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span>Owner's Equity (Net Worth)</span>
                                <span className="font-bold text-indigo-600">₦{bsData?.equity.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-4">
                                * Assets = Liabilities + Equity (Balanced)
                            </div>
                        </div>
                    </CardContent>
                </Card>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
