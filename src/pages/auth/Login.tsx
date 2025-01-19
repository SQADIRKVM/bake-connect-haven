import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const { isLoading, error, handleLogin } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;