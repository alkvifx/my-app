"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addPayment } from "@/actions/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  studentId: string;
  studentName: string;
  remaining: number;
};

export default function StudentsQuickPayClient({
  studentId,
  studentName,
  remaining,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<{ amount: number }>({
    defaultValues: {
      amount: remaining > 0 ? Number(remaining.toFixed(2)) : 0,
    },
  });

  function onSubmit(values: { amount: number }) {
    startTransition(async () => {
      try {
        await addPayment({
          studentId,
          amount: values.amount,
        });
        toast.success("Payment added successfully.");
      } catch (error) {
        console.error(error);
        toast.error("Failed to add payment. Please try again.");
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Quick Pay
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Pay</DialogTitle>
          <DialogDescription>
            Record a quick payment for <span className="font-medium">{studentName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Remaining Fee</span>
              <span className="font-semibold">{remaining.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quick-amount">Amount</Label>
            <Input
              id="quick-amount"
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Processing..." : "Submit Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

