import { ReactQueryProvider } from "@/app/provider";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </div>
  );
}
