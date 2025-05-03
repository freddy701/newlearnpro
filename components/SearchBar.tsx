"use client";

import { useState, useEffect } from "react";
import { LucideSearch } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialValue?: string;
  className?: string;
}

export default function SearchBar({ 
  placeholder = "Rechercher...", 
  onSearch, 
  initialValue = "", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  // Déclencher la recherche lorsque l'utilisateur tape
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onSearch(newValue); // Déclencher la recherche immédiatement
  };

  // Toujours permettre la soumission du formulaire (pour la compatibilité mobile)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className={`relative flex items-center ${className}`} onSubmit={handleSubmit}>
      <input
        type="text"
        className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
      />
      <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <button 
        type="submit" 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-1 rounded-md hover:bg-blue-700"
      >
        <LucideSearch className="h-4 w-4" />
      </button>
    </form>
  );
}