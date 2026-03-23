import axiosInstance from "@/lib/axiosInstance";
import { BankEarnings } from "@/types/bankEarnings";

export async function fetchBankEarnings(): Promise<BankEarnings> {
  const response = await axiosInstance.get("/bank-earnings");
  return response.data;
}

export type ConvertCurrencyPayload = {
  amountBs: number;
  rate: number;
};

export async function convertCurrency(data: ConvertCurrencyPayload) {
  const response = await axiosInstance.post("/bank-earnings/convert", data);
  return response.data;
}

export type WithdrawCurrency = "BS" | "USDT";

export type WithdrawFundsPayload = {
  currency: WithdrawCurrency;
  amount: number;
  reason: string;
};

export async function withdrawFunds(data: WithdrawFundsPayload) {
  const response = await axiosInstance.post("/bank-earnings/withdraw", data);
  return response.data;
}
