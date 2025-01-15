import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category: string;
  baker: {
    id: string;
    full_name: string;
  } | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
});

const BakerProducts = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      category: "",
    },
  });

  const { data: products, refetch } = useQuery({
    queryKey: ['baker-products'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          baker:profiles(id, full_name)
        `)
        .eq('baker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  const createProduct = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const productData = {
        name: values.name,
        price: values.price,
        description: values.description || null,
        category: values.category,
        baker_id: user.id,
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Product created",
        description: "Your product has been created successfully.",
      });
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to create product",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!editingProduct) return;

      const productData = {
        name: values.name,
        price: values.price,
        description: values.description || null,
        category: values.category,
      };

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "Your product has been updated successfully.",
      });
      setEditingProduct(null);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editingProduct) {
      updateProduct.mutate(values);
    } else {
      createProduct.mutate(values);
    }
  };

  // Group products by category
  const groupedProducts = products?.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>) || {};

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Products by Category</h2>
          <div className="space-y-6">
            {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-medium capitalize">{category}</h3>
                <div className="grid gap-4">
                  {categoryProducts.map((product) => (
                    <Card key={product.id}>
                      <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <p className="mt-2 font-semibold">${product.price}</p>
                        {product.baker && (
                          <p className="text-sm">Baker: {product.baker.full_name}</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(product);
                            form.reset({
                              name: product.name,
                              price: product.price,
                              description: product.description || "",
                              category: product.category,
                            });
                          }}
                        >
                          Edit
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BakerProducts;