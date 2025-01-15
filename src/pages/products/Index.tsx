import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: string;
  average_rating: number | null;
  order_count: number | null;
}

const Products = () => {
  const navigate = useNavigate();

  const { data: allProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: topRated } = useQuery({
    queryKey: ['products', 'top-rated'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('average_rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: mostOrdered } = useQuery({
    queryKey: ['products', 'most-ordered'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('order_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Product[];
    },
  });

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  const ProductGrid = ({ products }: { products: Product[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products?.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <p className="text-sm text-muted-foreground">{product.description}</p>
            <p className="mt-2 font-semibold">${product.price}</p>
            {product.average_rating && (
              <p className="text-sm">Rating: {product.average_rating.toFixed(1)} ⭐</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          <TabsTrigger value="most-ordered">Most Ordered</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <h2 className="text-2xl font-bold mb-6">All Products</h2>
          <ProductGrid products={allProducts || []} />
        </TabsContent>

        <TabsContent value="top-rated">
          <h2 className="text-2xl font-bold mb-6">Top Rated Products</h2>
          <ProductGrid products={topRated || []} />
        </TabsContent>

        <TabsContent value="most-ordered">
          <h2 className="text-2xl font-bold mb-6">Most Ordered Products</h2>
          <ProductGrid products={mostOrdered || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;