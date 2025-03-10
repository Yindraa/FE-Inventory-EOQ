"use client";

import {
  FaHome,
  FaBox,
  FaShippingFast,
  FaChartLine,
  FaSignOutAlt,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { IconType } from "react-icons";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface NavItemProps {
  icon: IconType;
  text: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change: "positive" | "negative";
}

interface ProductSale {
  product: string;
  sale: number;
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-black text-white p-6 flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="EOQ Logo" width={40} height={40} />
          <span className="text-xl font-bold">EOQ TRACK</span>
        </div>
        <nav className="flex flex-col space-y-4">
          <NavItem icon={FaHome} text="Home" />
          <NavItem icon={FaBox} text="Product" />
          <NavItem icon={FaShippingFast} text="Order" />
          <NavItem icon={FaChartLine} text="EOQ" />
          <NavItem icon={FaSignOutAlt} text="Log Out" />
        </nav>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Welcome, De Carlito</h1>
        <p className="text-gray-500">{new Date().toLocaleDateString()}</p>

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-6 my-6">
          <StatCard title="Inventory" value="1.5%" change="positive" />
          <StatCard title="Total Order" value="12.4" change="negative" />
          <StatCard title="Total Customer" value="2,753" change="positive" />
        </div>

        {/* Recent Order */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Recent Order</h2>
          <OrderTable />
        </div>
      </main>

      {/* Sidebar Kanan */}
      <aside className="w-72 bg-gray-800 text-white p-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <FaUser className="text-2xl" />
          <span className="text-lg">De Carlito</span>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none"
          />
        </div>
        <TopSellingProducts />
      </aside>
    </div>
  );
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, text }) => {
  const pathname = usePathname();
  const isActive = pathname.includes(text.toLowerCase());

  return (
    <button
      className={`flex items-center space-x-2 p-2 rounded-lg ${
        isActive ? "bg-gray-700" : "hover:bg-gray-700"
      }`}
    >
      <Icon className="text-xl" />
      <span>{text}</span>
    </button>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, change }) => (
  <div
    className={`p-4 rounded-lg shadow-lg ${
      change === "positive" ? "bg-green-100" : "bg-red-100"
    }`}
  >
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const orders = [
  {
    id: "12563987563",
    date: "18/07/2023",
    product: "Dolan Watch",
    customer: "Allan Wood",
    price: "$1,349",
    status: "On Process",
  },
  {
    id: "12563987564",
    date: "19/07/2023",
    product: "Sisy Bag",
    customer: "Jane Doe",
    price: "$849",
    status: "Delivered",
  },
];

const OrderTable: React.FC = () => (
  <table className="w-full text-left">
    <thead>
      <tr>
        <th className="border-b p-2">Order ID</th>
        <th className="border-b p-2">Date</th>
        <th className="border-b p-2">Product</th>
        <th className="border-b p-2">Customer</th>
        <th className="border-b p-2">Total Price</th>
        <th className="border-b p-2">Status</th>
      </tr>
    </thead>
    <tbody>
      {orders.map((order, index) => (
        <tr key={index}>
          <td className="p-2">{order.id}</td>
          <td className="p-2">{order.date}</td>
          <td className="p-2">{order.product}</td>
          <td className="p-2">{order.customer}</td>
          <td className="p-2">{order.price}</td>
          <td className="p-2">{order.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TopSellingProducts: React.FC = () => {
  const products: ProductSale[] = [
    { product: "Dolan Watch", sale: 365 },
    { product: "Sisy Bag", sale: 135 },
    { product: "Path Shoes", sale: 65 },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Top Selling Product</h2>
      <ul className="space-y-2">
        {products.map((item, index) => (
          <li key={index} className="flex justify-between">
            <span>{item.product}</span>
            <span>{item.sale}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
