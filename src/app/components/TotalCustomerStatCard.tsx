"use client";

import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Registrasi Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface CustomerStats {
  totalCustomers: number | null;
  newCustomers: number | null;
  percentageChange: number | null;
}

const TotalCustomerStatCard: React.FC = () => {
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [newCustomers, setNewCustomers] = useState<number | null>(null);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get<CustomerStats>("https://api.example.com/customers/statistics")
      .then((response: AxiosResponse<CustomerStats>) => {
        const data = response.data;
        setTotalCustomers(data.totalCustomers ?? null);
        setNewCustomers(data.newCustomers ?? null);
        setPercentageChange(data.percentageChange ?? null);
      })
      .catch((error: unknown) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loyalCustomers =
    totalCustomers !== null && newCustomers !== null
      ? totalCustomers - newCustomers
      : null;

  const isPositive = (percentageChange ?? 0) >= 0;
  const arrowIcon = isPositive ? (
    <FaArrowUp className="text-green-500" />
  ) : (
    <FaArrowDown className="text-red-500" />
  );
  const textColor = isPositive ? "text-green-600" : "text-red-600";

  const chartData = {
    labels: ["New Customer", "Loyal Customer"],
    datasets: [
      {
        data:
          newCustomers !== null && loyalCustomers !== null
            ? [newCustomers, loyalCustomers]
            : [],
        backgroundColor: ["#A3A3A3", "#1F1F1F"],
        hoverBackgroundColor: ["#8D8D8D", "#000000"],
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
        <p className="text-gray-500">Loading Total Customer Data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white border border-gray-300 flex flex-col">
      <h3 className="text-lg text-black font-semibold">Total Customer</h3>

      {/* Total Customer Number */}
      <p className={`text-3xl font-bold ${textColor}`}>
        {totalCustomers !== null
          ? totalCustomers.toLocaleString()
          : "No data available"}
      </p>

      {/* Percentage Change Text */}
      <p
        className={`flex items-center space-x-1 ${textColor} text-md font-medium`}
      >
        {arrowIcon}
        <span>
          {newCustomers !== null && percentageChange !== null
            ? `${newCustomers.toLocaleString()} new customer (${percentageChange}%)`
            : "No data available"}
        </span>
        <span className="text-gray-500">vs last month</span>
      </p>

      {/* Grafik Donut */}
      <div className="h-32 w-32 mx-auto mt-4">
        {newCustomers !== null && loyalCustomers !== null ? (
          <Doughnut data={chartData} options={chartOptions} />
        ) : (
          <p className="text-gray-500 text-center">No data available</p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          <span className="text-black">New Customer</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-black rounded-full"></div>
          <span className="text-black">Loyal Customer</span>
        </div>
      </div>
    </div>
  );
};

export default TotalCustomerStatCard;
