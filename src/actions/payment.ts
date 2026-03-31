"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

type CreatePaymentInput = {
  studentId: string;
  amount: number;
};

export async function addPayment(input: CreatePaymentInput) {
  if (input.amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const payment = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.payment.create({
      data: {
        studentId: input.studentId,
        amount: input.amount,
      },
    });

    await tx.student.update({
      where: { id: input.studentId },
      data: {
        paidAmount: student.paidAmount + input.amount,
      },
    });

    return createdPayment;
  });

  revalidatePath("/students");
  revalidatePath(`/students/${input.studentId}`);

  return payment;
}

export async function getPaymentsForStudent(studentId: string) {
  return prisma.payment.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
}

