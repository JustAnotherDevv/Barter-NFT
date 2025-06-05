import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ModeToggle } from "@/components/mode-toggle";
import { Search, Menu, Bell, Wallet } from "lucide-react";
// import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 10);
    });
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            {/* <Wallet className="h-6 w-6 text-primary" /> */}
            <span className="font-bold text-xl hidden sm:block ml-4 text-white">
              BarterNFT
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/explore">
            <Button variant="ghost">Explore</Button>
          </Link>
          <Link to="/trades">
            <Button variant="ghost">Trades</Button>
          </Link>
          <Link to="/inventory">
            <Button variant="ghost">Inventory</Button>
          </Link>
        </div>

        {/* <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search NFTs..." className="pl-8" />
        </div> */}

        <div className="flex items-center gap-2">
          <ConnectButton />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b p-4 flex flex-col gap-2">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Home
            </Button>
          </Link>
          <Link to="/explore" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Explore
            </Button>
          </Link>
          <Link to="/trades" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Trades
            </Button>
          </Link>
          <Link to="/inventory" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">
              Inventory
            </Button>
          </Link>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search NFTs..." className="pl-8 w-full" />
          </div>
        </div>
      )}
    </header>
  );
}
