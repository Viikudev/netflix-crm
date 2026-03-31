export type BankEarnings = {
  total: number;
  totalUsdt: number;
};

export type ConvertCurrencyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};
