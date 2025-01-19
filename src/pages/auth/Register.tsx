import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      // Check if profile was created
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was an error creating your profile. Please try again.",
        });
        // Sign out the user if profile creation failed
        await supabase.auth.signOut();
        return;
      }

      if (profile) {
        toast({
          title: "Success",
          description: "Registration successful! Please wait for admin approval.",
        });
        navigate("/login");
      }
    } else if (event === "SIGNED_OUT") {
      setError("");
    }
  });

  return (
    <div className="container max-w-lg mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up for a new account
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                }
              }
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
          onError={(error) => {
            console.error("Auth error:", error);
            setError(error.message);
            toast({
              variant: "destructive",
              title: "Error",
              description: error.message,
            });
          }}
          view="sign_up"
        />
      </div>
    </div>
  );
};

export default Register;