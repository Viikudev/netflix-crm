import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ServicesSection from "@/components/ServicesSection";
import ActiveAccountsSection from "@/components/ActiveAccountsSection";
import BankEarningsCard from "@/components/BankEarningsCard";
import ClientStatusTable from "@/components/ClientStatusTable";
import ClientsTable from "@/components/ClientsTable";
import WithdrawalsTable from "@/components/WithdrawalsTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="mx-10 pb-10 max-sm:mx-4">
      <Tabs defaultValue="panel-principal" className="w-full gap-4">
        <TabsList
          variant="line"
          className="w-full justify-start gap-0 rounded-none px-0"
        >
          <TabsTrigger value="panel-principal" className="px-4">
            Panel Principal
          </TabsTrigger>
          <TabsTrigger value="clientes" className="px-4">
            Clientes
          </TabsTrigger>
          <TabsTrigger value="retiros" className="px-4">
            Retiros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="panel-principal">
          <div className="grid grid-cols-4 gap-4 max-sm:grid-cols-1 max-sm:gap-x-0 max-sm:gap-y-4">
            <div className="col-span-4 flex gap-4 max-sm:col-span-1 max-sm:flex-col sm:items-start"></div>
            <BankEarningsCard />
            <div className="col-span-2 max-sm:hidden"></div>
            <ServicesSection />
            <ActiveAccountsSection />
            <ClientStatusTable />
          </div>
        </TabsContent>

        <TabsContent value="clientes">
          <ClientsTable />
        </TabsContent>

        <TabsContent value="retiros">
          <WithdrawalsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
