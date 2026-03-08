export type ScreenProps = {
  id: string;
  profileName: string;
  profilePIN: number;
  activeAccountId: string;
  activeAccount?: { id: string; email: string } | null;
};
