import { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Library as LibraryIcon, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Libraries = () => {
  const { libraries, addLibrary, deleteLibrary, getLibraryValue, getTotalBooks } = useLibrary();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addLibrary({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-vintage-spine" />
            <h1 className="text-3xl font-display font-bold text-foreground">Minha Biblioteca</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-vintage-leather font-body">
                <Plus className="h-4 w-4 mr-2" /> Nova Biblioteca
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Criar Biblioteca</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Nome da biblioteca" value={name} onChange={e => setName(e.target.value)} className="bg-vintage-paper border-border" />
                <Textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-vintage-paper border-border" />
                <Button onClick={handleAdd} className="w-full bg-primary text-primary-foreground hover:bg-vintage-leather">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {libraries.length === 0 ? (
          <div className="text-center py-20">
            <LibraryIcon className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-2xl font-display text-muted-foreground mb-2">Nenhuma biblioteca ainda</h2>
            <p className="text-muted-foreground font-body">Crie sua primeira biblioteca para começar a organizar seus livros.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {libraries.map(lib => (
              <Link
                key={lib.id}
                to={`/library/${lib.id}`}
                className="group block bg-card border border-border rounded-lg p-6 hover:shadow-lg hover:border-vintage-gold/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-vintage-spine transition-colors">{lib.name}</h3>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteLibrary(lib.id); }}
                    className="text-muted-foreground hover:text-destructive text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
                {lib.description && <p className="text-muted-foreground text-sm mb-4 line-clamp-2 font-body">{lib.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> {getTotalBooks(lib.id)} livros
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" /> R$ {getLibraryValue(lib.id).toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Libraries;
