import { Home, User, Briefcase, FileText } from "lucide-react";
import TubelightNavbar from "./components/ui/TubelightNavbar";

export default function App() {

  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "About", url: "/about", icon: User },
    { name: "Projects", url: "/projects", icon: Briefcase },
    { name: "Resume", url: "/resume", icon: FileText }
  ];

  return (
    <>
      <TubelightNavbar items={navItems} />

      {/* your routes */}
    </>
  );
}
