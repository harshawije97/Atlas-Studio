import ListHeader from "@/components/local/list-header";
import OverviewContent from "@/components/local/overview-content";
import React from "react";

function PortalPage() {
  return (
    <>
      <ListHeader />
      <div className="flex w-full flex-wrap">
        <OverviewContent />
      </div>
    </>
  );
}

export default PortalPage;
