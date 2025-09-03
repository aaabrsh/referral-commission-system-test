"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import Link from "next/link";
import api, { ApiRoutes, Routes } from "@/lib/api";
import Column from "@/components/deals/Column";
import { DealStage } from "@prisma/client";
import { ReferralWithUser } from "@/types/referral";
import { toast } from "sonner";

interface DealsPageProps {
  allReferrals: ReferralWithUser[];
}
export default function Deals({ allReferrals }: DealsPageProps) {
  const [referrals, setReferrals] = useState<{
    NEW: ReferralWithUser[];
    CONTACTED: ReferralWithUser[];
    WON: ReferralWithUser[];
  }>({
    WON: [],
    CONTACTED: [],
    NEW: [],
  });
  const [hoverStarted, setHoverStarted] = useState(false);
  const [dragItem, setDragItem] = useState<ReferralWithUser | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<DealStage | null>(null);
  const [dragFromColumn, setDragFromColumn] = useState<DealStage | null>(null);

  useEffect(() => {
    const referralsCopy: typeof referrals = { NEW: [], CONTACTED: [], WON: [] };
    for (const referral of allReferrals) {
      switch (referral.stage) {
        case DealStage.NEW:
          referralsCopy.NEW.push(referral);
          break;
        case DealStage.CONTACTED:
          referralsCopy.CONTACTED.push(referral);
          break;
        case DealStage.WON:
          referralsCopy.WON.push(referral);
          break;
      }
    }
    setReferrals(referralsCopy);
  }, [allReferrals]);

  const handleDragItemStart = (id: string, column: DealStage) => {
    setHoverStarted(true);
    setDragItem(allReferrals.find((referral) => referral.id === id) ?? null);
    setDragFromColumn(column);
  };

  const handleDragOverCol = (column: DealStage) => {
    setDragOverColumn(column);
  };

  const handleDragLeaveCol = (column: DealStage) => {
    setDragOverColumn((current) => (current === column ? null : current));
  };

  const handleDragEnterCol = (column: DealStage) => {
    setDragOverColumn(column);
  };

  const handleDropItem = () => {
    if (
      dragItem &&
      dragFromColumn &&
      dragOverColumn &&
      dragFromColumn != dragOverColumn
    ) {
      updateReferralStage(dragItem, dragFromColumn, dragOverColumn);
    }

    setHoverStarted(false);
    setDragItem(null);
    setDragFromColumn(null);
    setDragOverColumn(null);
  };

  const updateReferralStage = async (
    referral: ReferralWithUser,
    from: DealStage,
    to: DealStage
  ) => {
    // update the ui now, and if request fails revert changes
    setReferrals((referrals) => moveReferralUI(referrals, referral, from, to));

    try {
      const response = await api.put(`${ApiRoutes.referrals}/${referral.id}`, {
        stage: to,
      });
    } catch (error: any) {
      console.error("Error submitting referral:", error);
      // revert UI changes
      setReferrals((referrals) =>
        moveReferralUI(referrals, referral, to, from)
      );
      const errorMessage =
        error.response?.data?.error ||
        "Failed to submit referral. Please try again.";
      toast.error(errorMessage);
    }
  };

  const moveReferralUI = (
    allReferrals: typeof referrals,
    referral: ReferralWithUser,
    from: DealStage,
    to: DealStage
  ) => {
    // remove from old stage
    const updatedFrom = allReferrals[from].filter((r) => r.id !== referral.id);
    // add to new stage
    const updatedTo = [{ ...referral, stage: to }, ...allReferrals[to]];

    return {
      ...allReferrals,
      [from]: updatedFrom,
      [to]: updatedTo,
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row w-full gap-3">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deal Pipeline
          </h1>
          <p className="text-gray-600">
            Track and manage your referral deals through the pipeline.
          </p>
        </div>

        <div>
          <Link href={Routes.referral}>
            <Button className="flex gap-2 cursor-pointer">
              <Plus />
              Submit A New Referral
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* New Deals */}
        <Column
          referrals={referrals.NEW}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          color="text-blue-600"
          title="New"
          notFoundMsg="No new deals"
          description="Deals that need attention"
          dragItemStart={(id) => handleDragItemStart(id, DealStage.NEW)}
          dragEnd={handleDropItem} //in case the item was dropped out of any column
          dropItem={handleDropItem}
          dragOverCol={() => handleDragOverCol(DealStage.NEW)}
          dragEnter={() => handleDragEnterCol(DealStage.NEW)}
          dragLeave={() => handleDragLeaveCol(DealStage.NEW)}
          hoverStarted={hoverStarted}
          isHovered={dragOverColumn === DealStage.NEW}
        />

        {/* Contacted Deals */}
        <Column
          referrals={referrals.CONTACTED}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          color="text-yellow-600"
          title="Contacted"
          notFoundMsg="No contacted deals"
          description="Deals in progress"
          dragItemStart={(id) => handleDragItemStart(id, DealStage.CONTACTED)}
          dragEnd={handleDropItem} //in case the item was dropped out of any column
          dropItem={handleDropItem}
          dragOverCol={() => handleDragOverCol(DealStage.CONTACTED)}
          dragEnter={() => handleDragEnterCol(DealStage.CONTACTED)}
          dragLeave={() => handleDragLeaveCol(DealStage.CONTACTED)}
          hoverStarted={hoverStarted}
          isHovered={dragOverColumn === DealStage.CONTACTED}
        />

        {/* Won Deals */}
        <Column
          referrals={referrals.WON}
          icon={<Clock className="h-5 w-5 text-green-500" />}
          color="text-green-600"
          title="Won"
          notFoundMsg="No won deals"
          description="Successfully closed deals"
          dragItemStart={(id) => handleDragItemStart(id, DealStage.WON)}
          dragEnd={handleDropItem} //in case the item was dropped out of any column
          dropItem={handleDropItem}
          dragOverCol={() => handleDragOverCol(DealStage.WON)}
          dragEnter={() => handleDragEnterCol(DealStage.WON)}
          dragLeave={() => handleDragLeaveCol(DealStage.WON)}
          hoverStarted={hoverStarted}
          isHovered={dragOverColumn === DealStage.WON}
        />
      </div>
    </div>
  );
}
