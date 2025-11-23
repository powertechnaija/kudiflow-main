import { Outlet, Link } from 'react-router-dom';
import { Package2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      
      {/* Left Side: Branding & Testimonial */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r border-border lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Package2 className="mr-2 h-6 w-6" />
          Kudiflow Inc
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This bookkeeping platform has saved me countless hours of manual work. 
              The double-entry accounting is seamless and reliable.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis, CEO of UrbanStyle</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side: Login/Register Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Mobile Only Logo */}
          <div className="lg:hidden flex flex-col space-y-2 text-center">
             <div className="flex items-center justify-center font-bold text-xl">
                <Package2 className="mr-2 h-6 w-6" /> Kudiflow
             </div>
          </div>

          <Outlet />

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}