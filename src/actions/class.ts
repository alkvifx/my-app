"use server";

import { prisma } from "@/lib/prisma";

export async function getClasses() {
  return prisma.class.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createClass(name: string, defaultFee: number) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error("Class name is required");
  }

  if (!Number.isFinite(defaultFee) || defaultFee <= 0) {
    throw new Error("Default fee must be a positive number");
  }

  const existing = await prisma.class.findUnique({
    where: { name: normalizedName },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Class name must be unique");
  }

  const created = await prisma.class.create({
    data: {
      name: normalizedName,
      defaultFee,
    },
  });

  return created;
}

export async function deleteClass(id: string) {
  const classWithStudents = await prisma.class.findUnique({
    where: { id },
    select: { id: true, students: { select: { id: true } } },
  });

  if (!classWithStudents) {
    return;
  }

  if (classWithStudents.students.length > 0) {
    throw new Error("Cannot delete a class that has students");
  }

  await prisma.class.delete({ where: { id } });
}

