import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ServicesSection from "@/components/ServicesSection";
import ActiveAccountsSection from "@/components/ActiveAccountsSection";
import { fetchP2PPrice } from "@/lib/binance";
import BinancePriceCard from "@/components/BinancePriceCard";
import ClientStatusTable from "@/components/ClientStatusTable";

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
    <div className="mx-10 grid grid-cols-2 gap-4 max-sm:mx-4 max-sm:grid-cols-1">
      <div className="col-span-2 max-sm:col-span-1 sm:place-items-end">
        <BinancePriceCard price={price} />
      </div>
      <ServicesSection />
      <ActiveAccountsSection />
      <ClientStatusTable />
    </div>
  );
}
