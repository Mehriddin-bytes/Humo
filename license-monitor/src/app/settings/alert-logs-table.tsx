import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AlertLog {
  id: string;
  alertType: string;
  alertLevel: string;
  sentAt: Date;
  success: boolean;
  error: string | null;
  license: {
    licenseType: { name: string };
    worker: { firstName: string; lastName: string };
  };
}

interface AlertLogsTableProps {
  logs: AlertLog[];
}

export function AlertLogsTable({ logs }: AlertLogsTableProps) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>No alerts have been sent yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert History</CardTitle>
        <CardDescription>Recent notification activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Worker</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">
                  {format(new Date(log.sentAt), "MMM d, HH:mm")}
                </TableCell>
                <TableCell className="text-sm">
                  {log.license.worker.firstName} {log.license.worker.lastName}
                </TableCell>
                <TableCell className="text-sm">
                  {log.license.licenseType.name}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {log.alertType.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{log.alertLevel}</TableCell>
                <TableCell>
                  {log.success ? (
                    <Badge variant="success">Sent</Badge>
                  ) : (
                    <Badge variant="destructive" title={log.error || undefined}>
                      Failed
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
