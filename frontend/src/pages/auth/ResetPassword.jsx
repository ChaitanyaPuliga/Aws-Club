import { AuthView } from "@neondatabase/auth-ui";
import "../../styles/auth.css";

function ResetPassword() {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-brand">
          <div className="auth-logo">♢</div>
          <h1 className="auth-brand-title">Club Member Portal</h1>
          <p className="auth-brand-subtitle">
            AWS Student Builder Groups
          </p>
        </div>

        <div className="auth-card">
          <AuthView pathname="/reset-password" />
        </div>

        <div className="auth-footer">
          AWS Student Builder Groups
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;