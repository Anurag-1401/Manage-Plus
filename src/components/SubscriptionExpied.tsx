import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SubscriptionExpired = () =>{

    const navigate = useNavigate();

const handleClickRenew=()=>{
  navigate("/subscriptionPage")
}

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-6 max-w-md p-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Subscription Expired</h1>
            <p className="text-muted-foreground">
              Your subscription has expired. Please renew to continue using the application.
            </p>
          </div>
          <Button size="lg" className="w-full" onClick={handleClickRenew}>
            Renew Subscription
          </Button>
        </div>
      </div>
    );
}

export default SubscriptionExpired