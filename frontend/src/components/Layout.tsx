import { Link, NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-semibold tracking-tight text-stone-900"
          >
            Healthcare Booking
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavItem to="/" end>
              Home
            </NavItem>
            <NavItem to="/physicians">Book</NavItem>
            <NavItem to="/admin">Admin</NavItem>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-stone-200">
        <div className="mx-auto max-w-5xl px-6 h-12 flex items-center text-xs text-stone-500">
          Demo project · Not for medical use · Created by{" "}
          <a
            href="https://github.com/ductranphan"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 text-stone-700 hover:text-stone-900 underline underline-offset-2"
          >
            DucTranPhan
          </a>
        </div>
      </footer>
    </div>
  );
}

function NavItem({
  to,
  end,
  children,
}: {
  to: string;
  end?: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "px-3 py-1.5 rounded-md text-stone-600 hover:text-stone-900 transition-colors",
          isActive && "text-stone-900"
        )
      }
    >
      {children}
    </NavLink>
  );
}
