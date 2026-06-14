import { LoginView } from "@/views/LoginView";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  return <LoginView redirectTo={(await searchParams).redirectTo ?? "/dashboard"} />;
}
