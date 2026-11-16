
import { useState } from "react";
import { useAuth } from "../hooks/use_auth.jsx";
import "./login.css";

export default function Login({ onAuthenticated, onGuestContinue }) {
  const {
    signIn,
    signUp,
    signInAsGuest,
  } = useAuth();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        await signIn(email, password);
        onAuthenticated?.();
      } else {
        const data = await signUp(email, password);

        if (!data.session) {
          setMessage(
            "Account created! Check your email to confirm your account before signing in."
          );
        } else {
          onAuthenticated?.();
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signInAsGuest();
      onGuestContinue?.();
    } catch (err) {
      setError(err.message || "Guest sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-layout">
        <section className="login-intro">
          <img
            className="login-logo"
            src="/theunsent_logo.png"
            alt="The Unsent Project"
          />
          <span className="login-eyebrow">A PLACE FOR UNSPOKEN THINGS</span>
          <h1>Come in,<br /><i>stay a while.</i></h1>
          <p>
            Some words are easier to share when they do not have to carry your
            name. Keep your memories close, or simply leave something honest
            here.
          </p>
          <div className="login-intro-note">
            <span>“</span>
            <p>There is room here for everything left unsaid.</p>
          </div>
        </section>

        <section className="login-card">

        <div className="login-heading">
          <h2>
            {mode === "login"
              ? "Welcome back."
              : "Create your account."}
          </h2>

          <p>
            {mode === "login"
              ? "Your words have a place here."
              : "Start sharing what you can't say out loud."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            autoComplete="email"
          />

          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={6}
            autoComplete={
              mode === "login"
                ? "current-password"
                : "new-password"
            }
          />

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <button
            className="login-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="login-divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        <button
          className="guest-button"
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
        >
          Continue as Guest
        </button>

        <p className="guest-note">
          No account needed. Just come in and let
          your words breathe.
        </p>

        <div className="login-switch">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
        </section>
      </div>

      <footer className="login-footer">
        A little space for everything left unsaid.
      </footer>
    </main>
  );
}
