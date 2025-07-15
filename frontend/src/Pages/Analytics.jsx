import React, { useState } from "react";
import NavBar from "../Components/NavBar";
import SideBar from "../Components/SideBar";
import CropMarketDashboard from "../Components/MarketAnalytics";
import Settings from "../Components/Settings";
import useOnStartData from "../Components/OnStartData";

export default function ChatAi() {
  const isFetching = useOnStartData();

  if (isFetching) {
    return (
      <div className="self-center h-screen flex items-center justify-center ">
        <div class="fa-3x">
          {" "}
          <i class="fa-solid fa-circle-notch fa-spin "></i>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:flex flex-row  justify-center ">
      <SideBar />
      <div className=" lg:h-full overflow-y-auto w-screen flex flex-col">
        <NavBar />
        <CropMarketDashboard />
        <Settings />
      </div>
    </div>
  );
}
