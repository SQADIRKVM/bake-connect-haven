import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

interface Baker {
  id: string;
  full_name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: string;
  baker: Baker;
}

const CategoryView = () => {
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          baker:profiles(id, full_name)
        `);

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      return data as Product[];
    },
  });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p className="text-lg text-red-500">
            {error instanceof Error ? error.message : "Failed to load products"}
          </p>
        </div>
      </div>
    );
  }

  // Group products by category
  const groupedProducts = products?.reduce((acc, product) => {
    if (!product) return acc;
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>) || {};

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <p className="text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Browse Categories</h1>
      
      <div className="space-y-12">
        {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
          <div key={category} className="space-y-6">
            <h2 className="text-2xl font-semibold capitalize">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {product.description || 'No description available'}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-lg">${product.price}</p>
                      <Button
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        Order Now
                      </Button>
                    </div>
                    {product.baker && (
                      <p className="text-sm mt-2">By: {product.baker.full_name}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryView;