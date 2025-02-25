"use client";
import "../globals.css"
import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Icons } from "@/components/icons";
import { Loader2 } from "lucide-react";
import axios from "axios";
import useTokenVerification from "@/hooks/use-TokenVerification";
const Icons = {
    spinner: Loader2,
};

export default function LoginPage() {
    const router = useRouter();
    const { isVerified, isLoading:loading, error } = useTokenVerification()
    const nameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    if (loading) {
        return <div>Loading...</div>
    }
    if (isVerified) {
        router.push("/dashboard");
    }
    
    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
                username,
                password
            });
            console.log('Login response:', response);
            if (response.status === 200) {
                localStorage.setItem('AdminToken', response.data.token);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };
    async function onSubmit(event: React.FormEvent) {
      event.preventDefault();
      setIsLoading(true);

      const username = nameRef.current?.value || '';
      const password = passwordRef.current?.value || '';

      const success = await login(username, password);
      if (success) {
        // Show loading state during redirect
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'fixed inset-0 bg-background flex items-center justify-center z-50';
        loadingDiv.innerHTML = `
          <div class="text-center">
            <div class="animate-spin h-8 w-8 mb-4 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p>Logging in...</p>
          </div>
        `;
        document.body.appendChild(loadingDiv);
        
        router.push("/dashboard");
      } else {
        // Handle login failure
        alert("Login failed. Please check your credentials.");
        setIsLoading(false);
      }
    }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Image className="mb-5 rounded overflow-hidden" src="logos1.png" alt="Peponi"  width={150} height={100} />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Superadmin Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="text"
                ref={nameRef}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                ref={passwordRef}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex items-end justify-end text-md">
              <div onClick={()=>router.push('/forgot')} className="flex cursor-pointer text-blue-500  tracking-wide">Forgot password?</div>
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
