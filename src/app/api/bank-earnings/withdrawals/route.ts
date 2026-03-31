import prisma from "@/shared/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const withdrawals = await prisma.bankWithdrawal.findMany({
      select: {
        id: true,
        currency: true,
        amount: true,
        reason: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(withdrawals, { status: 200 });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
