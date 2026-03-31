import Link from "next/link";
import { Suspense } from "react";

import { getStudents } from "@/actions/student";
import { getClasses } from "@/actions/class";
import { calculateRemainingFee } from "@/lib/fee";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import StudentsQuickPayClient from "./StudentsQuickPayClient";

type Props = {
  searchParams: Promise<{
    q?: string;
    classId?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function StudentsPage({ searchParams }: Props) {
  const { q, classId } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage students and their fee status.
          </p>
        </div>
        <Button asChild>
          <Link href="/students/add">Add Student</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">
            Student List
          </CardTitle>
          <StudentsSearch initialQuery={q} initialClassId={classId} />
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-sm text-muted-foreground">Loading students…</div>}>
            <StudentsTable query={q} classId={classId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function StudentsSearch({
  initialQuery,
  initialClassId,
}: {
  initialQuery?: string;
  initialClassId?: string;
}) {
  const classes = await getClasses();

  return (
    <form className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <div className="w-full sm:w-64">
        <Input
          type="search"
          name="q"
          defaultValue={initialQuery ?? ""}
          placeholder="Search by student name"
          className="h-9"
        />
      </div>
      <div className="w-full sm:w-48">
        <Select name="classId" defaultValue={initialClassId ?? ""} className="h-9">
          <option value="">All classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="outline" className="h-9 px-4">
        Apply
      </Button>
    </form>
  );
}

async function StudentsTable({
  query,
  classId,
}: {
  query?: string;
  classId?: string;
}) {
  const students = await getStudents();

  const normalizedQuery = query?.trim().toLowerCase() ?? "";
  const filtered = students.filter((s) => {
    const matchesQuery = normalizedQuery
      ? s.name.toLowerCase().includes(normalizedQuery)
      : true;
    const matchesClass = classId ? s.classId === classId : true;
    return matchesQuery && matchesClass;
  });

  if (!filtered.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center">
        <p className="text-sm font-medium">No students match your criteria.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search or filter, or add a new student to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="text-right">Final Fee</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead className="text-right">Remaining</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((s) => {
          const remaining = calculateRemainingFee(s.finalFee, s.paidAmount);

          return (
            <TableRow key={s.id}>
              <TableCell>
                <Link
                  href={`/students/${s.id}`}
                  className="font-medium hover:underline"
                >
                  {s.name}
                </Link>
              </TableCell>
              <TableCell>{s.class?.name ?? "-"}</TableCell>
              <TableCell>{s.phone}</TableCell>
              <TableCell className="text-right">
                {s.finalFee.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {s.paidAmount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {remaining <= 0 ? (
                  <Badge variant="success">Paid</Badge>
                ) : (
                  <span className="font-semibold text-destructive">
                    {remaining.toFixed(2)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <StudentsQuickPayClient
                  studentId={s.id}
                  remaining={remaining}
                  studentName={s.name}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}


