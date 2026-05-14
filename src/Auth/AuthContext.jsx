import { useEffect, useMemo, useState } from "react";
import { getAccount, loginUser, registerUser } from "../api/books";
import { AuthContext } from "./context";

const TOKEN_KEY = "book-buddy-token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(Boolean(token));
  const [accountError, setAccountError] = useState("");

  useEffect(() => {
    if (!token) {
      setAccount(null);
      setAccountLoading(false);
      setAccountError("");
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    setAccountLoading(true);
    setAccountError("");

    getAccount(token)
      .then((data) => {
        setAccount(data);
      })
      .catch((error) => {
        setToken("");
        setAccount(null);
        setAccountError(error.message);
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        setAccountLoading(false);
      });
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      setToken,
      account,
      setAccount,
      accountLoading,
      accountError,
      isLoggedIn: Boolean(token && account),
      async register(credentials) {
        const result = await registerUser(credentials);
        const accountData = await getAccount(result.token);
        setAccount(accountData);
        setToken(result.token);
        return result;
      },
      async login(credentials) {
        const result = await loginUser(credentials);
        const accountData = await getAccount(result.token);
        setAccount(accountData);
        setToken(result.token);
        return result;
      },
      logout() {
        setToken("");
        setAccount(null);
      },
    }),
    [account, accountError, accountLoading, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
