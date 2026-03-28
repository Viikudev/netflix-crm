import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateClientSchema } from "@/lib/schemas";

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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dataToUpdate = {
      ...parsed.data,
      phoneNumber:
        parsed.data.phoneNumber !== undefined
          ? normalizePhoneNumber(parsed.data.phoneNumber)
          : undefined,
    };

    const client = await prisma.client.update({
      where: { id },
      data: dataToUpdate,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    return NextResponse.json(toClientResponse(client));
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

    console.error("Error updating client:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { message: "Client not found" },
        { status: 404 },
      );
    }

    if (client._count.subscriptions > 0) {
      return NextResponse.json(
        {
          message:
            "No se puede eliminar este cliente porque tiene suscripciones asociadas",
        },
        { status: 409 },
      );
    }

    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
