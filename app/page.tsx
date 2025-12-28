import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Services CRM</h1>
      <div className="mt-8 flex gap-4">
        <Button asChild size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signin">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}
