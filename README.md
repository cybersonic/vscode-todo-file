# 📝 VSCode Todo Extension

A clean, keyboard-first VSCode extension for managing plain-text daily todos — ideal for developers who prefer lightweight task tracking right inside their editor.

---

## ✨ Features

### ✅ Todo List Formatting
- Automatically detects todo items:
  - `[ ]` for incomplete tasks
  - `[x]` for completed tasks
- Supports numeric completions: `[1]`, `[2]`, etc. to indicate repetitions or sessions
- Multiple bullet styles supported: `-`, `*`, `•`, etc.
- Strikethrough styling for `[x]` completed items
- Bold styling for active `[ ]` tasks
- Faded/italic styling for commented-out tasks (`// - [ ]`, `# - [ ]`)

---

### 📆 Daily Structure
- Insert a header with today’s date (`## YYYY-MM-DD`)
- Organize todos by day
- Move incomplete tasks from previous dates to today

---

### 🎯 Priority Markers
- Add priority using `!`, `!!`, or `!!!` after `[ ]`:
  - `🔴` High Priority (`!!!`)
  - `🟠` Medium Priority (`!!`)
  - `🟢` Low Priority (`!`)
- Visual emoji-based decoration for immediate recognition

---

### ⌨️ Smart Editing
- Press `Enter` on a `[ ]` line → automatically inserts a new `[ ]` on the next line
- Commands accessible via:
  - Command Palette
  - Right-click context menu
- Commands include:
  - Mark as Done
  - Toggle Done/Undone
  - Move Incomplete Tasks to Today
  - Insert Today's Date

---

## 📄 Example Format

```txt
## 2025-05-06
- [ ] !!! Critical issue     🔴
- [ ] !! Send weekly report  🟠
- [x] Write documentation     (completed)
- [ ] [2] Draft revisions      (tracked progress)
// - [ ] Cancelled feature     (commented out)
```

## 🛠 File Association
This extension activates on files ending with .todo.txt. Just create a file like myplan.todo.txt and you're ready to go.

## 💡 Coming Soon (?)
Sort or group tasks by priority

Completion stats

Timeline or visual calendar view

## 🙌 Contributing
Open to issues, ideas, and PRs. Feel free to improve or extend this extension.

## 📘 License
MIT — simple and open.