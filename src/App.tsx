import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import Dashboard from './pages/Dashboard';
import REIICPSearch from './pages/REIICPSearch';
import Prospects from './pages/Prospects';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<REIICPSearch />} />
              <Route path="/prospects" element={<Prospects />} />
            </Routes>
          </SidebarInset>
        </SidebarProvider>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
