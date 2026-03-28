import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { ClientStatusEnum } from "@/lib/generated/prisma/enums";
import { createClientStatusRequestSchema } from "@/lib/schemas";

function normalizePhoneNumber(phone: string) {
  return phone.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createClientStatusRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const {
      clientId,
      clientName,
      phoneNumber,
      activeAccountId,
      serviceId,
      screenId,
      status,
      amount,
    } = parsed.data;

    const validStatuses = Object.values(ClientStatusEnum);
    if (!validStatuses.includes(status as ClientStatusEnum)) {
      return NextResponse.json(
        {
          message: `status is required and must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Optionally verify referenced records exist
    const accountExists = await prisma.activeAccount.findUnique({
      where: { id: activeAccountId },
    });
    if (!accountExists) {
      return NextResponse.json(
        { message: "activeAccount not found" },
        { status: 404 },
      );
    }

    const serviceExists = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!serviceExists) {
      return NextResponse.json(
        { message: "service not found" },
        { status: 404 },
      );
    }

    const screenExists = await prisma.screen.findUnique({
      where: { id: screenId },
    });
    if (!screenExists) {
      return NextResponse.json(
        { message: "screen not found" },
        { status: 404 },
      );
    }

    // If the client provided an expirationDate use it, otherwise fall back to the
    // active account's expirationDate (or null).
    const providedExpiration =
      body.expirationDate && typeof body.expirationDate === "string"
        ? new Date(body.expirationDate)
        : null;

    const actualAmount = typeof amount === "number" ? amount : null;
    let resolvedClientId = clientId;

    if (!resolvedClientId && phoneNumber && clientName) {
      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

      const client = await prisma.client.upsert({
        where: { phoneNumber: normalizedPhoneNumber },
        update: {
          clientName,
        },
        create: {
          clientName,
          phoneNumber: normalizedPhoneNumber,
        },
        select: {
          id: true,
        },
      });

      resolvedClientId = client.id;
    }

    if (!resolvedClientId) {
      return NextResponse.json(
        { message: "clientId is required" },
        { status: 400 },
      );
    }

    const clientExists = await prisma.client.findUnique({
      where: { id: resolvedClientId },
      select: {
        id: true,
      },
    });

    if (!clientExists) {
      return NextResponse.json(
        { message: "client not found" },
        { status: 404 },
      );
    }

    const [created] = await prisma.$transaction([
      prisma.subscription.create({
        data: {
          clientId: resolvedClientId,
          activeAccountId,
          serviceId,
          screenId,
          expirationDate:
            providedExpiration ?? accountExists.expirationDate ?? null,
          amount: actualAmount,
          status: status as ClientStatusEnum,
        },
        include: {
          client: {
            select: {
              id: true,
              clientName: true,
              phoneNumber: true,
            },
          },
        },
      }),
      prisma.bankEarnings.upsert({
        where: { id: 1 },
        update: {
          total: {
            increment: actualAmount ?? 0,
          },
        },
        create: {
          id: 1,
          total: actualAmount ?? 0,
        },
      }),
    ]);

    return NextResponse.json(
      {
        ...created,
        clientName: created.client.clientName,
        phoneNumber: created.client.phoneNumber,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Log error to server console for debugging
    console.error("/api/client-status POST error:", err);
    // In development return the error message to help debugging
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { message: (err as Error)?.message ?? String(err) },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Auto-expire records
    await prisma.subscription.updateMany({
      where: {
        expirationDate: { lt: new Date() },
        status: { not: "EXPIRED" },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const items = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, clientName: true, phoneNumber: true },
        },
        activeAccount: {
          select: { id: true, email: true, expirationDate: true },
        },
        service: {
          select: {
            id: true,
            serviceName: true,
            price: true,
            textColor: true,
            backgroundColor: true,
          },
        },
        screen: { select: { id: true, profileName: true, profilePIN: true } },
      },
    });

    // Map enum values to a more friendly string if desired
    const mapped = items.map((it) => ({
      ...it,
      clientName: it.client.clientName,
      phoneNumber: it.client.phoneNumber,
      status: it.status,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err: unknown) {
    console.error("/api/client-status GET error:", err);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { message: (err as Error)?.message ?? String(err) },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
