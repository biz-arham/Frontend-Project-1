import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  showStatusFilter?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  statusFilter?: 'all' | 'pending' | 'ongoing' | 'completed';
  onStatusChange?: (status: 'all' | 'pending' | 'ongoing' | 'completed') => void;
  tagFilter?: string[];
  onTagFilterChange?: (tags: string[]) => void;
}

export function SearchFilter({ 
  showStatusFilter = true,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusChange,
  tagFilter = [],
  onTagFilterChange
}: SearchFilterProps) {
  const allTags = ['high-value', 'recurring', 'Shopify', 'design', 'development', 'WordPress', 'marketing'];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients or projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showStatusFilter && (
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(['all', 'pending', 'ongoing', 'completed'] as const).map((status) => (
            <Button
              key={status}
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange?.(status)}
              className={cn(
                'capitalize',
                statusFilter === status && 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Tags
            {tagFilter.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {tagFilter.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allTags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={tagFilter.includes(tag)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onTagFilterChange?.([...tagFilter, tag]);
                } else {
                  onTagFilterChange?.(tagFilter.filter((t) => t !== tag));
                }
              }}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
          {tagFilter.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => onTagFilterChange?.([])}
              >
                Clear filters
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
