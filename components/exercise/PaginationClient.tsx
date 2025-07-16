'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { ExerciseFilters as Filters } from '../../types/exercise';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  filters: Filters;
}

const PaginationClient: React.FC<PaginationClientProps> = ({
  currentPage,
  totalPages,
  filters,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    
    // Update filter parameters
    if (filters.search) {
      params.set('search', filters.search);
    } else {
      params.delete('search');
    }
    
    if (filters.exerciseType) {
      params.set('type', filters.exerciseType);
    } else {
      params.delete('type');
    }
    
    if (filters.primaryMuscleGroup) {
      params.set('muscle', filters.primaryMuscleGroup);
    } else {
      params.delete('muscle');
    }
    
    if (filters.force) {
      params.set('movement', filters.force);
    } else {
      params.delete('movement');
    }
    
    if (filters.level) {
      params.set('difficulty', filters.level);
    } else {
      params.delete('difficulty');
    }
    
    // Set page parameter
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    
    const newURL = `/exercise-library?${params.toString()}`;
    router.push(newURL);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => navigateToPage(i)}
          className={i === currentPage ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"}
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      {currentPage > 1 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigateToPage(currentPage - 1)}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          Previous
        </Button>
      )}
      
      {renderPageNumbers()}
      
      {currentPage < totalPages && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigateToPage(currentPage + 1)}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default PaginationClient; 