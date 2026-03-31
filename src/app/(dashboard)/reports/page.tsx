import Link from "next/link";

import { getPaymentsReportByDate } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PrintReportButton } from "./PrintReportButton";

type Props = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const report = await getPaymentsReportByDate(date);
  const dateValue = report.selectedDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Daily payment report by selected date.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Filter By Date</CardTitle>
          <PrintReportButton />
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-64">
              <label className="mb-1 block text-sm text-muted-foreground">
                Date
              </label>
              <Input type="date" name="date" defaultValue={dateValue} />
            </div>
            <button
              type="submit"
              className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Apply
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Total Collection</div>
          <div className="text-2xl font-bold">
            {report.totalCollection.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {report.payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payments found for this date.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.student.name}</TableCell>
                    <TableCell>{payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{payment.createdAt.toLocaleString()}</TableCell>
                    <TableCell>
                      <Link
                        href={`/receipt/${payment.id}`}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        View Receipt
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
