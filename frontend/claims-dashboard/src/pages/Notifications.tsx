import './pages.css';

type NotificationsProps = {
  reviewQueue: number;
  highFraud: number;
  onBack: () => void;
  onReview?: () => void;
  onFraud?: () => void;
  onAIEngine?: () => void;
};

export default function Notifications({
  reviewQueue,
  highFraud,
  onBack,
  onReview,
  onFraud,
  onAIEngine
}: NotificationsProps) {

  return (
    <section className="page-section">

      <div className="page-heading">

        <div>
          <span className="eyebrow">
            SYSTEM ACTIVITY
          </span>

          <h2>Notifications</h2>

          <p>
            Important updates from your claims workspace.
          </p>
        </div>

        <button
          className="ghost"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>


      <div className="notifications-list">

        {reviewQueue > 0 && (
          <button
            className="notification-item"
            onClick={onReview}
          >

            <span className="notification-icon warning">
              !
            </span>

            <div>

              <strong>
                Claims require review
              </strong>

              <p>
                {reviewQueue} claims are currently
                waiting for analyst attention.
              </p>

            </div>

            <span className="notification-arrow">
              →
            </span>

          </button>
        )}


        {highFraud > 0 && (
          <button
            className="notification-item"
            onClick={onFraud}
          >

            <span className="notification-icon risk">
              !
            </span>

            <div>

              <strong>
                Fraud signals detected
              </strong>

              <p>
                {highFraud} claims have elevated
                fraud scores.
              </p>

            </div>

            <span className="notification-arrow">
              →
            </span>

          </button>
        )}


        <button
          className="notification-item"
          onClick={onAIEngine}
        >

          <span className="notification-icon">
            ✦
          </span>

          <div>

            <strong>
              AI Engine operational
            </strong>

            <p>
              Local reasoning engine is online
              and ready.
            </p>

          </div>

          <span className="notification-arrow">
            →
          </span>

        </button>


        <div className="notification-empty">

          <span>✓</span>

          <strong>
            You're all caught up
          </strong>

          <p>
            Notifications are generated from
            the current claims workspace.
          </p>

        </div>

      </div>

    </section>
  );
}