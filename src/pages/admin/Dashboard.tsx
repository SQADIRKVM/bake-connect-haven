import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, ChefHat } from "lucide-react";

interface Baker {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_approved: boolean | null;
  is_blocked: boolean | null;
}

interface Analytics {
  totalUsers: number;
  totalProducts: number;
  totalBakers: number;
}

const AdminDashboard = () => {
  const [bakers, setBakers] = useState<Baker[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalProducts: 0,
    totalBakers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBakers();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [usersCount, productsCount, bakersCount] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .eq("role", "user"),
        supabase.from("products").select("id", { count: "exact" }),
        supabase
          .from("profiles")
          .select("id", { count: "exact" })
          .eq("role", "baker"),
      ]);

      setAnalytics({
        totalUsers: usersCount.count || 0,
        totalProducts: productsCount.count || 0,
        totalBakers: bakersCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load analytics",
      });
    }
  };

  const fetchBakers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "baker");

      if (error) throw error;
      
      setBakers(data || []);
    } catch (error) {
      console.error("Error fetching bakers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bakers",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (baker: Baker) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: !baker.is_approved })
        .eq("id", baker.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Baker ${baker.is_approved ? "unapproved" : "approved"} successfully`,
      });

      fetchBakers();
    } catch (error) {
      console.error("Error updating baker:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update baker status",
      });
    }
  };

  const toggleBlock = async (baker: Baker) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: !baker.is_blocked })
        .eq("id", baker.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${baker.is_blocked ? "unblocked" : "blocked"} successfully`,
      });

      fetchBakers();
    } catch (error) {
      console.error("Error updating block status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update block status",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bakers</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBakers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bakers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bakers.map((baker) => (
              <TableRow key={baker.id}>
                <TableCell>{baker.full_name || "N/A"}</TableCell>
                <TableCell>{baker.email}</TableCell>
                <TableCell>{baker.phone || "N/A"}</TableCell>
                <TableCell>
                  {baker.is_blocked ? (
                    <span className="text-red-600">Blocked</span>
                  ) : baker.is_approved ? (
                    <span className="text-green-600">Approved</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant={baker.is_approved ? "destructive" : "default"}
                    onClick={() => toggleApproval(baker)}
                    className="mr-2"
                  >
                    {baker.is_approved ? "Revoke" : "Approve"}
                  </Button>
                  <Button
                    variant={baker.is_blocked ? "outline" : "destructive"}
                    onClick={() => toggleBlock(baker)}
                  >
                    {baker.is_blocked ? "Unblock" : "Block"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;