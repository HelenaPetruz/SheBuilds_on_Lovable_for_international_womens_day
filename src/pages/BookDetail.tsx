import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { ArrowLeft, BookOpen, Star, DollarSign, MapPin, Clock, Edit2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getBook, getShelf, getLibrary, updateBook, deleteBook, loanBook, returnBook, getLoanHistory } = useLibrary();

  const book = getBook(bookId!);
  const shelf = book ? getShelf(book.shelfId) : undefined;
  const library = book ? getLibrary(book.libraryId) : undefined;
  const loanHistory = getLoanHistory(bookId!);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(book || {} as any);
  const [loanOpen, setLoanOpen] = useState(false);
  const [borrower, setBorrower] = useState('');

  if (!book) return <div className="min-h-screen flex items-center justify-center text-muted-foreground font-body">Livro não encontrado</div>;

  const handleSave = () => {
    updateBook(editForm);
    setEditing(false);
  };

  const handleLoan = () => {
    if (!borrower.trim()) return;
    loanBook(bookId!, borrower.trim());
    setBorrower('');
    setLoanOpen(false);
  };

  const handleReturn = () => returnBook(bookId!);

  const handleDelete = () => {
    deleteBook(bookId!);
    navigate(-1);
  };

  const fmtDate = (d: string) => {
    try { return format(new Date(d), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 transition-colors font-body text-sm">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-6 flex gap-6 items-start border-b border-border">
            <div className="w-20 h-52 rounded shadow-lg flex-shrink-0 flex items-end justify-center pb-3"
              style={{ backgroundColor: book.coverColor || 'hsl(25, 35%, 42%)' }}
            >
              <span className="text-[10px] text-primary-foreground font-body" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                {book.title}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">{book.title}</h1>
                  <p className="text-lg text-muted-foreground font-body mt-1">{book.author || 'Autor desconhecido'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setEditForm(book); setEditing(true); }} className="border-border">
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="border-border hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {book.status === 'available' ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-body">📚 Na estante</span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-vintage-gold/20 text-vintage-spine font-body">📤 Emprestado para {book.loanedTo}</span>
                )}
                {book.isRead ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-body">✓ Lido</span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-body">Não lido</span>
                )}
                {book.genre && <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-body">{book.genre}</span>}
              </div>
              {book.isRead && book.rating > 0 && (
                <div className="mt-3 text-vintage-gold text-lg">{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</div>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-border">
            <div className="text-center">
              <DollarSign className="h-5 w-5 mx-auto text-vintage-gold mb-1" />
              <p className="text-sm text-muted-foreground font-body">Valor pago</p>
              <p className="font-display font-semibold">R$ {book.pricePaid.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <BookOpen className="h-5 w-5 mx-auto text-vintage-spine mb-1" />
              <p className="text-sm text-muted-foreground font-body">Páginas</p>
              <p className="font-display font-semibold">{book.pages || '—'}</p>
            </div>
            <div className="text-center">
              <MapPin className="h-5 w-5 mx-auto text-vintage-spine mb-1" />
              <p className="text-sm text-muted-foreground font-body">Localização</p>
              <p className="font-display font-semibold text-sm">{library?.name} / {shelf?.name}</p>
            </div>
            <div className="text-center">
              <Star className="h-5 w-5 mx-auto text-vintage-gold mb-1" />
              <p className="text-sm text-muted-foreground font-body">Posição</p>
              <p className="font-display font-semibold">#{book.positionOnShelf}</p>
            </div>
          </div>

          {book.isbn && (
            <div className="px-6 py-3 border-b border-border">
              <p className="text-sm text-muted-foreground font-body">ISBN: <span className="text-foreground">{book.isbn}</span></p>
            </div>
          )}
          {book.notes && (
            <div className="px-6 py-4 border-b border-border">
              <h3 className="font-display font-semibold text-sm mb-2 text-muted-foreground">Notas pessoais</h3>
              <p className="text-foreground font-body text-sm whitespace-pre-wrap">{book.notes}</p>
            </div>
          )}

          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-display font-semibold mb-3">Empréstimo</h3>
            {book.status === 'available' ? (
              <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-vintage-leather font-body">Emprestar livro</Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display">Emprestar "{book.title}"</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Input placeholder="Nome de quem vai receber" value={borrower} onChange={e => setBorrower(e.target.value)} className="bg-vintage-paper border-border" />
                    <Button onClick={handleLoan} className="w-full bg-primary text-primary-foreground hover:bg-vintage-leather">Confirmar empréstimo</Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex items-center gap-4 flex-wrap">
                <p className="text-sm text-muted-foreground font-body">
                  Emprestado para <strong className="text-foreground">{book.loanedTo}</strong>
                  {book.loanDate && <> em {fmtDate(book.loanDate)}</>}
                </p>
                <Button onClick={handleReturn} variant="outline" className="border-border font-body">Registrar devolução</Button>
              </div>
            )}
          </div>

          {loanHistory.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Histórico de empréstimos
              </h3>
              <div className="space-y-2">
                {loanHistory.map(record => (
                  <div key={record.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0 gap-2">
                    <span className="font-body">{record.borrowerName}</span>
                    <div className="text-muted-foreground font-body text-xs text-right">
                      <div>Emprestado: {fmtDate(record.loanDate)}</div>
                      {record.returned && record.returnDate && <div>Devolvido: {fmtDate(record.returnDate)}</div>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${record.returned ? 'bg-secondary text-secondary-foreground' : 'bg-vintage-gold/20 text-vintage-spine'}`}>
                      {record.returned ? 'Devolvido' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Editar Livro</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Título" value={editForm.title} onChange={e => setEditForm((f: any) => ({ ...f, title: e.target.value }))} className="bg-vintage-paper border-border" />
              <Input placeholder="Autor" value={editForm.author} onChange={e => setEditForm((f: any) => ({ ...f, author: e.target.value }))} className="bg-vintage-paper border-border" />
              <Input placeholder="Gênero" value={editForm.genre} onChange={e => setEditForm((f: any) => ({ ...f, genre: e.target.value }))} className="bg-vintage-paper border-border" />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Páginas" value={editForm.pages || ''} onChange={e => setEditForm((f: any) => ({ ...f, pages: Number(e.target.value) }))} className="bg-vintage-paper border-border" />
                <Input placeholder="ISBN" value={editForm.isbn} onChange={e => setEditForm((f: any) => ({ ...f, isbn: e.target.value }))} className="bg-vintage-paper border-border" />
              </div>
              <Input type="number" step="0.01" placeholder="Valor pago (R$)" value={editForm.pricePaid || ''} onChange={e => setEditForm((f: any) => ({ ...f, pricePaid: Number(e.target.value) }))} className="bg-vintage-paper border-border" />
              <div className="flex items-center gap-3">
                <Switch checked={editForm.isRead} onCheckedChange={(v: boolean) => setEditForm((f: any) => ({ ...f, isRead: v }))} />
                <Label className="font-body">Já li este livro</Label>
              </div>
              {editForm.isRead && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setEditForm((f: any) => ({ ...f, rating: star }))}
                      className={`text-2xl ${star <= editForm.rating ? 'text-vintage-gold' : 'text-muted-foreground/30'}`}
                    >★</button>
                  ))}
                </div>
              )}
              <Textarea placeholder="Notas pessoais" value={editForm.notes} onChange={e => setEditForm((f: any) => ({ ...f, notes: e.target.value }))} className="bg-vintage-paper border-border" />
              <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground hover:bg-vintage-leather">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default BookDetail;
