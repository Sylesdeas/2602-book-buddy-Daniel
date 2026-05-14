import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import { useAuth } from "./Auth/useAuth";
import {
  getAccount,
  getBook,
  getBooks,
  getReservations,
  reserveBook,
  returnBook,
} from "./api/books";

export default function App() {
  const auth = useAuth();

  return (
    <div className="app-shell">
      <SiteHeader auth={auth} />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<BooksPage auth={auth} />} />
          <Route path="/books" element={<BooksPage auth={auth} />} />
          <Route path="/books/:id" element={<BookDetailsPage auth={auth} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<AccountPage auth={auth} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function SiteHeader({ auth }) {
  return (
    <header className="site-header">
      <div className="brand-block">
        <Link to="/" className="brand-mark">
          <span className="brand-kicker">Neighborhood Library</span>
          <span className="brand-name">Book Buddy</span>
        </Link>
        <p className="brand-copy">
          Browse the catalog, borrow what is available, and keep your account
          tidy.
        </p>
      </div>

      <nav className="site-nav" aria-label="Main navigation">
        <NavLink to="/books" className={getNavClass}>
          Catalog
        </NavLink>
        <NavLink to="/account" className={getNavClass}>
          Account
        </NavLink>
        {auth.isLoggedIn ? (
          <button type="button" className="nav-button" onClick={auth.logout}>
            Log out
          </button>
        ) : (
          <>
            <NavLink to="/login" className={getNavClass}>
              Log in
            </NavLink>
            <NavLink to="/register" className={getNavClass}>
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function BooksPage({ auth }) {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getBooks()
      .then((data) => {
        setBooks(data);
      })
      .catch((fetchError) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredBooks = books.filter((book) => {
    const haystack =
      `${book.title} ${book.author} ${book.description}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <section className="page-stack">
      <div className="hero-card">
        <div>
          <span className="eyebrow">Open catalog</span>
          <h1>Find your next checkout.</h1>
          <p>
            Every visitor can browse the full collection. Sign in when you are
            ready to reserve an available title.
          </p>
        </div>
        <label className="search-field">
          <span>Search the shelves</span>
          <input
            type="search"
            placeholder="Try title, author, or keyword"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {error ? <StatusCard tone="error" message={error} /> : null}
      {auth.accountError ? (
        <StatusCard tone="error" message={auth.accountError} />
      ) : null}

      {loading ? (
        <StatusCard tone="neutral" message="Loading the catalog..." />
      ) : (
        <section className="books-grid" aria-label="Books in catalog">
          {filteredBooks.map((book) => (
            <article key={book.id} className="book-card">
              <img
                src={book.coverimage}
                alt={`Cover of ${book.title}`}
                className="book-cover"
              />
              <div className="book-card-body">
                <span
                  className={`availability ${book.available ? "is-open" : "is-taken"}`}
                >
                  {book.available ? "Available now" : "Checked out"}
                </span>
                <h2>{book.title}</h2>
                <p className="book-author">{book.author}</p>
                <p className="book-description">{book.description}</p>
                <Link to={`/books/${book.id}`} className="primary-link">
                  View details
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {!loading && !filteredBooks.length ? (
        <StatusCard
          tone="neutral"
          message="No books matched that search yet. Try a broader keyword."
        />
      ) : null}
    </section>
  );
}

function BookDetailsPage({ auth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");

    getBook(id)
      .then((data) => {
        setBook(data);
      })
      .catch((fetchError) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  async function handleReserve() {
    if (!auth.token) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    setActionMessage("");

    try {
      await reserveBook(Number(id), auth.token);
      const [freshBook, freshAccount] = await Promise.all([
        getBook(id),
        getAccount(auth.token),
      ]);
      setBook(freshBook);
      auth.setAccount(freshAccount);
      setActionMessage(
        "Book reserved. You can manage it from your account page.",
      );
    } catch (actionError) {
      setActionMessage(actionError.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <StatusCard tone="neutral" message="Loading book details..." />;
  }

  if (error) {
    return <StatusCard tone="error" message={error} />;
  }

  if (!book) {
    return <StatusCard tone="error" message="That book could not be found." />;
  }

  return (
    <section className="detail-layout">
      <img
        src={book.coverimage}
        alt={`Cover of ${book.title}`}
        className="detail-cover"
      />
      <div className="detail-panel">
        <Link to="/books" className="back-link">
          Back to catalog
        </Link>
        <span
          className={`availability ${book.available ? "is-open" : "is-taken"}`}
        >
          {book.available ? "Available to reserve" : "Currently reserved"}
        </span>
        <h1>{book.title}</h1>
        <p className="book-author">{book.author}</p>
        <p className="detail-description">{book.description}</p>

        {actionMessage ? (
          <StatusCard tone="neutral" message={actionMessage} />
        ) : null}

        {auth.isLoggedIn ? (
          <button
            type="button"
            className="primary-button"
            onClick={handleReserve}
            disabled={!book.available || actionLoading}
          >
            {actionLoading
              ? "Reserving..."
              : book.available
                ? "Reserve book"
                : "Unavailable"}
          </button>
        ) : (
          <p className="inline-note">
            <Link to="/login">Log in</Link> or{" "}
            <Link to="/register">create an account</Link> to reserve this book.
          </p>
        )}
      </div>
    </section>
  );
}

function AccountPage({ auth }) {
  const { account, accountLoading, isLoggedIn, setAccount, token } = auth;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeReturnId, setActiveReturnId] = useState(null);

  useEffect(() => {
    if (!token || !isLoggedIn) {
      return;
    }

    setLoading(true);
    setError("");

    Promise.all([getAccount(token), getReservations(token)])
      .then(([accountData, reservationData]) => {
        setAccount(accountData);
        setReservations(reservationData);
      })
      .catch((fetchError) => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isLoggedIn, setAccount, token]);

  async function handleReturn(reservationId) {
    setActiveReturnId(reservationId);
    setMessage("");
    setError("");

    try {
      await returnBook(reservationId, token);
      const [accountData, reservationData] = await Promise.all([
        getAccount(token),
        getReservations(token),
      ]);
      setAccount(accountData);
      setReservations(reservationData);
      setMessage("Book returned successfully.");
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActiveReturnId(null);
    }
  }

  if (accountLoading) {
    return <StatusCard tone="neutral" message="Loading your account..." />;
  }

  if (!isLoggedIn) {
    return (
      <section className="page-stack">
        <div className="hero-card compact">
          <div>
            <span className="eyebrow">Account access</span>
            <h1>Please log in.</h1>
            <p>
              Your account page shows your profile details and any books you
              currently have reserved.
            </p>
          </div>
          <div className="inline-actions">
            <Link to="/login" className="primary-link">
              Log in
            </Link>
            <Link to="/register" className="secondary-link">
              Register
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="account-header">
        <div>
          <span className="eyebrow">Your profile</span>
          <h1>
            {account?.firstname} {account?.lastname}
          </h1>
          <p>{account?.email}</p>
        </div>
        <div className="account-summary">
          <span>Checked out now</span>
          <strong>{reservations.length}</strong>
        </div>
      </div>

      {message ? <StatusCard tone="neutral" message={message} /> : null}
      {error ? <StatusCard tone="error" message={error} /> : null}
      {loading ? (
        <StatusCard tone="neutral" message="Loading your reservations..." />
      ) : null}

      <section className="reservation-list" aria-label="Your reservations">
        {reservations.map((reservation) => (
          <article key={reservation.id} className="reservation-card">
            <img
              src={reservation.coverimage}
              alt={`Cover of ${reservation.title}`}
              className="reservation-cover"
            />
            <div className="reservation-copy">
              <h2>{reservation.title}</h2>
              <p className="book-author">{reservation.author}</p>
              <p>{reservation.description}</p>
            </div>
            <div className="reservation-actions">
              <Link
                to={`/books/${reservation.bookid}`}
                className="secondary-link"
              >
                View book
              </Link>
              <button
                type="button"
                className="primary-button"
                onClick={() => handleReturn(reservation.id)}
                disabled={activeReturnId === reservation.id}
              >
                {activeReturnId === reservation.id
                  ? "Returning..."
                  : "Return book"}
              </button>
            </div>
          </article>
        ))}
      </section>

      {!loading && !reservations.length ? (
        <StatusCard
          tone="neutral"
          message="You do not have any books checked out right now."
        />
      ) : null}
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="hero-card compact">
      <div>
        <span className="eyebrow">Missing page</span>
        <h1>That page is not on the shelf.</h1>
        <p>Head back to the catalog to keep browsing.</p>
      </div>
      <Link to="/books" className="primary-link">
        Go to catalog
      </Link>
    </section>
  );
}

function StatusCard({ tone, message }) {
  return <p className={`status-card tone-${tone}`}>{message}</p>;
}

function getNavClass({ isActive }) {
  return `nav-link${isActive ? " is-active" : ""}`;
}
