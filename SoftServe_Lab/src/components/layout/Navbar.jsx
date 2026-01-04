import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ======================
   Motion Variants (Apple-like)
====================== */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.35, ease: [0.4, 0, 0.6, 1] },
  },
};

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: "easeOut" },
  },
};

function linkClass({ isActive }) {
  return [
    "block py-3 text-lg transition rounded-xl px-3",
    "text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] hover:bg-[rgba(var(--stroke),0.08)]",
    isActive ? "text-[rgb(var(--fg))] bg-[rgba(var(--stroke),0.08)]" : "",
  ].join(" ");
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click (panel)
  useEffect(() => {
    function onClick(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const links = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Book", to: "/book" },
    { label: "Admin", to: "/admin" },
  ];

  return (
    <>
      {/* Top Bar (theme-safe glass) */}
      <header
        className="
          sticky top-0 z-50 backdrop-blur
          bg-[rgba(var(--bg0),0.65)]
          border-b border-[rgba(var(--stroke),0.10)]
        "
      >
        <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <NavLink
            to="/"
            className="text-xl font-medium tracking-wide text-[rgb(var(--fg))]"
          >
            SoftServe Lab
          </NavLink>

          <div className="flex items-center gap-3">
            {/* Theme slider (outside menu) */}

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="
    group relative inline-flex items-center justify-center
    px-6 py-3 rounded-full
    text-xs font-semibold tracking-[0.25em]
    cursor-pointer overflow-hidden
    text-[rgb(var(--fg))]
    bg-[rgba(var(--bg1),0.35)]
    ring-1 ring-[rgba(var(--stroke),0.14)]
    shadow-[0_10px_28px_-18px_rgba(0,0,0,0.65)]
    transition-all duration-150
    hover:bg-[rgba(var(--bg1),0.45)]
    active:scale-[0.97]
  "
            >
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
                <span
                  className="
        w-[10rem] h-[10rem] rounded-full blur-2xl opacity-50
        bg-[linear-gradient(90deg,#de004b,#bf46ff,#00d4ff)]
        animate-[spin_3s_linear_infinite]
        transition-all duration-300
        group-hover:w-[8rem] group-hover:h-[8rem]
      "
                />
              </span>

              <span className="relative z-10 flex items-center gap-2">
                <span>MENU</span>
                <span className="text-sm leading-none">+</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (theme-safe dim) */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.40)]"
            />

            <motion.aside
              ref={panelRef}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="
                fixed top-0 right-0 z-50 h-full w-[360px] max-w-[90vw]
                backdrop-blur-xl
                bg-[rgba(var(--bg0),0.92)]
                border-l border-[rgba(var(--stroke),0.10)]
                px-6 pt-20
              "
              aria-label="Site menu"
            >
              {/* Small top row */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm tracking-wide text-[rgb(var(--muted))]">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="
                    text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]
                    transition
                  "
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <motion.nav
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="space-y-1"
              >
                {links.map((l) => (
                  <motion.div key={l.to} variants={itemVariants}>
                    <NavLink to={l.to} className={linkClass}>
                      {l.label}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.nav>

              <div className="mt-10 pt-6 border-t border-[rgba(var(--stroke),0.10)]">
                <p className="text-xs text-[rgb(var(--muted))]">
                  © {new Date().getFullYear()} SoftServe Lab
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
