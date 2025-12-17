import { useAuth } from "@/hooks/useAuth";
import React, { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: 999,
    duration: "1 Month",
    features: ["Access to core features", "Email support"],
  },
  {
    name: "Pro",
    price: 2799,
    duration: "3 Months",
    features: ["Everything in Basic", "Priority support", "Analytics dashboard"],
  },
  {
    name: "Premium",
    price: 10999,
    duration: "12 Months",
    features: ["Everything in Pro", "Dedicated account manager", "Advanced reports"],
  },
];


const SubscriptionPage = () => {

  const [currentPlan, setCurrentPlan] = useState({
    name: "Basic",
    expiry: new Date(new Date().setDate(new Date().getDate() - 1)), // expired for demo
  });
  
  const{company , subscription}=useAuth();

if (!subscription) {
    return <div>No active subscription found</div>;
  }

  const expiryDate = new Date(subscription.expire_date);
  const isExpired = expiryDate.getTime() < Date.now();

  const handleSubscribe = (planName: string) => {
    alert(`Subscribed to ${planName} plan!`);
    // Here you can call API to process payment and update plan
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Your Subscription</h1>

        {/* Current Plan */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
          <p className="text-gray-600">
            Plan: <span className="font-medium">{subscription.plan_name}</span>
          </p>
          <p className="text-gray-600">
            Expiry:{" "}
            <span className="font-medium">
              {expiryDate.toDateString()}
            </span>
          </p>
          {isExpired && (
            <p className="mt-2 text-red-600 font-semibold">Your plan has expired! Please renew.</p>
          )}
        </div>

        {/* Available Plans */}
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-700 text-lg font-bold mb-4">₹{plan.price} / {plan.duration}</p>
                <ul className="mb-4">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="text-gray-600 mb-1">• {f}</li>
                  ))}
                </ul>
              </div>
              <button
                className={`mt-auto w-full py-2 rounded-lg font-semibold text-white ${
                  plan.name === subscription.plan_name && !isExpired
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => handleSubscribe(plan.name)}
                disabled={plan.name === subscription.plan_name&& !isExpired}
              >
                {plan.name === subscription.plan_name && !isExpired ? "Current Plan" : isExpired ? "Renew" : "Subscribe"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
