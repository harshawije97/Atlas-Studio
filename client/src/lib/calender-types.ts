type View = "day" | "week" | "month";
type CalendarId = "personal" | "work" | "team";

interface CalEvent {
  id: string;
  title: string;
  start: number;
  end: number;
  allDay: boolean;
  calendarId: CalendarId;
  description?: string;
}

interface Settings {
  weekStartsOn: 0 | 1;
  hour24: boolean;
  showWeekends: boolean;
  hatchOffHours: boolean;
  workStart: number;
  workEnd: number;
}

interface Draft {
  id?: string;
  title: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  allDay: boolean;
  calendarId: CalendarId;
  description: string;
}

interface Placed {
  ev: CalEvent;
  col: number;
  cols: number;
  startMin: number;
  endMin: number;
}
export type { CalEvent, Settings, Draft, Placed };
export type { View, CalendarId };
