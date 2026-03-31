"use server";

import { prisma } from "@/lib/prisma";

export async function getReceiptByPaymentId(paymentId: string) {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      student: true,
    },
  });
}

