import axiosInstance from "@/shared/lib/axiosInstance";
import { BankEarnings } from "@/features/bank-funds/types/bankEarnings";

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

export type BankWithdrawal = {
  id: string;
  currency: WithdrawCurrency;
  amount: number;
  reason: string;
  createdAt: string;
};

export async function withdrawFunds(data: WithdrawFundsPayload) {
  const response = await axiosInstance.post("/bank-earnings/withdraw", data);
  return response.data;
}

export async function fetchWithdrawals(): Promise<BankWithdrawal[]> {
  const response = await axiosInstance.get("/bank-earnings/withdrawals");
  return response.data;
}
