// import React, { createContext, useEffect, useState, ReactNode } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { useNavigate } from "react-router-dom";

// interface SignupData {
//   fullName: string;
//   phone?: string;
//   companyName: string;
//   gstNo?: string;
//   address?: string;
// }

// interface AuthContextType {
//   user: any;
//   company: any;
//   loading: boolean;
//   signup: (email: string, password: string, data: SignupData) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [company, setCompany] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   // Restore session on app reload
//   useEffect(() => {
//     const init = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       setUser(session?.user || null);
//       setLoading(false);
//     };

//     init();

//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_, session) => setUser(session?.user || null)
//     );

//     return () => listener?.subscription.unsubscribe();
//   }, []);

//   // -------------------------
//   // SIGNUP
//   // -------------------------
//   const signup = async (email: string, password: string, data: SignupData) => {
//     setLoading(true);

//     const { error } = await supabase.auth.signUp({
//       email: email.trim().toLowerCase(),
//       password,
//     });

//     if (error) {
//       setLoading(false);
//       throw error;
//     }

//     alert("Signup successful! Please verify your email.");
//     setLoading(false);
//     navigate("/login");
//   };

//   // -------------------------
//   // LOGIN (INSERT OWNER + COMPANY AFTER EMAIL VERIFIED)
//   // -------------------------
//   const login = async (email: string, password: string) => {
//     setLoading(true);

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email: email.trim().toLowerCase(),
//       password,
//     });

//     if (error) {
//       setLoading(false);
//       throw error;
//     }

//     const loggedUser = data.user;
//     setUser(loggedUser);

//     // ❗ Email NOT verified → Stop here
//     if (!loggedUser.email_confirmed_at) {
//       alert("Please verify your email first!");
//       setLoading(false);
//       return;
//     }

//     // ❗ Check if owner already exists (avoid duplicate insertion)
//     const { data: existingOwner } = await supabase
//       .from("owner")
//       .select("*")
//       .eq("owner_id", loggedUser.id)
//       .maybeSingle();

//     // If owner exists → Just redirect
//     if (existingOwner) {
//       setLoading(false);
//       navigate("/dashboard");
//       return;
//     }

//     // 👇 Owner does NOT exist → FIRST LOGIN AFTER VERIFICATION
//     try {
//       // Insert Company
//       const { data: comp, error: compErr } = await supabase
//         .from("company")
//         .insert({
//           company_name: data.user.user_metadata.companyName,
//           gst_no: data.user.user_metadata.gstNo || null,
//           address: data.user.user_metadata.address || null,
//         })
//         .select()
//         .single();

//       if (compErr) throw compErr;

//       // Insert Owner
//       const { error: ownerErr } = await supabase
//         .from("owner")
//         .insert({
//           owner_id: loggedUser.id,
//           company_id: comp.company_id,
//           full_name: data.user.user_metadata.fullName,
//           email: loggedUser.email,
//           phone: data.user.user_metadata.phone || null,
//         });

//       if (ownerErr) throw ownerErr;

//       // Update metadata
//       await supabase.auth.updateUser({
//         data: {
//           role: "owner",
//           company_id: comp.company_id,
//         },
//       });

//       setCompany(comp);
//       alert("Registration completed!");
//       navigate("/dashboard");

//     } catch (e: any) {
//       alert(e.message);
//     }

//     setLoading(false);
//   };

//   // -------------------------
//   // LOGOUT
//   // -------------------------
//   const logout = async () => {
//     setLoading(true);
//     await supabase.auth.signOut();
//     setUser(null);
//     setCompany(null);
//     setLoading(false);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         company,
//         loading,
//         signup,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };


// 🔥 CLEAN AUTH CONTEXT (NO OWNER/COMPANY INSERT HERE)

import React, { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface SignupData {
  fullName: string;
  phone?: string;
  companyName: string;
  gstNo?: string;
  address?: string;
}

interface AuthContextType {
  user: any;
  company: any;
  loading: boolean;
  signup: (...args: any) => Promise<void>;
  login: (...args: any) => Promise<any>;
  logout: () => Promise<void>;
  setCompany: (data: any) => void;   // <-- ADD THIS
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);


  // Restore session on refresh
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user || null)
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  // -------------------------
  // SIGNUP ONLY (NO INSERT)
  // -------------------------
  const signup = async (email: string, password: string, data: SignupData) => {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data }
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    alert("Please verify your email before logging in.");
    setLoading(false);
    navigate("/login");
  };

  // -------------------------
  // LOGIN ONLY (NO INSERT)
  // -------------------------
  const login = async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    setUser(data.user);
    setLoading(false);
    return data.user; // return user info to Login page logic
  };

  // -------------------------
  // LOGOUT
  // -------------------------
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout,setCompany }}>
      {children}
    </AuthContext.Provider>
  );
};
