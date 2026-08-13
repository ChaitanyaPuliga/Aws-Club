import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Landing() {
  return <main className="landing-page"><div className="landing-card"><div className="auth-logo">♢</div><h1>Welcome to <strong>Club Member Portal</strong></h1><p>Your AI assistant for all club information. Find answers, explore resources, and stay updated with club activities.</p><div className="landing-features"><div><span>✦</span><b>AI powered answers</b><small>Get accurate answers from our club documents</small></div><div><span>◌</span><b>Verified sources</b><small>Every answer includes its source and section</small></div><div><span>♙</span><b>For members only</b><small>Secure access for club members</small></div></div><div className="landing-actions"><Link className="primary-action" to="/register">Sign up</Link><Link className="secondary-action" to="/login">Log in</Link></div><footer>© 2026 Club Member Portal · AWS Student Builder Groups</footer></div></main>;
}
