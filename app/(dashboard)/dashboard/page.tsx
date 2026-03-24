import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ServicesSection from "@/components/ServicesSection";
import ActiveAccountsSection from "@/components/ActiveAccountsSection";
import { fetchP2PPrice } from "@/lib/binance";
import BinancePriceCard from "@/components/BinancePriceCard";
import TotalRevenueCard from "@/components/TotalRevenueCard";
import BankEarningsCard from "@/components/BankEarningsCard";
import ClientStatusTable from "@/components/ClientStatusTable";
import { BinancePriceProvider } from "@/context/BinancePriceContext";

export default async function ResetPasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  let price = null;
  try {
    price = await fetchP2PPrice();
  } catch (err) {
    console.error("Error fetching P2P price:", err);
  }

  // console.log("P2P USDT Price in VES:", price);

  return (
    <BinancePriceProvider price={price}>
      <div className="mx-10 grid grid-cols-4 gap-4 pb-10 max-sm:mx-4 max-sm:grid-cols-1 max-sm:gap-x-0 max-sm:gap-y-4">
        <div className="col-span-4 flex gap-4 max-sm:col-span-1 max-sm:flex-col sm:items-start">
          <BinancePriceCard price={price} />
        </div>
        {/* <TotalRevenueCard /> */}
        <BankEarningsCard />
        <div className="col-span-2"></div>
        <ServicesSection />
        <ActiveAccountsSection />
        <ClientStatusTable />
      </div>
    </BinancePriceProvider>
  );
}
