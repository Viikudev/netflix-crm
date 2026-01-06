type BinancePriceCardProps = {
  price: number | null;
};

export default async function BinancePriceCard({
  price,
}: BinancePriceCardProps) {
  return (
    <div className="flex w-fit items-start gap-1 rounded-full border-3 border-black bg-yellow-300 px-4 py-1 text-black">
      <h2 className="text-md font-normal">Precio USDT:</h2>
      {price !== null ? (
        <p className="text-md font-bold">{price.toFixed(2)} Bs</p>
      ) : (
        <p className="text-red-500">Precio no accesible</p>
      )}
    </div>
  );
}
