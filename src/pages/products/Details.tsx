import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  baker_id: string;
  category: string;
  average_rating: number | null;
  baker: {
    full_name: string | null;
    phone: string | null;
  };
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          baker:profiles(full_name, phone)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Product not found');

      return data as Product;
    },
    enabled: !!id,
  });

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        navigate('/login');
        throw new Error('Please login to place an order');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to place an order');

      const { error } = await supabase
        .from('orders')
        .insert({
          product_id: id,
          user_id: user.id,
          quantity,
          status: 'pending',
          payment_status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and is pending payment.",
      });
      navigate('/orders');
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'Please login to place an order') {
        // Don't show error toast when redirecting to login
        return;
      }
      toast({
        variant: "destructive",
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const submitRating = useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        navigate('/login');
        throw new Error('Please login to rate products');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to rate products');

      const { error } = await supabase
        .from('ratings')
        .insert({
          product_id: id,
          user_id: user.id,
          rating
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for rating this product!",
      });
    },
    onError: (error) => {
      if (error instanceof Error && error.message === 'Please login to rate products') {
        // Don't show error toast when redirecting to login
        return;
      }
      toast({
        variant: "destructive",
        title: "Failed to submit rating",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const handleWhatsApp = () => {
    if (product?.baker.phone) {
      window.open(`https://wa.me/${product.baker.phone}`, '_blank');
    } else {
      toast({
        variant: "destructive",
        title: "Contact not available",
        description: "The baker hasn't provided a contact number.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p className="text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p className="text-lg text-red-500">
            {error instanceof Error ? error.message : "Failed to load product"}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p className="text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-xl font-semibold mt-2">${product.price}</p>
            {product.average_rating && (
              <p className="text-lg mt-2">Rating: {product.average_rating.toFixed(1)} ⭐</p>
            )}
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div>
            <p className="font-semibold">Baker: {product.baker.full_name || 'Anonymous'}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={handleWhatsApp}
            >
              Contact via WhatsApp
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={() => createOrder.mutate()}
                >
                  {isAuthenticated ? 'Place Order' : 'Login to Order'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rate this product
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                  />
                </div>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => submitRating.mutate()}
                >
                  {isAuthenticated ? 'Submit Rating' : 'Login to Rate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;