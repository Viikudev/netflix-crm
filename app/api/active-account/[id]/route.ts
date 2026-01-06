import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { createActiveAccountSchema } from "@/lib/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Allow partial updates
    const parsed = createActiveAccountSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const dataToUpdate = {
      ...parsed.data,
      ...(parsed.data.expirationDate && {
        expirationDate: new Date(parsed.data.expirationDate),
      }),
    };

    const updatedAccount = await prisma.activeAccount.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Error updating active account:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await prisma.activeAccount.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Active account deleted" });
  } catch (error) {
    console.error("Error deleting active account:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
