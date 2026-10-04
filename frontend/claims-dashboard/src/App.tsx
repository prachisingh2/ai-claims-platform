import { FormEvent, useEffect, useMemo, useState } from 'react';

import Login from './pages/Login';
import MyProfile from './pages/MyProfile';
import Preferences from './pages/Preferences';
import Notifications from './pages/Notifications';


type Claim = {
  claimNumber: string;
  customerId: string;
  claimType: string;
  description: string;
  estimatedAmount?: number;
  status: string;
  classification?: string;
  confidenceScore?: number;
  riskLevel?: string;
  fraudScore?: number;
  fraudFlags?: string;
  summary?: string;
  recommendedAction?: string;
  keySignals?: string;
  priority?: string;
  reviewerNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Insight = {
  summary: string;
  classification: string;
  confidence: number;
  riskLevel: string;
  fraudScore: number;
  fraudFlags: string[];
  keySignals: string[];
  recommendedAction: string;
  priority: string;
};

type Dashboard = {
  totalClaims: number;
  aiProcessing: number;
  reviewQueue: number;
  processed: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  highFraud: number;
  averageConfidence: number;
  totalEstimatedAmount: number;
};

const API = 'http://localhost:8081/api/v1';

type AuthUser = {
  token: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLAIMER';
};

const blank = {
  customerId: '',
  claimType: 'AUTO',
  description: '',
  estimatedAmount: ''
};

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('claims_user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('claims_user');
      localStorage.removeItem('claims_token');
      return null;
    }
  });

  const [claims, setClaims] = useState<Claim[]>([]);
  const [dash, setDash] = useState<Dashboard | null>(null);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [risk, setRisk] = useState('ALL');
  const [sort, setSort] = useState('newest');

  const [selected, setSelected] = useState<Claim | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);

  const [create, setCreate] = useState(false);
  const [form, setForm] = useState(blank);

  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState('Overview');

  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  // const [workspace, setWorkspace] = useState('Claims Operations');

  const [profileOpen, setProfileOpen] = useState(false);
  const [aiStatusOpen, setAiStatusOpen] = useState(false);


  const [profilePage, setProfilePage] = useState<
    'profile' | 'preferences' | 'notifications' | null
  >(null);

  const [signOutOpen, setSignOutOpen] = useState(false);

  const [workspace, setWorkspace] = useState(() => {
    return (
      localStorage.getItem('claims_default_workspace') ||
      'Claims Operations'
    );
  });

  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('claims_compact_mode') === 'true';
  });
  useEffect(() => {
    localStorage.setItem(
      'claims_default_workspace',
      workspace
    );
  }, [workspace]);

  function loadPreferences() {
    const savedWorkspace =
      localStorage.getItem('claims_default_workspace');

    const savedReviewAlerts =
      localStorage.getItem('claims_review_alerts');

    const savedAiAlerts =
      localStorage.getItem('claims_ai_alerts');

    const savedCompactMode =
      localStorage.getItem('claims_compact_mode');

    if (savedWorkspace) {
      setWorkspace(savedWorkspace);
    }

    setCompactMode(
      savedCompactMode === 'true'
    );
  }

  async function apiFetch(
    path: string,
    options: RequestInit = {}
  ) {
    const token = localStorage.getItem('claims_token');
    const headers = new Headers(options.headers);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      handleLogout();
    }

    return response;
  }

  function handleLogin(user: AuthUser) {
    localStorage.setItem(
      'claims_user',
      JSON.stringify(user)
    );

    localStorage.setItem(
      'claims_token',
      user.token
    );

    setAuthUser(user);

    if (user.role === 'ADMIN') {
      setTab('Overview');
    } else {
      setTab('Claims');
    }
  }

  function handleLogout() {
    localStorage.removeItem('claims_token');
    localStorage.removeItem('claims_user');

    setAuthUser(null);
    setClaims([]);
    setDash(null);
    setSelected(null);
    setInsight(null);
    setProfileOpen(false);
    setWorkspaceOpen(false);
    setAiStatusOpen(false);
    setProfilePage(null);
  }


  async function load() {
    if (!authUser) {
      return;
    }

    setLoading(true);
    setToast('');

    try {
      const claimsResponse = await apiFetch('/claims');

      if (!claimsResponse.ok) {
        const errorText = await claimsResponse.text();
        console.error(
          'Claims API failed:',
          claimsResponse.status,
          errorText
        );

        throw new Error(
          `Claims API returned ${claimsResponse.status}`
        );
      }

      const claimsData = await claimsResponse.json();

      console.log(
        'Claims loaded from API:',
        claimsData.length
      );

      setClaims(claimsData);

      if (authUser.role === 'ADMIN') {
        const dashboardResponse = await apiFetch('/dashboard');

        if (dashboardResponse.ok) {
          const dashboardData =
            await dashboardResponse.json();

          console.log(
            'Dashboard loaded:',
            dashboardData
          );

          setDash(dashboardData);
        } else {
          console.warn(
            'Dashboard API returned:',
            dashboardResponse.status
          );

          setDash(null);
        }
      } else {
        setDash(null);
      }

    } catch (error) {
      console.error(
        'Failed to load claims:',
        error
      );

      setToast(
        error instanceof Error
          ? error.message
          : 'Unable to load claims.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authUser) {
      load();
    }
  }, [authUser]);


  async function openClaim(c: Claim) {
    setSelected(c);
    setInsight(null);

    try {
      const r = await apiFetch(
        `/claims/${c.claimNumber}/ai-summary`
      );

      if (r.ok) {
        setInsight(await r.json());
      }
    } catch {
      // Keep the claim selected even if AI summary is unavailable.
    }
  }

  async function createClaim(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const r = await apiFetch('/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: form.customerId,
          claimType: form.claimType,
          description: form.description,
          estimatedAmount: Number(form.estimatedAmount || 0)
        })
      });

      if (!r.ok) {
        throw new Error();
      }

      const c = await r.json();

      setCreate(false);
      setForm(blank);
      setToast(`${c.claimNumber} analyzed successfully.`);

      await load();
      await openClaim(c);
    } catch {
      setToast(
        'Unable to create claim. Check the backend console.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function review(action: string) {
    if (!selected) {
      return;
    }

    try {
      const r = await apiFetch(
        `/claims/${selected.claimNumber}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: action,
            note:
              action === 'APPROVED'
                ? 'Claim approved after human review'
                : 'Claim rejected after human review',
            reviewedBy: 'Claims Analyst'
          })
        }
      );

      if (!r.ok) {
        throw new Error('Review update failed');
      }

      const updatedClaim = await r.json();

      // Update selected claim immediately
      setSelected(updatedClaim);

      // Update claim in the table immediately
      setClaims(prev =>
        prev.map(c =>
          c.claimNumber === updatedClaim.claimNumber
            ? updatedClaim
            : c
        )
      );

      // Refresh dashboard KPIs
      await load();

      // Show confirmation
      setToast(
        action === 'APPROVED'
          ? `✓ ${updatedClaim.claimNumber} approved successfully.`
          : `✓ ${updatedClaim.claimNumber} rejected successfully.`
      );

    } catch (error) {
      console.error(error);

      setToast(
        `Unable to ${action === 'APPROVED'
          ? 'approve'
          : 'reject'
        } claim.`
      );
    }
  }

  async function reprocess() {
    if (!selected) {
      return;
    }

    try {
      const r = await apiFetch(
        `/claims/${selected.claimNumber}/reprocess`,

        {
          method: 'POST'
        }
      );

      if (r.ok) {
        const c = await r.json();

        setSelected(c);
        setToast('AI assessment refreshed.');

        await load();
        await openClaim(c);
      }
    } catch {
      setToast('Unable to re-run AI assessment.');
    }
  }

  function exportCsv() {
    const h = [
      'Claim',
      'Customer',
      'Type',
      'Classification',
      'Confidence',
      'Risk',
      'Fraud Score',
      'Status',
      'Amount'
    ];

    const rows = filtered.map(c => [
      c.claimNumber,
      c.customerId,
      c.claimType,
      c.classification || '',
      `${Math.round((c.confidenceScore || 0) * 100)}%`,
      c.riskLevel || '',
      c.fraudScore ?? '',
      c.status,
      c.estimatedAmount ?? 0
    ]);

    const csv = [h, ...rows]
      .map(row =>
        row
          .map(value => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const a = document.createElement('a');

    a.href = URL.createObjectURL(
      new Blob([csv], {
        type: 'text/csv'
      })
    );

    a.download = 'claims-report.csv';
    a.click();

    URL.revokeObjectURL(a.href);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    const x = claims.filter(c => {
      const matchesSearch =
        !q ||
        [
          c.claimNumber,
          c.customerId,
          c.description,
          c.classification
        ].some(v =>
          String(v || '')
            .toLowerCase()
            .includes(q)
        );

      const matchesType =
        type === 'ALL' || c.claimType === type;

      const matchesStatus =
        status === 'ALL' || c.status === status;

      const matchesRisk =
        risk === 'ALL' || c.riskLevel === risk;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesRisk
      );
    });

    return [...x].sort((a, b) => {
      if (sort === 'amount') {
        return (
          (b.estimatedAmount || 0) -
          (a.estimatedAmount || 0)
        );
      }

      if (sort === 'risk') {
        return (
          (b.fraudScore || 0) -
          (a.fraudScore || 0)
        );
      }

      return String(b.createdAt || '').localeCompare(
        String(a.createdAt || '')
      );
    });
  }, [
    claims,
    search,
    type,
    status,
    risk,
    sort
  ]);

  const automation = dash
    ? Math.round(
      (dash.processed /
        Math.max(dash.totalClaims, 1)) *
      100
    )
    : 0;

  if (!authUser) {
    return <Login onLogin={handleLogin} />;
  }


  return (
    <div

      className={
        compactMode
          ? 'app-shell compact-mode'
          : 'app-shell'
      }
    >
      <aside className="sidebar">
        <button
          type="button"
          className="brand-button"
          onClick={() => {
            setTab('Overview');
            setWorkspaceOpen(false);
            setProfileOpen(false);
          }}
        >
          <div className="brand-mark">
            ✦
          </div>

          <div>
            <strong>CLAIMS</strong>
            <span>INTELLIGENCE</span>
          </div>
        </button>

        <div className="workspace">

          <span className="tiny">WORKSPACE</span>

          {authUser.role === 'ADMIN' && (
            <div className="workspace-selector">
              <button
                type="button"
                className="workspace-pill"
                onClick={() => {
                  setProfileOpen(false);
                  setWorkspaceOpen(prev => !prev);
                }}
              >
                <span className="dot" />

                <span>{workspace}</span>

                <b className={workspaceOpen ? 'rotate' : ''}>
                  ⌄
                </b>
              </button>

              {workspaceOpen && (
                <div className="workspace-menu">
                  {[
                    'Claims Operations',
                    'AI Review',
                    'Fraud Investigation',
                    'Claims Analytics'
                  ].map(item => (
                    <button
                      key={item}
                      type="button"
                      className={
                        workspace === item
                          ? 'workspace-option selected'
                          : 'workspace-option'
                      }
                      onClick={() => {
                        setWorkspace(item);
                        setWorkspaceOpen(false);
                        setProfileOpen(false);
                        setSelected(null);
                        setInsight(null);

                        if (item === 'Claims Operations') {
                          setTab('Overview');
                        }

                        if (item === 'AI Review') {
                          setTab('AI Review');
                        }

                        if (item === 'Fraud Investigation') {
                          setTab('Fraud Signals');
                        }

                        if (item === 'Claims Analytics') {
                          setTab('Analytics');
                        }
                      }}
                    >
                      <span className="workspace-option-dot" />
                      <span>{item}</span>

                      {workspace === item && (
                        <strong>✓</strong>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        <nav>
          {(
            authUser.role === 'ADMIN'
              ? [
                'Overview',
                'Claims',
                'AI Review',
                'Fraud Signals',
                'Analytics'
              ]
              : [
                'Claims'
              ]
          ).map(x => (
            <button
              key={x}
              className={
                tab === x
                  ? 'nav active'
                  : 'nav'
              }
              onClick={() => {
                setTab(x);
                setSelected(null);
                setInsight(null);
                setWorkspaceOpen(false);
                setProfileOpen(false);
                setProfilePage(null);
              }}
            >
              <span>
                {x === 'Overview'
                  ? '◫'
                  : x === 'Claims'
                    ? '▤'
                    : x === 'AI Review'
                      ? '✦'
                      : x === 'Fraud Signals'
                        ? '⌁'
                        : '◒'}
              </span>

              {x}
            </button>
          ))}
        </nav>

        {authUser.role === 'ADMIN' && (
          <button
            type="button"
            className="side-card"
            onClick={() => setAiStatusOpen(true)}
          >
            <span>AI ENGINE</span>

            <strong>Operational</strong>

            <p>
              Local reasoning engine is online and
              ready to analyze claims.
            </p>

            <i>
              <b />
            </i>

            <small className="side-card-action">
              View engine status →
            </small>
          </button>
        )}

        <button
          type="button"
          className="sidebar-bottom"
          onClick={() => {
            setWorkspaceOpen(false);
            setProfileOpen(prev => !prev);
          }}
        >
          <div className="user-dot">
            {authUser.name
              .split(' ')
              .map(x => x[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <div>
            <strong>{authUser.name}</strong>
            <small>
              {authUser.role === 'ADMIN'
                ? 'Administrator'
                : 'Claims user'}
            </small>
          </div>


          <span>•••</span>
        </button>

        {profileOpen && (
          <div className="profile-menu">

            <div className="profile-header">
              <div className="user-dot large">
                {authUser.name
                  .split(' ')
                  .map(x => x[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <strong>{authUser.name}</strong>
                <small>
                  {authUser.role === 'ADMIN'
                    ? 'Administrator'
                    : 'Claims user'}
                </small>
              </div>
            </div>


            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setWorkspaceOpen(false);
                setProfilePage('profile');
              }}
            >
              <span className="profile-option-icon">PR</span>
              <span>
                <strong>My Profile</strong>
                <small>Account and workspace details</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setWorkspaceOpen(false);
                setProfilePage('preferences');
              }}
            >
              <span className="profile-option-icon">⚙</span>
              <span>
                <strong>Preferences</strong>
                <small>Workspace and display settings</small>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setWorkspaceOpen(false);
                setProfilePage('notifications');
              }}
            >
              <span className="profile-option-icon">●</span>
              <span>
                <strong>Notifications</strong>
                <small>System alerts and updates</small>
              </span>
            </button>

            {authUser.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceOpen(false);
                  setProfileOpen(false);
                  setAiStatusOpen(true);
                }}

              >
                <span className="profile-option-icon">✦</span>
                <span>
                  <strong>AI Engine Status</strong>
                  <small>View AI engine health</small>
                </span>
              </button>
            )}

            <div className="profile-divider" />

            <button
              type="button"
              className="profile-signout"
              onClick={handleLogout}
            >
              <span className="profile-option-icon">↪</span>
              <span>
                <strong>Sign out</strong>
                <small>End your current session</small>
              </span>
            </button>

          </div>
        )}
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <span className="crumb">
              Insurance / Claims Intelligence
            </span>

            <h1>
              {tab === 'Overview'
                ? 'Claims Operations'
                : tab}
            </h1>
          </div>

          <div className="top-actions">
            <div className="global-search">
              ⌕

              <input
                value={search}
                onChange={e =>
                  setSearch(e.target.value)
                }
                placeholder="Search claims, customers..."
              />
            </div>


            {authUser.role === 'ADMIN' && (
              <button
                className="ghost"
                onClick={exportCsv}
              >
                Export
              </button>
            )}


            <button
              onClick={() => setCreate(true)}
            >
              + New claim
            </button>

            <button className="avatar">
              PR
            </button>
          </div>
        </header>


        <MyProfile
          workspace={workspace}
          onBack={() => setProfilePage(null)}
          onClaims={() => {
            setProfilePage(null);
            setTab('Claims');
          }}
          onAIReview={
            authUser.role === 'ADMIN'
              ? () => {
                setProfilePage(null);
                setTab('AI Review');
              }
              : undefined
          }
          onAIEngine={
            authUser.role === 'ADMIN'
              ? () => {
                setProfilePage(null);
                setAiStatusOpen(true);
              }
              : undefined
          }
        />


        {profilePage === 'preferences' && (
          <Preferences
            workspace={workspace}
            onBack={() => setProfilePage(null)}
            onSave={newWorkspace => {
              setWorkspace(newWorkspace);

              loadPreferences();

              setProfilePage(null);

              setToast('Preferences saved successfully.');
            }}
          />
        )}

        {profilePage === 'notifications' && (
          <Notifications
            reviewQueue={authUser.role === 'ADMIN'
              ? dash?.reviewQueue ?? 0
              : 0}
            highFraud={authUser.role === 'ADMIN'
              ? dash?.highFraud ?? 0
              : 0}
            onBack={() => setProfilePage(null)}
            onReview={
              authUser.role === 'ADMIN'
                ? () => {
                  setProfilePage(null);
                  setTab('AI Review');
                }
                : undefined
            }
            onFraud={
              authUser.role === 'ADMIN'
                ? () => {
                  setProfilePage(null);
                  setTab('Fraud Signals');
                }
                : undefined
            }
            onAIEngine={
              authUser.role === 'ADMIN'
                ? () => {
                  setProfilePage(null);
                  setAiStatusOpen(true);
                }
                : undefined
            }
          />
        )}
        {/* OVERVIEW*/}

        {!profilePage && tab === 'Overview' && (
          <>
            <section className="hero-strip">
              <div>
                <span className="eyebrow">
                  AI-POWERED INSURANCE OPERATIONS
                </span>

                <h2>
                  See what matters across every claim.
                </h2>

                <p>
                  Structure claim data, surface risk
                  signals and give handlers an
                  explainable AI assessment before the
                  next decision.
                </p>
              </div>

              <div className="hero-status">
                <span>
                  <i className="live-dot" />
                </span>

                <strong>
                  {automation}%
                </strong>

              </div>

            </section>

            <section className="kpis">
              <Kpi
                label="Total claims"
                value={
                  dash?.totalClaims ??
                  claims.length
                }
                note="Across active workspace"
              />

              <Kpi
                label="Review queue"
                value={dash?.reviewQueue ?? 0}
                note="Claims needing attention"
                accent={!!dash?.reviewQueue}
              />

              <Kpi
                label="High risk"
                value={dash?.highRisk ?? 0}
                note="Risk score threshold"
                accent={!!dash?.highRisk}
              />

              <Kpi
                label="AI confidence"
                value={`${Math.round(
                  (dash?.averageConfidence ??
                    0) * 100
                )}%`}
                note="Average assessment"
              />
            </section>

            <section className="signal-bar">
              <div>
                <span>
                  ✦ AI CONTROL CENTER
                </span>

                <strong>
                  Decision support across the
                  claim lifecycle
                </strong>
              </div>

              <div className="signal-items">
                <span>
                  <b>
                    {dash?.highFraud ?? 0}
                  </b>{' '}
                  high fraud signals
                </span>

                <span>
                  <b>
                    ₹
                    {Math.round(
                      dash?.totalEstimatedAmount ??
                      0
                    ).toLocaleString('en-IN')}
                  </b>{' '}
                  exposure
                </span>

                <span>
                  <b>
                    {dash?.processed ?? 0}
                  </b>{' '}
                  auto processed
                </span>
              </div>
            </section>

            <section className="workspace-grid">
              <div className="claims-panel panel">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">
                      LIVE QUEUE
                    </span>

                    <h3>
                      Claims requiring intelligence
                    </h3>
                  </div>

                  <button
                    className="icon-refresh"
                    onClick={load}
                  >
                    ↻
                  </button>
                </div>

                <div className="filters">
                  <select
                    value={type}
                    onChange={e =>
                      setType(e.target.value)
                    }
                  >
                    <option value="ALL">
                      All lines
                    </option>

                    <option value="AUTO">
                      Motor
                    </option>

                    <option value="MEDICAL">
                      Health
                    </option>

                    <option value="PROPERTY">
                      Property
                    </option>

                    <option value="GENERAL">
                      General
                    </option>
                  </select>

                  <select
                    value={status}
                    onChange={e =>
                      setStatus(e.target.value)
                    }
                  >
                    <option value="ALL">
                      All statuses
                    </option>

                    <option value="PROCESSED">
                      Processed
                    </option>

                    <option value="REVIEW_REQUIRED">
                      Review required
                    </option>

                    <option value="APPROVED">
                      Approved
                    </option>

                    <option value="REJECTED">
                      Rejected
                    </option>
                  </select>

                  <select
                    value={risk}
                    onChange={e =>
                      setRisk(e.target.value)
                    }
                  >
                    <option value="ALL">
                      All risk
                    </option>

                    <option value="HIGH">
                      High
                    </option>

                    <option value="MEDIUM">
                      Medium
                    </option>

                    <option value="LOW">
                      Low
                    </option>
                  </select>

                  <select
                    value={sort}
                    onChange={e =>
                      setSort(e.target.value)
                    }
                  >
                    <option value="newest">
                      Newest
                    </option>

                    <option value="amount">
                      Highest exposure
                    </option>

                    <option value="risk">
                      Highest fraud score
                    </option>
                  </select>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Claim</th>
                        <th>Line</th>
                        <th>AI assessment</th>
                        <th>Confidence</th>
                        <th>Risk</th>
                        <th>Status</th>
                        <th>Exposure</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map(c => (
                        <tr
                          className={
                            selected?.claimNumber ===
                              c.claimNumber
                              ? 'selected'
                              : ''
                          }
                          key={c.claimNumber}
                          onClick={() =>
                            openClaim(c)
                          }
                        >
                          <td>
                            <strong>
                              {c.claimNumber}
                            </strong>

                            <small>
                              {c.customerId} ·{' '}
                              {formatDate(
                                c.createdAt
                              )}
                            </small>
                          </td>

                          <td>
                            <span className="line-tag">
                              {c.claimType}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {c.classification ||
                                'Pending'}
                            </strong>

                            <small>
                              {c.priority ||
                                'NORMAL'}{' '}
                              priority
                            </small>
                          </td>

                          <td>
                            <div className="confidence">
                              <b>
                                {Math.round(
                                  (c.confidenceScore ||
                                    0) * 100
                                )}
                                %
                              </b>

                              <i>
                                <span
                                  style={{
                                    width: `${Math.round(
                                      (c.confidenceScore ||
                                        0) * 100
                                    )}%`
                                  }}
                                />
                              </i>
                            </div>
                          </td>

                          <td>
                            <Badge
                              text={
                                c.riskLevel ||
                                'PENDING'
                              }
                            />

                            {typeof c.fraudScore ===
                              'number' && (
                                <small className="fraud-score">
                                  Fraud{' '}
                                  {c.fraudScore}
                                </small>
                              )}
                          </td>

                          <td>
                            <Badge
                              text={c.status}
                            />
                          </td>

                          <td>
                            ₹
                            {Math.round(
                              c.estimatedAmount ||
                              0
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!loading &&
                  filtered.length === 0 && (
                    <div className="empty">
                      No claims match the current
                      filters.
                    </div>
                  )}
              </div>

              <aside className="copilot panel">
                {selected ? (
                  <>
                    <div className="copilot-head">
                      <div>
                        <span className="eyebrow">
                          AI CLAIM COPILOT
                        </span>

                        <h3>
                          {selected.claimNumber}
                        </h3>
                      </div>

                      <button
                        className="close"
                        onClick={() =>
                          setSelected(null)
                        }
                      >
                        ×
                      </button>
                    </div>

                    <div className="claim-meta">
                      <span>
                        {selected.customerId}
                      </span>

                      <span>
                        {selected.claimType}
                      </span>

                      <span>
                        ₹
                        {Math.round(
                          selected.estimatedAmount ||
                          0
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="assessment">
                      <div className="assessment-title">
                        <span>✦</span>

                        <div>
                          <strong>
                            AI assessment
                          </strong>

                          <small>
                            Explainable decision
                            support
                          </small>
                        </div>

                        <Badge
                          text={
                            selected.riskLevel ||
                            'PENDING'
                          }
                        />
                      </div>

                      <p>
                        {insight?.summary ||
                          selected.summary ||
                          'Analyzing claim...'}
                      </p>
                    </div>

                    <div className="score-grid">
                      <Score
                        label="Confidence"
                        value={`${Math.round(
                          (insight?.confidence ??
                            selected.confidenceScore ??
                            0) * 100
                        )}%`}
                      />

                      <Score
                        label="Fraud score"
                        value={`${insight?.fraudScore ??
                          selected.fraudScore ??
                          0}/100`}
                      />

                      <Score
                        label="Priority"
                        value={
                          insight?.priority ||
                          selected.priority ||
                          '—'
                        }
                      />
                    </div>

                    <Block
                      title="What the AI noticed"
                      items={
                        insight?.keySignals ||
                        split(selected.keySignals)
                      }
                    />

                    <Block
                      title="Risk & fraud signals"
                      items={
                        insight?.fraudFlags ||
                        split(selected.fraudFlags)
                      }
                    />

                    <div className="recommend">
                      <span>
                        Recommended next action
                      </span>

                      <strong>
                        {insight?.recommendedAction ||
                          selected.recommendedAction ||
                          '—'}
                      </strong>
                    </div>

                    <div className="source">
                      <span>
                        Claim narrative
                      </span>

                      <p>
                        {selected.description}
                      </p>
                    </div>

                    <div className="copilot-actions">
                      <button
                        className="ghost"
                        onClick={reprocess}
                      >
                        ↻ Re-run AI
                      </button>

                      {selected?.status !== 'APPROVED' &&
                        selected?.status !== 'REJECTED' && (
                          <div className="copilot-actions">

                            <button
                              onClick={() => review('APPROVED')}
                            >
                              ✓ Approve claim
                            </button>

                            <button
                              className="reject"
                              onClick={() => review('REJECTED')}
                            >
                              ✕ Reject claim
                            </button>

                          </div>
                        )}
                      {selected?.status === 'APPROVED' && (
                        <div className="decision-record approved">
                          <div className="decision-icon">✓</div>

                          <div>
                            <strong>Claim approved</strong>
                            <span>
                              Human review decision has been recorded.
                            </span>
                          </div>
                        </div>
                      )}

                      {selected?.status === 'REJECTED' && (
                        <div className="decision-record rejected">
                          <div className="decision-icon">✕</div>

                          <div>
                            <strong>Claim rejected</strong>
                            <span>
                              Human review decision has been recorded.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-copilot">
                    <div className="big-spark">
                      ✦
                    </div>

                    <span className="eyebrow">
                      AI CLAIM COPILOT
                    </span>

                    <h3>
                      Select a claim
                    </h3>

                    <p>
                      Open any claim to see its
                      structured assessment, risk
                      signals, evidence summary and
                      recommended action.
                    </p>

                    <div className="mini-points">
                      <span>
                        ✓ Explainable signals
                      </span>

                      <span>
                        ✓ Human review controls
                      </span>

                      <span>
                        ✓ Audit-ready assessment
                      </span>
                    </div>
                  </div>
                )}
              </aside>
            </section>
          </>
        )}

        {/* CLAIMS */}

        {!profilePage && tab === 'Claims' && (
          <section className="page-section">
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  CLAIMS WORKSPACE
                </span>

                <h2>
                  {authUser.role === 'ADMIN'
                    ? 'All Claims'
                    : 'My Claims'}
                </h2>

                <p>
                  {authUser.role === 'ADMIN'
                    ? 'Review, search and manage every claim in the workspace.'
                    : 'View and manage your submitted claims.'}
                </p>


              </div>

              <button
                onClick={() => setCreate(true)}
              >
                + New claim
              </button>
            </div>

            <div className="panel full-panel">
              <div className="filters">
                <select
                  value={type}
                  onChange={e =>
                    setType(e.target.value)
                  }
                >
                  <option value="ALL">
                    All lines
                  </option>

                  <option value="AUTO">
                    Motor
                  </option>

                  <option value="MEDICAL">
                    Health
                  </option>

                  <option value="PROPERTY">
                    Property
                  </option>

                  <option value="GENERAL">
                    General
                  </option>
                </select>

                <select
                  value={status}
                  onChange={e =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="ALL">
                    All statuses
                  </option>

                  <option value="PROCESSED">
                    Processed
                  </option>

                  <option value="REVIEW_REQUIRED">
                    Review required
                  </option>

                  <option value="APPROVED">
                    Approved
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>
                </select>

                <select
                  value={risk}
                  onChange={e =>
                    setRisk(e.target.value)
                  }
                >
                  <option value="ALL">
                    All risk
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="LOW">
                    Low
                  </option>
                </select>

                <select
                  value={sort}
                  onChange={e =>
                    setSort(e.target.value)
                  }
                >
                  <option value="newest">
                    Newest
                  </option>

                  <option value="amount">
                    Highest exposure
                  </option>

                  <option value="risk">
                    Highest fraud score
                  </option>
                </select>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Claim</th>
                      <th>Line</th>
                      <th>AI Assessment</th>
                      <th>Confidence</th>
                      <th>Risk</th>
                      <th>Status</th>
                      <th>Exposure</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map(c => (
                      <tr
                        key={c.claimNumber}
                        className={
                          selected?.claimNumber ===
                            c.claimNumber
                            ? 'selected'
                            : ''
                        }
                        onClick={() =>
                          openClaim(c)
                        }
                      >
                        <td>
                          <strong>
                            {c.claimNumber}
                          </strong>

                          <small>
                            {c.customerId}
                          </small>
                        </td>

                        <td>
                          <span className="line-tag">
                            {c.claimType}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {c.classification ||
                              'Pending'}
                          </strong>

                          <small>
                            {c.priority ||
                              'NORMAL'}{' '}
                            priority
                          </small>
                        </td>

                        <td>
                          {Math.round(
                            (c.confidenceScore ||
                              0) * 100
                          )}
                          %
                        </td>

                        <td>
                          <Badge
                            text={
                              c.riskLevel ||
                              'PENDING'
                            }
                          />
                        </td>

                        <td>
                          <Badge
                            text={c.status}
                          />
                        </td>

                        <td>
                          ₹
                          {Math.round(
                            c.estimatedAmount ||
                            0
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!loading &&
                filtered.length === 0 && (
                  <div className="empty">
                    No claims match the current
                    filters.
                  </div>
                )}
            </div>
          </section>
        )}

        {/*   
            AI REVIEW
              */}

        {!profilePage && tab === 'AI Review' && (
          <section className="page-section">
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  HUMAN-IN-THE-LOOP
                </span>

                <h2>AI Review Queue</h2>

                <p>
                  Claims that require analyst
                  attention before a final decision.
                </p>
              </div>
            </div>

            <div className="review-grid">
              {claims
                .filter(
                  c =>
                    c.status ===
                    'REVIEW_REQUIRED' ||
                    c.riskLevel === 'HIGH'
                )
                .map(c => (
                  <button
                    className="review-card"
                    key={c.claimNumber}
                    onClick={() =>
                      openClaim(c)
                    }
                  >
                    <div className="review-card-top">
                      <strong>
                        {c.claimNumber}
                      </strong>

                      <Badge
                        text={
                          c.riskLevel ||
                          'PENDING'
                        }
                      />
                    </div>

                    <h3>
                      {c.classification ||
                        'Pending AI assessment'}
                    </h3>

                    <p>
                      {c.summary ||
                        c.description}
                    </p>

                    <div className="review-card-meta">
                      <span>
                        Confidence:{' '}
                        {Math.round(
                          (c.confidenceScore ||
                            0) * 100
                        )}
                        %
                      </span>

                      <span>
                        Fraud:{' '}
                        {c.fraudScore ?? 0}/100
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            {claims.filter(
              c =>
                c.status === 'REVIEW_REQUIRED' ||
                c.riskLevel === 'HIGH'
            ).length === 0 && (
                <div className="empty">
                  No claims currently require AI
                  review.
                </div>
              )}
          </section>
        )}

        {/*   
            FRAUD SIGNALS
              */}

        {!profilePage && tab === 'Fraud Signals' && (
          <section className="page-section">
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  RISK INTELLIGENCE
                </span>

                <h2>Fraud Signals</h2>

                <p>
                  Claims with notable fraud scores
                  and AI-detected signals.
                </p>
              </div>
            </div>

            <div className="fraud-grid">
              {claims
                .filter(
                  c => (c.fraudScore || 0) >= 55
                )
                .map(c => (
                  <button
                    className="fraud-card"
                    key={c.claimNumber}
                    onClick={() =>
                      openClaim(c)
                    }
                  >
                    <div className="fraud-card-top">
                      <strong>
                        {c.claimNumber}
                      </strong>

                      <span className="fraud-number">
                        {c.fraudScore ?? 0}
                      </span>
                    </div>

                    <h3>
                      {c.classification ||
                        'General claim'}
                    </h3>

                    <p>
                      {c.fraudFlags ||
                        'No detailed fraud signals available.'}
                    </p>

                    <Badge
                      text={
                        c.riskLevel ||
                        'PENDING'
                      }
                    />
                  </button>
                ))}
            </div>

            {claims.filter(
              c => (c.fraudScore || 0) >= 55
            ).length === 0 && (
                <div className="empty">
                  No high fraud signals found.
                </div>
              )}
          </section>
        )}

        {/*   
            ANALYTICS
              */}

        {!profilePage && tab === 'Analytics' && (
          <section className="page-section">
            <div className="page-heading">
              <div>
                <span className="eyebrow">
                  PERFORMANCE INTELLIGENCE
                </span>

                <h2>Claims Analytics</h2>

                <p>
                  Monitor claim volume, risk
                  distribution and AI performance.
                </p>
              </div>
            </div>

            <div className="analytics-grid">
              <Kpi
                label="Total Claims"
                value={dash?.totalClaims ?? 0}
                note="Claims processed"
              />

              <Kpi
                label="Processed"
                value={dash?.processed ?? 0}
                note="AI processed"
              />

              <Kpi
                label="Review Queue"
                value={dash?.reviewQueue ?? 0}
                note="Needs analyst attention"
              />

              <Kpi
                label="High Fraud"
                value={dash?.highFraud ?? 0}
                note="Fraud score ≥ 55"
                accent={!!dash?.highFraud}
              />

              <div className="panel analytics-card">
                <span className="eyebrow">
                  RISK DISTRIBUTION
                </span>

                <div className="metric-row">
                  <span>High</span>

                  <strong>
                    {dash?.highRisk ?? 0}
                  </strong>
                </div>

                <div className="metric-row">
                  <span>Medium</span>

                  <strong>
                    {dash?.mediumRisk ?? 0}
                  </strong>
                </div>

                <div className="metric-row">
                  <span>Low</span>

                  <strong>
                    {dash?.lowRisk ?? 0}
                  </strong>
                </div>
              </div>

              <div className="panel analytics-card">
                <span className="eyebrow">
                  AI PERFORMANCE
                </span>

                <div className="analytics-big">
                  {Math.round(
                    (dash?.averageConfidence ??
                      0) * 100
                  )}
                  %
                </div>

                <p>
                  Average AI confidence across
                  analyzed claims.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/*   
          NEW CLAIM MODAL
            */}

      {create && (
        <div
          className="overlay"
          onMouseDown={() =>
            setCreate(false)
          }
        >
          <div
            className="modal"
            onMouseDown={e =>
              e.stopPropagation()
            }
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  NEW CLAIM
                </span>

                <h2>
                  Start an AI assessment
                </h2>
              </div>

              <button
                className="close"
                onClick={() =>
                  setCreate(false)
                }
              >
                ×
              </button>
            </div>

            <form
              onSubmit={createClaim}
              className="form"
            >
              {authUser.role === 'ADMIN' ? (
                <label>
                  Customer ID

                  <input
                    required
                    placeholder="CUST-1005"
                    value={form.customerId}
                    onChange={e =>
                      setForm({
                        ...form,
                        customerId: e.target.value
                      })
                    }
                  />
                </label>
              ) : (
                <div className="claim-customer-display">
                  <span>Customer</span>
                  <strong>CUST-10001</strong>
                  <small>
                    This claim will be submitted under your account.
                  </small>
                </div>
              )}

              <div className="form-row">
                <label>
                  Line

                  <select
                    value={form.claimType}
                    onChange={e =>
                      setForm({
                        ...form,
                        claimType:
                          e.target.value
                      })
                    }
                  >
                    <option value="AUTO">
                      AUTO
                    </option>

                    <option value="MEDICAL">
                      MEDICAL
                    </option>

                    <option value="PROPERTY">
                      PROPERTY
                    </option>

                    <option value="GENERAL">
                      GENERAL
                    </option>
                  </select>
                </label>

                <label>
                  Estimated exposure

                  <input
                    required
                    type="number"
                    min="0"
                    value={
                      form.estimatedAmount
                    }
                    onChange={e =>
                      setForm({
                        ...form,
                        estimatedAmount:
                          e.target.value
                      })
                    }
                  />
                </label>
              </div>

              <label>
                Claim narrative

                <textarea
                  required
                  minLength={5}
                  rows={7}
                  placeholder="Describe the incident, loss, treatment, damage and any supporting context..."
                  value={form.description}
                  onChange={e =>
                    setForm({
                      ...form,
                      description:
                        e.target.value
                    })
                  }
                />
              </label>

              <button disabled={saving}>
                {saving
                  ? 'Analyzing claim…'
                  : 'Submit & analyze with AI →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <button
          className="toast"
          onClick={() => setToast('')}
        >
          {toast} ×
        </button>
      )}
      {aiStatusOpen && (
        <div
          className="overlay"
          onMouseDown={() => setAiStatusOpen(false)}
        >
          <div
            className="status-modal"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">
                  AI ENGINE
                </span>

                <h2>
                  Local AI Engine
                </h2>
              </div>

              <button
                className="close"
                onClick={() => setAiStatusOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="engine-status-main">
              <div className="engine-live">
                <span className="live-dot" />
                Operational
              </div>

              <p>
                The local claims reasoning engine is
                connected and ready to analyze claims.
              </p>
            </div>

            <div className="engine-grid">

              <div>
                <span>ENGINE</span>
                <strong>Local Reasoning</strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>Online</strong>
              </div>

              <div>
                <span>CLASSIFICATION</span>
                <strong>Active</strong>
              </div>

              <div>
                <span>FRAUD ANALYSIS</span>
                <strong>Active</strong>
              </div>

            </div>

            <div className="engine-capabilities">
              <strong>Available capabilities</strong>

              <div>
                <span>✓ Claim classification</span>
                <span>✓ Confidence scoring</span>
                <span>✓ Risk assessment</span>
                <span>✓ Fraud indicators</span>
                <span>✓ Recommended actions</span>
                <span>✓ Human review routing</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/*   
   COMPONENTS
      */

function Kpi({
  label,
  value,
  note,
  accent = false
}: {
  label: string;
  value: string | number;
  note: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`kpi ${accent ? 'accent' : ''
        }`}
    >
      <span>{label}</span>

      <strong>{value}</strong>

      <small>{note}</small>
    </div>
  );
}

function Score({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="score">
      <span>{label}</span>

      <strong>{value}</strong>
    </div>
  );
}

function Badge({
  text
}: {
  text: string;
}) {
  const value = String(text);

  return (
    <span
      className={`badge ${value
        .toLowerCase()
        .replace(/_/g, '-')}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
}

function Block({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="copilot-block">
      <div className="block-title">
        <span>{title}</span>

        <b>AI</b>
      </div>

      <ul>
        {items.length ? (
          items.map((x, i) => (
            <li key={i}>{x}</li>
          ))
        ) : (
          <li>No signals available</li>
        )}
      </ul>
    </div>
  );
}

function split(v?: string) {
  return v
    ? v.split('|').filter(Boolean)
    : [];
}

function formatDate(v?: string) {
  return v
    ? new Date(v).toLocaleString(
      'en-IN',
      {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    )
    : '—';
}
