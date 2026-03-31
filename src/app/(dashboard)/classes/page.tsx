"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { createClass, deleteClass, getClasses } from "@/actions/class";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string().min(1, "Class name is required"),
  defaultFee: z.number().positive("Default fee must be positive"),
});

type FormValues = z.infer<typeof schema>;
type ClassItem = Awaited<ReturnType<typeof getClasses>>[number];

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = () => {
    setLoading(true);
    getClasses()
      .then((data) => setClasses(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const hasClasses = useMemo(() => classes.length > 0, [classes.length]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      defaultFee: 0,
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await createClass(values.name, values.defaultFee);
        toast.success("Class added successfully.");
        form.reset({ name: "", defaultFee: 0 });
        refresh();
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to add class.");
      }
    });
  }

  function onDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteClass(id);
        toast.success("Class deleted successfully.");
        refresh();
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to delete class.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Classes</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage classes for student assignment.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Add Class</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Class Name</Label>
                <Input id="name" {...form.register("name")} placeholder="C1, C2..." />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="defaultFee">Default Fee</Label>
                <Input
                  id="defaultFee"
                  type="number"
                  step="0.01"
                  {...form.register("defaultFee", { valueAsNumber: true })}
                />
                {form.formState.errors.defaultFee && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.defaultFee.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isPending}>
                {isPending ? "Processing..." : "Add Class"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Class List</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && !hasClasses ? (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center">
                <p className="text-sm font-medium">
                  No classes created yet.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first class to start assigning students.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Default Fee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-right">
                        {c.defaultFee.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              disabled={isPending}
                            >
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Delete class</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this class? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => onDelete(c.id)}
                              >
                                Confirm delete
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

