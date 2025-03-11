"use client";

import { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrasi Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface InventoryStats {
  inventoryChange: number | null;
  inventoryTrend: number[] | null;
}

const InventoryStatCard: React.FC = () => {
  const [inventoryChange, setInventoryChange] = useState<number | null>(null);
  const [inventoryTrend, setInventoryTrend] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const chartRef = useRef<any>(null); // Ref untuk akses canvas

  useEffect(() => {
    // Ambil data dari API backend (gunakan fetch atau axios)
    const fetchData = async () => {
      try {
        const response = await fetch("/api/inventory"); // Ganti dengan endpoint backend
        const data: InventoryStats = await response.json();
        setInventoryChange(data.inventoryChange);
        setInventoryTrend(data.inventoryTrend);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 flex justify-center items-center h-24">
        <p className="text-gray-500">Loading inventory data...</p>
      </div>
    );
  }

  const isPositive = (inventoryChange ?? 0) >= 0;
  const arrowIcon = isPositive ? (
    <FaArrowUp className="text-green-500" />
  ) : (
    <FaArrowDown className="text-red-500" />
  );
  const textColor = isPositive ? "text-green-600" : "text-red-600";

  // Fungsi untuk membuat gradient fill pada grafik
  const getGradientFill = (context: any) => {
    const chart = chartRef.current;
    if (!chart)
      return isPositive ? "rgba(16, 185, 129, 0.2)" : "rgba(220, 38, 38, 0.2)";

    const ctx = context.chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(
      0,
      isPositive ? "rgba(16, 185, 129, 0.6)" : "rgba(220, 38, 38, 0.6)"
    );
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Fade-out ke transparan

    return gradient;
  };

  const chartData = {
    labels: inventoryTrend
      ? inventoryTrend.map((_, i) => `Month ${i + 1}`)
      : [],
    datasets: [
      {
        label: "Inventory",
        data: inventoryTrend ?? [],
        borderColor: isPositive ? "#16A34A" : "#DC2626",
        backgroundColor: (context: any) => getGradientFill(context),
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 } },
    plugins: {
      legend: { display: false }, // Sembunyikan kotak hijau label
    },
  };

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300">
      <h3 className="text-lg text-black font-semibold">Inventory</h3>
      <p className={`flex items-center space-x-1 ${textColor}`}>
        {arrowIcon}
        <span className="text-xl font-semibold">
          {inventoryChange !== null
            ? `${Math.abs(inventoryChange)}%`
            : "No data available"}
        </span>
      </p>
      <p className="text-gray-500 text-sm">vs last month</p>

      <div className="h-20 mt-2">
        {inventoryTrend && inventoryTrend.length > 0 ? (
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
};

export default InventoryStatCard;
