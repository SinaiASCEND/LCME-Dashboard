/* global React, ReactDOM, LCME_DATA, LCME_DCI, LCME_ISA, LCME_GLOSSARY,
   HomeView, SubcommitteeView, ElementView, AllElementsView, AllTasksView,
   MEPOView, ResourcesView, MembershipView, GlossaryView, RosterView, AllPhasesView,
   DCIIndexView, DCIStandardView, DCIElementView, ISAIndexView, ISADomainView,
   AboutView, RoadmapView, LeadershipView, AllSubcommitteesView, SiteVisitView, AscendView,
   Breadcrumbs, Icon, useTaskStatuses, DocSearchBar,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakButton */
// LCME Task Force — App root with hash router + breadcrumbs + tweaks.

const { useState, useEffect, useMemo, useCallback } = React;

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "sinai",
  "density": "comfortable"
}/*EDITMODE-END*/;

// ─── Hash router ──────────────────────────────────────────────────────
function useHashRoute() {
  const parse = () => (window.location.hash || "#/").replace(/^#/, "") || "/";
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
const Header = ({ navigate }) => {
  const ref = React.useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const measure = () => {
      const h = ref.current?.getBoundingClientRect().height || 60;
      document.documentElement.style.setProperty("--header-h", h + "px");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return (
    <header className="app-header" ref={ref}>
      <div className="app-header__bar">
        <a className="app-header__brand" href="#/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          <div className="app-header__crest">LC</div>
          <div>
            <div className="app-header__title">LCME Task Force</div>
            <div className="app-header__sub">Mount Sinai · 2027–28 DCI Cycle</div>
          </div>
        </a>
        <span className="app-header__spacer" />
        <button className="app-header__back" onClick={() => navigate("/")}>
          <Icon name="home" size={13} /> Home
        </button>
      </div>
    </header>
  );
};

// ─── Build breadcrumb trail from current view ─────────────────────────
function trailFor(view, navigate) {
  const base = { label: "Home", path: "/" };
  switch (view.type) {
    case "home":              return [{ label: "Home" }];
    case "subcommittee":      return [base, { label: window.LCME_DATA.SUBCOMMITTEES[view.key]?.short || view.key }];
    case "element": {
      const tf = window.LCME_DATA.ELEMENTS.find(e => e.id === view.id);
      const subName = tf ? window.LCME_DATA.SUBCOMMITTEES[tf.subcommittee].short : null;
      const trail = [base];
      if (tf) trail.push({ label: subName, path: "/s/" + tf.subcommittee });
      trail.push({ label: "Element " + view.id });
      return trail;
    }
    case "all-elements":      return [base, { label: "All elements" }];
    case "all-tasks":         return [base, { label: "All tasks" }];
    case "mepos":             return [base, { label: "MEPOs" }];
    case "resources":         return [base, { label: "Resources" }];
    case "members":           return [base, { label: "Membership" }];
    case "glossary":          return [base, { label: "Glossary" }];
    case "phases":            return [base, { label: "ASCEND Phases" }];
    case "roster": {
      const labels = { phase1: "Phase 1 modules", phase2: "Phase 2 clerkships", phase3: "Phase 3 experiences" };
      return [base, { label: labels[view.id] || "Roster" }];
    }
    case "dci":               return [base, { label: "DCI 2027–28" }];
    case "dci-standard":      return [base, { label: "DCI 2027–28", path: "/dci" }, { label: "Standard " + view.id }];
    case "dci-element": {
      let standardId = null;
      for (const std of (window.LCME_DCI || [])) if (std.elements.find(e => e.id === view.id)) { standardId = std.id; break; }
      const trail = [base, { label: "DCI 2027–28", path: "/dci" }];
      if (standardId) trail.push({ label: "Standard " + standardId, path: "/dci/s/" + standardId });
      trail.push({ label: "Element " + view.id });
      return trail;
    }
    case "isa":               return [base, { label: "ISA" }];
    case "isa-domain": {
      const d = (window.LCME_ISA || [])[Number(view.idx)];
      return [base, { label: "ISA", path: "/isa" }, { label: d ? "Domain " + (Number(view.idx)+1) : "Domain" }];
    }
    case "about":             return [base, { label: "About the self-study" }];
    case "roadmap":           return [base, { label: "Roadmap" }];
    case "leadership":        return [base, { label: "Leadership & roles" }];
    case "sc8":               return [base, { label: "All 8 subcommittees" }];
    case "site-visit":        return [base, { label: "Site visit" }];
    case "ascend":            return [base, { label: "ASCEND curriculum" }];
    case "search":            return [base, { label: "Search" }];
    default:                  return [{ label: "Home" }];
  }
}

// ─── Scroll sway — gentle horizontal drift as the page scrolls ───────
function useScrollSway() {
  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const y = window.scrollY || 0;
      const main = Math.sin(y / 220) * 6;  // ±6px
      const bar  = Math.cos(y / 260) * 8;  // ±8px
      document.documentElement.style.setProperty("--sway-main", main.toFixed(2) + "px");
      document.documentElement.style.setProperty("--sway-bar",  bar.toFixed(2) + "px");
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}

// ─── Search results view (full page) ──────────────────────────────────
const SearchView = ({ navigate, initialQuery }) => {
  const [q, setQ] = useState(initialQuery || "");
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null); // result object
  const inputRef = React.useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Persist q in hash so back/forward & deep links work: #/search?q=foo
  useEffect(() => {
    const cur = window.location.hash.replace(/^#/, "");
    const target = "/search" + (q ? "?q=" + encodeURIComponent(q) : "");
    if (cur !== target) {
      window.history.replaceState(null, "", "#" + target);
    }
  }, [q]);

  // Build results
  useEffect(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) { setResults([]); setExpanded(null); return; }
    const out = [];
    const D = window.LCME_DATA || {};

    // DCI
    for (const std of (window.LCME_DCI || [])) {
      if (std.title.toLowerCase().includes(term)) {
        out.push({ kind: "standard", label: `Standard ${std.id}: ${std.title}`, path: "/dci/s/" + std.id, body: std.intent || std.title });
      }
      for (const el of std.elements) {
        if (el.id.includes(term) || el.title.toLowerCase().includes(term)) {
          out.push({ kind: "element", label: `${el.id} ${el.title}`, sub: "Standard " + std.id, path: "/dci/e/" + el.id, body: el.title });
        }
        for (const n of el.narratives) {
          if (n.text.toLowerCase().includes(term)) {
            out.push({ kind: "narrative", label: `${el.id} · narrative (${n.letter})`, sub: snippet(n.text, term), path: "/dci/e/" + el.id, body: n.text });
          }
        }
        for (const t of el.tables) {
          if ((t.title || "").toLowerCase().includes(term) || (t.description || "").toLowerCase().includes(term)) {
            out.push({ kind: "table", label: `${el.id} · ${t.title || "table"}`, sub: snippet(t.description || "", term), path: "/dci/e/" + el.id, body: t.description || t.title });
          }
        }
        for (const d of el.supportingDocs) {
          if (d.text.toLowerCase().includes(term)) {
            out.push({ kind: "doc", label: `${el.id} · supporting doc ${d.n}`, sub: snippet(d.text, term), path: "/dci/e/" + el.id, body: d.text });
          }
        }
      }
    }
    // ISA
    (window.LCME_ISA || []).forEach((d, di) => {
      if (d.name.toLowerCase().includes(term)) {
        out.push({ kind: "isa-domain", label: `ISA: ${d.name}`, path: "/isa/" + di, body: d.name });
      }
      const allItems = [...d.items, ...d.subdomains.flatMap(sd => sd.items.map(it => ({ ...it, _sd: sd.name })))];
      for (const it of allItems) {
        if (it.text.toLowerCase().includes(term)) {
          out.push({ kind: "isa-item", label: `ISA · ${d.name}${it._sd ? " · " + it._sd : ""}`, sub: snippet(it.text, term), path: "/isa/" + di, body: it.text });
        }
      }
    });
    // Subcommittees + members
    for (const sub of Object.values(D.SUBCOMMITTEES || {})) {
      if (sub.name.toLowerCase().includes(term) || (sub.blurb || "").toLowerCase().includes(term)) {
        out.push({ kind: "subcommittee", label: sub.name, sub: snippet(sub.blurb || "", term), path: "/s/" + sub.key, body: sub.blurb });
      }
      const people = [
        ...sub.coChairs.map(m => ({ ...m, role: "Co-chair" })),
        { ...sub.projectManager, role: "PM" },
        ...sub.members.map(m => ({ ...m, role: "Member" })),
      ];
      for (const m of people) {
        if ((m.name || "").toLowerCase().includes(term) || (m.email || "").toLowerCase().includes(term)) {
          out.push({ kind: "member", label: m.name, sub: `${m.role} · ${sub.short} · ${m.email}`, path: "/s/" + sub.key, body: `${m.role} — ${sub.name}. ${m.note || ""}\n${m.email}` });
        }
      }
    }
    // Task-force elements
    for (const el of (D.ELEMENTS || [])) {
      if (el.id.includes(term) || (el.title || "").toLowerCase().includes(term) || (el.changeSummary || "").toLowerCase().includes(term)) {
        out.push({ kind: "element", label: `${el.id} ${el.title}`, sub: snippet(el.changeSummary || "", term), path: "/e/" + el.id, body: el.changeSummary });
      }
    }
    // Tasks
    for (const t of (D.TASKS || [])) {
      if (t.id.toLowerCase().includes(term) || (t.description || "").toLowerCase().includes(term)) {
        out.push({ kind: "task", label: `${t.id} · ${t.category}`, sub: snippet(t.description || "", term), path: "/e/" + t.element, body: t.description });
      }
    }
    // MEPOs
    for (const g of (D.MEPOS || [])) {
      if ((g.domain || "").toLowerCase().includes(term)) {
        out.push({ kind: "mepo", label: `MEPO domain: ${g.domain}`, path: "/mepos", body: g.domain });
      }
      for (const item of g.items || []) {
        if (item.toLowerCase().includes(term)) {
          out.push({ kind: "mepo", label: `MEPO · ${g.domain}`, sub: snippet(item, term), path: "/mepos", body: item });
        }
      }
    }
    // Glossary
    const glossary = window.LCME_GLOSSARY;
    const glossaryEntries = glossary && glossary.entries ? glossary.entries : (Array.isArray(glossary) ? glossary : []);
    for (const entry of glossaryEntries) {
      const t = (entry.term || "").toLowerCase();
      const def = (entry.body || entry.def || entry.definition || "").toLowerCase();
      if (t.includes(term) || def.includes(term)) {
        out.push({ kind: "glossary", label: entry.term + (entry.expansion ? " — " + entry.expansion : ""), sub: snippet(entry.body || entry.def || entry.definition || "", term), path: "/glossary", body: entry.body || entry.def || entry.definition });
      }
    }

    // Dedupe
    const seen = new Set();
    const dedup = [];
    for (const r of out) {
      const k = r.kind + "|" + r.label + "|" + r.path;
      if (seen.has(k)) continue;
      seen.add(k);
      dedup.push(r);
    }
    setResults(dedup.slice(0, 120));
    setExpanded(null);
  }, [q]);

  // Group by kind
  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of results) {
      if (!map.has(r.kind)) map.set(r.kind, []);
      map.get(r.kind).push(r);
    }
    const order = ["standard", "element", "narrative", "table", "doc",
                   "isa-domain", "isa-item", "subcommittee", "member",
                   "task", "mepo", "glossary"];
    return order.filter(k => map.has(k)).map(k => ({ kind: k, items: map.get(k) }));
  }, [results]);

  return (
    <>
      <h1 className="h-display" style={{ marginBottom: 6 }}>Search</h1>
      <p className="lead" style={{ marginBottom: 14 }}>
        Search the entire database — DCI standards &amp; elements, ISA survey items, subcommittees, members, tasks, MEPOs, and the glossary.
      </p>
      <div className="searchpage-input">
        <Icon name="search" size={16} />
        <input
          ref={inputRef}
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q ? (
          <button onClick={() => { setQ(""); inputRef.current?.focus(); }} aria-label="Clear">
            <Icon name="x" size={14} />
          </button>
        ) : null}
      </div>

      {q.trim().length < 2 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          Type at least 2 characters to search. Try an element ID ("7.6"), a person's name, or a topic ("self-directed").
        </div>
      ) : results.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>No matches.</div>
      ) : (
        <>
          <div className="searchpage-count">
            <strong>{results.length}</strong> result{results.length === 1 ? "" : "s"} across {grouped.length} categor{grouped.length === 1 ? "y" : "ies"}.
          </div>

          {grouped.map(g => (
            <section key={g.kind} className="searchpage-group">
              <h3 className="searchpage-group__title">
                {kindHeading(g.kind)} <span className="searchpage-group__count">{g.items.length}</span>
              </h3>
              <div className="searchpage-results">
                {g.items.map((r, i) => {
                  const isOpen = expanded && expanded._key === g.kind + ":" + i;
                  return (
                    <React.Fragment key={i}>
                      <button className={"searchpage-hit" + (isOpen ? " is-open" : "")}
                        onClick={() => {
                          const key = g.kind + ":" + i;
                          setExpanded(isOpen ? null : { ...r, _key: key });
                        }}>
                        <span className={"doc-search__kind doc-search__kind--" + r.kind.replace(/[^a-z]/g, "")}>{kindLabelShort(r.kind)}</span>
                        <div className="searchpage-hit__body">
                          <div className="searchpage-hit__label">{r.label}</div>
                          {r.sub ? <div className="searchpage-hit__sub">{r.sub}</div> : null}
                        </div>
                        <Icon name="chevronDown" size={14} />
                      </button>
                      {isOpen ? (
                        <div className="searchpage-expand">
                          <div className="searchpage-expand__kind">{kindHeading(r.kind)}</div>
                          <h4 className="searchpage-expand__title">{r.label}</h4>
                          {r.body ? <p className="searchpage-expand__body">{r.body}</p> : null}
                          <div className="searchpage-expand__actions">
                            <button className="btn-primary" onClick={() => navigate(r.path)}>
                              Open <Icon name="arrowR" size={12} />
                            </button>
                            <button className="btn-ghost" onClick={() => setExpanded(null)}>
                              Close
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  );
};

function snippet(text, term) {
  if (!text) return "";
  const t = String(text);
  const lower = t.toLowerCase();
  const idx = lower.indexOf(term);
  if (idx < 0) return t.slice(0, 120);
  const start = Math.max(0, idx - 36);
  const end = Math.min(t.length, idx + term.length + 90);
  return (start > 0 ? "…" : "") + t.slice(start, end) + (end < t.length ? "…" : "");
}
function kindLabelShort(kind) {
  return {
    standard: "Std", element: "Elem", narrative: "Q", table: "Table", doc: "Doc",
    "isa-domain": "ISA", "isa-item": "ISA",
    subcommittee: "Sub", member: "Person", task: "Task", mepo: "MEPO", glossary: "Term",
  }[kind] || kind;
}
function kindHeading(kind) {
  return {
    standard: "DCI standards", element: "Elements", narrative: "DCI narrative questions",
    table: "DCI tables", doc: "Supporting documents",
    "isa-domain": "ISA domains", "isa-item": "ISA survey items",
    subcommittee: "Subcommittees", member: "People", task: "Tasks", mepo: "MEPOs",
    glossary: "Glossary terms",
  }[kind] || kind;
}

// ─── Bottom bar ───────────────────────────────────────────────────────
const BottomBar = ({ route, navigate }) => {
  const active = (path) => route.startsWith(path);
  return (
    <nav className="bottom-bar" aria-label="Primary">
      <button className={"bottom-bar__btn " + (active("/dci") ? "is-active" : "")}
        onClick={() => navigate("/dci")}>
        <Icon name="book" size={20} />
        <span>DCI</span>
      </button>
      <button className={"bottom-bar__btn " + (active("/members") ? "is-active" : "")}
        onClick={() => navigate("/members")}>
        <Icon name="users" size={20} />
        <span>Members</span>
      </button>
      <button className={"bottom-bar__btn " + (active("/glossary") ? "is-active" : "")}
        onClick={() => navigate("/glossary")}>
        <Icon name="glossary" size={20} />
        <span>Glossary</span>
      </button>
      <button className={"bottom-bar__btn " + (active("/search") ? "is-active" : "")}
        onClick={() => navigate("/search")}>
        <Icon name="search" size={20} />
        <span>Search</span>
      </button>
    </nav>
  );
};

// ─── App ──────────────────────────────────────────────────────────────
const App = () => {
  const [route, navigate] = useHashRoute();
  const [statuses, setStatus] = useTaskStatuses();
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);
  const [tab, setTab] = useState("elements");
  useScrollSway();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.theme || "sinai");
  }, [tweaks.theme]);

  useEffect(() => { setTab("elements"); }, [route]);

  const { view, searchQuery } = useMemo(() => {
    // Strip ?query off path for routing, but capture for search
    const hashStr = route;
    const [pathPart, queryStr] = hashStr.split("?");
    const params = new URLSearchParams(queryStr || "");
    const searchQuery = params.get("q") || "";
    const parts = pathPart.split("/").filter(Boolean);
    let view;
    if (parts.length === 0)                                          view = { type: "home" };
    else if (parts[0] === "s"  && parts[1])                          view = { type: "subcommittee", key: parts[1] };
    else if (parts[0] === "e"  && parts[1])                          view = { type: "element", id: parts[1] };
    else if (parts[0] === "elements")                                view = { type: "all-elements" };
    else if (parts[0] === "tasks")                                   view = { type: "all-tasks" };
    else if (parts[0] === "mepos")                                   view = { type: "mepos" };
    else if (parts[0] === "resources")                               view = { type: "resources" };
    else if (parts[0] === "members")                                 view = { type: "members" };
    else if (parts[0] === "glossary")                                view = { type: "glossary" };
    else if (parts[0] === "phases")                                  view = { type: "phases" };
    else if (parts[0] === "roster" && parts[1])                      view = { type: "roster", id: parts[1] };
    else if (parts[0] === "dci" && parts[1] === "s" && parts[2])     view = { type: "dci-standard", id: parts[2] };
    else if (parts[0] === "dci" && parts[1] === "e" && parts[2])     view = { type: "dci-element", id: parts[2] };
    else if (parts[0] === "dci")                                     view = { type: "dci" };
    else if (parts[0] === "isa" && parts[1])                         view = { type: "isa-domain", idx: parts[1] };
    else if (parts[0] === "isa")                                     view = { type: "isa" };
    else if (parts[0] === "about")                                   view = { type: "about" };
    else if (parts[0] === "roadmap")                                 view = { type: "roadmap" };
    else if (parts[0] === "leadership")                              view = { type: "leadership" };
    else if (parts[0] === "sc8")                                     view = { type: "sc8" };
    else if (parts[0] === "site-visit")                              view = { type: "site-visit" };
    else if (parts[0] === "ascend")                                  view = { type: "ascend" };
    else if (parts[0] === "search")                                  view = { type: "search" };
    else                                                             view = { type: "home" };
    return { view, searchQuery };
  }, [route]);

  const trail = trailFor(view, navigate);

  return (
    <>
      <Header navigate={navigate} />
      <main className="app-main" key={route}>
        {view.type !== "home" ? <Breadcrumbs trail={trail} navigate={navigate} /> : null}

        {view.type === "home"               && <HomeView navigate={navigate} statuses={statuses} />}
        {view.type === "subcommittee"       && <SubcommitteeView subKey={view.key} tab={tab} setTab={setTab}
                                                navigate={navigate} statuses={statuses} setStatus={setStatus} />}
        {view.type === "element"            && <ElementView elementId={view.id} navigate={navigate}
                                                statuses={statuses} setStatus={setStatus} />}
        {view.type === "all-elements"       && <AllElementsView navigate={navigate} statuses={statuses} />}
        {view.type === "all-tasks"          && <AllTasksView navigate={navigate} statuses={statuses} setStatus={setStatus} />}
        {view.type === "mepos"              && <MEPOView />}
        {view.type === "resources"          && <ResourcesView navigate={navigate} />}
        {view.type === "members"            && <MembershipView navigate={navigate} />}
        {view.type === "glossary"           && <GlossaryView navigate={navigate} />}
        {view.type === "phases"             && <AllPhasesView navigate={navigate} />}
        {view.type === "roster"             && <RosterView phaseId={view.id} navigate={navigate} />}
        {view.type === "dci"                && <DCIIndexView navigate={navigate} />}
        {view.type === "dci-standard"       && <DCIStandardView standardId={view.id} navigate={navigate} />}
        {view.type === "dci-element"        && <DCIElementView elementId={view.id} navigate={navigate} />}
        {view.type === "isa"                && <ISAIndexView navigate={navigate} />}
        {view.type === "isa-domain"         && <ISADomainView domainIdx={view.idx} navigate={navigate} />}
        {view.type === "about"              && <AboutView navigate={navigate} />}
        {view.type === "roadmap"            && <RoadmapView navigate={navigate} />}
        {view.type === "leadership"         && <LeadershipView navigate={navigate} />}
        {view.type === "sc8"                && <AllSubcommitteesView navigate={navigate} />}
        {view.type === "site-visit"         && <SiteVisitView navigate={navigate} />}
        {view.type === "ascend"             && <AscendView navigate={navigate} />}
        {view.type === "search"             && <SearchView navigate={navigate} initialQuery={searchQuery} key={searchQuery ? "" : "blank"} />}
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
            { value: "sinai",  label: "ASCEND" },
            { value: "calm",   label: "Calm institutional" },
            { value: "modern", label: "Modern productivity" },
          ]} />

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
      </TweaksPanel>

      <BottomBar route={route} navigate={navigate} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
