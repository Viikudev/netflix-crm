import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const json = await req.json();

    const result = await prisma.screen.update({
      where: { id },
      data: {
        profileName: json.profileName,
        profilePIN: json.profilePIN,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Error updating screen" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.screen.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Screen deleted" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Error deleting screen" },
      { status: 500 },
    );
  }
}
