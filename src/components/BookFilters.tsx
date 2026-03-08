import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LITERARY_GENRES } from '@/constants/genres';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface BookFilterState {
  search: string;
  genre: string;
  status: string; // '' | 'available' | 'loaned'
  readStatus: string; // '' | 'read' | 'unread'
}

export const defaultFilters: BookFilterState = { search: '', genre: '', status: '', readStatus: '' };

interface Props {
  filters: BookFilterState;
  onChange: (filters: BookFilterState) => void;
}

export function BookFilters({ filters, onChange }: Props) {
  const set = (partial: Partial<BookFilterState>) => onChange({ ...filters, ...partial });
  const hasFilters = filters.search || filters.genre || filters.status || filters.readStatus;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou autor..."
          value={filters.search}
          onChange={e => set({ search: e.target.value })}
          className="pl-10 bg-vintage-paper border-border font-body"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={filters.genre} onValueChange={v => set({ genre: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-[180px] bg-vintage-paper border-border font-body text-sm h-9">
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-body">Todos os gêneros</SelectItem>
            {LITERARY_GENRES.map(g => (
              <SelectItem key={g} value={g} className="font-body">{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={v => set({ status: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-[160px] bg-vintage-paper border-border font-body text-sm h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-body">Todos</SelectItem>
            <SelectItem value="available" className="font-body">Na estante</SelectItem>
            <SelectItem value="loaned" className="font-body">Emprestado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.readStatus} onValueChange={v => set({ readStatus: v === 'all' ? '' : v })}>
          <SelectTrigger className="w-[150px] bg-vintage-paper border-border font-body text-sm h-9">
            <SelectValue placeholder="Leitura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="font-body">Todos</SelectItem>
            <SelectItem value="read" className="font-body">Lidos</SelectItem>
            <SelectItem value="unread" className="font-body">Não lidos</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => onChange(defaultFilters)} className="h-9 text-muted-foreground hover:text-foreground font-body text-sm">
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        )}
      </div>
    </div>
  );
}

export function filterBooks<T extends { title: string; author: string; genre: string; status: string; isRead: boolean }>(
  books: T[],
  filters: BookFilterState
): T[] {
  return books.filter(b => {
    const q = filters.search.toLowerCase();
    if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
    if (filters.genre && b.genre !== filters.genre) return false;
    if (filters.status && b.status !== filters.status) return false;
    if (filters.readStatus === 'read' && !b.isRead) return false;
    if (filters.readStatus === 'unread' && b.isRead) return false;
    return true;
  });
}
