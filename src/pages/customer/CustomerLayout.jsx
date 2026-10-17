
import { Outlet, NavLink } from "react-router-dom";
import { FaUser, FaFire, FaBolt } from "react-icons/fa";
import { MdTipsAndUpdates } from "react-icons/md";
import { PiBroadcastFill } from "react-icons/pi";

const tabs = [
  { path: "/customer/home", name: "Top", icon: FaFire },
  { path: "/customer/feed", name: "Tips", icon: MdTipsAndUpdates },
  { path: "/customer/live", name: "Live", icon: PiBroadcastFill },
  { path: "/customer/profile", name: "Profile", icon: FaUser },
];

function NavigationItem({ tab, mobile = false }) {
  const Icon = tab.icon;

  return (
    <NavLink
      to={tab.path}
      end
      aria-label={tab.name}
      className={({ isActive }) =>
        mobile
          ? `relative flex min-w-0 flex-1 flex-col items-center
             justify-center gap-1.5 rounded-xl py-2
             transition-all duration-200
             ${
               isActive
                 ? "text-[#18ffc8]"
                 : "text-white/50 hover:text-white"
             }`
          : `group relative flex items-center gap-3 overflow-hidden
             rounded-xl px-4 py-3.5 text-sm font-semibold
             transition-all duration-200
             ${
               isActive
                 ? "bg-[#18ffc8]/10 text-[#18ffc8]"
                 : "text-white/55 hover:bg-white/[0.06] hover:text-white"
             }`
      }
    >
      {({ isActive }) => (
        <>
          {!mobile && isActive && (
            <span className="absolute bottom-2 left-0 top-2 w-[3px]
              rounded-r-full bg-[#18ffc8]" />
          )}

          {mobile && isActive && (
            <span className="absolute top-0 h-[3px] w-7
              rounded-full bg-[#18ffc8]
              shadow-[0_0_10px_rgba(24,255,200,0.45)]" />
          )}

          <Icon
            size={mobile ? 21 : 20}
            className={`shrink-0 transition-transform duration-200
              ${!mobile ? "group-hover:scale-110" : ""}`}
          />

          <span
            className={
              mobile
                ? "truncate text-[10px] font-semibold sm:text-xs"
                : "flex-1"
            }
          >
            {tab.name}
          </span>

          {!mobile && isActive && (
            <span className="text-[#fea92a]">✦</span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function CustomerLayout() {
  return (
    <div className="min-h-dvh bg-black text-white md:flex">

      {/* Desktop Sidebar */}
      <aside className="relative hidden h-dvh w-[250px] shrink-0
        flex-col overflow-hidden border-r border-white/[0.08]
        bg-black md:sticky md:top-0 md:flex">

        {/* Sporty decorative accents */}
        <div className="pointer-events-none absolute -right-12 top-24
          h-32 w-32 rotate-45 border-r-[14px] border-t-[14px]
          border-[#855391]/20" />

        <div className="pointer-events-none absolute -left-16 bottom-36
          h-32 w-32 rotate-45 border-l-[14px] border-b-[14px]
          border-[#18ffc8]/10" />

        <div className="mx-5 border-t border-white/[0.08]" />

        {/* Navigation */}
        <div className="relative px-4 pt-8">
          <div className="mb-4 flex items-center justify-between px-3">
            <span className="text-[10px] font-black uppercase
              tracking-[0.22em] text-white/35">
              Main Menu
            </span>

            <div className="flex gap-1">
              <span className="h-1 w-3 skew-x-[-25deg] bg-[#18ffc8]" />
              <span className="h-1 w-3 skew-x-[-25deg] bg-[#fea92a]" />
              <span className="h-1 w-3 skew-x-[-25deg] bg-[#855391]" />
            </div>
          </div>

          <nav aria-label="Main navigation" className="space-y-2">
            {tabs.map((tab) => (
              <NavigationItem key={tab.path} tab={tab} />
            ))}
          </nav>
        </div>

        {/* Promotional Card */}
        <div className="relative mt-auto p-4">
          <div className="relative overflow-hidden rounded-2xl
            border border-[#855391]/30 bg-gradient-to-br
            from-[#855391]/20 via-[#111111] to-black p-4">

            <div className="absolute -right-6 -top-6 h-20 w-20
              rotate-45 border-r-[12px] border-t-[12px]
              border-[#fea92a]/25" />

            <div className="mb-3 flex h-9 w-9 items-center
              justify-center rounded-lg bg-[#fea92a] text-black">
              <FaFire size={18} />
            </div>

            <h3 className="text-sm font-black uppercase italic">
              Stay in the game
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-white/55">
              Explore fresh tips, daily updates and live conversations.
            </p>

            <div className="mt-4 flex gap-1">
              <span className="h-1 w-8 skew-x-[-25deg] bg-[#18ffc8]" />
              <span className="h-1 w-5 skew-x-[-25deg] bg-[#fea92a]" />
              <span className="h-1 w-3 skew-x-[-25deg] bg-[#855391]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page */}
      <main className="min-w-0 flex-1 overflow-x-hidden
        pb-24 md:h-dvh md:overflow-y-auto md:pb-0">
        <Outlet />
      </main>


    {/* Mobile Bottom Navigation */}
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t
        border-white/[0.09] bg-black/95 px-2 pt-2
        pb-[max(10px,env(safe-area-inset-bottom))]
        shadow-[0_-8px_30px_rgba(0,0,0,0.55)]
        backdrop-blur-xl md:hidden"
    >
      {/* Sporty accent stripes */}
      <div className="mx-auto mb-2 flex max-w-lg justify-center gap-1">
        <span className="h-[3px] w-8 skew-x-[-25deg] rounded-full bg-[#18ffc8]" />
        <span className="h-[3px] w-5 skew-x-[-25deg] rounded-full bg-[#fea92a]" />
        <span className="h-[3px] w-3 skew-x-[-25deg] rounded-full bg-[#855391]" />
      </div>

      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end
              aria-label={tab.name}
              className={({ isActive }) =>
                `group relative flex min-w-0 flex-1 flex-col
                  items-center justify-center gap-1.5
                  rounded-xl px-0.5 py-2
                  transition-all duration-200
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-[#18ffc8]
                  ${
                    isActive
                      ? "bg-[#18ffc8]/30 text-[#18ffc8] shadow-[0_0_18px_rgba(24,255,200,0.16)]"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white"
                  }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active sporty corner accent */}
                  {isActive && (
                    <span className="absolute right-0 top-0 h-3 w-3
                      rounded-tr-xl border-r-3 border-t-3
                      border-[#fea92a]" />
                  )}

                  <Icon
                    size={21}
                    className={`shrink-0 transition-transform duration-200
                      ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />

                  <span className="max-w-full truncate text-[10px] font-bold
                    leading-none sm:text-xs">
                    {tab.name}
                  </span>

                  {/* Purple active indicator */}
                  {isActive && (
                    <span className="absolute bottom-1 h-[2px] w-4
                      rounded-full bg-[#855391]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>

    </div>
  );
}
