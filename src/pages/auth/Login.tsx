import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Handle auth state changes and errors
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN") {
      try {
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session?.user?.id)
          .single();

        if (profileError) throw profileError;

        // Redirect based on role
        if (profile?.role === "admin") {
          navigate("/admin");
        } else if (profile?.role === "baker") {
          navigate("/baker/dashboard");
        } else {
          navigate("/");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Error accessing user profile");
      }
    } else if (event === "SIGNED_OUT") {
      setError(""); // Clear any errors on sign out
    }
  });

  // Handle specific auth errors
  const handleAuthError = (error: AuthError) => {
    switch (error.message) {
      case "Invalid login credentials":
        setError("Invalid email or password. Please check your credentials.");
        break;
      case "Email not confirmed":
        setError("Please verify your email before logging in.");
        break;
      default:
        setError(error.message);
    }
  };

  return (
    <div className="container max-w-lg mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          redirectTo={window.location.origin}
          onError={(error) => handleAuthError(error)}
        />
      </div>
    </div>
  );
};

export default Login;