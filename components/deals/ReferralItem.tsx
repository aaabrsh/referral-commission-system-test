import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Mail, User, Calendar } from "lucide-react";
import { ReferralWithUser } from "@/types/referral";
import { cn } from "@/lib/utils";

interface ReferralItemProps {
  referral: ReferralWithUser;
  isDragging?: boolean;
  dragItemStart: (e: React.DragEvent<HTMLDivElement>) => void;
  dragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  hide: boolean;
}

export default function ReferralItem({
  referral,
  isDragging = false,
  dragItemStart,
  dragEnd,
  hide,
}: ReferralItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className={cn(
        `py-3 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 border-gray-500`,
        isDragging ? "opacity-50 scale-95" : "hover:scale-[1.02]",
        hide ? "opacity-0" : "opacity-100"
      )}
      onDragStart={dragItemStart}
      onDragEnd={dragEnd}
      draggable="true"
    >
      <CardContent className="px-4 space-y-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">
                {referral.lead_company}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-3 w-3" />
              <span className="truncate">{referral.lead_email}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <span className="font-semibold text-green-700">
            {formatCurrency(referral.deal_value)}
          </span>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="text-md font-semibold truncate">
              {referral.receiver?.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate">{referral.receiver?.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(referral.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
