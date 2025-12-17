import React, { useEffect, useState } from 'react';
import { Outlet, Navigate ,useNavigate} from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import Sidebar from './Sidebar';
import Header from './Header';
import SplashScreen from '@/components/SplashScreen';
import SubscriptionReminderDialog from '@/components/SubscriptionReminderDialog';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardLayout: React.FC = () => {
const { user,role,loading,company ,subscription} = useAuth(); 
 const [showSplash, setShowSplash] = useState(true);
const navigate = useNavigate();


  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  
if (loading || showSplash) {
  return <SplashScreen />;
}

if (!user) return <Navigate to="/login" replace />;


  // Check subscription status
  const isSubscriptionExpired = subscription?.status === 'expired' || 
    (subscription?.expire_date && new Date(subscription.expire_date) < new Date());

  if (isSubscriptionExpired) {
    navigate("/subscriptionExpired")
  }

  return (
    <>
      <SubscriptionReminderDialog company={company} />
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
