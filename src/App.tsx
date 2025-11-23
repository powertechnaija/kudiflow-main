import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/useAuthStore';
import ErrorPage from "./pages/ErrorPage";
import { authLoader } from "@/lib/authLoader";

// Correct Layout
import DashboardLayout from '@/layouts/DashboardLayout'; 

// Page Components
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import InventoryList from './pages/inventory/InventoryList';
import POSPage from './pages/pos/POSPage';
import CustomerList from './pages/customers/CustomerList';
import SalesList from './pages/sales/SalesList';
import ReportsPage from './pages/report/ReportPage';

const queryClient = new QueryClient();

// This is a good pattern for protecting routes, but we can also use the loader
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
      path: "/",
      // Use the correct, responsive DashboardLayout
      element: <DashboardLayout />, 
      errorElement: <ErrorPage />,
      // The authLoader will protect all child routes
      loader: authLoader, 
      children: [
          {
              path: "",
              element: <Dashboard />,
          },
          {
              path: "inventory",
              element: <InventoryList />,
          },
          {
              path: "pos",
              element: <POSPage />,
          },
          {
              path: "customers",
              element: <CustomerList />,
          },
          {
              path: "sales",
              element: <SalesList />,
          },
          {
              path: "reports",
              element: <ReportsPage />,
          },
      ],
  },
  {
      path: "/login",
      element: <Login />,
  },
  {
      path: "/register",
      element: <Register />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;