import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Library, Shelf, Book, LoanRecord } from '@/types/library';

interface LibraryContextType {
  libraries: Library[];
  shelves: Shelf[];
  books: Book[];
  loanRecords: LoanRecord[];
  addLibrary: (lib: Omit<Library, 'id' | 'createdAt'>) => void;
  updateLibrary: (lib: Library) => void;
  deleteLibrary: (id: string) => void;
  addShelf: (shelf: Omit<Shelf, 'id'>) => void;
  updateShelf: (shelf: Shelf) => void;
  deleteShelf: (id: string) => void;
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  reorderBooks: (shelfId: string, orderedBookIds: string[]) => void;
  moveBookToPosition: (bookId: string, newPosition: number) => void;
  loanBook: (bookId: string, borrowerName: string) => void;
  returnBook: (bookId: string) => void;
  getLibrary: (id: string) => Library | undefined;
  getShelf: (id: string) => Shelf | undefined;
  getBook: (id: string) => Book | undefined;
  getShelvesForLibrary: (libraryId: string) => Shelf[];
  getBooksForShelf: (shelfId: string) => Book[];
  getBooksForLibrary: (libraryId: string) => Book[];
  getLoanHistory: (bookId: string) => LoanRecord[];
  getLibraryValue: (libraryId: string) => number;
  getTotalBooks: (libraryId: string) => number;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

const genId = () => crypto.randomUUID();

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [libraries, setLibraries] = useState<Library[]>(() => loadState('libraries', []));
  const [shelves, setShelves] = useState<Shelf[]>(() => loadState('shelves', []));
  const [books, setBooks] = useState<Book[]>(() => loadState('books', []));
  const [loanRecords, setLoanRecords] = useState<LoanRecord[]>(() => loadState('loanRecords', []));

  useEffect(() => { localStorage.setItem('libraries', JSON.stringify(libraries)); }, [libraries]);
  useEffect(() => { localStorage.setItem('shelves', JSON.stringify(shelves)); }, [shelves]);
  useEffect(() => { localStorage.setItem('books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('loanRecords', JSON.stringify(loanRecords)); }, [loanRecords]);

  const addLibrary = useCallback((lib: Omit<Library, 'id' | 'createdAt'>) => {
    setLibraries(prev => [...prev, { ...lib, id: genId(), createdAt: new Date().toISOString() }]);
  }, []);
  const updateLibrary = useCallback((lib: Library) => {
    setLibraries(prev => prev.map(l => l.id === lib.id ? lib : l));
  }, []);
  const deleteLibrary = useCallback((id: string) => {
    const shelfIds = shelves.filter(s => s.libraryId === id).map(s => s.id);
    setBooks(prev => prev.filter(b => !shelfIds.includes(b.shelfId)));
    setShelves(prev => prev.filter(s => s.libraryId !== id));
    setLibraries(prev => prev.filter(l => l.id !== id));
  }, [shelves]);

  const addShelf = useCallback((shelf: Omit<Shelf, 'id'>) => {
    setShelves(prev => [...prev, { ...shelf, id: genId() }]);
  }, []);
  const updateShelf = useCallback((shelf: Shelf) => {
    setShelves(prev => prev.map(s => s.id === shelf.id ? shelf : s));
  }, []);
  const deleteShelf = useCallback((id: string) => {
    setBooks(prev => prev.filter(b => b.shelfId !== id));
    setShelves(prev => prev.filter(s => s.id !== id));
  }, []);

  const addBook = useCallback((book: Omit<Book, 'id' | 'createdAt'>) => {
    setBooks(prev => [...prev, { ...book, id: genId(), createdAt: new Date().toISOString() }]);
  }, []);
  const updateBook = useCallback((book: Book) => {
    setBooks(prev => prev.map(b => b.id === book.id ? book : b));
  }, []);
  const deleteBook = useCallback((id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  }, []);

  const reorderBooks = useCallback((shelfId: string, orderedBookIds: string[]) => {
    setBooks(prev => prev.map(b => {
      if (b.shelfId !== shelfId) return b;
      const idx = orderedBookIds.indexOf(b.id);
      return idx >= 0 ? { ...b, positionOnShelf: idx + 1 } : b;
    }));
  }, []);

  const moveBookToPosition = useCallback((bookId: string, newPosition: number) => {
    setBooks(prev => {
      const book = prev.find(b => b.id === bookId);
      if (!book) return prev;
      const shelfBooks = prev.filter(b => b.shelfId === book.shelfId && b.id !== bookId).sort((a, b) => a.positionOnShelf - b.positionOnShelf);
      const clamped = Math.max(1, Math.min(newPosition, shelfBooks.length + 1));
      shelfBooks.splice(clamped - 1, 0, book);
      return prev.map(b => {
        if (b.shelfId !== book.shelfId) return b;
        const idx = shelfBooks.findIndex(sb => sb.id === b.id);
        return idx >= 0 ? { ...b, positionOnShelf: idx + 1 } : b;
      });
    });
  }, []);

  const loanBook = useCallback((bookId: string, borrowerName: string) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'loaned' as const, loanedTo: borrowerName, loanDate: new Date().toISOString() } : b));
    setLoanRecords(prev => [...prev, { id: genId(), bookId, borrowerName, loanDate: new Date().toISOString(), returnDate: null, returned: false }]);
  }, []);

  const returnBook = useCallback((bookId: string) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'available' as const, loanedTo: '', loanDate: '' } : b));
    setLoanRecords(prev => prev.map(r => r.bookId === bookId && !r.returned ? { ...r, returned: true, returnDate: new Date().toISOString() } : r));
  }, []);

  const getLibrary = useCallback((id: string) => libraries.find(l => l.id === id), [libraries]);
  const getShelf = useCallback((id: string) => shelves.find(s => s.id === id), [shelves]);
  const getBook = useCallback((id: string) => books.find(b => b.id === id), [books]);
  const getShelvesForLibrary = useCallback((libraryId: string) => shelves.filter(s => s.libraryId === libraryId).sort((a, b) => a.position - b.position), [shelves]);
  const getBooksForShelf = useCallback((shelfId: string) => books.filter(b => b.shelfId === shelfId).sort((a, b) => a.positionOnShelf - b.positionOnShelf), [books]);
  const getBooksForLibrary = useCallback((libraryId: string) => books.filter(b => b.libraryId === libraryId), [books]);
  const getLoanHistory = useCallback((bookId: string) => loanRecords.filter(r => r.bookId === bookId).sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime()), [loanRecords]);
  const getLibraryValue = useCallback((libraryId: string) => books.filter(b => b.libraryId === libraryId).reduce((sum, b) => sum + b.pricePaid, 0), [books]);
  const getTotalBooks = useCallback((libraryId: string) => books.filter(b => b.libraryId === libraryId).length, [books]);

  return (
    <LibraryContext.Provider value={{
      libraries, shelves, books, loanRecords,
      addLibrary, updateLibrary, deleteLibrary,
      addShelf, updateShelf, deleteShelf,
      addBook, updateBook, deleteBook,
      loanBook, returnBook,
      getLibrary, getShelf, getBook,
      getShelvesForLibrary, getBooksForShelf, getBooksForLibrary,
      getLoanHistory, getLibraryValue, getTotalBooks,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
