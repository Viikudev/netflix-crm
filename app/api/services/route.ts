import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServiceSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = createServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // forward headers so auth can read cookies
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { serviceName, price, imageUrl, description, currency } = parsed.data;
    const priceCents = Math.round(price * 100);

    const service = await prisma.service.create({
      data: {
        serviceName,
        price: priceCents,
        imageUrl: imageUrl ?? null,
        description: description ?? null,
        currency: currency ?? "USD",
        createdById: session.user.id,
      },
    });

    return NextResponse.json(service);
  } catch {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      // orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
