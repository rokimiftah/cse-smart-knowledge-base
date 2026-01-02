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
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 sm:left-6" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for solutions, Ex: Google timeout error when scraping"
          className="w-full rounded-xl border-2 border-gray-300 bg-white py-3 pr-4 pl-12 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none sm:rounded-2xl sm:py-5 sm:pr-6 sm:pl-16 sm:text-base"
          disabled={isLoading}
        />
      </div>
    </form>
  );
};
