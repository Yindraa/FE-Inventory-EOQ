"use client";

import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import InventoryStatCard from "../components/InventoryStatCard";
import TotalOrderStatCard from "../components/TotalOrderStatCard";
import TotalCustomerStatCard from "../components/TotalCustomerStatCard";
import OrderReportStatCard from "../components/OrderReportStatCard";
import RecentOrder from "../components/RecentOrder";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Sidebar Kiri */}
      <LeftSidebar />

      {/* Konten Utama */}
      <main className="flex-grow p-6">
        <h1 className="text-2xl text-black font-bold">Welcome, De Carlito</h1>
        <p className="text-black">
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {/* Statistik */}
        <div className="grid grid-cols-2 gap-6 my-6">
          <InventoryStatCard />
          <TotalOrderStatCard />
          <TotalCustomerStatCard />
          <OrderReportStatCard />
        </div>
        {/* Recent Order */}
        <RecentOrder />
      </main>

      {/* Sidebar Kanan */}
      <RightSidebar />
    </div>
  );
}
