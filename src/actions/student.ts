"use server";

import { revalidatePath } from "next/cache";

import { calculateFinalFee } from "@/lib/fee";
import { prisma } from "@/lib/prisma";

type CreateStudentInput = {
  name: string;
  fatherName: string;
  phone: string;
  address: string;
  classId: string;
  totalFee: number;
  discount: number;
};

type UpdateStudentInput = Partial<CreateStudentInput>;

export async function getStudents() {
  return prisma.student.findMany({
    include: {
      class: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentById(id?: string) {
  if (!id) {
    return null;
  }

  return prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
    },
  });
}

async function generateNextStudentId() {
  const last = await prisma.student.findFirst({
    orderBy: { createdAt: "desc" },
    select: { studentId: true },
  });

  if (!last?.studentId?.startsWith("STU")) {
    return "STU001";
  }

  const numeric = parseInt(last.studentId.slice(3), 10);
  const nextNumber = Number.isNaN(numeric) ? 1 : numeric + 1;
  return `STU${nextNumber.toString().padStart(3, "0")}`;
}

export async function createStudent(input: CreateStudentInput) {
  const studentId = await generateNextStudentId();

  const finalFee = calculateFinalFee(input.totalFee, input.discount);
  const paidAmount = 0;

  const student = await prisma.student.create({
    data: {
      studentId,
      name: input.name,
      fatherName: input.fatherName,
      phone: input.phone,
      address: input.address,
      classId: input.classId,
      totalFee: input.totalFee,
      discount: input.discount,
      finalFee,
      paidAmount,
    },
  });

  revalidatePath("/students");
  return student;
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Student not found");
  }

  const totalFee = input.totalFee ?? existing.totalFee;
  const discount = input.discount ?? existing.discount;
  const finalFee = calculateFinalFee(totalFee, discount);

  const updated = await prisma.student.update({
    where: { id },
    data: {
      ...input,
      totalFee,
      discount,
      finalFee,
    },
  });

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  return updated;
}

export async function deleteStudent(id: string) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({ where: { studentId: id } });
    await tx.student.delete({ where: { id } });
  });
  revalidatePath("/students");
}

