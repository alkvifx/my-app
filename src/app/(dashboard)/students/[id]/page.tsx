import { notFound } from "next/navigation";
import Link from "next/link";

import { getStudentById } from "@/actions/student";
import { getPaymentsForStudent } from "@/actions/payment";
import { calculateRemainingFee } from "@/lib/fee";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import AddPaymentClient from "./AddPaymentClient";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ id?: string }>;
};

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const remaining = calculateRemainingFee(student.finalFee, student.paidAmount);
  const payments = await getPaymentsForStudent(student.id);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{student.name}</h1>
        <p className="text-sm text-muted-foreground">
          Student ID: {student.studentId}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Personal Details
            </CardTitle>
            <CardDescription>Basic student information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Father Name:</span>{" "}
              <span>{student.fatherName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Class:</span>{" "}
              <span>{student.class?.name ?? "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>{" "}
              <span>{student.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Address:</span>{" "}
              <span>{student.address}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Created At:</span>{" "}
              <span>{student.createdAt.toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Fee Summary Card
            </CardTitle>
            <CardDescription>
              Overview of total, discounted, and remaining fees.{" "}
              <span className="font-medium text-foreground">
                All calculations are automatic.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total Fee</div>
                <div className="text-lg font-semibold">
                  {student.totalFee.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">
                  Discount (%)
                </div>
                <div className="text-lg font-semibold">
                  {student.discount.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Final Fee</div>
                <div className="text-lg font-semibold">
                  {student.finalFee.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Paid</div>
                <div className="text-lg font-semibold">
                  {student.paidAmount.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Remaining</div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {remaining.toFixed(2)}
                  </span>
                  {remaining <= 0 ? (
                    <Badge variant="success">Paid</Badge>
                  ) : (
                    <Badge variant="destructive">Due</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <PaymentsSection
        studentId={student.id}
        payments={payments}
        remaining={remaining}
      />
    </div>
  );
}

type PaymentsSectionProps = {
  studentId: string;
  payments: Awaited<ReturnType<typeof getPaymentsForStudent>>;
  remaining: number;
};

function PaymentsSection({ studentId, payments, remaining }: PaymentsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Add payment */}
      <div className="md:col-span-1">
        {/* Client component wrapper for form */}
        {/* eslint-disable-next-line @next/next/no-async-client-component */}
        {/* This small indirection keeps the page itself server-side */}
        {/* while the form logic runs on the client. */}
        {/* The client component is defined below. */}
        <AddPaymentClient studentId={studentId} remaining={remaining} />
      </div>

      {/* Payment history */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Payment History
          </CardTitle>
          <CardDescription>
            All recorded payments for this student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center">
              <p className="text-sm font-medium">
                No payments recorded yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                When you add payments, they will appear here with quick access to receipts.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 text-sm">
              {payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span>{p.createdAt.toLocaleString()}</span>
                    <Link
                      href={`/receipt/${p.id}`}
                      className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                      View Receipt
                    </Link>
                  </div>
                  <span className="font-medium">{p.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



