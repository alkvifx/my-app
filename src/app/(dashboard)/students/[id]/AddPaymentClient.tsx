"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addPayment } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  studentId: string;
  remaining: number;
};

export default function AddPaymentClient({ studentId, remaining }: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<{ amount: number }>({
    defaultValues: { amount: 0 },
  });

  function onSubmit(values: { amount: number }) {
    startTransition(async () => {
      try {
        await addPayment({
          studentId,
          amount: values.amount,
        });
        toast.success("Payment added successfully.");
        form.reset({ amount: 0 });
      } catch (error) {
        console.error(error);
        toast.error("Failed to add payment. Please try again.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Add Payment</CardTitle>
        <CardDescription>
          Record a new payment for this student.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Remaining</Label>
            <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 py-1 text-sm">
              {remaining.toFixed(2)}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Processing..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

