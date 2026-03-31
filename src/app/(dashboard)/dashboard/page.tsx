import { getDashboardStats } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of student and fee statistics.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value={String(stats.totalStudents)} />
        <StatCard
          title="Total Fees Collected"
          value={stats.totalFeesCollected.toFixed(2)}
        />
        <StatCard
          title="Total Pending Fees"
          value={stats.totalPendingFees.toFixed(2)}
        />
        <StatCard
          title="Today's Collection"
          value={stats.todaysCollection.toFixed(2)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Top Defaulters</span>
              <Badge variant="outline" className="text-xs font-normal">
                Highest remaining fees
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topDefaulters.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Great news! No pending fees at the moment.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topDefaulters.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.className}</TableCell>
                      <TableCell className="text-right">
                        {s.remaining.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Activity from payments, new students, and new classes will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.createdAt.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
