import { useState } from "react";
import { Compass } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { isSupabaseConfigured } from "@/lib/supabase";

export function Login() {
  const { signIn, signUp, mode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) await signUp(email, password, name);
      else await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Compass className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-2 text-2xl">{APP_NAME}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Premium job application tracker
          </p>
          {!isSupabaseConfigured && (
            <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              Demo mode: any email/password works. Add Supabase keys in .env for cloud sync.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                required
                minLength={mode === "supabase" ? 6 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : isSignUp ? "Create account" : "Sign in"}
            </Button>
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
