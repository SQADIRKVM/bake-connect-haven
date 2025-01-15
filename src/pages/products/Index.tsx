import { Navigate } from "react-router-dom";

const Products = () => {
  // Redirect to category view as main landing page
  return <Navigate to="/products/categories" replace />;
};

export default Products;