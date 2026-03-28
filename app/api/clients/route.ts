import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClientSchema } from "@/lib/schemas";

function normalizePhoneNumber(phoneNumber: string) {
  return phoneNumber.trim();
}

function toClientResponse(client: {
  id: string;
  clientName: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { subscriptions: number };
}) {
  return {
    id: client.id,
    clientName: client.clientName,
    phoneNumber: client.phoneNumber,
    subscriptionCount: client._count.subscriptions,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      orderBy: [{ clientName: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json(clients.map(toClientResponse));
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.create({
      data: {
        clientName: parsed.data.clientName,
        phoneNumber: normalizePhoneNumber(parsed.data.phoneNumber),
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json(toClientResponse(client), { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Ya existe un cliente con ese numero de telefono" },
        { status: 409 },
      );
    }

    console.error("Error creating client:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
