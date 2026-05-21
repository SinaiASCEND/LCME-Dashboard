/* global React, ReactDOM, LCME_DATA, HomeView, SubcommitteeView, ElementView, AllElementsView, AllTasksView, MEPOView, ResourcesView, MeView, Icon, useTaskStatuses, useMe, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakButton, initialsFor */
// LCME Task Force — App root with hash router + tweaks panel.

const { useState, useEffect, useMemo, useCallback } = React;

// Default tweakable values — wrapped in EDITMODE markers for persistence.
const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "sinai",
  "density": "comfortable",
  "showChangedFirst": true
}/*EDITMODE-END*/;

// ─── Hash router ──────────────────────────────────────────────────────
function useHashRoute() {
  const parse = () => {
    const h = (window.location.hash || "#/").replace(/^#/, "") || "/";
    return h;
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const fn = () => setRoute(parse());
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  const navigate = useCallback((path) => {
    if (path.startsWith("#")) path = path.slice(1);
    if (!path.startsWith("/")) path = "/" + path;
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return [route, navigate];
}

// ─── Header ───────────────────────────────────────────────────────────
const Header = ({ route, navigate, me }) => {
  const showBack = route !== "/" && route !== "";
  return (
    <header className="app-header">
      <div className="app-header__bar">
        <a className="app-header__brand" href="#/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <div className="app-header__crest">LC</div>
          <div>
            <div className="app-header__title">LCME Task Force</div>
            <div className="app-header__sub">Mount Sinai · 2027–28 DCI Cycle</div>
          </div>
        </a>
        <span className="app-header__spacer" />
        {showBack ? (
          <button className="app-header__back" onClick={() => navigate("/")}>
            <Icon name="home" size={13} /> Home
          </button>
        ) : null}
        <button className="app-header__me" onClick={() => navigate("/me")}>
          {me ? (
            <>
              <span className="app-header__me-avatar">{initialsFor(me)}</span>
              <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {me}
              </span>
            </>
          ) : (
            <>
              <Icon name="users" size={13} /> Sign in
            </>
          )}
        </button>
      </div>
    </header>
  );
};

// ─── App ──────────────────────────────────────────────────────────────
const App = () => {
  const [route, navigate] = useHashRoute();
  const [statuses, setStatus] = useTaskStatuses();
  const [me, setMe] = useMe();
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  const [tab, setTab] = useState("elements");

  // Apply theme to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme || "sinai");
    document.documentElement.setAttribute("data-density", tweaks.density || "comfortable");
  }, [tweaks.theme, tweaks.density]);

  // Reset tab when subcommittee changes
  useEffect(() => { setTab("elements"); }, [route]);

  // Parse the route
  const view = useMemo(() => {
    const parts = route.split("/").filter(Boolean);
    if (parts.length === 0) return { type: "home" };
    if (parts[0] === "s" && parts[1]) return { type: "subcommittee", key: parts[1] };
    if (parts[0] === "e" && parts[1]) return { type: "element", id: parts[1] };
    if (parts[0] === "elements")      return { type: "all-elements" };
    if (parts[0] === "tasks")         return { type: "all-tasks" };
    if (parts[0] === "mepos")         return { type: "mepos" };
    if (parts[0] === "resources")     return { type: "resources" };
    if (parts[0] === "me")            return { type: "me" };
    return { type: "home" };
  }, [route]);

  return (
    <>
      <Header route={route} navigate={navigate} me={me} />
      <main className="app-main" key={route /* scroll reset by remount */}>
        {view.type === "home" && <HomeView navigate={navigate} statuses={statuses} me={me} />}
        {view.type === "subcommittee" && (
          <SubcommitteeView subKey={view.key} tab={tab} setTab={setTab}
            navigate={navigate} statuses={statuses} setStatus={setStatus} />
        )}
        {view.type === "element" && (
          <ElementView elementId={view.id} navigate={navigate}
            statuses={statuses} setStatus={setStatus} />
        )}
        {view.type === "all-elements" && (
          <AllElementsView navigate={navigate} statuses={statuses} />
        )}
        {view.type === "all-tasks" && (
          <AllTasksView navigate={navigate} statuses={statuses} setStatus={setStatus} />
        )}
        {view.type === "mepos"     && <MEPOView />}
        {view.type === "resources" && <ResourcesView navigate={navigate} />}
        {view.type === "me"        && <MeView navigate={navigate} me={me} setMe={setMe}
          statuses={statuses} setStatus={setStatus} />}
      </main>

      <footer className="app-footer">
        Mount Sinai LCME Task Force · 2027–28 DCI Cycle · 
        <a href="https://sinaiascend.github.io/Dashboard-Students/" target="_blank" rel="noreferrer"> ASCEND Curriculum Navigator </a>
         · Status saved on this device
      </footer>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Visual theme" />
        <TweakRadio
          label="Theme"
          value={tweaks.theme}
          onChange={v => setTweak("theme", v)}
          options={[
            { value: "sinai",  label: "Mount Sinai" },
            { value: "calm",   label: "Calm institutional" },
            { value: "modern", label: "Modern productivity" },
          ]}
        />

        <TweakSection label="Task data" />
        <TweakButton label="Reset task status" secondary onClick={() => {
          if (confirm("Clear all task status (this device only)?")) {
            localStorage.removeItem("lcme.taskforce.statuses.v1");
            location.reload();
          }
        }} />
        <TweakButton label="Show progress summary" onClick={() => {
          const tasks = window.LCME_DATA.TASKS;
          const total = tasks.length;
          const counts = { complete: 0, "in-progress": 0, blocked: 0 };
          for (const t of tasks) {
            const s = statuses[t.id];
            if (s && counts[s] !== undefined) counts[s]++;
          }
          const notStarted = total - counts.complete - counts["in-progress"] - counts.blocked;
          alert(`Status saved on this device:\n• Complete: ${counts.complete}\n• In progress: ${counts["in-progress"]}\n• Blocked: ${counts.blocked}\n• Not started: ${notStarted}\n• Total: ${total}`);
        }} />

        <TweakSection label="Identity" />
        {me ? (
          <TweakButton label={`Sign out (${me})`} secondary onClick={() => setMe("")} />
        ) : (
          <TweakButton label="Pick your name" onClick={() => navigate("/me")} />
        )}
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
