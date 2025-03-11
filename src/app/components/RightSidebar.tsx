import { FaSearch, FaUser } from "react-icons/fa";

const TopSellingProducts: React.FC = () => {
  const products = [
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

const RightSidebar: React.FC = () => {
  return (
    <aside className="w-72 bg-black text-white p-6 flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <FaUser className="text-2xl" />
        <span className="text-lg">De Carlito</span>
      </div>
      <div className="relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-black focus:outline-none"
        />
      </div>
      <TopSellingProducts />
    </aside>
  );
};

export default RightSidebar;
