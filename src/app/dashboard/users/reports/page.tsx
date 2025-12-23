'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';

const reports = [
  {
    id: 'rep_001',
    reportedUser: 'Priya Singh',
    reportedBy: 'Karan Mishra',
    reason: 'Spam',
    content: 'Posted a review with a link to a scam website.',
    status: 'Pending',
  },
  {
    id: 'rep_002',
    reportedUser: 'Rohan Verma',
    reportedBy: 'Alia Sharma',
    reason: 'Abuse',
    content: 'User sent an inappropriate message via the chat feature.',
    status: 'Resolved',
  },
  {
    id: 'rep_003',
    reportedUser: 'John Doe',
    reportedBy: 'Jane Smith',
    reason: 'Safety Concern',
    content: 'User was providing false information about emergency services.',
    status: 'Pending',
  },
];

export default function UserReportsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Reports</h1>
        <p className="text-muted-foreground">
          Review and take action on reports filed by users.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Reports</CardTitle>
          <CardDescription>
            These reports require your immediate attention.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {reports.filter(r => r.status === 'Pending').map((report) => (
            <Card key={report.id} className="p-4">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">
                        Report against <Link href="/dashboard/users/usr_3" className="font-semibold underline">{report.reportedUser}</Link> by <Link href="/dashboard/users/usr_4" className="font-semibold underline">{report.reportedBy}</Link>
                    </p>
                    <p className="font-semibold mt-2">"{report.content}"</p>
                  </div>
                  <Badge variant="destructive" className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    {report.reason}
                  </Badge>
              </div>

               <CardFooter className="mt-4 flex justify-end gap-2 p-0">
                <Button variant="outline">
                  <X className="mr-2 h-4 w-4" /> Dismiss Report
                </Button>
                <Button>
                  <Check className="mr-2 h-4 w-4" /> Take Action
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
