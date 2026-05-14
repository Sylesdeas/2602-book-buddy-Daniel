import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "./useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function tryRegister(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstname = formData.get("firstname");
    const lastname = formData.get("lastname");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await register({ firstname, lastname, email, password });
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
        <span className="eyebrow">New reader</span>
        <h1>Create your library account.</h1>
        <p>
          Register to reserve books, see your profile, and keep track of what
          you have checked out.
        </p>
      </div>

      <form className="auth-card" onSubmit={tryRegister}>
        <label>
          <span>First name</span>
          <input type="text" name="firstname" required />
        </label>

        <label>
          <span>Last name</span>
          <input type="text" name="lastname" />
        </label>

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
          {submitting ? "Creating account..." : "Register"}
        </button>

        <p className="inline-note">
          Already have an account? <Link to="/login">Log in here</Link>.
        </p>
      </form>
    </section>
  );
}
