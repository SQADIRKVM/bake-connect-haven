import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

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

const CATEGORY_IMAGES: Record<string, string> = {
  "biryani": "/lovable-uploads/9e8b0566-e9ab-4963-98c2-71d79095b6a9.png#biryani",
  "pizza": "/lovable-uploads/9e8b0566-e9ab-4963-98c2-71d79095b6a9.png#pizza",
  "chicken": "/lovable-uploads/9e8b0566-e9ab-4963-98c2-71d79095b6a9.png#chicken",
  "burger": "/lovable-uploads/9e8b0566-e9ab-4963-98c2-71d79095b6a9.png#burger",
  "rolls": "/lovable-uploads/9e8b0566-e9ab-4963-98c2-71d79095b6a9.png#rolls",
  "falooda": "/lovable-uploads/9e8b0566-e9ab-4963-98c2-71d79095b6a9.png#falooda"
};

const CategoryView = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');

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
    queryKey: ['products-by-category', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          baker:profiles(id, full_name)
        `)
        .order('category', { ascending: true });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory.toLowerCase());
      }

      const { data, error } = await query;

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

  const handleCategoryClick = (category: string) => {
    setSearchParams({ category });
  };

  const clearCategory = () => {
    setSearchParams({});
  };

  if (!selectedCategory) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Inspiration for your first order</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {Object.keys(CATEGORY_IMAGES).map((category) => (
            <div 
              key={category}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-2 border-gray-200 hover:border-primary transition-colors">
                <img
                  src={CATEGORY_IMAGES[category]}
                  alt={category}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-medium capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold capitalize">{selectedCategory} Products</h1>
        <Button variant="outline" onClick={clearCategory}>
          View All Categories
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
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
  );
};

export default CategoryView;