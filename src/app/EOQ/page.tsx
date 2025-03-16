"use client";
import { useState } from "react";
import LeftSidebar from "../components/LeftSidebar";

const EOQCalculator = () => {
  const [demand, setDemand] = useState("");
  const [orderingCost, setOrderingCost] = useState("");
  const [holdingCost, setHoldingCost] = useState("");
  const [eoq, setEoq] = useState<number | null>(null);

  // Fungsi untuk menghitung EOQ
  const calculateEOQ = () => {
    if (!demand || !orderingCost || !holdingCost) return;

    const D = parseFloat(demand.replace(/\./g, ""));
    const S = parseFloat(orderingCost.replace(/\./g, ""));
    const H = parseFloat(holdingCost.replace(/\./g, ""));

    if (isNaN(D) || isNaN(S) || isNaN(H) || H === 0) return; // Validasi input
    const result = Math.sqrt((2 * D * S) / H);

    setEoq(Number(result.toFixed(2))); // Menampilkan hasil EOQ
  };

  // Fungsi menangani event Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      calculateEOQ(); // Menjalankan perhitungan saat Enter ditekan
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="flex-1 flex justify-center items-center">
        <div className="text-black">
          <h1 className="text-2xl font-bold text-center mb-8">
            EOQ CALCULATOR
          </h1>

          {/* Input Fields */}
          <div className="space-y-6">
            <InputField
              label="Demand (D)"
              value={demand}
              onChange={(e) => setDemand(e.target.value)}
              onKeyDown={handleKeyDown} // Tambahkan event enter
            />
            <InputField
              label="Ordering Cost (S)"
              value={orderingCost}
              onChange={(e) => setOrderingCost(e.target.value)}
              onKeyDown={handleKeyDown} // Tambahkan event enter
            />
            <InputField
              label="Holding Cost (H)"
              value={holdingCost}
              onChange={(e) => setHoldingCost(e.target.value)}
              onKeyDown={handleKeyDown} // Tambahkan event enter
            />
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mt-6">
            <button
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
              onClick={calculateEOQ}
            >
              Calculate
            </button>
          </div>

          {/* EOQ Result */}
          {eoq !== null && (
            <div className="mt-8 text-lg font-semibold text-center">
              EOQ = <span className="text-xl">{eoq}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Input Component dengan event enter
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void; // Tambahkan event keydown
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  onKeyDown,
}) => {
  return (
    <div className="grid grid-cols-3 items-center gap-4 py-3">
      <label className="text-lg font-medium text-black">{label}</label>
      <span className="text-lg font-medium text-black text-center">=</span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown} // Tambahkan event enter di sini
        className="w-full border-b border-black outline-none text-right pr-2 py-2"
      />
    </div>
  );
};

export default EOQCalculator;
