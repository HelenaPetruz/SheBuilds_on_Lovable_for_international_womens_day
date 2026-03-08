import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Plus, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookFilters, filterBooks, defaultFilters, type BookFilterState } from '@/components/BookFilters';

const LibraryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getLibrary, getShelvesForLibrary, getBooksForShelf, getBooksForLibrary, addShelf, deleteShelf, getLibraryValue, getTotalBooks, reorderBooks } = useLibrary();
  const [open, setOpen] = useState(false);
  const [shelfName, setShelfName] = useState('');
  const [filters, setFilters] = useState<BookFilterState>(defaultFilters);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragShelfId, setDragShelfId] = useState<string | null>(null);

  const library = getLibrary(id!);
  if (!library) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Biblioteca não encontrada</div>;

  const shelves = getShelvesForLibrary(id!);
  const allLibraryBooks = getBooksForLibrary(id!);
  const hasAnyBooks = allLibraryBooks.length > 0;
  const hasActiveFilters = filters.search || filters.genre || filters.status || filters.readStatus;

  const handleAddShelf = () => {
    if (!shelfName.trim()) return;
    addShelf({ libraryId: id!, name: shelfName.trim(), position: shelves.length + 1 });
    setShelfName('');
    setOpen(false);
  };

  const handleDragStart = (bookId: string, shelfId: string) => {
    setDraggedId(bookId);
    setDragShelfId(shelfId);
  };

  const handleDragOver = (e: React.DragEvent, targetBookId: string, targetShelfId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetBookId || dragShelfId !== targetShelfId || hasActiveFilters) return;
  };

  const handleDrop = (e: React.DragEvent, targetBookId: string, targetShelfId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetBookId || dragShelfId !== targetShelfId || hasActiveFilters) return;
    const shelfBooks = getBooksForShelf(targetShelfId);
    const currentOrder = shelfBooks.map(b => b.id);
    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetBookId);
    if (fromIdx < 0 || toIdx < 0) return;
    currentOrder.splice(fromIdx, 1);
    currentOrder.splice(toIdx, 0, draggedId);
    reorderBooks(targetShelfId, currentOrder);
    setDraggedId(null);
    setDragShelfId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragShelfId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 transition-colors font-body text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">{library.name}</h1>
              {library.description && <p className="text-muted-foreground mt-1 font-body">{library.description}</p>}
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{getTotalBooks(id!)} livros</span>
                <span>Valor: R$ {getLibraryValue(id!).toFixed(2)}</span>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-vintage-leather font-body">
                  <Plus className="h-4 w-4 mr-2" /> Nova Estante
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Adicionar Estante</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <Input placeholder="Nome da estante" value={shelfName} onChange={e => setShelfName(e.target.value)} className="bg-vintage-paper border-border" />
                  <Button onClick={handleAddShelf} className="w-full bg-primary text-primary-foreground hover:bg-vintage-leather">Adicionar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {hasAnyBooks && (
          <div className="mb-6">
            <BookFilters filters={filters} onChange={setFilters} />
          </div>
        )}
        {shelves.length === 0 ? (
          <div className="text-center py-20">
            <Layers className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-2xl font-display text-muted-foreground mb-2">Nenhuma estante</h2>
            <p className="text-muted-foreground font-body">Adicione estantes para organizar seus livros.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {shelves.map(shelf => {
              const shelfBooks = getBooksForShelf(shelf.id);
              const filteredBooks = hasActiveFilters ? filterBooks(shelfBooks, filters) : shelfBooks;
              if (hasActiveFilters && filteredBooks.length === 0) return null;
              return (
                <div key={shelf.id} className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 bg-secondary/50 border-b border-border">
                    <Link to={`/library/${id}/shelf/${shelf.id}`} className="flex items-center gap-2 hover:text-vintage-spine transition-colors">
                      <Layers className="h-5 w-5 text-vintage-gold" />
                      <h3 className="text-lg font-display font-semibold">{shelf.name}</h3>
                      <span className="text-sm text-muted-foreground">({filteredBooks.length}{hasActiveFilters ? `/${shelfBooks.length}` : ''} livros)</span>
                    </Link>
                    <div className="flex gap-2">
                      <Link to={`/library/${id}/shelf/${shelf.id}`}>
                        <Button variant="outline" size="sm" className="border-border font-body text-xs">Ver estante</Button>
                      </Link>
                      <button onClick={() => deleteShelf(shelf.id)} className="text-muted-foreground hover:text-destructive text-sm px-2">✕</button>
                    </div>
                  </div>
                  {filteredBooks.length > 0 && (
                    <div className="p-4 flex gap-3 overflow-x-auto">
                      {filteredBooks.slice(0, 8).map(book => (
                        <Link key={book.id} to={`/book/${book.id}`} className="flex-shrink-0">
                          <div
                            className="w-12 h-40 rounded-sm shadow-md flex items-end justify-center pb-2 hover:scale-105 transition-transform cursor-pointer relative"
                            style={{ backgroundColor: book.coverColor || 'hsl(25, 35%, 42%)' }}
                          >
                            <span className="text-[8px] text-primary-foreground font-body writing-vertical transform rotate-180 truncate max-h-32 px-0.5"
                              style={{ writingMode: 'vertical-rl' }}
                            >
                              {book.title}
                            </span>
                            {book.status === 'loaned' && (
                              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-vintage-gold" title="Emprestado" />
                            )}
                          </div>
                        </Link>
                      ))}
                      {filteredBooks.length > 8 && (
                        <div className="flex-shrink-0 w-12 h-40 rounded-sm border border-dashed border-border flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">+{filteredBooks.length - 8}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default LibraryDetail;
