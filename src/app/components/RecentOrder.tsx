"use client";

import { useEffect, useState } from "react";
import axios from "axios"; // Menggunakan axios

// Definisikan tipe data untuk orders
interface Order {
  id: string;
  date: string;
  product: string;
  customer: string;
  price: string;
  status: string;
}

const RecentOrder: React.FC = () => {
  // State untuk menyimpan data orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Ambil data dari backend saat komponen pertama kali dirender
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          "https://jsonplaceholder.typicode.com/posts"
        );
        console.log("Data fetched:", response.data);
        setOrders(response.data.slice(0, 5)); // Ambil 5 data dummy
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl text-black font-semibold mb-4">Recent Order</h2>
      <table className="w-full text-left text-black border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Order ID</th>
            <th className="p-2">Date</th>
            <th className="p-2">Product</th>
            <th className="p-2">Customer</th>
            <th className="p-2">Total Price</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          ) : orders.length > 0 ? (
            orders.map((order, index) => (
              <tr
                key={index}
                className="border-b hover:text-black text-gray-600"
              >
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.date}</td>
                <td className="p-4">{order.product}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.price}</td>
                <td className="p-4">{order.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrder;
