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

interface Baker {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  is_approved: boolean;
}

const AdminDashboard = () => {
  const [bakers, setBakers] = useState<Baker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBakers();
  }, []);

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

      fetchBakers(); // Refresh the list
    } catch (error) {
      console.error("Error updating baker:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update baker status",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
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
                <TableCell>{baker.full_name}</TableCell>
                <TableCell>{baker.email}</TableCell>
                <TableCell>{baker.phone}</TableCell>
                <TableCell>
                  {baker.is_approved ? (
                    <span className="text-green-600">Approved</span>
                  ) : (
                    <span className="text-red-600">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant={baker.is_approved ? "destructive" : "default"}
                    onClick={() => toggleApproval(baker)}
                  >
                    {baker.is_approved ? "Revoke" : "Approve"}
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