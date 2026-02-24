import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileCheck,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";

interface StatsCardsProps {
  totalWorkers: number;
  totalLicenses: number;
  expiringSoon: number;
  expired: number;
}

export function StatsCards({
  totalWorkers,
  totalLicenses,
  expiringSoon,
  expired,
}: StatsCardsProps) {
  const cards = [
    {
      title: "Total Workers",
      value: totalWorkers,
      description: "View all workers",
      icon: Users,
      color: "text-blue-600",
      bgHover:
        "hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20",
      href: "/workers",
    },
    {
      title: "Total Licenses",
      value: totalLicenses,
      description: "View by license type",
      icon: FileCheck,
      color: "text-green-600",
      bgHover:
        "hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-950/20",
      href: "/license-types",
    },
    {
      title: "Expiring Soon",
      value: expiringSoon,
      description: "Within 90 days",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgHover:
        "hover:border-orange-300 hover:bg-orange-50/50 dark:hover:bg-orange-950/20",
      href: "/expiring",
    },
    {
      title: "Expired",
      value: expired,
      description: "Needs renewal",
      icon: XCircle,
      color: "text-red-600",
      bgHover:
        "hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20",
      href: "/expired",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href}>
          <Card
            className={`transition-all duration-200 cursor-pointer ${card.bgHover} group`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
