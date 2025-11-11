'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { ExerciseFilters as Filters, FilterOptions } from '../../types/exercise';
import DebouncedSearchInput from './DebouncedSearchInput';

interface ExerciseFiltersProps {
  filters: Filters;
  filterOptions: FilterOptions;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  filters,
  filterOptions,
  onFiltersChange,
  onClearFilters,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Filter out empty strings from filter options
  const sanitizedFilterOptions = React.useMemo(() => {
    return {
      exerciseTypes: filterOptions.exerciseTypes.filter(type => type && type.trim() !== ''),
      primaryMuscleGroups: filterOptions.primaryMuscleGroups.filter(muscle => muscle && muscle.trim() !== ''),
      forces: filterOptions.forces.filter(force => force && force.trim() !== ''),
      levels: filterOptions.levels.filter(level => level && level.trim() !== ''),
      categories: filterOptions.categories.filter(category => category && category.trim() !== ''),
      equipment: filterOptions.equipment.filter(equipment => equipment && equipment.trim() !== ''),
      mechanics: filterOptions.mechanics.filter(mechanic => mechanic && mechanic.trim() !== ''),
    };
  }, [filterOptions]);

  const handleSearchChange = (searchValue: string) => {
    onFiltersChange({
      ...filters,
      search: searchValue,
    });
  };

  const handleFilterChange = (key: keyof Filters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.search || 
      filters.exerciseType || 
      filters.primaryMuscleGroup || 
      filters.force || 
      filters.level
    );
  };

  const getActiveFilters = () => {
    const activeFilters: React.ReactNode[] = [];

    if (filters.search) {
      activeFilters.push(
        <Badge key="search" variant="outline" className="gap-1 bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">
          Search: {filters.search}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-gray-600" 
            onClick={() => handleFilterChange('search', undefined)}
          />
        </Badge>
      );
    }

    if (filters.exerciseType) {
      activeFilters.push(
        <Badge key="type" variant="outline" className="gap-1 bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">
          Type: {filters.exerciseType}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-gray-600" 
            onClick={() => handleFilterChange('exerciseType', undefined)}
          />
        </Badge>
      );
    }

    if (filters.primaryMuscleGroup) {
      activeFilters.push(
        <Badge key="muscle" variant="outline" className="gap-1 bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">
          Muscle: {filters.primaryMuscleGroup}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-gray-600" 
            onClick={() => handleFilterChange('primaryMuscleGroup', undefined)}
          />
        </Badge>
      );
    }

    if (filters.force) {
      activeFilters.push(
        <Badge key="force" variant="outline" className="gap-1 bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">
          {filters.force}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-gray-600" 
            onClick={() => handleFilterChange('force', undefined)}
          />
        </Badge>
      );
    }

    if (filters.level) {
      activeFilters.push(
        <Badge key="level" variant="outline" className="gap-1 bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200">
          Level: {filters.level}
          <X 
            className="h-3 w-3 cursor-pointer hover:text-gray-600" 
            onClick={() => handleFilterChange('level', undefined)}
          />
        </Badge>
      );
    }

    return activeFilters;
  };

  return (
    <Card className="bg-white border-gray-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search & Filter Exercises
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search exercises..."
            disabled={isLoading}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {getActiveFilters()}
            </div>
          </div>
        )}

        {/* Collapsible Filter Options */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-white border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            >
              <span className="flex items-center gap-2 text-gray-700">
                <Filter className="h-4 w-4" />
                Filter Options
              </span>
              <span className="text-xs text-gray-500">
                {isOpen ? 'Hide' : 'Show'} Filters
              </span>
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exercise Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Exercise Type
                </label>
                <Select
                  value={filters.exerciseType || undefined}
                  onValueChange={(value) => handleFilterChange('exerciseType', value === 'all' ? undefined : value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400 text-gray-900">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-md">
                    <SelectItem value="all" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">All types</SelectItem>
                    {sanitizedFilterOptions.exerciseTypes.map((type) => (
                      <SelectItem key={type} value={type} className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Primary Muscle Group Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Primary Muscle Group
                </label>
                <Select
                  value={filters.primaryMuscleGroup || undefined}
                  onValueChange={(value) => handleFilterChange('primaryMuscleGroup', value === 'all' ? undefined : value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400 text-gray-900">
                    <SelectValue placeholder="All muscle groups" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-md">
                    <SelectItem value="all" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">All muscle groups</SelectItem>
                    {sanitizedFilterOptions.primaryMuscleGroups.map((muscle) => (
                      <SelectItem key={muscle} value={muscle} className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        {muscle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Force Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Force Type
                </label>
                <Select
                  value={filters.force || undefined}
                  onValueChange={(value) => handleFilterChange('force', value === 'all' ? undefined : value as any)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400 text-gray-900">
                    <SelectValue placeholder="All force types" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-md">
                    <SelectItem value="all" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">All force types</SelectItem>
                    {sanitizedFilterOptions.forces.map((force) => (
                      <SelectItem key={force} value={force} className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        {force}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Difficulty Level
                </label>
                <Select
                  value={filters.level || undefined}
                  onValueChange={(value) => handleFilterChange('level', value === 'all' ? undefined : value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400 text-gray-900">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 shadow-md">
                    <SelectItem value="all" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">All levels</SelectItem>
                    {sanitizedFilterOptions.levels.map((level) => (
                      <SelectItem key={level} value={level} className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ExerciseFilters; 