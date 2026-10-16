/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client";

import * as React from "react";
import {
  IconAlignLeft,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarMonth,
  IconCalendarPlus,
  IconCalendarWeek,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCornerDownLeft,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSelector,
  IconSettings,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CalendarId,
  Settings,
  View,
  CalEvent,
  Draft,
  Placed,
} from "@/lib/calender-types";

/* -------------------------------------------------------------------------- */
/*  Types & constants                                                         */
/* -------------------------------------------------------------------------- */

const HOUR_H = 64; // px per hour
const GUTTER = 88; // px, time label column
const SNAP = 15; // minutes
const MIN = 60_000;
const STORAGE_KEY = "planner.calendar.v1";

const DEFAULT_SETTINGS: Settings = {
  weekStartsOn: 0,
  hour24: false,
  showWeekends: true,
  hatchOffHours: true,
  workStart: 9,
  workEnd: 18,
};

const CALENDARS: Record<
  CalendarId,
  { name: string; dot: string; chip: string; solid: string }
> = {
  personal: {
    name: "Personal",
    dot: "bg-violet-500",
    chip: "border-violet-500 bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100",
    solid: "bg-violet-500 text-white",
  },
  work: {
    name: "Work",
    dot: "bg-blue-500",
    chip: "border-blue-500 bg-blue-100 text-blue-950 dark:bg-blue-950 dark:text-blue-100",
    solid: "bg-blue-500 text-white",
  },
  team: {
    name: "Team",
    dot: "bg-emerald-500",
    chip: "border-emerald-500 bg-emerald-100 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100",
    solid: "bg-emerald-500 text-white",
  },
};
const CALENDAR_IDS = Object.keys(CALENDARS) as CalendarId[];

const HATCH: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in oklab, var(--foreground) 7%, transparent) 6px 7px)",
};

/* -------------------------------------------------------------------------- */
/*  Date helpers (dependency free)                                            */
/* -------------------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

const startOfDay = (d: Date | number) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const isSameDay = (a: Date | number, b: Date | number) =>
  startOfDay(a).getTime() === startOfDay(b).getTime();
const startOfWeek = (d: Date, weekStartsOn: number) => {
  const x = startOfDay(d);
  return addDays(x, -((x.getDay() - weekStartsOn + 7) % 7));
};
const minutesOfDay = (ms: number) => {
  const d = new Date(ms);
  return d.getHours() * 60 + d.getMinutes();
};
/** Epoch ms for `min` minutes after local midnight of `day` (1440 = next midnight). */
const atMinutes = (day: Date, min: number) => {
  const x = startOfDay(day);
  x.setMinutes(min);
  return x.getTime();
};
const toDateInput = (d: Date | number) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
const fromDateInput = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const toTimeInput = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};
const parseTime = (s: string) => {
  const [h, m] = s.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
};
const fmtTime = (ms: number, h24: boolean) => {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h24) return `${pad(h)}:${pad(m)}`;
  const suffix = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}${m ? `:${pad(m)}` : ""} ${suffix}`;
};
const hourLabel = (h: number, h24: boolean) =>
  h24 ? `${pad(h)}:00` : `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`;
const gmtLabel = () => {
  const off = -new Date().getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const a = Math.abs(off);
  return `GMT${sign}${Math.floor(a / 60)}${a % 60 ? `:${pad(a % 60)}` : ""}`;
};
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const endMinutes = (ev: CalEvent) =>
  clamp(Math.round((ev.end - startOfDay(ev.start).getTime()) / MIN), 0, 1440);

/* -------------------------------------------------------------------------- */
/*  Layout, seed data, quick-add parsing                                      */
/* -------------------------------------------------------------------------- */

/** Side-by-side column layout for overlapping timed events in one day. */
function layoutDay(events: CalEvent[], day: Date): Placed[] {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = addDays(startOfDay(day), 1).getTime();
  const items: Placed[] = events
    .filter((e) => !e.allDay && e.start < dayEnd && e.end > dayStart)
    .map((ev) => ({
      ev,
      col: 0,
      cols: 1,
      startMin: Math.max(0, (ev.start - dayStart) / MIN),
      endMin: Math.min(1440, (ev.end - dayStart) / MIN),
    }))
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

  const out: Placed[] = [];
  let cluster: Placed[] = [];
  let colEnds: number[] = [];
  let clusterEnd = -1;
  const flush = () => {
    const cols = Math.max(1, colEnds.length);
    cluster.forEach((p) => (p.cols = cols));
    out.push(...cluster);
    cluster = [];
    colEnds = [];
    clusterEnd = -1;
  };
  for (const it of items) {
    if (cluster.length && it.startMin >= clusterEnd) flush();
    let c = colEnds.findIndex((end) => end <= it.startMin);
    if (c === -1) {
      c = colEnds.length;
      colEnds.push(it.endMin);
    } else {
      colEnds[c] = it.endMin;
    }
    it.col = c;
    cluster.push(it);
    clusterEnd = Math.max(clusterEnd, it.endMin);
  }
  flush();
  return out;
}

function seedEvents(base: Date): CalEvent[] {
  const wk = startOfWeek(base, 0);
  const out: CalEvent[] = [];
  const timed = (
    day: number,
    h: number,
    m: number,
    dur: number,
    title: string,
    calendarId: CalendarId,
    description?: string,
  ) => {
    const d = addDays(wk, day);
    out.push({
      id: uid(),
      title,
      start: atMinutes(d, h * 60 + m),
      end: atMinutes(d, h * 60 + m + dur),
      allDay: false,
      calendarId,
      description,
    });
  };
  const allDay = (day: number, title: string, calendarId: CalendarId) => {
    const d = addDays(wk, day);
    out.push({
      id: uid(),
      title,
      start: d.getTime(),
      end: addDays(d, 1).getTime(),
      allDay: true,
      calendarId,
    });
  };

  allDay(2, "Sprint 42 kickoff", "work");
  allDay(2, "Design freeze", "work");
  allDay(2, "Offsite prep", "team");
  allDay(3, "Quarterly planning", "work");
  allDay(3, "Client onsite", "work");
  allDay(3, "Docs cleanup", "team");
  allDay(4, "Release v2.4", "work");
  allDay(4, "Bug bash", "team");
  allDay(4, "Mum's birthday", "personal");
  allDay(5, "Demo day", "team");
  allDay(5, "Sprint retro", "team");
  allDay(5, "Invoice due", "personal");
  allDay(6, "Weekend hike", "personal");
  allDay(6, "Groceries", "personal");
  allDay(6, "Laundry", "personal");

  timed(1, 9, 30, 30, "Daily standup", "team");
  timed(1, 13, 0, 60, "Lunch with Maya", "personal");
  timed(2, 9, 30, 30, "Daily standup", "team");
  timed(2, 11, 0, 90, "Sprint planning", "work", "Scope the next two weeks.");
  timed(3, 9, 30, 30, "Daily standup", "team");
  timed(3, 14, 0, 60, "Roadmap review", "work");
  timed(4, 9, 30, 30, "Daily standup", "team");
  timed(
    4,
    10,
    0,
    90,
    "Design review",
    "work",
    "Walk through the new planner UI.",
  );
  timed(4, 11, 0, 60, "1:1 with Sam", "team");
  timed(4, 14, 30, 45, "Customer call", "work");
  timed(4, 18, 30, 60, "Gym", "personal");
  timed(5, 9, 30, 30, "Daily standup", "team");
  timed(5, 15, 0, 60, "Demo day", "team");
  return out;
}

const WEEKDAY_WORDS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

/** Tiny natural-language parser: "Lunch tomorrow 1pm for 45m" etc. */
function parseQuickAdd(text: string, base: Date) {
  let rest = ` ${text} `;
  let day = startOfDay(base);

  const dayRe =
    /\b(today|tomorrow|sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues|tue|wed|thurs|thu|fri|sat)\b/i;
  const dm = rest.match(dayRe);
  if (dm) {
    const w = dm[1].toLowerCase();
    if (w === "tomorrow") day = addDays(day, 1);
    else if (w !== "today") {
      const target = WEEKDAY_WORDS.findIndex((n) =>
        n.startsWith(w.slice(0, 3)),
      );
      day = addDays(day, (target - day.getDay() + 7) % 7);
    }
    rest = rest.replace(dm[0], " ");
  }

  let durMin = 60;
  const durRe = /\bfor\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\b/i;
  const du = rest.match(durRe);
  if (du) {
    const n = parseFloat(du[1]);
    durMin = Math.max(
      SNAP,
      Math.round(du[2].toLowerCase().startsWith("h") ? n * 60 : n),
    );
    rest = rest.replace(du[0], " ");
  }

  let startMin = 0;
  let allDay = true;
  const ampm = rest.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  const h24 = rest.match(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (ampm) {
    let h = parseInt(ampm[1], 10) % 12;
    if (ampm[3].toLowerCase() === "pm") h += 12;
    startMin = h * 60 + (ampm[2] ? parseInt(ampm[2], 10) : 0);
    allDay = false;
    rest = rest.replace(ampm[0], " ");
  } else if (h24) {
    startMin = parseInt(h24[1], 10) * 60 + parseInt(h24[2], 10);
    allDay = false;
    rest = rest.replace(h24[0], " ");
  }

  const cleaned = rest.replace(/\s+/g, " ").trim();
  const title = cleaned
    ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    : "Untitled event";
  return { title, day, startMin, durMin, allDay };
}

function validate(d: Draft): string | null {
  if (!d.date) return "Pick a date.";
  if (d.allDay) return null;
  const sm = parseTime(d.startTime);
  const em = parseTime(d.endTime);
  if (Number.isNaN(sm) || Number.isNaN(em))
    return "Enter a valid start and end time.";
  if (em !== 0 && em <= sm) return "End time must be after the start time.";
  if (em === 0 && sm === 0) return "End time must be after the start time.";
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function PlannerCalendar({ className }: { className?: string }) {
  const [ready, setReady] = React.useState(false);
  const [now, setNow] = React.useState<any>();
  const [anchor, setAnchor] = React.useState(() => startOfDay(new Date()));
  const [view, setView] = React.useState<View>("week");
  const [events, setEvents] = React.useState<CalEvent[]>([]);
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [visible, setVisible] = React.useState<Record<CalendarId, boolean>>({
    personal: true,
    work: true,
    team: true,
  });
  const [allDayOpen, setAllDayOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [drag, setDrag] = React.useState<{
    id: string;
    start: number;
    end: number;
  } | null>(null);
  const [selection, setSelection] = React.useState<{
    dayIdx: number;
    a: number;
    b: number;
  } | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const colsRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  /* ----- persistence ----- */
  const load = React.useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const p = JSON.parse(raw);
      if (Array.isArray(p.events)) setEvents(p.events);
      if (p.settings) setSettings({ ...DEFAULT_SETTINGS, ...p.settings });
      if (p.visible) setVisible((v) => ({ ...v, ...p.visible }));
      if (p.view === "day" || p.view === "week" || p.view === "month")
        setView(p.view);
      return Array.isArray(p.events);
    } catch {
      return false;
    }
  }, []);

  React.useEffect(() => {
    if (!load()) setEvents(seedEvents(new Date()));
    setReady(true);
  }, [load]);

  React.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events, settings, visible, view }),
      );
    } catch {
      /* storage unavailable: calendar still works in memory */
    }
  }, [ready, events, settings, visible, view]);

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  /* ----- derived ----- */
  const today = startOfDay(now);
  const gmt = React.useMemo(() => gmtLabel(), []);

  const days = React.useMemo(() => {
    if (view === "day") return [anchor];
    const s = startOfWeek(anchor, settings.weekStartsOn);
    const all = Array.from({ length: 7 }, (_, i) => addDays(s, i));
    return settings.showWeekends
      ? all
      : all.filter((d) => d.getDay() !== 0 && d.getDay() !== 6);
  }, [anchor, view, settings.weekStartsOn, settings.showWeekends]);

  const month = React.useMemo(() => {
    if (view !== "month")
      return { cells: [] as Date[], weeks: 0, cols: 7, head: [] as Date[] };
    const ws = settings.weekStartsOn;
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const dim = new Date(
      anchor.getFullYear(),
      anchor.getMonth() + 1,
      0,
    ).getDate();
    const offset = (first.getDay() - ws + 7) % 7;
    const weeks = Math.ceil((offset + dim) / 7);
    const gridStart = startOfWeek(first, ws);
    const keep = (d: Date) =>
      settings.showWeekends || (d.getDay() !== 0 && d.getDay() !== 6);
    const all = Array.from({ length: weeks * 7 }, (_, i) =>
      addDays(gridStart, i),
    );
    return {
      cells: all.filter(keep),
      weeks,
      cols: settings.showWeekends ? 7 : 5,
      head: all.slice(0, 7).filter(keep),
    };
  }, [view, anchor, settings.weekStartsOn, settings.showWeekends]);

  const title = React.useMemo(() => {
    const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
      d.toLocaleDateString("en-US", o);
    if (view === "day")
      return fmt(anchor, { month: "long", day: "numeric", year: "numeric" });
    if (view === "month")
      return fmt(anchor, { month: "long", year: "numeric" });
    const first = startOfWeek(anchor, settings.weekStartsOn);
    const last = addDays(first, 6);
    if (
      first.getMonth() === last.getMonth() &&
      first.getFullYear() === last.getFullYear()
    )
      return fmt(first, { month: "long", year: "numeric" });
    if (first.getFullYear() === last.getFullYear())
      return `${fmt(first, { month: "short" })} – ${fmt(last, { month: "short" })} ${last.getFullYear()}`;
    return `${fmt(first, { month: "short", year: "numeric" })} – ${fmt(last, { month: "short", year: "numeric" })}`;
  }, [anchor, view, settings.weekStartsOn]);

  const shown = React.useMemo(
    () =>
      events
        .filter((e) => visible[e.calendarId])
        .map((e) =>
          drag && drag.id === e.id
            ? { ...e, start: drag.start, end: drag.end }
            : e,
        ),
    [events, visible, drag],
  );
  const allDayFor = (day: Date) =>
    shown.filter((e) => e.allDay && isSameDay(e.start, day));
  const monthEventsFor = (day: Date) =>
    shown
      .filter((e) =>
        e.allDay
          ? isSameDay(e.start, day)
          : e.start < addDays(day, 1).getTime() && e.end > day.getTime(),
      )
      .sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start);

  const firstVisibleCalendar = (): CalendarId =>
    CALENDAR_IDS.find((c) => visible[c]) ?? "personal";

  /* ----- actions ----- */
  const goToday = () => setAnchor(startOfDay(new Date()));
  const shift = (dir: 1 | -1) =>
    setAnchor((a) =>
      view === "day"
        ? addDays(a, dir)
        : view === "week"
          ? addDays(a, 7 * dir)
          : new Date(a.getFullYear(), a.getMonth() + dir, 1),
    );

  const ensureVisible = (day: Date) => {
    const inView =
      view === "month"
        ? day.getMonth() === anchor.getMonth() &&
          day.getFullYear() === anchor.getFullYear()
        : days.some((d) => isSameDay(d, day));
    if (!inView) setAnchor(startOfDay(day));
  };

  const upsert = (e: CalEvent) =>
    setEvents((prev) =>
      prev.some((x) => x.id === e.id)
        ? prev.map((x) => (x.id === e.id ? e : x))
        : [...prev, e],
    );
  const removeEvent = (id: string) =>
    setEvents((prev) => prev.filter((x) => x.id !== id));

  const openCreate = (
    day: Date,
    startMin: number,
    endMin: number,
    allDay = false,
  ) =>
    setDraft({
      title: "",
      date: toDateInput(day),
      startTime: toTimeInput(startMin),
      endTime: toTimeInput(endMin),
      allDay,
      calendarId: firstVisibleCalendar(),
      description: "",
    });

  const openEdit = (ev: CalEvent) =>
    setDraft({
      id: ev.id,
      title: ev.title,
      date: toDateInput(ev.start),
      startTime: toTimeInput(minutesOfDay(ev.start)),
      endTime: toTimeInput(
        ev.allDay ? minutesOfDay(ev.start) + 60 : endMinutes(ev),
      ),
      allDay: ev.allDay,
      calendarId: ev.calendarId,
      description: ev.description ?? "",
    });

  const newEventNow = () => {
    const base =
      days.some((d) => isSameDay(d, today)) || view === "month"
        ? today
        : anchor;
    const h = clamp(new Date().getHours() + 1, 0, 23);
    openCreate(view === "day" ? anchor : base, h * 60, h * 60 + 60);
  };

  const saveDraft = (d: Draft) => {
    const day = fromDateInput(d.date);
    let start: number;
    let end: number;
    if (d.allDay) {
      start = day.getTime();
      end = addDays(day, 1).getTime();
    } else {
      const sm = parseTime(d.startTime);
      let em = parseTime(d.endTime);
      if (em === 0) em = 1440;
      start = atMinutes(day, sm);
      end = atMinutes(day, em);
    }
    upsert({
      id: d.id ?? uid(),
      title: d.title.trim() || "Untitled event",
      start,
      end,
      allDay: d.allDay,
      calendarId: d.calendarId,
      description: d.description.trim() || undefined,
    });
    ensureVisible(day);
    setDraft(null);
  };

  const refresh = () => {
    setSyncing(true);
    load();
    setNow(new Date());
    setTimeout(() => setSyncing(false), 700);
  };

  const quickAdd = (text: string) => {
    const t = text.trim();
    if (!t) {
      searchRef.current?.focus();
      return;
    }
    const p = parseQuickAdd(t, new Date());
    upsert({
      id: uid(),
      title: p.title,
      start: p.allDay ? p.day.getTime() : atMinutes(p.day, p.startMin),
      end: p.allDay
        ? addDays(p.day, 1).getTime()
        : atMinutes(p.day, Math.min(p.startMin + p.durMin, 1440)),
      allDay: p.allDay,
      calendarId: firstVisibleCalendar(),
    });
    ensureVisible(p.day);
    setQuery("");
    searchRef.current?.blur();
  };

  /* ----- pointer interactions: create by click / drag-select ----- */
  const minuteAt = (clientY: number) => {
    const r = colsRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return clamp(
      Math.floor(((clientY - r.top) / HOUR_H) * (60 / SNAP)) * SNAP,
      0,
      1440 - SNAP,
    );
  };

  const beginSelect = (e: React.PointerEvent<HTMLElement>, dayIdx: number) => {
    if (e.button !== 0) return;
    const startY = e.clientY;
    const a = minuteAt(startY);
    let b = a;
    let moved = false;
    setSelection({ dayIdx, a, b });

    const move = (m: PointerEvent) => {
      if (Math.abs(m.clientY - startY) > 4) moved = true;
      b = minuteAt(m.clientY);
      setSelection({ dayIdx, a, b });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      setSelection(null);
    };
    const up = () => {
      stop();
      const day = days[dayIdx];
      if (!day) return;
      if (!moved) {
        const s = Math.min(Math.floor(a / 60) * 60, 1380);
        openCreate(day, s, s + 60);
      } else {
        openCreate(day, Math.min(a, b), Math.min(Math.max(a, b) + SNAP, 1440));
      }
    };
    const cancel = () => stop();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };

  /* ----- pointer interactions: move / resize events ----- */
  const beginDrag = (
    e: React.PointerEvent<HTMLElement>,
    id: string,
    mode: "move" | "resize",
  ) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const ev = events.find((x) => x.id === id);
    const cols = colsRef.current;
    if (!ev || !cols) return;

    const colW = cols.getBoundingClientRect().width / days.length;
    const startX = e.clientX;
    const startY = e.clientY;
    const origIdx = Math.max(
      0,
      days.findIndex((d) => isSameDay(d, ev.start)),
    );
    const origStartMin = minutesOfDay(ev.start);
    const origEndMin = endMinutes(ev);
    const dur = Math.max(SNAP, origEndMin - origStartMin);
    let moved = false;

    const compute = (m: PointerEvent) => {
      const dMin =
        Math.round(((m.clientY - startY) / HOUR_H) * (60 / SNAP)) * SNAP;
      if (mode === "resize") {
        const endMin = clamp(origEndMin + dMin, origStartMin + SNAP, 1440);
        return {
          start: ev.start,
          end: atMinutes(startOfDay(ev.start), endMin),
        };
      }
      const idx = clamp(
        origIdx + Math.round((m.clientX - startX) / colW),
        0,
        days.length - 1,
      );
      const day = days[idx] ?? days[origIdx];
      const sMin = clamp(origStartMin + dMin, 0, 1440 - dur);
      return { start: atMinutes(day, sMin), end: atMinutes(day, sMin + dur) };
    };

    const move = (m: PointerEvent) => {
      if (!moved && Math.hypot(m.clientX - startX, m.clientY - startY) < 4)
        return;
      moved = true;
      setDrag({ id, ...compute(m) });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      setDrag(null);
    };
    const up = (m: PointerEvent) => {
      stop();
      if (!moved) {
        openEdit(ev);
        return;
      }
      upsert({ ...ev, ...compute(m) });
    };
    const cancel = () => stop();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
  };

  /* ----- keyboard shortcuts ----- */
  const shortcutRef = React.useRef({ goToday, shift, setView, newEventNow });
  shortcutRef.current = { goToday, shift, setView, newEventNow };
  const blocked = !!draft || settingsOpen;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) ||
          t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (typing || blocked || e.metaKey || e.ctrlKey || e.altKey) return;
      const a = shortcutRef.current;
      switch (e.key) {
        case "/":
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case "t":
          a.goToday();
          break;
        case "d":
          a.setView("day");
          break;
        case "w":
          a.setView("week");
          break;
        case "m":
          a.setView("month");
          break;
        case "n":
          e.preventDefault();
          a.newEventNow();
          break;
        case "ArrowLeft":
          a.shift(-1);
          break;
        case "ArrowRight":
          a.shift(1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blocked]);

  /* ----- scroll to a sensible hour on mount / view change ----- */
  React.useEffect(() => {
    if (!ready || view === "month") return;
    const el = scrollRef.current;
    if (!el) return;
    const todayShown = days.some((d) => isSameDay(d, new Date()));
    const hour = todayShown
      ? Math.max(0, new Date().getHours() - 2)
      : Math.max(0, settings.workStart - 1);
    el.scrollTop = hour * HOUR_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, view]);

  /* ----- command bar ----- */
  type Item = {
    id: string;
    section: string;
    label: string;
    hint?: string;
    icon: React.ReactNode;
    run: () => void;
  };
  const q = query.trim().toLowerCase();
  const items: Item[] = [];
  if (q) {
    events
      .filter((e) =>
        `${e.title} ${e.description ?? ""}`.toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          Math.abs(a.start - now.getTime()) - Math.abs(b.start - now.getTime()),
      )
      .slice(0, 6)
      .forEach((e) =>
        items.push({
          id: `ev-${e.id}`,
          section: "Events",
          label: e.title,
          hint: `${new Date(e.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}${e.allDay ? "" : ` · ${fmtTime(e.start, settings.hour24)}`}`,
          icon: (
            <span
              className={cn(
                "size-2.5 rounded-full",
                CALENDARS[e.calendarId].dot,
              )}
            />
          ),
          run: () => {
            setAnchor(startOfDay(e.start));
            openEdit(e);
          },
        }),
      );
  }
  const commands: Omit<Item, "section">[] = [
    {
      id: "c-today",
      label: "Go to today",
      hint: "T",
      icon: <IconCalendar className="size-4" />,
      run: goToday,
    },
    {
      id: "c-new",
      label: "New event",
      hint: "N",
      icon: <IconCalendarPlus className="size-4" />,
      run: newEventNow,
    },
    {
      id: "c-day",
      label: "Day view",
      hint: "D",
      icon: <IconCalendarEvent className="size-4" />,
      run: () => setView("day"),
    },
    {
      id: "c-week",
      label: "Week view",
      hint: "W",
      icon: <IconCalendarWeek className="size-4" />,
      run: () => setView("week"),
    },
    {
      id: "c-month",
      label: "Month view",
      hint: "M",
      icon: <IconCalendarMonth className="size-4" />,
      run: () => setView("month"),
    },
    {
      id: "c-settings",
      label: "Calendar settings",
      icon: <IconSettings className="size-4" />,
      run: () => setSettingsOpen(true),
    },
  ];
  commands
    .filter((c) => !q || c.label.toLowerCase().includes(q))
    .forEach((c) => items.push({ ...c, section: "Commands" }));
  if (q) {
    items.push({
      id: "quick",
      section: "Quick add",
      label: `Add “${query.trim()}”`,
      hint: "Enter",
      icon: <IconSparkles className="size-4 text-violet-500" />,
      run: () => quickAdd(query),
    });
  }
  const runItem = (it: Item | undefined) => {
    if (!it) return;
    it.run();
    if (it.id !== "quick") {
      setQuery("");
      searchRef.current?.blur();
    }
  };

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */

  if (!ready) {
    return (
      <div
        className={cn("h-full min-h-96 bg-background", className)}
        aria-busy="true"
      />
    );
  }

  const n = days.length;
  const gridCols = `${GUTTER}px repeat(${n}, minmax(0, 1fr))`;
  const isOffDay = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const VIEW_LABEL: Record<View, string> = {
    day: "Day",
    week: "Week",
    month: "Month",
  };

  const offBlocks = (day: Date) => {
    if (!settings.hatchOffHours) return [];
    if (isOffDay(day)) return [{ from: 0, to: 1440, fade: "none" as const }];
    const blocks: { from: number; to: number; fade: "top" | "bottom" }[] = [];
    if (settings.workStart > 0)
      blocks.push({ from: 0, to: settings.workStart * 60, fade: "bottom" });
    if (settings.workEnd < 24)
      blocks.push({ from: settings.workEnd * 60, to: 1440, fade: "top" });
    return blocks;
  };

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col bg-background text-foreground",
        className,
      )}
    >
      {/* ------------------------------ toolbar ------------------------------ */}
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => shift(-1)}
            aria-label="Previous"
          >
            <IconChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => shift(1)}
            aria-label="Next"
          >
            <IconChevronRight className="size-4" />
          </Button>
          <h1 className="ml-2 truncate text-lg font-medium tracking-tight">
            {title}
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="ml-3 hidden sm:inline-flex"
            onClick={goToday}
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-1.5" />
              }
            >
              {VIEW_LABEL[view]}
              <IconChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["day", "week", "month"] as View[]).map((v) => (
                <DropdownMenuItem key={v} onClick={() => setView(v)}>
                  {VIEW_LABEL[v]}
                  <span className="ml-auto pl-6 text-xs text-muted-foreground">
                    {v[0].toUpperCase()}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={newEventNow}
            aria-label="New event"
            title="New event (N)"
          >
            <IconCalendarPlus className="size-4.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 px-2"
                  aria-label="Calendars"
                />
              }
            >
              <IconCalendar className="size-4.5" />
              <span className="text-sm tabular-nums">
                {CALENDAR_IDS.filter((c) => visible[c]).length}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {CALENDAR_IDS.map((id) => (
                <DropdownMenuCheckboxItem
                  key={id}
                  checked={visible[id]}
                  onCheckedChange={(c) =>
                    setVisible((v) => ({ ...v, [id]: !!c }))
                  }
                >
                  <span
                    className={cn("size-2.5 rounded-full", CALENDARS[id].dot)}
                  />
                  {CALENDARS[id].name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={refresh}
            aria-label="Refresh"
          >
            <IconRefresh
              className={cn("size-4.5", syncing && "animate-spin")}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setSettingsOpen(true)}
            aria-label="Calendar settings"
          >
            <IconSettings className="size-4.5" />
          </Button>
        </div>
      </div>

      {/* ----------------------------- scroll area ---------------------------- */}
      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-auto">
        {view === "month" ? (
          <div className="flex min-h-full min-w-160 flex-col">
            <div
              className="sticky top-0 z-20 grid border-b bg-background"
              style={{
                gridTemplateColumns: `repeat(${month.cols}, minmax(0, 1fr))`,
              }}
            >
              {month.head.map((d) => (
                <div
                  key={d.getDay()}
                  className={cn(
                    "py-2.5 text-center text-sm",
                    isOffDay(d) && "text-muted-foreground",
                  )}
                >
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
              ))}
            </div>
            <div
              className="grid flex-1 pb-24"
              style={{
                gridTemplateColumns: `repeat(${month.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${month.weeks}, minmax(112px, 1fr))`,
              }}
            >
              {month.cells.map((day) => {
                const list = monthEventsFor(day);
                const isToday = isSameDay(day, today);
                const outside = day.getMonth() !== anchor.getMonth();
                return (
                  <div
                    key={day.getTime()}
                    onClick={() => openCreate(day, 540, 600)}
                    className={cn(
                      "min-w-0 cursor-pointer space-y-0.5 border-b border-l p-1 transition-colors hover:bg-muted/40",
                      isOffDay(day) && "bg-muted/25",
                    )}
                  >
                    <div className="flex justify-end">
                      <span
                        className={cn(
                          "grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs",
                          isToday
                            ? "bg-red-500 font-medium text-white"
                            : outside
                              ? "text-muted-foreground/60"
                              : "text-muted-foreground",
                        )}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                    {list.slice(0, 3).map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(ev);
                        }}
                        className={cn(
                          "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-xs",
                          ev.allDay
                            ? CALENDARS[ev.calendarId].solid
                            : "hover:bg-muted",
                          outside && "opacity-60",
                        )}
                      >
                        {!ev.allDay && (
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              CALENDARS[ev.calendarId].dot,
                            )}
                          />
                        )}
                        {!ev.allDay && (
                          <span className="shrink-0 text-muted-foreground">
                            {fmtTime(ev.start, settings.hour24)}
                          </span>
                        )}
                        <span className="truncate">{ev.title}</span>
                      </button>
                    ))}
                    {list.length > 3 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnchor(day);
                          setView("day");
                        }}
                        className="px-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        +{list.length - 3} more
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative" style={{ minWidth: n > 1 ? 720 : 0 }}>
            {/* sticky day header + all-day row */}
            <div className="sticky top-0 z-30 bg-background">
              <div
                className="grid border-b"
                style={{ gridTemplateColumns: gridCols }}
              >
                <div className="flex items-center gap-1.5 px-3">
                  <button
                    type="button"
                    onClick={newEventNow}
                    aria-label="Add event"
                    className="grid size-5 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <IconPlus className="size-4" />
                  </button>
                  <span className="truncate text-xs font-medium text-muted-foreground">
                    {gmt}
                  </span>
                </div>
                {days.map((d) => {
                  const isToday = isSameDay(d, today);
                  return (
                    <button
                      key={d.getTime()}
                      type="button"
                      disabled={view === "day"}
                      onClick={() => {
                        setAnchor(d);
                        setView("day");
                      }}
                      className={cn(
                        "flex h-12 items-center justify-center gap-1.5 text-[15px] transition-colors enabled:hover:bg-muted/50",
                        isOffDay(d) && !isToday && "text-muted-foreground",
                      )}
                    >
                      <span>
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                      {isToday ? (
                        <span className="grid h-7 min-w-7 place-items-center rounded-full bg-red-500 px-1 text-sm font-medium text-white">
                          {d.getDate()}
                        </span>
                      ) : (
                        <span>{d.getDate()}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div
                className="grid border-b"
                style={{ gridTemplateColumns: gridCols }}
              >
                <button
                  type="button"
                  onClick={() => setAllDayOpen((o) => !o)}
                  aria-expanded={allDayOpen}
                  className="flex h-8 items-center gap-2 px-3 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <IconSelector className="size-4" />
                  All day
                </button>
                {days.map((d) => {
                  const list = allDayFor(d);
                  return (
                    <div
                      key={d.getTime()}
                      onClick={() => openCreate(d, 540, 600, true)}
                      className="min-h-8 min-w-0 cursor-pointer space-y-0.5 border-l px-1 py-1 transition-colors hover:bg-muted/40"
                    >
                      {allDayOpen
                        ? list.map((ev) => (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(ev);
                              }}
                              className={cn(
                                "block w-full truncate rounded px-1.5 py-0.5 text-left text-xs",
                                CALENDARS[ev.calendarId].solid,
                              )}
                            >
                              {ev.title}
                            </button>
                          ))
                        : list.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAllDayOpen(true);
                              }}
                              className="px-1 text-xs leading-6 text-muted-foreground hover:text-foreground"
                            >
                              {list.length}{" "}
                              {list.length === 1 ? "event" : "events"}
                            </button>
                          )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* hour grid */}
            <div className="flex pb-24" style={{ height: 24 * HOUR_H + 96 }}>
              <div
                className="relative shrink-0"
                style={{ width: GUTTER, height: 24 * HOUR_H }}
              >
                {Array.from({ length: 23 }, (_, i) => i + 1).map((h) => (
                  <div
                    key={h}
                    className="absolute right-3 -translate-y-1/2 text-xs text-muted-foreground"
                    style={{ top: h * HOUR_H }}
                  >
                    {hourLabel(h, settings.hour24)}
                  </div>
                ))}
              </div>

              <div
                ref={colsRef}
                className="relative grid min-w-0 flex-1"
                style={{
                  gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                  height: 24 * HOUR_H,
                  backgroundImage:
                    "linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                  backgroundSize: `100% ${HOUR_H}px`,
                }}
              >
                {days.map((day, dayIdx) => {
                  const isToday = isSameDay(day, today);
                  const placed = layoutDay(shown, day);
                  return (
                    <div
                      key={day.getTime()}
                      onPointerDown={(e) => beginSelect(e, dayIdx)}
                      className="relative min-w-0 cursor-cell touch-pan-y select-none border-l"
                    >
                      {offBlocks(day).map((b, i) => (
                        <div
                          key={i}
                          className="pointer-events-none absolute inset-x-0"
                          style={{
                            top: (b.from / 60) * HOUR_H,
                            height: ((b.to - b.from) / 60) * HOUR_H,
                            ...HATCH,
                            ...(b.fade === "none"
                              ? {}
                              : {
                                  maskImage: `linear-gradient(to ${b.fade === "bottom" ? "bottom" : "top"}, #000 calc(100% - 48px), transparent)`,
                                  WebkitMaskImage: `linear-gradient(to ${b.fade === "bottom" ? "bottom" : "top"}, #000 calc(100% - 48px), transparent)`,
                                }),
                          }}
                        />
                      ))}

                      {selection && selection.dayIdx === dayIdx && (
                        <div
                          className="pointer-events-none absolute inset-x-1 rounded-md border border-dashed border-primary/60 bg-primary/10"
                          style={{
                            top:
                              (Math.min(selection.a, selection.b) / 60) *
                              HOUR_H,
                            height:
                              ((Math.abs(selection.b - selection.a) + SNAP) /
                                60) *
                              HOUR_H,
                          }}
                        />
                      )}

                      {placed.map((p) => {
                        const cal = CALENDARS[p.ev.calendarId];
                        const dragging = drag?.id === p.ev.id;
                        const height = Math.max(
                          ((p.endMin - p.startMin) / 60) * HOUR_H - 2,
                          20,
                        );
                        return (
                          <div
                            key={p.ev.id}
                            role="button"
                            tabIndex={0}
                            aria-label={`${p.ev.title}, ${fmtTime(p.ev.start, settings.hour24)} to ${fmtTime(p.ev.end, settings.hour24)}`}
                            onPointerDown={(e) => beginDrag(e, p.ev.id, "move")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openEdit(p.ev);
                              }
                            }}
                            className={cn(
                              "absolute cursor-grab overflow-hidden rounded-md border-l-4 px-1.5 py-0.5 text-xs shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing",
                              cal.chip,
                              dragging
                                ? "z-20 opacity-90 shadow-lg ring-2 ring-ring"
                                : "z-5",
                            )}
                            style={{
                              top: (p.startMin / 60) * HOUR_H + 1,
                              height,
                              left: `calc(${(p.col / p.cols) * 100}% + 2px)`,
                              width: `calc(${100 / p.cols}% - 4px)`,
                            }}
                          >
                            <div className="truncate font-medium leading-4">
                              {p.ev.title}
                            </div>
                            {height >= 36 && (
                              <div className="truncate leading-4 opacity-70">
                                {fmtTime(p.ev.start, settings.hour24)} –{" "}
                                {fmtTime(p.ev.end, settings.hour24)}
                              </div>
                            )}
                            <div
                              onPointerDown={(e) =>
                                beginDrag(e, p.ev.id, "resize")
                              }
                              className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize"
                            />
                          </div>
                        );
                      })}

                      {isToday && (
                        <div
                          className="pointer-events-none absolute inset-x-0 z-10"
                          style={{
                            top:
                              ((now.getHours() * 60 + now.getMinutes()) / 60) *
                              HOUR_H,
                          }}
                        >
                          <div className="relative h-px bg-red-500">
                            <span className="absolute -left-1 -top-0.75 size-1.75 rounded-full bg-red-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --------------------------- floating command bar -------------------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-5 z-40 flex justify-center px-4">
        <div className="pointer-events-auto relative w-full max-w-150">
          {focused && items.length > 0 && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute bottom-full mb-2 w-full overflow-hidden rounded-2xl border bg-popover p-1 text-popover-foreground shadow-xl"
            >
              <div className="max-h-72 overflow-y-auto">
                {items.map((it, i) => (
                  <React.Fragment key={it.id}>
                    {(i === 0 || items[i - 1].section !== it.section) && (
                      <div className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {it.section}
                      </div>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => runItem(it)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                        i === activeIdx && "bg-muted",
                      )}
                    >
                      <span className="grid size-5 shrink-0 place-items-center text-muted-foreground">
                        {it.icon}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {it.label}
                      </span>
                      {it.hint && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {it.hint}
                        </span>
                      )}
                      {it.id === "quick" && (
                        <IconCornerDownLeft className="size-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl border bg-background px-4 py-2 shadow-lg">
            <IconSearch className="size-4.5 shrink-0 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={query}
              placeholder="Search events, teammates, commands..."
              aria-label="Search events, teammates, commands"
              className="h-8 flex-1 border-0 bg-transparent px-0 text-[15px] shadow-none focus-visible:ring-0 dark:bg-transparent"
              onChange={(e: {
                target: { value: React.SetStateAction<string> };
              }) => {
                setQuery(e.target.value);
                setActiveIdx(0);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e: any) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIdx((i) =>
                    items.length ? (i + 1) % items.length : 0,
                  );
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIdx((i) =>
                    items.length ? (i - 1 + items.length) % items.length : 0,
                  );
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  runItem(items[Math.min(activeIdx, items.length - 1)]);
                } else if (e.key === "Escape") {
                  setQuery("");
                  searchRef.current?.blur();
                }
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => quickAdd(query)}
              title="Quick add from text, e.g. “Lunch tomorrow 1pm for 45m”"
              aria-label="Quick add event"
              className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-violet-500 transition-colors hover:bg-muted"
            >
              <IconSparkles className="size-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------- dialogs ---------------------------- */}
      {draft && (
        <EventDialog
          key={draft.id ?? "new"}
          draft={draft}
          hour24={settings.hour24}
          onClose={() => setDraft(null)}
          onSave={saveDraft}
          onDelete={(id) => {
            removeEvent(id);
            setDraft(null);
          }}
        />
      )}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onChange={setSettings}
      />
    </div>
  );
}

export default PlannerCalendar;

/* -------------------------------------------------------------------------- */
/*  Event dialog                                                              */
/* -------------------------------------------------------------------------- */

function EventDialog({
  draft,
  onClose,
  onSave,
  onDelete,
}: {
  draft: Draft;
  hour24: boolean;
  onClose: () => void;
  onSave: (d: Draft) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = React.useState<Draft>(draft);
  const [touched, setTouched] = React.useState(false);
  const error = validate(form);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit event" : "New event"}</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (!error) onSave(form);
          }}
        >
          <Input
            autoFocus
            value={form.title}
            onChange={(e: { target: { value: string } }) =>
              set("title", e.target.value)
            }
            placeholder="Event title"
            aria-label="Event title"
            className="h-10 text-base"
          />

          <div
            className="flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-label="Calendar"
          >
            {CALENDAR_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={form.calendarId === id}
                onClick={() => set("calendarId", id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  form.calendarId === id
                    ? "border-foreground/40 bg-muted font-medium"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <span
                  className={cn("size-2 rounded-full", CALENDARS[id].dot)}
                />
                {CALENDARS[id].name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="planner-allday" className="flex items-center gap-2">
              <IconClock className="size-4 text-muted-foreground" />
              All day
            </Label>
            <Switch
              id="planner-allday"
              checked={form.allDay}
              onCheckedChange={(c: boolean) => set("allDay", !!c)}
            />
          </div>

          <div
            className={cn(
              "grid gap-2",
              form.allDay ? "grid-cols-1" : "grid-cols-[1fr_auto_auto]",
            )}
          >
            <Input
              type="date"
              value={form.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                set("date", e.target.value)
              }
              aria-label="Date"
            />
            {!form.allDay && (
              <>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e: { target: { value: string } }) =>
                    set("startTime", e.target.value)
                  }
                  aria-label="Start time"
                />
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e: { target: { value: string } }) =>
                    set("endTime", e.target.value)
                  }
                  aria-label="End time"
                />
              </>
            )}
          </div>

          <div className="flex gap-2">
            <IconAlignLeft className="mt-2 size-4 shrink-0 text-muted-foreground" />
            <Textarea
              value={form.description}
              onChange={(e: { target: { value: string } }) =>
                set("description", e.target.value)
              }
              placeholder="Add description"
              aria-label="Description"
              rows={3}
            />
          </div>

          {touched && error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {form.id ? (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(form.id!)}
              >
                <IconTrash className="size-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Settings dialog                                                           */
/* -------------------------------------------------------------------------- */

function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  const patch = (p: Partial<Settings>) => onChange({ ...settings, ...p });
  const row = "flex items-center justify-between gap-4";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calendar settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className={row}>
            <Label>Week starts on</Label>
            <div className="flex rounded-lg border p-0.5">
              {([0, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => patch({ weekStartsOn: d })}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm transition-colors",
                    settings.weekStartsOn === d
                      ? "bg-muted font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {d === 0 ? "Sunday" : "Monday"}
                </button>
              ))}
            </div>
          </div>

          <div className={row}>
            <Label htmlFor="s-24h">24-hour clock</Label>
            <Switch
              id="s-24h"
              checked={settings.hour24}
              onCheckedChange={(c: any) => patch({ hour24: !!c })}
            />
          </div>
          <div className={row}>
            <Label htmlFor="s-weekends">Show weekends</Label>
            <Switch
              id="s-weekends"
              checked={settings.showWeekends}
              onCheckedChange={(c: any) => patch({ showWeekends: !!c })}
            />
          </div>
          <div className={row}>
            <Label htmlFor="s-hatch">Shade non-working hours</Label>
            <Switch
              id="s-hatch"
              checked={settings.hatchOffHours}
              onCheckedChange={(c: any) => patch({ hatchOffHours: !!c })}
            />
          </div>

          <div className={row}>
            <Label>Working hours</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={settings.workEnd - 1}
                value={settings.workStart}
                onChange={(e: { target: { value: any } }) =>
                  patch({
                    workStart: clamp(
                      Number(e.target.value) || 0,
                      0,
                      settings.workEnd - 1,
                    ),
                  })
                }
                className="w-16"
                aria-label="Working hours start"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                min={settings.workStart + 1}
                max={24}
                value={settings.workEnd}
                onChange={(e: any) =>
                  patch({
                    workEnd: clamp(
                      Number(e.target.value) || 24,
                      settings.workStart + 1,
                      24,
                    ),
                  })
                }
                className="w-16"
                aria-label="Working hours end"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
