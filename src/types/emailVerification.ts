export type EmailVerificationWindowProps = {
  email?: string;
  onResend?: () => void | Promise<void>;
  onClose?: () => void;
  className?: string;
};
