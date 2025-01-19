import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { AuthError, AuthApiError } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }, "Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

const BakerRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      phone: "",
    },
  });

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.message) {
        case "User already registered":
          return "This email is already registered. Please try logging in instead.";
        case "Email address is invalid":
          return "Please enter a valid email address";
        default:
          return error.message;
      }
    }
    return "An unexpected error occurred. Please try again.";
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // First, sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            role: 'baker',
            phone: values.phone,
          },
        },
      });

      if (signUpError) {
        setError(getErrorMessage(signUpError));
        return;
      }

      if (!signUpData?.user) {
        setError("Failed to create user account. Please try again.");
        return;
      }

      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account. An admin will review your application.",
      });

      // Redirect to login page after successful registration
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Baker Registration</h1>
          <p className="text-sm text-muted-foreground">
            Register as a baker to start selling your products
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="john@example.com" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value.trim().toLowerCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registering..." : "Register as Baker"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BakerRegister;