import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company } from '@/types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, companyName: string, companyDetails?: Partial<Company>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    const storedCompany = localStorage.getItem('company');
    
    if (storedUser && storedCompany) {
      setUser(JSON.parse(storedUser));
      setCompany(JSON.parse(storedCompany));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - check localStorage for users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: User) => u.email === email);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    const foundCompany = companies.find((c: Company) => c.id === foundUser.companyId);

    setUser(foundUser);
    setCompany(foundCompany);
    localStorage.setItem('user', JSON.stringify(foundUser));
    localStorage.setItem('company', JSON.stringify(foundCompany));
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    companyName: string,
    companyDetails?: Partial<Company>
  ) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: User) => u.email === email)) {
      throw new Error('Email already exists');
    }

    const companyId = `company_${Date.now()}`;
    const userId = `user_${Date.now()}`;

    // Set subscription to 30 days from now
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

    const newCompany: Company = {
      id: companyId,
      name: companyName,
      ownerId: userId,
      gstNo: companyDetails?.gstNo,
      address: companyDetails?.address,
      subscriptionEndDate: subscriptionEndDate.toISOString(),
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: userId,
      email,
      fullName,
      role: 'OWNER',
      companyId,
      createdAt: new Date().toISOString(),
    };

    const companies = JSON.parse(localStorage.getItem('companies') || '[]');
    companies.push(newCompany);
    users.push(newUser);

    localStorage.setItem('companies', JSON.stringify(companies));
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('company', JSON.stringify(newCompany));

    setUser(newUser);
    setCompany(newCompany);
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('user');
    localStorage.removeItem('company');
  };

  return (
    <AuthContext.Provider value={{ user, company, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
