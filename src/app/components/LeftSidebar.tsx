"use client";

import type React from "react";

import {
  FaHome,
  FaBox,
  FaShippingFast,
  FaTruckMoving,
  FaChartLine,
  FaSignOutAlt,
} from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface NavItemProps {
  icon: React.ElementType;
  text: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  text,
  isActive,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-between w-[90%] pr-6 py-3 rounded-full transition-all duration-200 ml-[-10px] min-h-[48px] 
      ${
        isActive
          ? "bg-white text-black font-medium"
          : "text-white hover:bg-white hover:text-black"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3 pl-4">
        <Icon
          className={`text-lg transition-all duration-200 ${
            isActive || isHovered ? "text-black" : "text-white"
          }`}
        />
        <span>{text}</span>
      </div>
      {(isActive || isHovered) && (
        <span className="absolute right-4 text-black text-2xl scale-150">
          •
        </span>
      )}
    </button>
  );
};

const LeftSidebar: React.FC = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Fix hydration mismatch by only running on client
  useEffect(() => {
    setIsMounted(true);
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Are you sure you want to log out?")
    ) {
      // Remove session data if any (e.g., localStorage)
      localStorage.removeItem("userToken"); // Adjust according to the token used

      // Redirect to login page
      router.push("/");
    }
  };

  // Return a simple placeholder during server-side rendering
  if (!isMounted) {
    return (
      <aside className="w-64 bg-black text-white p-6 flex flex-col space-y-6">
        <div className="flex justify-center">
          {/* Empty space for logo */}
          <div className="w-[150px] h-[150px]"></div>
        </div>
        <nav className="flex flex-col space-y-3">
          {/* Empty placeholders for nav items */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-[90%] h-[48px]"></div>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-black text-white p-6 flex flex-col space-y-6">
      <div className="flex justify-center">
        <Image
          src="/Image/EOQ TRACK LOGO 1.png"
          alt="EOQ Logo"
          width={150}
          height={150}
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-3">
        <NavItem
          icon={FaHome}
          text="Home"
          isActive={currentPath.includes("Dashboard")}
          onClick={() => router.push("/Dashboard")}
        />
        <NavItem
          icon={FaBox}
          text="Product"
          isActive={currentPath.includes("Product")}
          onClick={() => router.push("/Product")}
        />
        <NavItem
          icon={FaShippingFast}
          text="Order"
          isActive={currentPath.includes("Order")}
          onClick={() => router.push("/Order")}
        />
        <NavItem
          icon={FaTruckMoving}
          text="Shipping"
          isActive={currentPath.includes("Shipping")}
          onClick={() => router.push("/Shipping")}
        />
        <NavItem
          icon={FaChartLine}
          text="EOQ"
          isActive={currentPath.includes("EOQ")}
          onClick={() => router.push("/EOQ")}
        />
        <NavItem
          icon={FaSignOutAlt}
          text="Log Out"
          isActive={false}
          onClick={handleLogout}
        />
      </nav>
    </aside>
  );
};

export default LeftSidebar;
