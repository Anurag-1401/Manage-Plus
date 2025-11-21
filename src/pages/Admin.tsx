import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { Company, User } from '@/types';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const Admin: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [extendDays, setExtendDays] = useState<string>('30');
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    // Load data from localStorage
    const companiesData = JSON.parse(localStorage.getItem('companies') || '[]');
    const usersData = JSON.parse(localStorage.getItem('users') || '[]');
    
    setCompanies(companiesData);
    setUsers(usersData);

    // Calculate stats
    const active = companiesData.filter((c: Company) => c.subscriptionStatus === 'active').length;
    const expired = companiesData.filter((c: Company) => c.subscriptionStatus === 'expired').length;

    setStats({
      totalCompanies: companiesData.length,
      activeSubscriptions: active,
      expiredSubscriptions: expired,
      totalUsers: usersData.length,
    });
  }, []);

  const handleExtendTrial = (company: Company) => {
    setSelectedCompany(company);
    setIsExtendDialogOpen(true);
  };

  const confirmExtend = () => {
    if (!selectedCompany) return;

    const days = parseInt(extendDays) || 30;
    const currentEndDate = selectedCompany.subscriptionEndDate 
      ? new Date(selectedCompany.subscriptionEndDate) 
      : new Date();
    
    currentEndDate.setDate(currentEndDate.getDate() + days);

    const updatedCompanies = companies.map(c => 
      c.id === selectedCompany.id 
        ? { 
            ...c, 
            subscriptionEndDate: currentEndDate.toISOString(),
            subscriptionStatus: 'active' as const
          } 
        : c
    );

    setCompanies(updatedCompanies);
    localStorage.setItem('companies', JSON.stringify(updatedCompanies));

    toast({
      title: 'Subscription Extended',
      description: `${selectedCompany.name}'s subscription extended by ${days} days.`,
    });

    setIsExtendDialogOpen(false);
    setExtendDays('30');
  };

  const getRemainingDays = (endDate?: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getOwnerName = (companyId: string) => {
    const owner = users.find(u => u.companyId === companyId && u.role === 'OWNER');
    return owner?.fullName || 'N/A';
  };

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      color: 'text-primary',
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      icon: CheckCircle2,
      color: 'text-secondary',
    },
    {
      title: 'Expired Subscriptions',
      value: stats.expiredSubscriptions,
      icon: XCircle,
      color: 'text-destructive',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-accent',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage user subscriptions and view usage statistics</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Usage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">
                {JSON.parse(localStorage.getItem('employees') || '[]').length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Attendance Records</p>
              <p className="text-2xl font-bold">
                {JSON.parse(localStorage.getItem('attendance') || '[]').length}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Active Supervisors</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'SUPERVISOR').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Companies & Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>GST No</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Remaining</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No companies registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company) => {
                    const remainingDays = getRemainingDays(company.subscriptionEndDate);
                    return (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{getOwnerName(company.id)}</TableCell>
                        <TableCell>{company.gstNo || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={company.subscriptionStatus === 'active' ? 'default' : 'destructive'}
                          >
                            {company.subscriptionStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={remainingDays <= 7 ? 'text-destructive font-semibold' : ''}>
                            {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {company.subscriptionEndDate 
                            ? format(new Date(company.subscriptionEndDate), 'PP')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExtendTrial(company)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Extend
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Extend Trial Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>
              Extend the trial period for {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                placeholder="30"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
              />
            </div>
            {selectedCompany && (
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Current End Date:</span>{' '}
                  {selectedCompany.subscriptionEndDate
                    ? format(new Date(selectedCompany.subscriptionEndDate), 'PPP')
                    : 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">New End Date:</span>{' '}
                  {selectedCompany.subscriptionEndDate &&
                    format(
                      new Date(
                        new Date(selectedCompany.subscriptionEndDate).getTime() +
                          (parseInt(extendDays) || 30) * 24 * 60 * 60 * 1000
                      ),
                      'PPP'
                    )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmExtend}>Confirm Extension</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
