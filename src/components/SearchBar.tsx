import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for people, posts, or hashtags..."
          className="w-full px-4 py-2 pl-10 bg-white dark:bg-amoled-light border dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      </div>
    </form>
  );
}
