import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServiceSchema } from "@/lib/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Allow partial updates by using partial()
    const parsed = createServiceSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const dataToUpdate = { ...parsed.data };

    // If price is provided, convert to cents
    if (dataToUpdate.price !== undefined) {
      dataToUpdate.price = Math.round(dataToUpdate.price * 100);
    }

    const service = await prisma.service.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
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

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
