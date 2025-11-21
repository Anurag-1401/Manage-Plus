import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Company } from '@/types';

interface SubscriptionReminderDialogProps {
  company: Company | null;
}

const SubscriptionReminderDialog: React.FC<SubscriptionReminderDialogProps> = ({ company }) => {
  const [open, setOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (company?.subscriptionEndDate) {
      const endDate = new Date(company.subscriptionEndDate);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysRemaining(diffDays);
      
      // Show reminder if subscription ends in 7 days or less
      if (diffDays > 0 && diffDays <= 7) {
        setOpen(true);
      }
    }
  }, [company]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-6 h-6" />
            <DialogTitle>Subscription Ending Soon</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            Your subscription will expire in <span className="font-bold text-foreground">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</span>.
            <br />
            Please renew your subscription to continue using all features.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Remind Later
          </Button>
          <Button onClick={() => setOpen(false)}>
            Renew Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionReminderDialog;
