export interface Library {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Shelf {
  id: string;
  libraryId: string;
  name: string;
  position: number;
}

export interface Book {
  id: string;
  shelfId: string;
  libraryId: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  isbn: string;
  positionOnShelf: number;
  pricePaid: number;
  isRead: boolean;
  rating: number; // 0-5
  notes: string;
  status: 'available' | 'loaned';
  loanedTo: string;
  loanDate: string;
  coverColor: string;
  createdAt: string;
}

export interface LoanRecord {
  id: string;
  bookId: string;
  borrowerName: string;
  loanDate: string;
  returnDate: string | null;
  returned: boolean;
}
