import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { ClientStatusEnum } from "@/lib/generated/prisma/enums";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      clientName,
      phoneNumber,
      activeAccountId,
      serviceId,
      profileName,
      profilePIN,
      status,
    } = body ?? {};

    if (!clientName || typeof clientName !== "string") {
      return NextResponse.json(
        { message: "clientName is required" },
        { status: 400 },
      );
    }

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json(
        { message: "phoneNumber is required" },
        { status: 400 },
      );
    }

    if (!activeAccountId || typeof activeAccountId !== "string") {
      return NextResponse.json(
        { message: "activeAccountId is required" },
        { status: 400 },
      );
    }

    if (!serviceId || typeof serviceId !== "string") {
      return NextResponse.json(
        { message: "serviceId is required" },
        { status: 400 },
      );
    }

    if (!profileName || typeof profileName !== "string") {
      return NextResponse.json(
        { message: "profileName is required" },
        { status: 400 },
      );
    }

    if (
      profilePIN === undefined ||
      profilePIN === null ||
      typeof profilePIN !== "number"
    ) {
      return NextResponse.json(
        { message: "profilePIN is required and must be a number" },
        { status: 400 },
      );
    }

    const validStatuses = Object.values(ClientStatusEnum);
    if (
      !status ||
      typeof status !== "string" ||
      !validStatuses.includes(status as ClientStatusEnum)
    ) {
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

    // If the client provided an expirationDate use it, otherwise fall back to the
    // active account's expirationDate (or null).
    const providedExpiration =
      body.expirationDate && typeof body.expirationDate === "string"
        ? new Date(body.expirationDate)
        : null;

    const created = await prisma.clientStatus.create({
      data: {
        clientName,
        phoneNumber,
        activeAccountId,
        serviceId,
        profileName,
        profilePIN,
        expirationDate:
          providedExpiration ?? accountExists.expirationDate ?? null,
        status: status as ClientStatusEnum,
      },
    });

    return NextResponse.json(created, { status: 201 });
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
    await prisma.clientStatus.updateMany({
      where: {
        expirationDate: { lt: new Date() },
        status: { not: "EXPIRED" },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const items = await prisma.clientStatus.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        activeAccount: {
          select: { id: true, email: true, expirationDate: true },
        },
        service: { select: { id: true, serviceName: true } },
      },
    });

    // Map enum values to a more friendly string if desired
    const mapped = items.map((it) => ({
      ...it,
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
