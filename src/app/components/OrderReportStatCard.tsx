"use client";

import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Registrasi Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface OrderReportStats {
  totalOrders: number | null;
  percentageChange: number | null;
  categoryDistribution: {
    ecommerce: number;
    offline: number;
    other: number;
  } | null;
}

const timeFilters = ["1W", "1M", "6M", "1Y"];

const OrderReportStatCard: React.FC = () => {
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);
  const [categoryDistribution, setCategoryDistribution] =
    useState<OrderReportStats["categoryDistribution"]>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("1Y");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get<OrderReportStats>(
        `https://api.example.com/orders/report?period=${selectedFilter}`
      )
      .then((response: AxiosResponse<OrderReportStats>) => {
        const data = response.data;
        setTotalOrders(data.totalOrders ?? null);
        setPercentageChange(data.percentageChange ?? null);
        setCategoryDistribution(data.categoryDistribution ?? null);
      })
      .catch((error: unknown) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setIsLoading(false));
  }, [selectedFilter]);

  const isPositive = (percentageChange ?? 0) >= 0;
  const arrowIcon = isPositive ? (
    <FaArrowUp className="text-green-500" />
  ) : (
    <FaArrowDown className="text-red-500" />
  );
  const textColor = isPositive ? "text-green-600" : "text-red-600";

  const periodText = {
    "1W": "last week",
    "1M": "last month",
    "6M": "last 6 months",
    "1Y": "last year",
  }[selectedFilter];

  const chartData = {
    labels: ["E-commerce", "Offline Store", "Other"],
    datasets: [
      {
        data: categoryDistribution
          ? [
              categoryDistribution.ecommerce,
              categoryDistribution.offline,
              categoryDistribution.other,
            ]
          : [],
        backgroundColor: ["#1F1F1F", "#A3A3A3", "#E5E5E5"],
        hoverBackgroundColor: ["#000000", "#8D8D8D", "#C0C0C0"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 flex justify-center items-center h-24">
        <p className="text-gray-500">Loading Order Report Data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 flex flex-col relative">
      <div className="flex justify-between items-center">
        <h3 className="text-lg text-black font-semibold">Order Report</h3>

        {/* Filter Waktu */}
        <div className="flex space-x-1 bg-black rounded-full p-0.5 scale-100">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedFilter === filter
                  ? "text-white font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
              {selectedFilter === filter && <span className="ml-0.5">•</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Total Orders */}
      <p className={`text-3xl font-bold ${textColor}`}>
        {totalOrders !== null
          ? totalOrders.toLocaleString()
          : "No data available"}
      </p>

      {/* Percentage Change */}
      <p
        className={`flex items-center space-x-1 ${textColor} text-md font-medium`}
      >
        {arrowIcon}
        <span>
          {percentageChange !== null
            ? `${Math.abs(percentageChange)}%`
            : "No data available"}
        </span>
        <span className="text-gray-500">vs {periodText}</span>
      </p>

      {/* Donut Chart */}
      <div className="h-32 w-32 mx-auto mt-4">
        {categoryDistribution ? (
          <Doughnut data={chartData} options={chartOptions} />
        ) : (
          <p className="text-gray-500 text-center">No data available</p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-black rounded-full"></div>
          <span className="text-black">E-commerce</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-black">Offline Store</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="text-black">Other</span>
        </div>
      </div>
    </div>
  );
};

export default OrderReportStatCard;
