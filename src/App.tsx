import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
// import { useAuthStore } from '@/store/useAuthStore'; // No longer needed as authLoader handles protection
// import ErrorPage from "./pages/ErrorPage";
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
import UserList from '@/pages/users/UserList';
import OrderList from '@/pages/orders/OrderList';

const queryClient = new QueryClient();

// The ProtectedRoute component is no longer needed as authLoader handles route protection.
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const { isAuthenticated } = useAuthStore();
//   return isAuthenticated ? children : <Navigate to="/login" />;
// };

const router = createBrowserRouter([
  {
      path: "/",
      // Use the correct, responsive DashboardLayout
      element: <DashboardLayout />, 
      // errorElement: <ErrorPage />,
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
          {
              path: "users",
              element: <UserList />,
          },{
            path: "orders",
            element: <OrderList />,

          }
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