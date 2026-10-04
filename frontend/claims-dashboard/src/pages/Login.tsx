import { FormEvent, useState } from 'react';

const API = 'http://localhost:8081/api/v1';

type LoginUser = {
  token: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLAIMER';
};

type LoginProps = {
  onLogin: (user: LoginUser) => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customerId, setCustomerId] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [error, setError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const [registerError, setRegisterError] = useState('');
  

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password
        })
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Invalid email or password.');
        } else {
          setError('Unable to sign in. Please try again.');
        }
        return;
      }

      const data = await response.json();

      if (!data.token || !data.email || !data.role) {
        setError('Invalid login response from the server.');
        return;
      }

      const user: LoginUser = {
        token: data.token,
        name: data.name || trimmedEmail.split('@')[0],
        email: data.email,
        role: data.role === 'ADMIN' ? 'ADMIN' : 'CLAIMER'
      };

      localStorage.setItem('claims_token', user.token);
      localStorage.setItem('claims_user', JSON.stringify(user));

      onLogin(user);

    } catch {
      setError(
        'Unable to connect to Claims Intelligence. Please make sure Spring Boot is running on port 8081.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setRegisterError('');
    setRegisterSuccess('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCustomerId = customerId.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedCustomerId) {
      setRegisterError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setRegisterError('Password must be at least 8 characters.');
      return;
    }

    setRegisterLoading(true);

    try {
      const response = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          customerId: trimmedCustomerId
        })
      });

      if (!response.ok) {
        const message = await response.text();

        if (response.status === 409) {
          setRegisterError('An account with this email already exists.');
        } else if (message) {
          setRegisterError(message);
        } else {
          setRegisterError('Unable to create account. Please try again.');
        }

        return;
      }

      setRegisterSuccess(
        'Account created successfully. You can now sign in.'
      );

      setShowRegister(false);

      setName('');
      setCustomerId('');
      setPassword('');

    } catch {
      setError(
        'Unable to connect to Claims Intelligence. Please make sure Spring Boot is running on port 8081.'
      );
    } finally {
      setRegisterLoading(false);
    }
  }

  function fillDemoAccount(role: 'ADMIN' | 'CLAIMER') {
    setShowRegister(false);

    if (role === 'ADMIN') {
      setEmail('admin@claims.ai');
      setPassword('Admin@123');
    } else {
      setEmail('claimer@claims.ai');
      setPassword('Claimer@123');
    }

    setError('');
    setRegisterSuccess('');
  }

  return (
    <div className="login-page">

      <div className="login-background">
        <div className="login-orb login-orb-one" />
        <div className="login-orb login-orb-two" />
        <div className="login-grid" />
      </div>

      <main className="login-shell">

        <section className="login-brand-panel">

          <div className="login-brand">
            <div className="login-brand-mark">✦</div>

            <div>
              <strong>CLAIMS</strong>
              <span>INTELLIGENCE</span>
            </div>
          </div>

          <div className="login-intro">
            <span className="eyebrow">
              AI-POWERED INSURANCE OPERATIONS
            </span>

            <h1>
              Smarter claims.
              <br />
              Faster decisions.
            </h1>

            <p>
              Bring claim intelligence, risk signals and explainable AI
              assessments into one secure operations workspace.
            </p>
          </div>

          <div className="login-feature-list">

            <div>
              <span>✦</span>

              <div>
                <strong>AI-assisted assessment</strong>
                <small>
                  Classification, confidence and recommended action.
                </small>
              </div>
            </div>

            <div>
              <span>⌁</span>

              <div>
                <strong>Risk & fraud intelligence</strong>
                <small>
                  Surface high-risk claims and suspicious signals.
                </small>
              </div>
            </div>

            <div>
              <span>✓</span>

              <div>
                <strong>Human-in-the-loop decisions</strong>
                <small>
                  Keep final claim decisions with authorized reviewers.
                </small>
              </div>
            </div>

          </div>

          <div className="login-status">
            <span className="live-dot" />
            <span>Local AI engine operational</span>
          </div>

        </section>

        <section className="login-card">

          {!showRegister ? (

            <>
              <div className="login-card-header">

                <span className="eyebrow">
                  SECURE ACCESS
                </span>

                <h2>Welcome back</h2>

                <p>
                  Sign in to your Claims Intelligence workspace.
                </p>

              </div>

              <form
                className="login-form"
                onSubmit={handleSubmit}
              >

                <label>
                  <span>Email address</span>

                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="username"
                    disabled={loading}
                    autoFocus
                  />
                </label>

                <label>
                  <span>Password</span>

                  <div className="login-password">

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowPassword(prev => !prev)
                      }
                      disabled={loading}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>

                  </div>

                </label>

                {error && (
                  <div className="login-error" role="alert">
                    <span>!</span>
                    <span>{error}</span>
                  </div>
                )}

                {registerSuccess && (
                  <div className="login-success">
                    ✓ {registerSuccess}
                  </div>
                )}

                <button
                  className="login-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="login-spinner" />
                      Signing in…
                    </>
                  ) : (
                    <>Sign in to workspace →</>
                  )}
                </button>

                <button
                  type="button"
                  className="register-link"
                  onClick={() => {
                    setShowRegister(true);
                    setError('');
                    setRegisterError('');
                    setRegisterSuccess('');
                  }}
                >
                  Don't have an account? Register
                </button>

              </form>

              <div className="login-divider">
                <span>Demo access</span>
              </div>

              <div className="demo-accounts">

                <button
                  type="button"
                  onClick={() => fillDemoAccount('ADMIN')}
                  disabled={loading}
                >
                  <span className="demo-icon">A</span>

                  <span>
                    <strong>Administrator</strong>
                    <small>
                      Full claims operations access
                    </small>
                  </span>

                  <b>→</b>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('CLAIMER')}
                  disabled={loading}
                >
                  <span className="demo-icon">C</span>

                  <span>
                    <strong>Claims User</strong>
                    <small>
                      Customer claims workspace
                    </small>
                  </span>

                  <b>→</b>
                </button>

              </div>

            </>

          ) : (

            <>
              <div className="login-card-header">

                <span className="eyebrow">
                  CREATE ACCOUNT
                </span>

                <h2>Join Claims Intelligence</h2>

                <p>
                  Create your claims user account.
                </p>

              </div>

              <form
                className="login-form"
                onSubmit={handleRegister}
              >

                <label>
                  <span>Full name</span>

                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    disabled={registerLoading}
                    autoFocus
                  />
                </label>

                <label>
                  <span>Email address</span>

                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={registerLoading}
                  />
                </label>

                <label>
                  <span>Customer ID</span>

                  <input
                    type="text"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                    placeholder="CUST-10002"
                    disabled={registerLoading}
                  />
                </label>

                <label>
                  <span>Password</span>

                  <div className="login-password">

                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      disabled={registerLoading}
                    />

                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() =>
                        setShowPassword(prev => !prev)
                      }
                      disabled={registerLoading}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>

                  </div>
                </label>

                  {registerError && (
                  <div className="login-error" role="alert">
                    <span>!</span>
                    <span>{registerError}</span>
                  </div>
                )}

                <button
                  className="login-submit"
                  type="submit"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <>
                      <span className="login-spinner" />
                      Creating account…
                    </>
                  ) : (
                    <>Create account →</>
                  )}
                </button>

                <button
                  type="button"
                  className="register-link"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                    setRegisterError('');
                    setRegisterSuccess('');
                  }}
                >
                  ← Already have an account? Sign in
                </button>

              </form>
            </>

          )}

          <p className="login-security">
            Authentication is secured with JWT and role-based access control.
          </p>

        </section>

      </main>

      <footer className="login-footer">
        <span>Claims Intelligence</span>
        <span>Enterprise Claims Platform</span>
      </footer>

    </div>
  );
}