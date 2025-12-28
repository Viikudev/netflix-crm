import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, expirationDate } = body ?? {};

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 },
      );
    }

    if (!expirationDate || typeof expirationDate !== "string") {
      return NextResponse.json(
        { message: "expirationDate is required (ISO string)" },
        { status: 400 },
      );
    }

    const exp = new Date(expirationDate);
    if (isNaN(exp.getTime())) {
      return NextResponse.json(
        { message: "Invalid expirationDate" },
        { status: 400 },
      );
    }

    const created = await prisma.activeAccount.create({
      data: {
        email,
        password,
        expirationDate: exp,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        email: created.email,
        expirationDate: created.expirationDate,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ err: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const accounts = await prisma.activeAccount.findMany({
      select: { id: true, email: true, password: true, expirationDate: true },
    });
    return NextResponse.json(accounts, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
