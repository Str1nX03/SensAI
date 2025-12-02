import { Link, useLocation } from "react-router-dom";
import "../styles/navbar.css";

export default function Navbar({ items }) {
  const location = useLocation();

  const activeTab = items.find(i => i.url === location.pathname)?.name || items[0].name;

  return (
    <div className="nav-shell top-fixed">
      <nav className="nav-bar">
        {items.map(item => {
          const Icon = item.icon;
          const active = activeTab === item.name;

          return (
            <Link
              key={item.name}
              to={item.url}
              className={`nav-pill ${active ? "nav-pill-active" : ""}`}
            >
              <div className="nav-icon-container">
                <Icon size={18} />
              </div>
              
              <span className="nav-text">{item.name}</span>

              {active && <span className="nav-glow"/>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}