import { notFound } from "next/navigation";

import { getReceiptByPaymentId } from "@/actions/receipt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PrintButton from "./PrintButton";

type Props = {
  params: Promise<{
    paymentId: string;
  }>;
};

export default async function ReceiptPage({ params }: Props) {
  const { paymentId } = await params;
  const payment = await getReceiptByPaymentId(paymentId);

  if (!payment) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-8">
      <div className="flex justify-end">
        <PrintButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Springfield Public School</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-2 border-b pb-2">
            <span className="text-muted-foreground">Receipt ID</span>
            <span className="font-medium">{payment.id}</span>
          </div>
          <div className="flex justify-between gap-2 border-b pb-2">
            <span className="text-muted-foreground">Student Name</span>
            <span className="font-medium">{payment.student.name}</span>
          </div>
          <div className="flex justify-between gap-2 border-b pb-2">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium">{payment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{payment.createdAt.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

