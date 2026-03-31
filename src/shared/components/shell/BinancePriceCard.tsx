import type { BinancePriceCardProps } from "@/shared/types/binancePrice";

export default function BinancePriceCard({ price }: BinancePriceCardProps) {
  return (
    <div className="flex w-fit items-start gap-1 rounded-full bg-black px-4 py-1 text-yellow-300">
      {/* <h2 className="text-md font-bold">Precio USDT:</h2> */}
      {price !== null ? (
        <p className="text-md font-bold">Precio USDT: {price.toFixed(2)} Bs</p>
      ) : (
        <p className="text-red-500">Precio no accesible</p>
      )}
    </div>
  );
}
