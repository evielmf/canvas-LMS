Feature Prompt: Quick Notes / Markdown Notepad for Students
Goal:
Design and implement a minimalist yet powerful Quick Notes / Markdown Notepad feature inside the Easeboard student dashboard. The goal is to help students take lecture notes, write study plans, or make to-do lists in a calm, distraction-free environment.

🎯 Core Requirements:
Autosave Notes

Notes should autosave every few seconds or on text change.

Data is saved to the student's account, scoped to class if applicable.

Include last edited timestamp.

Markdown Support

Allow students to write in plain Markdown.

Live preview panel (side-by-side or toggle view).

Support for:

Headings

Bullet/numbered lists

Bold, italic, underline

Checkboxes (- [ ] task)

Code blocks and inline code

Link Notes to Class or Assignment

Allow student to associate each note with a specific class or assignment.

Class dropdown or smart linking on note creation.

If opened from an assignment page, auto-link it.

Display a badge/tag showing the linked class or assignment.

Export to PDF

Add an “Export to PDF” button.

Export Markdown as clean, formatted PDF with title, class info, and timestamp.

Fonts and styling should be clean and print-friendly.

🧘 Design Philosophy:
Minimal UI with focus-first layout (Think Notion / Obsidian Lite).

Soft borders, rounded corners, generous padding.

Color scheme follows Easeboard’s calm, student-friendly theme.

Full-screen mode or popup modal option.

⚙️ Tech Suggestions:
Frontend: React + Tailwind

Markdown Engine: remark, react-markdown, or markdown-it

Autosave: Local debounce + remote update (Supabase or your backend)

PDF Export: html2pdf.js, jsPDF, or render server-side with FastAPI/reportlab

Data Model (Supabase or DB):

ts
Copy
Edit
Note {
  id: string
  user_id: string
  content: text (Markdown)
  title: string
  class_id: string (nullable)
  assignment_id: string (nullable)
  last_edited: timestamp
  created_at: timestamp
}