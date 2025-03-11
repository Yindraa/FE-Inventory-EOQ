"use client";

import { useEffect, useState } from "react";
import axios from "axios";
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

interface OrderStats {
  totalOrders: number;
  percentageChange: number;
  orderTrend: number[];
}

const TotalOrderStatCard: React.FC = () => {
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [percentageChange, setPercentageChange] = useState<number>(0);
  const [orderTrend, setOrderTrend] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get<OrderStats>("https://api.example.com/orders/statistics")
      .then((response) => {
        const data = response.data;
        setTotalOrders(data.totalOrders);
        setPercentageChange(data.percentageChange);
        setOrderTrend(data.orderTrend);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 flex justify-center items-center h-24">
        <p className="text-gray-500">Loading order data...</p>
      </div>
    );
  }

  const isPositive = percentageChange >= 0;
  const arrowIcon = isPositive ? (
    <FaArrowUp className="text-green-500" />
  ) : (
    <FaArrowDown className="text-red-500" />
  );
  const textColor = isPositive ? "text-green-600" : "text-red-600";

  // Fungsi untuk membuat gradient transparan pada grafik
  const getGradientFill = (context: { chart: ChartJS }) => {
    const ctx = context.chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(
      0,
      isPositive ? "rgba(16, 185, 129, 0.6)" : "rgba(220, 38, 38, 0.6)"
    );
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    return gradient;
  };

  const chartData = {
    labels: orderTrend.map((_, i) => `Month ${i + 1}`),
    datasets: [
      {
        label: "Orders",
        data: orderTrend,
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
    plugins: { legend: { display: false } },
  };

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300">
      <h3 className="text-lg text-black font-semibold">Total Orders</h3>

      {/* Warna Total Orders Sesuai Data */}
      <p className={`text-3xl font-bold ${textColor}`}>
        {totalOrders.toLocaleString()}
      </p>

      <p className={`flex items-center space-x-1 ${textColor}`}>
        {arrowIcon}
        <span className="text-xl font-semibold">
          {percentageChange.toFixed(2)}%
        </span>
      </p>
      <p className="text-gray-500 text-sm">vs last month</p>

      <div className="h-20 mt-2">
        {orderTrend.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>
    </div>
  );
};

export default TotalOrderStatCard;
