import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LibraryProvider } from "@/context/LibraryContext";
import Libraries from "./pages/Libraries";
import LibraryDetail from "./pages/LibraryDetail";
import ShelfDetail from "./pages/ShelfDetail";
import BookDetail from "./pages/BookDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LibraryProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Libraries />} />
            <Route path="/library/:id" element={<LibraryDetail />} />
            <Route path="/library/:id/shelf/:shelfId" element={<ShelfDetail />} />
            <Route path="/book/:bookId" element={<BookDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LibraryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
