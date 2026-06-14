import { BrandMark } from "@/components/shared/BrandMark";
import { LoginForm } from "@/features/auth/components/LoginForm";

type LoginViewProps = {
  redirectTo: string;
};

export function LoginView({ redirectTo }: LoginViewProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6 shadow-soft">
        <div className="mb-6">
          <BrandMark className="mb-4" />
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">Login</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Access the client project portal with your team or client account.
          </p>
        </div>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </main>
  );
}
