import { format } from "date-fns";
import {
  IconBook,
  IconCalendarWeek,
  IconChecklist,
  IconSun,
  IconTargetArrow,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import { newId } from "@/lib/utils";

export interface NoteTemplate {
  id: string;
  label: string;
  icon: Icon;
  build: () => string;
}

const h1 = (text: string) => `<h1>${text}</h1>`;
const h2 = (text: string) => `<h2>${text}</h2>`;
const p = (text = "") => `<p>${text}</p>`;
const bullets = (...items: string[]) =>
  `<ul>${items.map((t) => `<li><p>${t}</p></li>`).join("")}</ul>`;

// note: data-id diisi di sini karena baseline todo dibaca dari konten awal editor
const tasks = (...items: string[]) =>
  `<ul data-type="taskList">${items
    .map(
      (t) =>
        `<li data-type="taskItem" data-checked="false" data-id="${newId()}"><p>${t}</p></li>`,
    )
    .join("")}</ul>`;

const today = () => format(new Date(), "EEEE, d MMM yyyy");

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "checklist",
    label: "Checklist",
    icon: IconChecklist,
    build: () => h1("Checklist") + tasks("", "", ""),
  },
  {
    id: "daily-plan",
    label: "Daily plan",
    icon: IconSun,
    build: () =>
      h1(`Daily plan · ${today()}`) +
      h2("Top priorities") +
      tasks("", "", "") +
      h2("Schedule") +
      bullets("", "") +
      h2("Notes") +
      p(),
  },
  {
    id: "meeting-notes",
    label: "Meeting notes",
    icon: IconUsers,
    build: () =>
      h1("Meeting notes") +
      p(`<strong>Date:</strong> ${today()}`) +
      p("<strong>Attendees:</strong> ") +
      h2("Agenda") +
      bullets("", "") +
      h2("Discussion") +
      p() +
      h2("Decisions") +
      bullets("") +
      h2("Action items") +
      tasks("", ""),
  },
  {
    id: "weekly-review",
    label: "Weekly review",
    icon: IconCalendarWeek,
    build: () =>
      h1(`Weekly review · week of ${format(new Date(), "d MMM yyyy")}`) +
      h2("Wins") +
      bullets("") +
      h2("Challenges") +
      bullets("") +
      h2("What I learned") +
      p() +
      h2("Next week") +
      tasks("", "", ""),
  },
  {
    id: "project-plan",
    label: "Project plan",
    icon: IconTargetArrow,
    build: () =>
      h1("Project plan") +
      h2("Goal") +
      p() +
      h2("Milestones") +
      tasks("", "", "") +
      h2("Risks") +
      bullets("") +
      h2("Notes") +
      p(),
  },
  {
    id: "journal",
    label: "Journal",
    icon: IconBook,
    build: () =>
      h1(today()) +
      h2("How I feel") +
      p() +
      h2("What happened today") +
      p() +
      h2("Grateful for") +
      bullets("", "", ""),
  },
];
