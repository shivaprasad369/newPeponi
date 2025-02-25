"use client";

import { ReactNode } from "react";
import useTokenVerification from "@/hooks/use-TokenVerification";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isVerified, isLoading, error } = useTokenVerification();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isVerified) {
    // If not verified, navigate to login
    router.replace("/login");
    return null; // Prevent rendering anything after navigation
  }

  return <>{children}</>; // Render children if verified
};

export default AuthWrapper;
