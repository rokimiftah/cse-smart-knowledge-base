import { useCallback, useState } from "react";

import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchBar = ({ onSearch, onClear, isLoading }: SearchBarProps) => {
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

  const handleClear = useCallback(() => {
    setQuery("");
    onClear?.();
  }, [onClear]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 sm:left-4" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for solutions, Ex: Google timeout error when scraping"
          className="w-full rounded-lg border-2 border-gray-300 bg-white py-2 pr-10 pl-10 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-400 focus:outline-none sm:rounded-xl sm:py-2.5 sm:pr-12 sm:pl-12"
          disabled={isLoading}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 sm:right-4"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </form>
  );
};
