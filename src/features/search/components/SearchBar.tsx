import { useCallback, useState } from "react";

import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
      }
    },
    [query, onSearch],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute top-1/2 left-6 -translate-y-1/2 text-gray-400" size={22} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for solutions... (e.g., 'timeout error when scraping')"
          className="w-full rounded-2xl border-2 border-gray-300 bg-white py-5 pr-6 pl-16 text-base text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none"
          disabled={isLoading}
        />
      </div>
    </form>
  );
};
