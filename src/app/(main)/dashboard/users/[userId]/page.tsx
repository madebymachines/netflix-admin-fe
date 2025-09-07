"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShieldBan, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// API Fetcher
const fetchUserDetails = async (userId: number) => {
  const response = await api.get(`/admin/users/${userId}/details`);
  return response.data.data;
};

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-center rounded-lg border bg-slate-50 p-3 dark:bg-slate-800/50">
    <p className="text-muted-foreground text-sm">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

export default function UserDetailPage() {
  const params = useParams();
  const userId = Number(params.userId);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["userDetails", userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[70vh] w-full" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <p className="text-destructive mt-4">Failed to load user details. The user may not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom Kiri: Profil & Stats */}
        <Card className="flex h-fit flex-col lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.profilePictureUrl || undefined} alt={user.name} />
              <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            {user.isBanned ? (
              <Badge variant="destructive" className="mt-2">
                <ShieldBan className="mr-1 h-3 w-3" /> Banned
              </Badge>
            ) : (
              <Badge variant="secondary">
                <ShieldCheck className="mr-1 h-3 w-3" /> Active
              </Badge>
            )}
            {user.isBanned && <p className="mt-1 text-xs text-red-500">Reason: {user.banReason}</p>}
          </CardContent>
          <Separator />
          <CardContent className="grid grid-cols-2 gap-2 p-4">
            <StatItem label="Total Points" value={user.stats?.totalPoints ?? 0} />
            <StatItem label="Total Challenges" value={user.stats?.totalChallenges ?? 0} />
            <StatItem label="Top Streak" value={user.stats?.topStreak ?? 0} />
            <StatItem label="Current Streak" value={user.stats?.currentStreak ?? 0} />
          </CardContent>
        </Card>

        {/* Kolom Kanan: Histori */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.activityHistory.length > 0 ? (
                      user.activityHistory.map((act: any) => (
                        <TableRow key={act.id}>
                          <TableCell>{act.eventType}</TableCell>
                          <TableCell className="text-green-500">+{act.pointsEarn}</TableCell>
                          <TableCell>{format(new Date(act.createdAt), "dd MMM yyyy, HH:mm")}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No activities found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Purchase Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-60 w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Reviewed At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.purchaseVerifications.length > 0 ? (
                      user.purchaseVerifications.map((ver: any) => (
                        <TableRow key={ver.id}>
                          <TableCell>
                            <Badge variant={ver.status === "APPROVED" ? "secondary" : "destructive"}>
                              {ver.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a
                              href={ver.receiptImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              View Image
                            </a>
                          </TableCell>
                          <TableCell>{format(new Date(ver.submittedAt), "dd MMM yyyy")}</TableCell>
                          <TableCell>
                            {ver.reviewedAt ? format(new Date(ver.reviewedAt), "dd MMM yyyy") : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No verifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
