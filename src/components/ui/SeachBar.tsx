import React from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <div className="relative">
      <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#1a5276] focus:border-transparent bg-white"
      />
    </div>
  );
};

export default SearchBar;
