"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [totalStudents, paymentAgg, students, recentPayments, recentStudents, recentClasses] =
    await Promise.all([
    prisma.student.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    prisma.student.findMany({
      select: {
          id: true,
          name: true,
          class: {
            select: {
              name: true,
            },
          },
        finalFee: true,
        paidAmount: true,
      },
    }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: { name: true },
          },
        },
      }),
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.class.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
  ]);

  const totalFeesCollected = paymentAgg._sum.amount ?? 0;

  const totalPendingFees = students.reduce((sum, s) => {
    const remaining = s.finalFee - s.paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const todayAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const topDefaulters = students
    .map((s) => ({
      id: s.id,
      name: s.name,
      className: s.class?.name ?? "-",
      remaining: Math.max(s.finalFee - s.paidAmount, 0),
    }))
    .filter((s) => s.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining)
    .slice(0, 5);

  type ActivityItem = {
    id: string;
    label: string;
    createdAt: Date;
  };

  const activity: ActivityItem[] = [
    ...recentPayments.map((p) => ({
      id: `payment-${p.id}`,
      label: `${p.student.name} paid ${p.amount.toFixed(2)}`,
      createdAt: p.createdAt,
    })),
    ...recentStudents.map((s) => ({
      id: `student-${s.id}`,
      label: `${s.name} added as student`,
      createdAt: s.createdAt,
    })),
    ...recentClasses.map((c) => ({
      id: `class-${c.id}`,
      label: `${c.name} class created`,
      createdAt: c.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    totalStudents,
    totalFeesCollected,
    totalPendingFees,
    todaysCollection: todayAgg._sum.amount ?? 0,
    topDefaulters,
    recentActivity: activity.slice(0, 8),
  };
}

