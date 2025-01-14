import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-baker-500 to-baker-700 bg-clip-text text-transparent">
            Fresh Baked Goodness
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with local bakers and discover homemade treats made with love
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/products">
              <Button size="lg" className="bg-baker-500 hover:bg-baker-600">
                Browse Products
              </Button>
            </Link>
            <Link to="/baker/register">
              <Button size="lg" variant="outline">
                Become a Baker
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-12">
            Why Choose HomeBaked?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 hover-lift fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-baker-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-6">Ready to Start Baking?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join our community of passionate bakers and food lovers. Start sharing
            your creations today!
          </p>
          <Link to="/baker/register">
            <Button size="lg" className="bg-baker-500 hover:bg-baker-600">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
        />
      </svg>
    ),
    title: "Local Delivery",
    description:
      "Fresh baked goods delivered right to your doorstep from local bakers in your area.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Quality Assured",
    description:
      "All our bakers are verified and maintain the highest quality standards.",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Fresh & On Time",
    description:
      "Schedule your orders in advance and receive them fresh when you need them.",
  },
];

export default Index;