import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function tryLogin(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await login({ email, password });
      navigate("/account");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to your account.</h1>
        <p>Use your Book Buddy account to reserve available books and return them when you are done.</p>
      </div>

      <form className="auth-card" onSubmit={tryLogin}>
        <label>
          <span>Email</span>
          <input type="email" name="email" required />
        </label>

        <label>
          <span>Password</span>
          <input type="password" name="password" required />
        </label>

        {error ? <p className="status-card tone-error">{error}</p> : null}

        <button className="primary-button" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="inline-note">
          Need an account? <Link to="/register">Create one here</Link>.
        </p>
      </form>
    </section>
  );
}
