import { BrandMark } from "@/components/shared/BrandMark";
import { PasswordRecoveryForm } from "@/features/auth/components/PasswordRecoveryForm";

export function PasswordRecoveryView() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6 shadow-soft">
        <div className="mb-6">
          <BrandMark className="mb-4" />
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">Password Recovery</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your account email to receive a password recovery link.
          </p>
        </div>
        <PasswordRecoveryForm />
      </div>
    </main>
  );
}
