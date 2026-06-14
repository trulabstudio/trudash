import { ClientDetailView } from "@/views/ClientDetailView";

type ClientDetailPageProps = {
  params: Promise<{
    "client-id": string;
  }>;
};

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const clientId = (await params)["client-id"];

  return <ClientDetailView clientId={clientId} />;
}
