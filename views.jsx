/* global React, LCME_DATA, Icon, ChangeChip, Tabs, initialsFor, formatDate, formatDateShort, isExternal */
// View components for each screen.

const { SUBCOMMITTEES, ELEMENTS, TASKS, MEPOS, RESOURCES } = window.LCME_DATA;
const { useState, useMemo, useEffect } = React;

// ─── Task helpers shared across views ──────────────────────────────────
function tasksForElement(elementId) {
  return TASKS.filter(t => t.element === elementId);
}
function tasksForSubcommittee(key) {
  return TASKS.filter(t => t.subcommittee === key);
}
function elementsForSubcommittee(key) {
  return ELEMENTS.filter(e => e.subcommittee === key);
}
function statusCounts(taskIds, statuses) {
  const c = { "not-started": 0, "in-progress": 0, "complete": 0, "blocked": 0 };
  for (const id of taskIds) c[statuses[id] || "not-started"]++;
  return c;
}

// ─── Subcommittee card ────────────────────────────────────────────────
const SubcommitteeCard = ({ sub, onOpen, statuses }) => {
  const tasks = tasksForSubcommittee(sub.key);
  const els = elementsForSubcommittee(sub.key);
  const done = tasks.filter(t => statuses[t.id] === "complete").length;
  const memberCount = sub.coChairs.length + sub.members.length + 1; // + PM
  return (
    <button className={`subcomm-card subcomm-card--${sub.accent}`} onClick={onOpen}>
      <div className="subcomm-card__accent" />
      <div className="subcomm-card__eyebrow">Task Force Subcommittee</div>
      <div className="subcomm-card__name">{sub.name}</div>
      <div className="subcomm-card__blurb">{sub.blurb}</div>
      <div className="subcomm-card__meta">
        <span className="chip"><span className="dot" />{els.length} elements</span>
        <span className="chip">{tasks.length} tasks</span>
        <span className="chip">{memberCount} members</span>
      </div>
      <div className="subcomm-card__open">
        Open subcommittee <Icon name="arrowR" size={14} />
      </div>
    </button>
  );
};

// ─── HOME ──────────────────────────────────────────────────────────────
const HomeView = ({ navigate, statuses, me }) => {
  const totalElements = ELEMENTS.length;
  const majorElements = ELEMENTS.filter(e => e.changeLevel === "MAJOR" || e.changeLevel === "REMOVED").length;
  const totalTasks = TASKS.length;
  const doneTasks  = TASKS.filter(t => statuses[t.id] === "complete").length;

  return (
    <>
      <section className="hero">
        <div className="hero__eyebrow">LCME 2027–28 DCI Cycle · Mount Sinai</div>
        <h1 className="hero__title">The Curriculum Task Force, in one place.</h1>
        <p className="hero__body">
          Membership, assigned LCME elements, what the new DCI actually says, the changes
          since 2026–27, and every task that has to be done before the June 2027 deadline —
          searchable and trackable from your phone.
        </p>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-value">3</span>
            <span className="hero__stat-label">Subcommittees</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">{totalElements}</span>
            <span className="hero__stat-label">LCME Elements</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">{totalTasks}</span>
            <span className="hero__stat-label">Tasks tracked</span>
          </div>
          <div className="hero__stat">
            <span className="hero__stat-value">{majorElements}</span>
            <span className="hero__stat-label">Major / removed changes</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="row row--between" style={{ marginBottom: 14 }}>
          <h2 className="h-section" style={{ margin: 0 }}>Pick your subcommittee</h2>
          {me ? <span className="chip chip--strong">Signed in as {me}</span> : null}
        </div>
        <div className="grid grid--3">
          {Object.values(SUBCOMMITTEES).map(sub => (
            <SubcommitteeCard key={sub.key} sub={sub} statuses={statuses}
              onOpen={() => navigate("/s/" + sub.key)} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="h-section">Quick links</h2>
        <div className="resource-strip">
          <a className="resource-tile" href={RESOURCES[0].url} target="_blank" rel="noreferrer">
            <span className="resource-tile__icon"><Icon name="compass" size={20} /></span>
            <div>
              <div className="resource-tile__title">{RESOURCES[0].label} <Icon name="external" size={11} /></div>
              <div className="resource-tile__desc">{RESOURCES[0].desc}</div>
            </div>
          </a>
          <button className="resource-tile" onClick={() => navigate("/resources")}>
            <span className="resource-tile__icon"><Icon name="tree" size={20} /></span>
            <div>
              <div className="resource-tile__title">{RESOURCES[1].label}</div>
              <div className="resource-tile__desc">{RESOURCES[1].desc}</div>
            </div>
          </button>
          <button className="resource-tile" onClick={() => navigate("/mepos")}>
            <span className="resource-tile__icon"><Icon name="target" size={20} /></span>
            <div>
              <div className="resource-tile__title">Medical Education Program Objectives</div>
              <div className="resource-tile__desc">All 23 MEPOs grouped by competency domain.</div>
            </div>
          </button>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="row" style={{ marginBottom: 8 }}>
            <span className="h-eyebrow">Browse</span>
          </div>
          <div className="row">
            <button className="pill" onClick={() => navigate("/elements")}>
              <Icon name="list" size={12} />&nbsp; All LCME elements ({totalElements})
            </button>
            <button className="pill" onClick={() => navigate("/tasks")}>
              <Icon name="list" size={12} />&nbsp; All tasks ({totalTasks})
            </button>
            <button className="pill" onClick={() => navigate("/me")}>
              <Icon name="users" size={12} />&nbsp; Who am I?
            </button>
            <a className="pill" href={RESOURCES[2].url} target="_blank" rel="noreferrer">
              <Icon name="doc" size={12} />&nbsp; DCI Comparison PDF
            </a>
          </div>
          {doneTasks > 0 ? (
            <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
              Progress so far: <strong style={{ color: "var(--teal)" }}>{doneTasks}</strong> of {totalTasks} tasks marked complete on this device.
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
};

// ─── Subcommittee detail ──────────────────────────────────────────────
const SubcommitteeView = ({ subKey, tab, setTab, navigate, statuses, setStatus }) => {
  const sub = SUBCOMMITTEES[subKey];
  if (!sub) return <div className="empty">Subcommittee not found.</div>;
  const els = elementsForSubcommittee(subKey);
  const tasks = tasksForSubcommittee(subKey);
  const counts = statusCounts(tasks.map(t => t.id), statuses);
  const memberCount = sub.coChairs.length + sub.members.length + 1;

  return (
    <>
      <div className={`subcomm-hero subcomm-hero--${sub.accent}`}>
        <div className="subcomm-hero__eyebrow">Subcommittee</div>
        <h1 className="subcomm-hero__title">{sub.name}</h1>
        <p className="subcomm-hero__blurb">{sub.blurb}</p>
        <div className="subcomm-hero__stats">
          <div className="subcomm-hero__stat"><strong>{els.length}</strong>LCME elements</div>
          <div className="subcomm-hero__stat"><strong>{tasks.length}</strong>Tasks</div>
          <div className="subcomm-hero__stat"><strong>{counts["complete"]}</strong>Completed</div>
          <div className="subcomm-hero__stat"><strong>{memberCount}</strong>Members</div>
        </div>
      </div>

      <Tabs value={tab} onChange={setTab} tabs={[
        { id: "elements", label: "Elements", count: els.length },
        { id: "tasks",    label: "All tasks", count: tasks.length },
        { id: "members",  label: "Members",  count: memberCount },
      ]} />

      {tab === "elements" && (
        <ElementList elements={els} tasks={tasks} statuses={statuses} navigate={navigate} />
      )}
      {tab === "tasks" && (
        <TaskBoard tasks={tasks} statuses={statuses} setStatus={setStatus} navigate={navigate} />
      )}
      {tab === "members" && (
        <MembersPanel sub={sub} />
      )}
    </>
  );
};

// ─── Element list (used inside subcommittee + browse) ─────────────────
const ElementList = ({ elements, tasks, statuses, navigate }) => {
  const byElement = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      (map[t.element] = map[t.element] || []).push(t);
    }
    return map;
  }, [tasks]);

  return (
    <div className="element-list">
      {elements.map(el => {
        const eTasks = byElement[el.id] || [];
        const done = eTasks.filter(t => statuses[t.id] === "complete").length;
        const pct = eTasks.length === 0 ? 0 : Math.round(100 * done / eTasks.length);
        return (
          <button key={el.id} className="element-row"
            onClick={() => navigate("/e/" + el.id)}>
            <div className="element-row__id">{el.id}</div>
            <div className="element-row__body">
              <div className="element-row__title">{el.title}</div>
              {el.previousTitle ? (
                <div className="element-row__prev">
                  Previously: {el.previousTitle}
                </div>
              ) : null}
              <div className="element-row__chips">
                <ChangeChip level={el.changeLevel} />
                {el.changeFlag ? (
                  <span className="chip chip--outline">
                    <Icon name="flag" size={11} />{el.changeFlag}
                  </span>
                ) : null}
                <span className="chip">{eTasks.length} {eTasks.length === 1 ? "task" : "tasks"}</span>
              </div>
            </div>
            <div className="element-row__progress">
              <div className="element-row__progress-bar">
                <div
                  className={"element-row__progress-fill" + (pct === 100 ? " element-row__progress-fill--done" : "")}
                  style={{ width: pct + "%" }} />
              </div>
              <span>{done} of {eTasks.length}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// ─── Task board with filters/search ───────────────────────────────────
const CATEGORY_OPTIONS = ["DCI Table", "Appendix", "Process", "DCI Narrative Review"];
const STATUS_OPTIONS   = [
  { id: "all", label: "All" },
  { id: "not-started", label: "Not started" },
  { id: "in-progress", label: "In progress" },
  { id: "complete", label: "Complete" },
  { id: "blocked", label: "Blocked" },
];
const STATUS_ORDER = ["not-started", "in-progress", "blocked", "complete"];

const categoryClass = (cat) => "task__category--" + cat.toLowerCase().replace(/\s+/g, "-");

const TaskBoard = ({ tasks, statuses, setStatus, navigate, showElementLink = true }) => {
  const [query, setQuery] = useState("");
  const [cat, setCat]     = useState("all");
  const [status, setStat] = useState("all");
  const [groupBy, setGroupBy] = useState("element"); // element | none

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter(t => {
      if (cat !== "all" && t.category !== cat) return false;
      const s = statuses[t.id] || "not-started";
      if (status !== "all" && s !== status) return false;
      if (q && !(t.description.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.element.includes(q))) return false;
      return true;
    });
  }, [tasks, query, cat, status, statuses]);

  const grouped = useMemo(() => {
    if (groupBy !== "element") return [{ key: "_all", title: null, tasks: filtered }];
    const map = new Map();
    for (const t of filtered) {
      if (!map.has(t.element)) map.set(t.element, []);
      map.get(t.element).push(t);
    }
    const out = [];
    // Order by ELEMENT order
    for (const el of ELEMENTS) {
      if (map.has(el.id)) out.push({ key: el.id, title: el.id + " · " + el.title, element: el, tasks: map.get(el.id) });
    }
    return out;
  }, [filtered, groupBy]);

  const catCounts = useMemo(() => {
    const c = { "DCI Table": 0, "Appendix": 0, "Process": 0, "DCI Narrative Review": 0 };
    for (const t of tasks) c[t.category] = (c[t.category] || 0) + 1;
    return c;
  }, [tasks]);

  const statusCountsAll = useMemo(() => statusCounts(tasks.map(t => t.id), statuses), [tasks, statuses]);

  return (
    <>
      <div className="tasks-toolbar">
        <label className="tasks-search">
          <Icon name="search" size={14} />
          <input
            placeholder="Search task description, ID, or element…"
            value={query}
            onChange={e => setQuery(e.target.value)} />
          {query ? (
            <button onClick={() => setQuery("")} aria-label="Clear search"
              style={{ color: "var(--muted)", display: "flex" }}>
              <Icon name="x" size={14} />
            </button>
          ) : null}
        </label>
      </div>

      <div className="row" style={{ marginBottom: 14, gap: 14 }}>
        <div className="filter-pills">
          <button className={"pill " + (cat === "all" ? "pill--active" : "")} onClick={() => setCat("all")}>
            All categories<span className="pill__count">{tasks.length}</span>
          </button>
          {CATEGORY_OPTIONS.map(c => (
            <button key={c} className={"pill " + (cat === c ? "pill--active" : "")} onClick={() => setCat(c)}>
              {c}<span className="pill__count">{catCounts[c] || 0}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="row" style={{ marginBottom: 14, gap: 6 }}>
        <span className="h-eyebrow" style={{ marginRight: 4 }}>Status</span>
        <div className="filter-pills">
          {STATUS_OPTIONS.map(s => (
            <button key={s.id}
              className={"pill " + (status === s.id ? "pill--active" : "")}
              onClick={() => setStat(s.id)}>
              {s.label}{s.id === "all"
                ? <span className="pill__count">{tasks.length}</span>
                : <span className="pill__count">{statusCountsAll[s.id]}</span>}
            </button>
          ))}
        </div>
        <span className="spacer" />
        <button className={"pill " + (groupBy === "element" ? "pill--active" : "")}
          onClick={() => setGroupBy(groupBy === "element" ? "none" : "element")}>
          Group by element
        </button>
      </div>

      {grouped.length === 0 || filtered.length === 0 ? (
        <div className="empty">No tasks match your filters.</div>
      ) : (
        grouped.map(g => (
          <div key={g.key} style={{ marginBottom: 22 }}>
            {g.title ? (
              <div className="row row--between" style={{ marginBottom: 8 }}>
                <button className="h-eyebrow"
                  style={{ color: "var(--navy)", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  onClick={() => navigate("/e/" + g.element.id)}>
                  {g.title} <Icon name="chevron" size={10} />
                </button>
                {g.element ? <ChangeChip level={g.element.changeLevel} /> : null}
              </div>
            ) : null}
            <div className="task-list">
              {g.tasks.map(t => (
                <TaskCard key={t.id} task={t}
                  status={statuses[t.id] || "not-started"}
                  setStatus={s => setStatus(t.id, s)}
                  showElementLink={showElementLink && !g.title}
                  navigate={navigate} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const TaskCard = ({ task, status, setStatus, showElementLink, navigate }) => {
  const cycleStatus = () => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    setStatus(next);
  };
  return (
    <div className={"task task--" + status}>
      <button className="task__check"
        title={"Status: " + status + " (click to cycle)"}
        aria-label="Cycle task status"
        onClick={cycleStatus}>
        <Icon name="check" size={14} />
      </button>
      <div className="task__body">
        <div className="task__head">
          <span className="task__id">{task.id}</span>
          <span className={"task__category " + categoryClass(task.category)}>{task.category}</span>
          {showElementLink ? (
            <button onClick={() => navigate("/e/" + task.element)}
              style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>
              · Element {task.element}
            </button>
          ) : null}
        </div>
        <p className="task__desc">{task.description}</p>
        <div className="task__meta">
          {task.due ? <span>Due <strong>{formatDate(task.due)}</strong></span> : null}
        </div>
      </div>
      <div className="task__status">
        {["not-started", "in-progress", "complete", "blocked"].map(s => (
          <button key={s}
            className={"task__status-btn " + (status === s ? "task__status-btn--active is-" + (s.replace("not-started", "none").replace("in-progress", "progress")) : "")}
            onClick={() => setStatus(s)}>
            {s === "not-started" ? "Open" : s === "in-progress" ? "In progress" : s === "complete" ? "Done" : "Blocked"}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Members panel ────────────────────────────────────────────────────
const MembersPanel = ({ sub }) => {
  const Avatar = ({ name }) => (
    <div className="member-card__avatar">{initialsFor(name)}</div>
  );
  const renderMember = (m, role) => (
    <a key={m.email} className="member-card" href={"mailto:" + m.email}>
      <Avatar name={m.name} />
      <div className="member-card__body">
        <div className="member-card__name">{m.name}</div>
        <div className="member-card__email">{m.email}</div>
        {m.note ? <div className="member-card__note">{m.note}</div> : null}
      </div>
      {role ? <span className={"member-card__role" + (role === "PM" ? " member-card__role--pm" : "")}>{role}</span> : null}
    </a>
  );

  return (
    <>
      <div className="member-group">
        <h3 className="member-group__title">Co-chairs</h3>
        <div className="member-grid">
          {sub.coChairs.map(m => renderMember(m, "Co-chair"))}
        </div>
      </div>
      <div className="member-group">
        <h3 className="member-group__title">Project Manager</h3>
        <div className="member-grid">
          {renderMember(sub.projectManager, "PM")}
        </div>
      </div>
      <div className="member-group">
        <h3 className="member-group__title">Members ({sub.members.length})</h3>
        <div className="member-grid">
          {sub.members.map(m => renderMember(m))}
        </div>
      </div>
    </>
  );
};

// ─── Element detail ────────────────────────────────────────────────────
const ElementView = ({ elementId, navigate, statuses, setStatus }) => {
  const el = ELEMENTS.find(e => e.id === elementId);
  if (!el) return <div className="empty">Element {elementId} not found.</div>;
  const sub = SUBCOMMITTEES[el.subcommittee];
  const tasks = tasksForElement(el.id);
  const counts = statusCounts(tasks.map(t => t.id), statuses);
  const isRemoved = el.changeLevel === "REMOVED";

  return (
    <>
      <div className={"element-hero element-hero--" + el.changeLevel}>
        <div className="row" style={{ marginBottom: 6, gap: 8 }}>
          <span className="element-hero__id">Element {el.id}</span>
          <span className="spacer" />
          <button className="chip" onClick={() => navigate("/s/" + el.subcommittee)}>
            <span className="dot" style={{ background: "var(--magenta)" }} />
            {sub.short}
          </button>
        </div>
        <h1 className="element-hero__title">{el.title}</h1>
        {el.previousTitle ? (
          <div className="element-hero__prev">Previously: “{el.previousTitle}”</div>
        ) : null}
        <div className="element-hero__chips">
          <ChangeChip level={el.changeLevel} />
          {el.changeFlag ? (
            <span className="chip chip--magenta">
              <Icon name="flag" size={11} />&nbsp;{el.changeFlag}
            </span>
          ) : null}
          <span className="chip">{tasks.length} tasks</span>
          {counts["complete"] > 0 ? (
            <span className="chip chip--teal">{counts["complete"]} complete</span>
          ) : null}
        </div>
        <p className="element-hero__summary">{el.changeSummary}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-card detail-card--changed">
          <h3 className="detail-card__title">
            <span className="detail-card__icon"><Icon name="sparkle" size={14} /></span>
            What changed in 2027–28
          </h3>
          <ul className="bullet-list">
            {el.whatChanged.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
        <div className="detail-card detail-card--address">
          <h3 className="detail-card__title">
            <span className="detail-card__icon"><Icon name="target" size={14} /></span>
            What our DCI response needs to address
          </h3>
          <ul className="bullet-list">
            {el.whatToAddress.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>

      <section className="section">
        <div className="row row--between" style={{ marginBottom: 10 }}>
          <h2 className="h-section" style={{ margin: 0 }}>Tasks for {el.id}</h2>
          <a className="pill" href={RESOURCES[2].url} target="_blank" rel="noreferrer">
            <Icon name="doc" size={12} /> Full DCI comparison
          </a>
        </div>
        {tasks.length === 0 ? (
          <div className="empty">No tasks tracked for this element.</div>
        ) : (
          <TaskBoard tasks={tasks} statuses={statuses} setStatus={setStatus}
            navigate={navigate} showElementLink={false} />
        )}
      </section>

      <section className="section">
        <h2 className="h-section">Related</h2>
        <div className="resource-strip">
          <a className="resource-tile" href={RESOURCES[0].url} target="_blank" rel="noreferrer">
            <span className="resource-tile__icon"><Icon name="compass" size={20} /></span>
            <div>
              <div className="resource-tile__title">ASCEND Navigator <Icon name="external" size={11} /></div>
              <div className="resource-tile__desc">Look up where {el.id}-relevant content lives in the curriculum.</div>
            </div>
          </a>
          <button className="resource-tile" onClick={() => navigate("/mepos")}>
            <span className="resource-tile__icon"><Icon name="target" size={20} /></span>
            <div>
              <div className="resource-tile__title">MEPOs Reference</div>
              <div className="resource-tile__desc">All 23 program objectives by competency domain.</div>
            </div>
          </button>
          <button className="resource-tile" onClick={() => navigate("/s/" + el.subcommittee)}>
            <span className="resource-tile__icon"><Icon name="users" size={20} /></span>
            <div>
              <div className="resource-tile__title">{sub.name}</div>
              <div className="resource-tile__desc">Members and other elements assigned to this subcommittee.</div>
            </div>
          </button>
        </div>
      </section>
    </>
  );
};

// ─── MEPOs ─────────────────────────────────────────────────────────────
const MEPOView = () => {
  let counter = 0;
  return (
    <>
      <h1 className="h-display">Medical Education Program Objectives</h1>
      <p className="lead">
        All 23 Sinai MEPOs grouped by their competency domain. Referenced throughout the
        Standard 6/7/8/9 evidence requirements — particularly Element 6.1 (linkage), 8.4
        (program-outcome evaluation), and the new 7.x competency tables.
      </p>
      <div className="mepo-numbered">
        {MEPOS.map(g => (
          <div key={g.domain} className="mepo-group">
            <h3 className="mepo-group__title">{g.domain}</h3>
            <ol className="mepo-list" start={counter + 1}
              ref={(node) => { /* no-op; numbering via counter-reset on ancestor */ }}>
              {g.items.map((item, i) => {
                counter++;
                return <li key={i}>{item}</li>;
              })}
            </ol>
          </div>
        ))}
      </div>
    </>
  );
};

// ─── Resources ─────────────────────────────────────────────────────────
const ResourcesView = ({ navigate }) => (
  <>
    <h1 className="h-display">Resources & references</h1>
    <p className="lead">Key documents, dashboards, and reference material for the task force.</p>

    <div className="grid grid--2">
      <a className="card" href={RESOURCES[0].url} target="_blank" rel="noreferrer"
        style={{ textDecoration: "none" }}>
        <div className="row" style={{ gap: 12, marginBottom: 8 }}>
          <span className="resource-tile__icon" style={{ width: 44, height: 44 }}>
            <Icon name="compass" size={24} />
          </span>
          <h3 className="h-card" style={{ flex: 1 }}>ASCEND Curriculum Navigator <Icon name="external" size={14} /></h3>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: 14, margin: 0 }}>
          Student-facing dashboard with phase, module, and EPO views. Use this to locate
          where DCI-required content lives within the curriculum map.
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="chip">sinaiascend.github.io</span>
        </div>
      </a>

      <a className="card" href={RESOURCES[2].url} target="_blank" rel="noreferrer"
        style={{ textDecoration: "none" }}>
        <div className="row" style={{ gap: 12, marginBottom: 8 }}>
          <span className="resource-tile__icon" style={{ width: 44, height: 44 }}>
            <Icon name="doc" size={24} />
          </span>
          <h3 className="h-card" style={{ flex: 1 }}>DCI Standards 6/7/8/9 Comparison</h3>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: 14, margin: 0 }}>
          Element-by-element brief of what changed in the 2027-28 DCI vs. 2026-27. Source
          for every "what changed" section across this site.
        </p>
        <div className="row" style={{ marginTop: 10 }}>
          <span className="chip">PDF · Prepared for the Curricular Affairs Team</span>
        </div>
      </a>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="row" style={{ gap: 12, marginBottom: 12 }}>
          <span className="resource-tile__icon" style={{ width: 44, height: 44 }}>
            <Icon name="tree" size={24} />
          </span>
          <h3 className="h-card" style={{ flex: 1 }}>ASCEND MD Curriculum Governance Org Chart</h3>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 0 }}>
          Reporting structure for the Dean for Medical Education, standing committees, and
          the four EEC subcommittees referenced throughout the DCI narrative.
        </p>
        <img src="assets/governance-org-chart.png" alt="ASCEND MD Curriculum Governance Org Chart"
          style={{ width: "100%", borderRadius: "var(--r)", border: "1px solid var(--line)" }} />
      </div>

      <button className="card" onClick={() => navigate("/mepos")} style={{ textAlign: "left" }}>
        <div className="row" style={{ gap: 12, marginBottom: 8 }}>
          <span className="resource-tile__icon" style={{ width: 44, height: 44 }}>
            <Icon name="target" size={24} />
          </span>
          <h3 className="h-card" style={{ flex: 1 }}>Medical Education Program Objectives</h3>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: 14, margin: 0 }}>
          All 23 MEPOs grouped by competency domain. Central to Element 6.1 linkage work
          and 8.4 outcome evaluation.
        </p>
      </button>

      <button className="card" onClick={() => navigate("/elements")} style={{ textAlign: "left" }}>
        <div className="row" style={{ gap: 12, marginBottom: 8 }}>
          <span className="resource-tile__icon" style={{ width: 44, height: 44 }}>
            <Icon name="list" size={24} />
          </span>
          <h3 className="h-card" style={{ flex: 1 }}>All LCME Elements</h3>
        </div>
        <p style={{ color: "var(--ink-2)", fontSize: 14, margin: 0 }}>
          Cross-subcommittee directory of every element assigned to the task force, with
          change-level chips and task counts.
        </p>
      </button>
    </div>
  </>
);

// ─── All elements (cross-subcommittee browse) ─────────────────────────
const AllElementsView = ({ navigate, statuses }) => {
  const [filterSub, setFilterSub] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const filtered = useMemo(() => {
    return ELEMENTS.filter(e => {
      if (filterSub !== "all" && e.subcommittee !== filterSub) return false;
      if (filterLevel !== "all" && e.changeLevel !== filterLevel) return false;
      return true;
    });
  }, [filterSub, filterLevel]);

  return (
    <>
      <h1 className="h-display">All LCME elements</h1>
      <p className="lead">
        {ELEMENTS.length} elements assigned across all three subcommittees. Tap any element
        for the new DCI requirements, changes from 2026-27, and the linked task list.
      </p>

      <div className="row" style={{ marginBottom: 8, gap: 8 }}>
        <span className="h-eyebrow">Subcommittee</span>
        <div className="filter-pills">
          <button className={"pill " + (filterSub === "all" ? "pill--active" : "")} onClick={() => setFilterSub("all")}>All</button>
          {Object.values(SUBCOMMITTEES).map(s => (
            <button key={s.key} className={"pill " + (filterSub === s.key ? "pill--active" : "")}
              onClick={() => setFilterSub(s.key)}>{s.short}</button>
          ))}
        </div>
      </div>
      <div className="row" style={{ marginBottom: 16, gap: 8 }}>
        <span className="h-eyebrow">Change level</span>
        <div className="filter-pills">
          {["all", "MAJOR", "MINOR", "NONE", "REMOVED"].map(lvl => (
            <button key={lvl} className={"pill " + (filterLevel === lvl ? "pill--active" : "")}
              onClick={() => setFilterLevel(lvl)}>
              {lvl === "all" ? "All" : lvl === "NONE" ? "No change" : (lvl[0] + lvl.slice(1).toLowerCase())}
            </button>
          ))}
        </div>
      </div>

      <ElementList elements={filtered} tasks={TASKS} statuses={statuses} navigate={navigate} />
    </>
  );
};

// ─── All tasks (cross-subcommittee) ───────────────────────────────────
const AllTasksView = ({ navigate, statuses, setStatus }) => {
  const [sub, setSub] = useState("all");
  const filtered = useMemo(() => {
    if (sub === "all") return TASKS;
    return TASKS.filter(t => t.subcommittee === sub);
  }, [sub]);

  return (
    <>
      <h1 className="h-display">All tasks</h1>
      <p className="lead">{TASKS.length} tracked tasks across all three subcommittees. Status is saved on this device.</p>

      <div className="row" style={{ marginBottom: 16, gap: 8 }}>
        <span className="h-eyebrow">Subcommittee</span>
        <div className="filter-pills">
          <button className={"pill " + (sub === "all" ? "pill--active" : "")} onClick={() => setSub("all")}>All</button>
          {Object.values(SUBCOMMITTEES).map(s => (
            <button key={s.key} className={"pill " + (sub === s.key ? "pill--active" : "")}
              onClick={() => setSub(s.key)}>{s.short}</button>
          ))}
        </div>
      </div>

      <TaskBoard tasks={filtered} statuses={statuses} setStatus={setStatus} navigate={navigate} showElementLink={true} />
    </>
  );
};

// ─── Me (roster picker) ───────────────────────────────────────────────
const MeView = ({ navigate, me, setMe, statuses, setStatus }) => {
  // Find everyone across subcommittees with their roles
  const everyone = useMemo(() => {
    const map = new Map();
    for (const sub of Object.values(SUBCOMMITTEES)) {
      const add = (m, role) => {
        const key = m.email.toLowerCase();
        const entry = map.get(key) || { name: m.name, email: m.email, subs: [] };
        entry.subs.push({ key: sub.key, name: sub.short, role });
        map.set(key, entry);
      };
      sub.coChairs.forEach(m => add(m, "Co-chair"));
      add(sub.projectManager, "PM");
      sub.members.forEach(m => add(m, "Member"));
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const myEntry = me ? everyone.find(p => p.name === me) : null;

  if (myEntry) {
    // Show "my tasks" view
    const myTasks = TASKS.filter(t => myEntry.subs.some(s => s.key === t.subcommittee));
    return (
      <>
        <div className="row" style={{ marginBottom: 14 }}>
          <div className="member-card__avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{initialsFor(me)}</div>
          <div>
            <div className="h-eyebrow">Signed in as</div>
            <h1 className="h-display" style={{ margin: 0 }}>{me}</h1>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
              {myEntry.subs.map(s => (
                <button key={s.key} className="chip" onClick={() => navigate("/s/" + s.key)}>
                  <span className="dot" />{s.role} · {s.name}
                </button>
              ))}
            </div>
          </div>
          <span className="spacer" />
          <button className="pill" onClick={() => setMe("")}>Sign out</button>
        </div>

        <h2 className="h-section">Your subcommittees' tasks</h2>
        <TaskBoard tasks={myTasks} statuses={statuses} setStatus={setStatus} navigate={navigate} showElementLink={true} />
      </>
    );
  }

  return (
    <>
      <h1 className="h-display">Who are you?</h1>
      <p className="lead">
        Pick your name to personalize the site — we'll show your subcommittee tasks first.
        Nothing leaves this device.
      </p>
      <div className="roster-grid">
        {everyone.map(p => (
          <button key={p.email} className="roster-pick" onClick={() => { setMe(p.name); navigate("/me"); }}>
            <div className="roster-pick__avatar">{initialsFor(p.name)}</div>
            <div>
              <div className="roster-pick__name">{p.name}</div>
              <div className="roster-pick__sub">{p.subs.map(s => s.name).join(" · ")}</div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

Object.assign(window, {
  HomeView, SubcommitteeView, ElementView, AllElementsView, AllTasksView,
  MEPOView, ResourcesView, MeView,
  ElementList, TaskBoard, MembersPanel,
  tasksForElement, tasksForSubcommittee, elementsForSubcommittee,
});
