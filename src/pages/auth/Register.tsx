import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters."),
  name: z.string().min(2, "Your name must be at least 2 characters."),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        store_name: "",
        name: "",
        email: "",
        password: "",
    }
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // const { data } = await api.post('/register', values); // Uncomment when API is ready
      // Mock successful registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = { user: { name: values.name, email: values.email }, access_token: 'mock_token' };

      setAuth(data.user, data.access_token);
      toast.success("Store Created!", { 
        description: "Your financial ledger has been set up." 
      });
      navigate('/');
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration Failed", { 
        description: "Could not create your account. Please try again."
      });
    }
  };

  return (
    <div className="grid gap-6">
        <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create your Store</h1>
            <p className="text-sm text-muted-foreground">Start tracking sales and inventory today.</p>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="store_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Store Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Awesome Shop" disabled={isSubmitting} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" disabled={isSubmitting} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@example.com" type="email" disabled={isSubmitting} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="******" disabled={isSubmitting} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                    Get Started
                </Button>
            </form>
        </Form>
        <div className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                Login
            </Link>
        </div>
    </div>
  );
}