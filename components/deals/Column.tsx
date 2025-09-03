import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";
import ReferralItem from "./ReferralItem";
import { ReferralWithUser } from "@/types/referral";

interface ColumnProps {
  referrals: ReferralWithUser[];
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  notFoundMsg: string;
  hoverStarted: boolean;
  isHovered: boolean;
  dragItemStart: (id: string) => void;
  dragEnd: () => void;
  dropItem: () => void;
  dragOverCol: () => void;
  dragEnter: () => void;
  dragLeave: () => void;
}

export default function Column({
  referrals,
  title,
  icon,
  color,
  description,
  notFoundMsg,
  hoverStarted,
  isHovered,
  dragItemStart,
  dragEnd,
  dropItem,
  dragOverCol,
  dragEnter,
  dragLeave,
}: ColumnProps) {
  return (
    <Card
      className={cn("shadow-sm min-h-[400px]", isHovered ? "outline-2" : "")}
      onDrop={dropItem}
      onDragOver={(e) => {
        e.preventDefault();
        dragOverCol();
      }}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
    >
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <>{icon}</>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className={cn("text-2xl font-bold", color)}>
          {referrals.length}
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3">
        {referrals.length === 0 && !hoverStarted && (
          <p className="text-sm text-gray-500">{notFoundMsg}</p>
        )}

        {referrals.map((referral) => (
          <ReferralItem
            key={referral.id}
            referral={referral as any}
            dragItemStart={(e) => dragItemStart(referral.id)}
            dragEnd={dragEnd}
            hide={hoverStarted}
          />
        ))}
      </CardContent>
    </Card>
  );
}
