import { useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Plus, ArrowLeft, GripVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GenreCombobox } from '@/components/GenreCombobox';
import { BookFilters, filterBooks, defaultFilters, type BookFilterState } from '@/components/BookFilters';

const COVER_COLORS = [
  'hsl(25, 35%, 42%)', 'hsl(0, 40%, 35%)', 'hsl(210, 30%, 35%)',
  'hsl(150, 25%, 35%)', 'hsl(40, 50%, 45%)', 'hsl(280, 25%, 35%)',
  'hsl(350, 30%, 30%)', 'hsl(180, 20%, 35%)',
];

const ShelfDetail = () => {
  const { id: libraryId, shelfId } = useParams<{ id: string; shelfId: string }>();
  const navigate = useNavigate();
  const { getLibrary, getShelf, getBooksForShelf, addBook, reorderBooks } = useLibrary();
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<BookFilterState>(defaultFilters);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', author: '', genre: '', pages: 0, isbn: '',
    pricePaid: 0, isRead: false, rating: 0, notes: '', coverColor: COVER_COLORS[0],
  });

  const library = getLibrary(libraryId!);
  const shelf = getShelf(shelfId!);
  if (!library || !shelf) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Não encontrado</div>;

  const allBooks = getBooksForShelf(shelfId!);
  const books = filterBooks(allBooks, filters);
  const hasActiveFilters = filters.search || filters.genre || filters.status || filters.readStatus;

  const handleDragStart = (bookId: string) => {
    setDraggedId(bookId);
  };

  const handleDragOver = (e: React.DragEvent, targetBookId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetBookId || hasActiveFilters) return;
  };

  const handleDrop = (e: React.DragEvent, targetBookId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetBookId || hasActiveFilters) return;
    const currentOrder = allBooks.map(b => b.id);
    const fromIdx = currentOrder.indexOf(draggedId);
    const toIdx = currentOrder.indexOf(targetBookId);
    if (fromIdx < 0 || toIdx < 0) return;
    currentOrder.splice(fromIdx, 1);
    currentOrder.splice(toIdx, 0, draggedId);
    reorderBooks(shelfId!, currentOrder);
    setDraggedId(null);
  };

  const handleDragEnd = () => setDraggedId(null);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addBook({
      ...form,
      shelfId: shelfId!,
      libraryId: libraryId!,
      positionOnShelf: allBooks.length + 1,
      status: 'available',
      loanedTo: '',
      loanDate: '',
    });
    setForm({ title: '', author: '', genre: '', pages: 0, isbn: '', pricePaid: 0, isRead: false, rating: 0, notes: '', coverColor: COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)] });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate(`/library/${libraryId}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 transition-colors font-body text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar para {library.name}
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">{shelf.name}</h1>
              <p className="text-muted-foreground mt-1 font-body">{allBooks.length} livros nesta estante</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-vintage-leather font-body">
                  <Plus className="h-4 w-4 mr-2" /> Novo Livro
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">Adicionar Livro</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <Input placeholder="Título *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-vintage-paper border-border" />
                  <Input placeholder="Autor" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="bg-vintage-paper border-border" />
                  <GenreCombobox value={form.genre} onChange={v => setForm(f => ({ ...f, genre: v }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" placeholder="Páginas" value={form.pages || ''} onChange={e => setForm(f => ({ ...f, pages: Number(e.target.value) }))} className="bg-vintage-paper border-border" />
                    <Input placeholder="ISBN" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} className="bg-vintage-paper border-border" />
                  </div>
                  <Input type="number" step="0.01" placeholder="Valor pago (R$)" value={form.pricePaid || ''} onChange={e => setForm(f => ({ ...f, pricePaid: Number(e.target.value) }))} className="bg-vintage-paper border-border" />
                  <div className="flex items-center gap-3">
                    <Switch checked={form.isRead} onCheckedChange={v => setForm(f => ({ ...f, isRead: v }))} />
                    <Label className="font-body">Já li este livro</Label>
                  </div>
                  {form.isRead && (
                    <div>
                      <Label className="font-body text-sm text-muted-foreground mb-1 block">Avaliação</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setForm(f => ({ ...f, rating: star }))}
                            className={`text-2xl transition-colors ${star <= form.rating ? 'text-vintage-gold' : 'text-muted-foreground/30'}`}
                          >★</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <Label className="font-body text-sm text-muted-foreground mb-2 block">Cor da lombada</Label>
                    <div className="flex gap-2">
                      {COVER_COLORS.map(c => (
                        <button key={c} onClick={() => setForm(f => ({ ...f, coverColor: c }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${form.coverColor === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <Textarea placeholder="Notas pessoais" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="bg-vintage-paper border-border" />
                  <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-vintage-leather">Adicionar Livro</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {allBooks.length > 0 && (
          <div className="mb-6">
            <BookFilters filters={filters} onChange={setFilters} />
          </div>
        )}
        {books.length === 0 && allBooks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-display text-muted-foreground mb-2">Estante vazia</p>
            <p className="text-muted-foreground font-body">Adicione livros a esta estante.</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground font-body">Nenhum livro encontrado com esses filtros.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map(book => (
              <div
                key={book.id}
                draggable={!hasActiveFilters}
                onDragStart={() => handleDragStart(book.id)}
                onDragOver={e => handleDragOver(e, book.id)}
                onDrop={e => handleDrop(e, book.id)}
                onDragEnd={handleDragEnd}
                className={`group bg-card border border-border rounded-lg p-4 hover:shadow-lg hover:border-vintage-gold/50 transition-all duration-300 flex gap-4 ${draggedId === book.id ? 'opacity-50 scale-95' : ''} ${!hasActiveFilters ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {!hasActiveFilters && (
                  <div className="flex items-center text-muted-foreground/40 -ml-1 mr-0">
                    <GripVertical className="h-5 w-5" />
                  </div>
                )}
                <Link to={`/book/${book.id}`} className="flex gap-4 flex-1 min-w-0">
                  <div className="w-10 h-32 rounded-sm flex-shrink-0 shadow-md"
                    style={{ backgroundColor: book.coverColor || 'hsl(25, 35%, 42%)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground/50 font-body">#{book.positionOnShelf}</span>
                      <h3 className="font-display font-semibold text-foreground group-hover:text-vintage-spine transition-colors truncate">{book.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-body truncate">{book.author}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {book.isRead && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-body">Lido</span>
                      )}
                      {book.status === 'loaned' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-vintage-gold/20 text-vintage-spine font-body">Emprestado</span>
                      )}
                    </div>
                    {book.isRead && book.rating > 0 && (
                      <div className="mt-1 text-vintage-gold text-sm">
                        {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShelfDetail;
