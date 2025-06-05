import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Footer } from './footer';
import { Toaster } from '@/components/ui/toaster';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-16">
        <ScrollArea className="h-full">
          <Outlet />
        </ScrollArea>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}