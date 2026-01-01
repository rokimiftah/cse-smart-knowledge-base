import { useEffect, useRef, useState } from "react";

import { Check, ChevronDown } from "lucide-react";

import { cn } from "@shared/lib";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "Choose...", className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm transition-all",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          isOpen && "border-blue-500 ring-1 ring-blue-500",
        )}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.color && <span className={cn("h-2.5 w-2.5 rounded-full", selectedOption.color)} />}
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>{selectedOption?.label || placeholder}</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-left text-sm transition-colors",
                "hover:bg-gray-50",
                value === option.value && "bg-blue-50",
              )}
            >
              <span className="flex items-center gap-2">
                {option.color && <span className={cn("h-2.5 w-2.5 rounded-full", option.color)} />}
                <span className="text-gray-900">{option.label}</span>
              </span>
              {value === option.value && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
