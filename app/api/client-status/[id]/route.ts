import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { updateClientStatusSchema } from "@/lib/schemas";

function normalizePhoneNumber(phone: string) {
  return phone.trim();
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = updateClientStatusSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const subscriptionData: Record<string, unknown> = {
      clientId: parsed.data.clientId,
      activeAccountId: parsed.data.activeAccountId,
      serviceId: parsed.data.serviceId,
      screenId: parsed.data.screenId,
      status: parsed.data.status,
      amount: parsed.data.amount,
      expirationDate: parsed.data.expirationDate,
    };

    Object.keys(subscriptionData).forEach((key) => {
      if (subscriptionData[key] === undefined) {
        delete subscriptionData[key];
      }
    });

    const clientDataToUpdate: Record<string, string> = {};
    if (typeof parsed.data.clientName === "string") {
      clientDataToUpdate.clientName = parsed.data.clientName;
    }
    if (typeof parsed.data.phoneNumber === "string") {
      clientDataToUpdate.phoneNumber = normalizePhoneNumber(
        parsed.data.phoneNumber,
      );
    }

    if (typeof subscriptionData.expirationDate === "string") {
      subscriptionData.expirationDate = new Date(
        subscriptionData.expirationDate,
      );
    }

    const amount =
      typeof subscriptionData.amount === "number" ? subscriptionData.amount : 0;
    const isRenewal = subscriptionData.status === "ACTIVE" && amount > 0;

    const currentSubscription = await prisma.subscription.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        client: {
          select: {
            id: true,
            clientName: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { message: "Subscription not found" },
        { status: 404 },
      );
    }

    const normalizedPhone = clientDataToUpdate.phoneNumber;
    const targetClientName = clientDataToUpdate.clientName;

    if (typeof parsed.data.clientId === "string") {
      subscriptionData.client = {
        connect: {
          id: parsed.data.clientId,
        },
      };
    } else if (normalizedPhone) {
      const existingClient = await prisma.client.findUnique({
        where: { phoneNumber: normalizedPhone },
        select: { id: true },
      });

      if (
        existingClient &&
        existingClient.id !== currentSubscription.clientId
      ) {
        subscriptionData.client = {
          connect: {
            id: existingClient.id,
          },
        };

        if (targetClientName) {
          await prisma.client.update({
            where: { id: existingClient.id },
            data: { clientName: targetClientName },
          });
        }
      } else {
        subscriptionData.client = {
          update: {
            ...(targetClientName ? { clientName: targetClientName } : {}),
            phoneNumber: normalizedPhone,
          },
        };
      }
    } else if (targetClientName) {
      subscriptionData.client = {
        update: {
          clientName: targetClientName,
        },
      };
    }

    const [updatedClientStatus] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id },
        data: subscriptionData,
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
            increment: isRenewal ? amount : 0,
          },
        },
        create: {
          id: 1,
          total: isRenewal ? amount : 0,
        },
      }),
    ]);

    return NextResponse.json({
      ...updatedClientStatus,
      clientName: updatedClientStatus.client.clientName,
      phoneNumber: updatedClientStatus.client.phoneNumber,
    });
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

    await prisma.subscription.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client status deleted" });
  } catch (error) {
    console.error("Error deleting client status:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
