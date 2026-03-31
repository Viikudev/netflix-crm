"use client";

import React, { createContext, useContext } from "react";

type BinancePriceContextType = {
  price: number | null;
};

const BinancePriceContext = createContext<BinancePriceContextType>({
  price: null,
});

export const BinancePriceProvider = ({
  price,
  children,
}: {
  price: number | null;
  children: React.ReactNode;
}) => {
  return (
    <BinancePriceContext.Provider value={{ price }}>
      {children}
    </BinancePriceContext.Provider>
  );
};

export const useBinancePrice = () => {
  return useContext(BinancePriceContext);
};
