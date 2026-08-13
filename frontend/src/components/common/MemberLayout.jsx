import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authClient } from "../../lib/auth";
import "../../styles/portal.css";

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

export default function MemberLayout({ children }) {
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const location = useLocation();

  const navItems = [
    {
      label: "Home",
      icon: "home",
      path: "/dashboard",
    },
    {
      label: "Chat",
      icon: "chat",
      path: "/chat",
    },
    {
      label: "My Chats",
      icon: "chats",
      path: "/chats",
    },
    {
      label: "Documents",
      icon: "document",
      path: "/documents",
    },
    {
      label: "Profile",
      icon: "user",
      path: "/profile",
    },
    {
      label: "Settings",
      icon: "settings",
      path: "/settings",
    },
  ];

  async function handleLogout() {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div className="dashboard-page">
      <aside
        className={`dashboard-sidebar ${
          mobileSidebar ? "open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-shield">♢</div>

          <div>
            <div className="brand-title">
              Club Member Portal
            </div>

            <div className="brand-small">
              AWS Student Builder
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === "/chat" &&
                location.pathname.startsWith("/chat/")) ||
              (item.path === "/chats" &&
                location.pathname.startsWith("/chats/"));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${
                  isActive ? "active" : ""
                }`}
                onClick={() =>
                  setMobileSidebar(false)
                }
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          className="sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          <Icon name="logout" size={17} />
          <span>Logout</span>
        </button>
      </aside>

      {mobileSidebar && (
        <button
          className="sidebar-overlay"
          type="button"
          onClick={() => setMobileSidebar(false)}
          aria-label="Close menu"
        />
      )}

      <div className="dashboard-main">
        <header className="dashboard-header">
          <button
            className="mobile-menu-button"
            type="button"
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

        {children}
      </div>

      <style>{`
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
          background: linear-gradient(
            180deg,
            #101d43 0%,
            #08142f 100%
          );
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
          background: linear-gradient(
            145deg,
            #7c35ed,
            #4f19c7
          );
          clip-path: polygon(
            50% 0%,
            91% 14%,
            87% 68%,
            50% 100%,
            13% 68%,
            9% 14%
          );
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
          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .sidebar-link:hover {
          color: white;
          background: rgba(255, 255, 255, 0.08);
        }

        .sidebar-link.active {
          color: white;
          background: linear-gradient(
            90deg,
            #7030df,
            #5e20ca
          );
          box-shadow:
            0 5px 15px rgba(80, 31, 180, 0.25);
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
          background: linear-gradient(
            135deg,
            #ffd2a8,
            #b87954
          );
          border: 2px solid white;
          box-shadow:
            0 1px 5px rgba(0, 0, 0, 0.14);
          color: white;
          font-size: 11px;
          font-weight: 800;
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
        }

        @media (max-width: 480px) {
          .header-brand span {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}