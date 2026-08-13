import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "../../lib/auth";
import { apiFetch } from "../../lib/api";

function Icon({ name, size = 18 }) {
  const paths = {
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6h5v6" />
      </>
    ),
    chat: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.4-.7L4 20l1.5-3.6A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </>
    ),
    chats: (
      <>
        <path d="M4 5.5h16v11H9l-5 4v-15Z" />
        <path d="M8 9.5h8M8 13h5" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h8l4 4v14H6V3Z" />
        <path d="M14 3v5h4M9 12h6M9 16h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.7-4 3-6 7-6s6.3 2 7 6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.5h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V6h2.5v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.5h-.1a1.7 1.7 0 0 0-1.6.4Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5v16h5" />
        <path d="M14 8l4 4-4 4M18 12H9" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Dashboard() {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");
  const { data: session } = authClient.useSession();

  useEffect(() => {
    let mounted = true;
    apiFetch("/api/users/me")
      .then((data) => {
        if (mounted) setProfile(data.profile);
      })
      .catch((error) => {
        if (mounted) setProfileError(error.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sessionUser = session?.user || session;
  const memberName = profile?.fullName || sessionUser?.name || sessionUser?.email?.split("@")[0] || "Member";

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } finally {
      window.location.href = "/login";
    }
  };

  const navItems = [
    { label: "Home", icon: "home", active: true, path: "/dashboard" },
    { label: "Chat", icon: "chat", path: "/chat" },
    { label: "My Chats", icon: "chats", path: "/chats" },
    { label: "Documents", icon: "document", path: "/documents" },
    { label: "Profile", icon: "user", path: "/profile" },
    { label: "Settings", icon: "settings", path: "/settings" },
  ];

  const recentChats = [
    {
      question: "How do I publish on Builder Center?",
      date: "10 Aug, 2024",
    },
    {
      question: "When is the next workshop?",
      date: "10 Aug, 2024",
    },
    {
      question: "Tell me about AWS account setup",
      date: "09 Aug, 2024",
    },
  ];

  return (
    <div className="dashboard-page">
      <aside className={`dashboard-sidebar ${mobileSidebar ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-shield">♢</div>
          <div>
            <div className="brand-title">Club Member Portal</div>
            <div className="brand-small">AWS Student Builder</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar-link ${item.active ? "active" : ""}`}
              onClick={() => setMobileSidebar(false)}
            >
              <Icon name={item.icon} size={17} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <Icon name="logout" size={17} />
          <span>Logout</span>
        </button>
      </aside>

      {mobileSidebar && (
        <button
          className="sidebar-overlay"
          onClick={() => setMobileSidebar(false)}
          aria-label="Close menu"
        />
      )}

      <div className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" size={20} />
          </button>

          <div className="header-brand">
            <div className="header-shield">♢</div>
            <span>Club Member Portal</span>
          </div>

          <div className="header-profile">
            <div className="avatar">C</div>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="welcome-section">
            <div>
              <h1>
                Welcome back,
                <br />
                <strong>{memberName}!</strong> 👋
              </h1>
              <p>How can I help you today?</p>
            </div>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">8</div>
              <div className="stat-label">Documents</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">24</div>
              <div className="stat-label">Past Workshops</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">150+</div>
              <div className="stat-label">Members</div>
            </div>

            <div className="stat-card">
              <div className="stat-number">12</div>
              <div className="stat-label">Leads</div>
            </div>
          </section>

          <section className="dashboard-section">
            <h2>Quick Start</h2>

            <div className="quick-grid">
              <Link to="/chat" className="quick-card">
                <div className="quick-icon purple">
                  <Icon name="chat" size={18} />
                </div>
                <div className="quick-card-content">
                  <h3>Ask a Question</h3>
                  <p>Get verified answers from club documents</p>
                </div>
                <Icon name="arrow" size={17} />
              </Link>

              <Link to="/documents" className="quick-card">
                <div className="quick-icon blue">
                  <Icon name="document" size={18} />
                </div>
                <div className="quick-card-content">
                  <h3>Browse Documents</h3>
                  <p>Explore all club resources</p>
                </div>
                <Icon name="arrow" size={17} />
              </Link>

              <Link to="/chats" className="quick-card">
                <div className="quick-icon pink">
                  <Icon name="chats" size={18} />
                </div>
                <div className="quick-card-content">
                  <h3>My Chats</h3>
                  <p>View your previous conversations</p>
                </div>
                <Icon name="arrow" size={17} />
              </Link>
            </div>
          </section>

          <section className="dashboard-section recent-section">
            <div className="section-heading-row">
              <h2>Recent Chats</h2>

              <Link to="/chats" className="view-all">
                View all chats <span>→</span>
              </Link>
            </div>

            <div className="recent-card">
              {recentChats.map((chat, index) => (
                <Link to="/chat" className="recent-row" key={chat.question}>
                  <div className="recent-chat-icon">
                    <Icon name="chat" size={14} />
                  </div>

                  <span className="recent-question">{chat.question}</span>

                  <span className="recent-date">{chat.date}</span>

                  <Icon name="arrow" size={14} />

                  {index < recentChats.length - 1 && (
                    <div className="recent-divider" />
                  )}
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          display: flex;
          background: #f8f8fc;
          color: #15182b;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .dashboard-sidebar {
          width: 218px;
          min-width: 218px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 30;
          display: flex;
          flex-direction: column;
          padding: 20px 12px 18px;
          background: linear-gradient(180deg, #101d43 0%, #08142f 100%);
          color: white;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 4px 8px 28px;
        }

        .brand-shield,
        .header-shield {
          width: 29px;
          height: 33px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background: linear-gradient(145deg, #7c35ed, #4f19c7);
          clip-path: polygon(50% 0%, 91% 14%, 87% 68%, 50% 100%, 13% 68%, 9% 14%);
          font-size: 18px;
          font-weight: 800;
        }

        .brand-title {
          font-size: 11px;
          font-weight: 700;
          line-height: 1.3;
        }

        .brand-small {
          margin-top: 2px;
          color: #9fa9c5;
          font-size: 8px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .sidebar-link {
          height: 39px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 12px;
          border-radius: 6px;
          color: #c3cbe0;
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .sidebar-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        .sidebar-link.active {
          color: white;
          background: linear-gradient(90deg, #7030df, #5e20ca);
          box-shadow: 0 5px 15px rgba(80, 31, 180, 0.25);
        }

        .sidebar-logout {
          margin-top: auto;
          height: 39px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 12px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #c3cbe0;
          cursor: pointer;
          font-size: 11px;
          text-align: left;
        }

        .sidebar-logout:hover {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        .dashboard-main {
          width: calc(100% - 218px);
          margin-left: 218px;
          min-height: 100vh;
        }

        .dashboard-header {
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: white;
          border-bottom: 1px solid #ececf2;
        }

        .header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #15182b;
          font-size: 11px;
          font-weight: 700;
        }

        .header-shield {
          width: 23px;
          height: 27px;
          font-size: 14px;
        }

        .header-profile {
          display: flex;
          align-items: center;
        }

        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ffd2a8, #b87954);
          border: 2px solid white;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.14);
          color: white;
          font-size: 11px;
          font-weight: 800;
        }

        .dashboard-content {
          max-width: 1050px;
          margin: 0 auto;
          padding: 38px 44px 55px;
        }

        .welcome-section {
          margin-bottom: 24px;
        }

        .welcome-section h1 {
          margin: 0;
          font-size: 25px;
          line-height: 1.18;
          letter-spacing: -0.6px;
          font-weight: 500;
        }

        .welcome-section h1 strong {
          font-weight: 800;
        }

        .welcome-section p {
          margin: 9px 0 0;
          color: #73778a;
          font-size: 11px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }

        .stat-card {
          min-height: 72px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12px 16px;
          background: white;
          border: 1px solid #e8e8f0;
          border-radius: 7px;
          box-shadow: 0 1px 3px rgba(31, 35, 55, 0.025);
        }

        .stat-number {
          color: #161a31;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.2;
        }

        .stat-label {
          margin-top: 4px;
          color: #85899a;
          font-size: 9px;
        }

        .dashboard-section {
          margin-top: 25px;
        }

        .dashboard-section h2 {
          margin: 0 0 12px;
          font-size: 14px;
          font-weight: 800;
          color: #171a2d;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .quick-card {
          min-height: 83px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 15px;
          border: 1px solid #e8e8f0;
          border-radius: 7px;
          background: white;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(31, 35, 55, 0.025);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .quick-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 7px 20px rgba(31, 35, 55, 0.08);
        }

        .quick-icon {
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .quick-icon.purple {
          color: #6d2dde;
          background: #f0e8ff;
        }

        .quick-icon.blue {
          color: #4075db;
          background: #e9f0ff;
        }

        .quick-icon.pink {
          color: #d451aa;
          background: #fceaf7;
        }

        .quick-card-content {
          min-width: 0;
          flex: 1;
        }

        .quick-card h3 {
          margin: 0 0 4px;
          font-size: 10px;
          font-weight: 800;
        }

        .quick-card p {
          margin: 0;
          color: #898d9e;
          font-size: 8px;
          line-height: 1.45;
        }

        .quick-card > svg {
          color: #a2a5b2;
          flex-shrink: 0;
        }

        .recent-section {
          margin-top: 30px;
        }

        .section-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .section-heading-row h2 {
          margin: 0;
        }

        .view-all {
          color: #6729d9;
          text-decoration: none;
          font-size: 8px;
          font-weight: 700;
        }

        .view-all span {
          margin-left: 3px;
        }

        .recent-card {
          position: relative;
          overflow: hidden;
          background: white;
          border: 1px solid #e8e8f0;
          border-radius: 7px;
        }

        .recent-row {
          min-height: 48px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 15px;
          color: #303346;
          text-decoration: none;
          font-size: 9px;
        }

        .recent-row:hover {
          background: #faf9ff;
        }

        .recent-chat-icon {
          width: 23px;
          height: 23px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7130df;
          background: #f1eaff;
          border-radius: 6px;
        }

        .recent-question {
          flex: 1;
          font-weight: 500;
        }

        .recent-date {
          color: #999baa;
          font-size: 8px;
          white-space: nowrap;
        }

        .recent-row > svg {
          color: #a8abb6;
          flex-shrink: 0;
        }

        .recent-divider {
          position: absolute;
          left: 48px;
          right: 15px;
          bottom: 0;
          height: 1px;
          background: #f0f0f4;
        }

        .mobile-menu-button {
          display: none;
          border: 0;
          background: transparent;
          color: #303346;
          padding: 4px;
          cursor: pointer;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 900px) {
          .dashboard-sidebar {
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }

          .dashboard-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 20;
            border: 0;
            background: rgba(4, 10, 25, 0.45);
          }

          .dashboard-main {
            width: 100%;
            margin-left: 0;
          }

          .mobile-menu-button {
            display: flex;
          }

          .header-brand {
            margin-right: auto;
            margin-left: 10px;
          }

          .dashboard-header {
            padding: 0 18px;
          }

          .dashboard-content {
            padding: 30px 24px 45px;
          }
        }

        @media (max-width: 700px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .quick-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .dashboard-content {
            padding: 25px 16px 40px;
          }

          .welcome-section h1 {
            font-size: 22px;
          }

          .recent-date {
            display: none;
          }

          .header-brand span {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
