"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useToast } from "../../../providers/ToastProvider";

type Book = {
  id: string;
  title: string;
  authors: string[];
  cover: string;
  subject: string[];
  publisher: string;
  year: string;
  isbn?: string;
  description?: string;
};

export default function BibliotecaPage() {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [myLibrary, setMyLibrary] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"search" | "my-library">("search");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      setLoading(false);
      loadMyLibrary(user.id);
    };
    getUser();
  }, [router]);

  const loadMyLibrary = async (userId: string) => {
    try {
      const saved = localStorage.getItem(`biblioteca_${userId}`);
      if (saved) {
        setMyLibrary(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading library:", e);
    }
  };

  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      toast.push({ type: "warning", message: "Escribe algo para buscar" });
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,cover_i,subject,publisher,publish_year,isbn`
      );
      const data = await response.json();

      const books: Book[] = data.docs.map((doc: any, index: number) => ({
        id: doc.key || `book-${index}`,
        title: doc.title || "Sin título",
        authors: doc.author_name || ["Autor desconocido"],
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : "/placeholder-book.png",
        subject: doc.subject?.slice(0, 3) || [],
        publisher: doc.publisher?.[0] || "Editorial desconocida",
        year: doc.publish_year?.[0]?.toString() || "N/A",
        isbn: doc.isbn?.[0],
      }));

      setSearchResults(books);
      toast.push({ type: "success", message: `${books.length} libros encontrados` });
    } catch (error) {
      console.error("Error searching books:", error);
      toast.push({ type: "error", message: "Error al buscar libros" });
    } finally {
      setSearching(false);
    }
  };

  const addToLibrary = (book: Book) => {
    if (myLibrary.some((b) => b.id === book.id)) {
      toast.push({ type: "info", message: "Este libro ya está en tu biblioteca" });
      return;
    }

    const updatedLibrary = [...myLibrary, book];
    setMyLibrary(updatedLibrary);
    localStorage.setItem(`biblioteca_${user.id}`, JSON.stringify(updatedLibrary));
    toast.push({ type: "success", message: "Libro agregado a tu biblioteca" });
  };

  const removeFromLibrary = (bookId: string) => {
    const updatedLibrary = myLibrary.filter((b) => b.id !== bookId);
    setMyLibrary(updatedLibrary);
    localStorage.setItem(`biblioteca_${user.id}`, JSON.stringify(updatedLibrary));
    toast.push({ type: "info", message: "Libro eliminado de tu biblioteca" });
  };

  if (loading) {
    return (
      <div className="biblioteca-container biblioteca-loading">
        <i className="fas fa-spinner biblioteca-spinner"></i>
      </div>
    );
  }

  return (
    <div className="biblioteca-container">
      {/* Header */}
      <div className="biblioteca-header">
        <div className="max-w-7xl mx-auto">
          <h1>
            <i className="fas fa-book-open"></i>
            Biblioteca Digital
          </h1>
          <p>Busca y guarda recursos educativos de todo el mundo</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="biblioteca-tabs">
          <button
            onClick={() => setActiveTab("search")}
            className={`biblioteca-tab ${activeTab === "search" ? "active" : ""}`}
          >
            <i className="fas fa-search mr-2"></i>
            Buscar Libros
          </button>
          <button
            onClick={() => setActiveTab("my-library")}
            className={`biblioteca-tab ${activeTab === "my-library" ? "active" : ""}`}
          >
            <i className="fas fa-bookmark mr-2"></i>
            Mi Biblioteca ({myLibrary.length})
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div>
            {/* Search Bar */}
            <div className="biblioteca-search-container">
              <div className="biblioteca-search-bar">
                <div className="biblioteca-search-input-wrapper">
                  <i className="fas fa-search biblioteca-search-icon"></i>
                  <input
                    type="text"
                    placeholder="Buscar libros por título, autor, tema..."
                    className="biblioteca-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && searchBooks(searchQuery)}
                  />
                </div>
                <button
                  onClick={() => searchBooks(searchQuery)}
                  disabled={searching}
                  className="biblioteca-search-btn"
                >
                  {searching ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i>
                      Buscar
                    </>
                  )}
                </button>
              </div>

              {/* Quick Search Suggestions */}
              <div className="biblioteca-quick-search">
                <span>Búsquedas rápidas:</span>
                {["Matemáticas", "Física", "Historia", "Biología", "Literatura"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        searchBooks(suggestion);
                      }}
                      className="biblioteca-quick-btn"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="biblioteca-books-grid">
                {searchResults.map((book) => (
                  <div key={book.id} className="biblioteca-book-card">
                    <div className="biblioteca-book-cover">
                      {book.cover !== "/placeholder-book.png" ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%236b7280'%3ENo cover%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <i className="fas fa-book text-gray-400 text-4xl"></i>
                        </div>
                      )}
                    </div>
                    <div className="biblioteca-book-info">
                      <h3 className="biblioteca-book-title">{book.title}</h3>
                      <p className="biblioteca-book-author">
                        {book.authors.slice(0, 2).join(", ")}
                      </p>
                      {book.subject.length > 0 && (
                        <div className="biblioteca-book-subjects">
                          {book.subject.slice(0, 2).map((subject: string, idx: number) => (
                            <span key={idx} className="biblioteca-subject-badge">
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="biblioteca-book-meta">
                        <span>
                          <i className="fas fa-calendar-alt mr-1"></i>
                          {book.year}
                        </span>
                        <span>
                          <i className="fas fa-building mr-1"></i>
                          {book.publisher}
                        </span>
                      </div>
                      <div className="biblioteca-book-actions">
                        <button
                          onClick={() => addToLibrary(book)}
                          className="biblioteca-btn biblioteca-btn-primary"
                        >
                          <i className="fas fa-plus"></i>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !searching && (
              <div className="biblioteca-empty-state">
                <div className="biblioteca-empty-icon">
                  <i className="fas fa-book-open"></i>
                </div>
                <h3 className="biblioteca-empty-title">
                  Busca contenido educativo
                </h3>
                <p className="biblioteca-empty-text">
                  Usa el buscador para encontrar libros, artículos y recursos
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Library Tab */}
        {activeTab === "my-library" && (
          <div>
            {myLibrary.length > 0 ? (
              <div className="biblioteca-books-grid">
                {myLibrary.map((book) => (
                  <div key={book.id} className="biblioteca-book-card">
                    <div className="biblioteca-book-cover">
                      {book.cover !== "/placeholder-book.png" ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300'%3E%3Crect fill='%23e5e7eb' width='200' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%236b7280'%3ENo cover%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">
                          <i className="fas fa-book text-gray-400 text-4xl"></i>
                        </div>
                      )}
                    </div>
                    <div className="biblioteca-book-info">
                      <h3 className="biblioteca-book-title">{book.title}</h3>
                      <p className="biblioteca-book-author">
                        {book.authors.slice(0, 2).join(", ")}
                      </p>
                      {book.subject.length > 0 && (
                        <div className="biblioteca-book-subjects">
                          {book.subject.slice(0, 2).map((subject: string, idx: number) => (
                            <span key={idx} className="biblioteca-subject-badge">
                              {subject}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="biblioteca-book-actions">
                        {book.isbn && (
                          <a
                            href={`https://openlibrary.org/isbn/${book.isbn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="biblioteca-btn biblioteca-btn-success"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            Ver
                          </a>
                        )}
                        <button
                          onClick={() => removeFromLibrary(book.id)}
                          className="biblioteca-btn biblioteca-btn-danger"
                        >
                          <i className="fas fa-trash"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="biblioteca-empty-state">
                <div className="biblioteca-empty-icon">
                  <i className="fas fa-bookmark"></i>
                </div>
                <h3 className="biblioteca-empty-title">
                  Tu biblioteca está vacía
                </h3>
                <p className="biblioteca-empty-text">
                  Busca y agrega recursos educativos a tu biblioteca personal
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="biblioteca-btn biblioteca-btn-primary"
                  style={{ width: "auto", padding: "0.75rem 2rem" }}
                >
                  <i className="fas fa-search"></i>
                  Comenzar a buscar
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
