import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { supabase } from '@/lib/supabaseClient';

import { Supervisor, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import SupervisorTable from '@/components/Supervisors/SupervisorTable';
import SupervisorDialog from '@/components/Supervisors/SupervisorDialog';

const Supervisors: React.FC = () => {
  const { company, user,role } = useAuth();
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

 useEffect(() => {
  if (company?.company_id) {
    loadSupervisors();
  }
}, [company?.company_id]);


 const loadSupervisors = async () => {
  if (!company?.company_id) return;
  console.log("compnay :",company)
  const { data, error } = await supabase
    .from('supervisor')
    .select('*')
    .eq('company_id', company.company_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setSupervisors(
    data.map(s => ({
      supervisor_id: s.supervisor_id,
      fullName: s.full_name,
      email: s.email,
      role: 'SUPERVISOR',
      phone: s.phone,
      companyId: s.company_id,
      aadhar: s.aadhar,
      pan: s.pan,
      address: s.address,
      createdAt: s.created_at,
    }))
  );
};


 const handleDelete = async (supervisor_id?: string) => {
  if (!supervisor_id) {
    console.error('Delete called with invalid id:', supervisor_id);
    return;
  }

  const { error } = await supabase
    .from('supervisor')
    .update({ status: 'DISABLED' })
    .eq('supervisor_id', supervisor_id);

  if (error) {
    console.error(error);
    return;
  }

  await loadSupervisors(); // ✅ INSIDE async function
};



 const handleSave = async (supervisor: Partial<Supervisor>) => {
  if (!company?.company_id) {
    throw new Error("Company not found");
  }
  console.log(supervisor)
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) {
    throw new Error("Not authenticated");
  }

  const res = await fetch(
  "https://cbfkbkywqndothzrydyv.supabase.co/functions/v1/invite-supervisor",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email: supervisor.email,
      full_name: supervisor.fullName,
      phone: supervisor.phone ?? null,
      aadhar: supervisor.aadhar ?? null,
      pan: supervisor.pan ?? null,
      address: supervisor.address ?? null,
      company_id: company.company_id,
      owner_id: user.id
    }),
  }
);

  if (!res.ok) {
    const err = await res.json();
    console.error("Invite error:", err);
    throw new Error(err.error || "Failed to invite supervisor");
  }

  await loadSupervisors();
  setDialogOpen(false);
};



  if (role !== 'OWNER') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">You don't have permission to view this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supervisors</h1>
          <p className="text-muted-foreground mt-1">Manage your team supervisors</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supervisor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Supervisors</CardTitle>
        </CardHeader>
        <CardContent>
          <SupervisorTable supervisors={supervisors} onDelete={handleDelete} />
        </CardContent>
      </Card>

      <SupervisorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};

export default Supervisors;
