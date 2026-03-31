"use server";

import { prisma } from "@/lib/prisma";

export async function getPaymentsReportByDate(date?: string) {
  const baseDate = date ? new Date(date) : new Date();
  const selectedDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  );
  const nextDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate() + 1,
  );

  const payments = await prisma.payment.findMany({
    where: {
      createdAt: {
        gte: selectedDate,
        lt: nextDate,
      },
    },
    include: {
      student: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCollection = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    selectedDate,
    totalCollection,
    payments,
  };
}

