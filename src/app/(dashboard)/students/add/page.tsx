"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { getClasses } from "@/actions/class";
import { createStudent } from "@/actions/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { calculateFinalFee } from "@/lib/fee";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  classId: z.string().min(1, "Class is required"),
  totalFee: z.number().min(0, "Total fee must be positive"),
  discount: z.number().min(0).max(100, "Discount cannot exceed 100"),
});

type FormValues = z.infer<typeof schema>;
type ClassItem = Awaited<ReturnType<typeof getClasses>>[number];

export default function AddStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [isPending, startTransition] = useTransition();
  const hasClasses = classes.length > 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      fatherName: "",
      phone: "",
      address: "",
      classId: "",
      totalFee: 0,
      discount: 0,
    },
  });

  useEffect(() => {
    let isMounted = true;

    getClasses()
      .then((data) => {
        if (isMounted) setClasses(data);
      })
      .finally(() => {
        if (isMounted) setLoadingClasses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalFee = form.watch("totalFee") || 0;
  const discount = form.watch("discount") || 0;
  const finalFee = calculateFinalFee(totalFee, discount);

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await createStudent(values);
        toast.success("Student added successfully.");
        router.push("/students");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Failed to add student. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add Student</h1>
        <p className="text-sm text-muted-foreground">
          Create a new student and assign them to a class.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fatherName">Father Name</Label>
                <Input id="fatherName" {...form.register("fatherName")} />
                {form.formState.errors.fatherName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fatherName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...form.register("phone")} />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="classId">Class</Label>
                {!loadingClasses && !hasClasses ? (
                  <p className="text-sm font-medium text-destructive">
                    Please create a class first
                  </p>
                ) : (
                  <Select
                    id="classId"
                    {...form.register("classId")}
                    disabled={!hasClasses}
                  >
                    <option value="">Select class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                )}
                {form.formState.errors.classId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.classId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register("address")} />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="totalFee">Total Fee</Label>
                <Input
                  id="totalFee"
                  type="number"
                  step="0.01"
                  {...form.register("totalFee", { valueAsNumber: true })}
                />
                {form.formState.errors.totalFee && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.totalFee.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  {...form.register("discount", { valueAsNumber: true })}
                />
                {form.formState.errors.discount && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.discount.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Final Fee</Label>
                <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 py-1 text-sm">
                  {finalFee.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.push("/students")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || loadingClasses || !hasClasses}
              >
                {isPending ? "Processing..." : "Create Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

