const API =
  import.meta.env.VITE_API ||
  "https://fsa-book-buddy-b6e748d1380d.herokuapp.com/api";

async function request(path, options = {}) {
  const { token, headers, ...fetchOptions } = options;
  const response = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...fetchOptions,
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      "Something went wrong while contacting the Book Buddy API.";
    throw new Error(message);
  }

  return payload;
}

export function getBooks() {
  return request("/books");
}

export function getBook(id) {
  return request(`/books/${id}`);
}

export function registerUser(credentials) {
  return request("/users/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function loginUser(credentials) {
  return request("/users/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getAccount(token) {
  return request("/users/me", { token });
}

export function getReservations(token) {
  return request("/reservations", { token });
}

export function reserveBook(bookId, token) {
  return request("/reservations", {
    method: "POST",
    token,
    body: JSON.stringify({ bookId }),
  });
}

export function returnBook(reservationId, token) {
  return request(`/reservations/${reservationId}`, {
    method: "DELETE",
    token,
  });
}
