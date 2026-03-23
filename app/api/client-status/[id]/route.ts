import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { createClientStatusSchema } from "@/lib/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Allow partial updates
    const parsed = createClientStatusSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const dataToUpdate: any = { ...parsed.data };

    // Handle expirationDate
    if (dataToUpdate.expirationDate) {
      dataToUpdate.expirationDate = new Date(dataToUpdate.expirationDate);
    }

    const amount =
      typeof dataToUpdate.amount === "number" ? dataToUpdate.amount : 0;
    const isRenewal = dataToUpdate.status === "ACTIVE" && amount > 0;

    const [updatedClientStatus] = await prisma.$transaction([
      prisma.clientStatus.update({
        where: { id },
        data: dataToUpdate,
      }),
      prisma.bankEarnings.upsert({
        where: { id: 1 },
        update: {
          total: {
            increment: isRenewal ? amount : 0,
          },
        },
        create: {
          id: 1,
          total: isRenewal ? amount : 0,
        },
      }),
    ]);

    return NextResponse.json(updatedClientStatus);
  } catch (error) {
    console.error("Error updating client status:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.clientStatus.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client status deleted" });
  } catch (error) {
    console.error("Error deleting client status:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
