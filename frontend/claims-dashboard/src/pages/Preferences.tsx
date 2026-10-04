import { useState } from 'react';
import './pages.css';

type PreferencesProps = {
  workspace: string;
  onBack: () => void;
  onSave: (workspace: string) => void;
};

export default function Preferences({
  workspace,
  onBack,
  onSave
}: PreferencesProps) {

  const [defaultWorkspace, setDefaultWorkspace] =
    useState(() =>
      localStorage.getItem('claims_default_workspace') ||
      workspace
    );

  const [reviewAlerts, setReviewAlerts] =
    useState(() =>
      localStorage.getItem('claims_review_alerts') !== 'false'
    );

  const [aiAlerts, setAiAlerts] =
    useState(() =>
      localStorage.getItem('claims_ai_alerts') !== 'false'
    );

  const [compactMode, setCompactMode] =
    useState(() =>
      localStorage.getItem('claims_compact_mode') === 'true'
    );

  const [saved, setSaved] = useState(false);

  const handleSave = () => {

    // Save preferences permanently for this browser
    localStorage.setItem(
      'claims_default_workspace',
      defaultWorkspace
    );

    localStorage.setItem(
      'claims_review_alerts',
      String(reviewAlerts)
    );

    localStorage.setItem(
      'claims_ai_alerts',
      String(aiAlerts)
    );

    localStorage.setItem(
      'claims_compact_mode',
      String(compactMode)
    );

    // Update App.tsx immediately
    onSave(defaultWorkspace);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <section className="page-section">

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            SETTINGS
          </span>

          <h2>Preferences</h2>

          <p>
            Configure your Claims Intelligence workspace.
          </p>
        </div>

        <button
          type="button"
          className="ghost"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>


      <div className="settings-grid">

        {/* WORKSPACE */}

        <div className="panel settings-card">

          <span className="eyebrow">
            WORKSPACE
          </span>

          <h3>
            Default workspace
          </h3>

          <p>
            Choose the workspace opened when
            you return to Claims Intelligence.
          </p>

          <select
            value={defaultWorkspace}
            onChange={e =>
              setDefaultWorkspace(e.target.value)
            }
          >
            <option value="Claims Operations">
              Claims Operations
            </option>

            <option value="AI Review">
              AI Review
            </option>

            <option value="Fraud Investigation">
              Fraud Investigation
            </option>

            <option value="Claims Analytics">
              Claims Analytics
            </option>
          </select>

        </div>


        {/* NOTIFICATIONS */}

        <div className="panel settings-card">

          <span className="eyebrow">
            NOTIFICATIONS
          </span>

          <h3>
            Alerts
          </h3>


          <label className="setting-toggle-row">

            <span>
              <strong>
                Review alerts
              </strong>

              <small>
                Notify when claims require
                human review.
              </small>
            </span>

            <input
              type="checkbox"
              checked={reviewAlerts}
              onChange={e =>
                setReviewAlerts(e.target.checked)
              }
            />

          </label>


          <label className="setting-toggle-row">

            <span>
              <strong>
                AI engine alerts
              </strong>

              <small>
                Receive AI engine status
                notifications.
              </small>
            </span>

            <input
              type="checkbox"
              checked={aiAlerts}
              onChange={e =>
                setAiAlerts(e.target.checked)
              }
            />

          </label>


          <label className="setting-toggle-row">

            <span>
              <strong>
                Compact mode
              </strong>

              <small>
                Use a denser dashboard layout.
              </small>
            </span>

            <input
              type="checkbox"
              checked={compactMode}
              onChange={e =>
                setCompactMode(e.target.checked)
              }
            />

          </label>

        </div>


        {/* SAVE */}

        <div className="panel settings-save-card">

          <div>
            <strong>
              {saved
                ? '✓ Preferences saved'
                : 'Save your preferences'}
            </strong>

            <p>
              {saved
                ? 'Your settings are now saved for this browser.'
                : 'These settings apply to this local workspace.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
          >
            {saved ? 'Saved ✓' : 'Save Changes'}
          </button>

        </div>

      </div>

    </section>
  );
}