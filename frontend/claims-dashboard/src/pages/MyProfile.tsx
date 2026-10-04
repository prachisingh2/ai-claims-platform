import './pages.css';

type MyProfileProps = {
  workspace: string;
  onBack: () => void;
  onClaims: () => void;
  onAIReview?: () => void;
  onAIEngine?: () => void;
};

export default function MyProfile({
  workspace,
  onBack,
  onClaims,
  onAIReview,
  onAIEngine
}: MyProfileProps) {
  return (
    <section className="page-section">

      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h2>My Profile</h2>
          <p>
            Manage your Claims Intelligence workspace profile.
          </p>
        </div>

        <button
          className="ghost"
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <div className="profile-page-grid">

        <div className="panel profile-identity-card">

          <div className="profile-avatar-large">
            PR
          </div>

          <h3>Claims Analyst</h3>

          <p>Claims Operations</p>

          <span className="profile-status">
            <i className="live-dot" />
            Active
          </span>

        </div>


        <div className="panel profile-details-card">

          <span className="eyebrow">
            ACCOUNT DETAILS
          </span>

          <div className="detail-row">
            <span>Name</span>
            <strong>Claims Analyst</strong>
          </div>

          <div className="detail-row">
            <span>Role</span>
            <strong>
              Claims Operations Analyst
            </strong>
          </div>

          <div className="detail-row">
            <span>Workspace</span>
            <strong>{workspace}</strong>
          </div>

          <div className="detail-row">
            <span>AI Access</span>
            <strong className="text-online">
              Enabled
            </strong>
          </div>

          <div className="detail-row">
            <span>AI Engine</span>
            <strong className="text-online">
              Online
            </strong>
          </div>

        </div>


        <div className="panel profile-access-card">

          <span className="eyebrow">
            QUICK ACCESS
          </span>

          <button
            className="profile-page-action"
            onClick={onClaims}
          >
            <span>▤</span>

            <div>
              <strong>
                Claims Workspace
              </strong>

              <small>
                Review and manage claims
              </small>
            </div>
          </button>


          <button
            className="profile-page-action"
            onClick={onAIReview}
          >
            <span>✦</span>

            <div>
              <strong>
                AI Review
              </strong>

              <small>
                Review claims requiring attention
              </small>
            </div>
          </button>


          <button
            className="profile-page-action"
            onClick={onAIEngine}
          >
            <span>◉</span>

            <div>
              <strong>
                AI Engine
              </strong>

              <small>
                View engine status
              </small>
            </div>
          </button>

        </div>

      </div>

    </section>
  );
}