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

    const updatedClientStatus = await prisma.clientStatus.update({
      where: { id },
      data: dataToUpdate,
    });

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
