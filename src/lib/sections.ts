/**
 * The homepage section index.
 *
 * The right rail, the command palette and the `#hash` targets on the page all
 * have to agree; keeping the list here means adding a section is one edit
 * rather than three that can drift apart.
 */
export interface SectionLink {
  /** Matches the element `id` on the homepage. */
  id: string;
  name: string;
  /** Uppercase letter used as `shift + <key>` in the command palette. */
  key: string;
}

export const SECTIONS: SectionLink[] = [
  { id: "experience", name: "Experience", key: "E" },
  { id: "projects", name: "Projects", key: "P" },
  { id: "activity", name: "Activity", key: "A" },
  { id: "opensource", name: "Open Source", key: "O" },
  { id: "skills", name: "Skills", key: "S" },
  { id: "writing", name: "Writing", key: "W" },
  { id: "highlights", name: "Highlights", key: "H" },
];
