import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LITERARY_GENRES } from '@/constants/genres';

interface GenreComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function GenreCombobox({ value, onChange, placeholder = 'Selecione o gênero...' }: GenreComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-vintage-paper border-border font-body font-normal"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 min-w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput placeholder="Buscar gênero..." className="font-body" />
          <CommandList>
            <CommandEmpty className="font-body text-sm p-4 text-center text-muted-foreground">Nenhum gênero encontrado.</CommandEmpty>
            <CommandGroup>
              {LITERARY_GENRES.map(genre => (
                <CommandItem
                  key={genre}
                  value={genre}
                  onSelect={() => {
                    onChange(genre === value ? '' : genre);
                    setOpen(false);
                  }}
                  className="font-body"
                >
                  <Check className={cn('mr-2 h-4 w-4', value === genre ? 'opacity-100' : 'opacity-0')} />
                  {genre}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
