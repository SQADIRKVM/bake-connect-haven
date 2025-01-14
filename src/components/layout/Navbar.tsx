import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, User } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-semibold text-baker-500">
          HomeBaked
        </Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/products">
            <Button variant="ghost" className="text-sm">
              Products
            </Button>
          </Link>
          <Link to="/bakers">
            <Button variant="ghost" className="text-sm">
              Bakers
            </Button>
          </Link>
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};