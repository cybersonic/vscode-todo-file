# 📝 VSCode Todo Extension

A clean, keyboard-first VSCode extension for managing plain-text daily todos file — ideal for developers who prefer lightweight task tracking right inside their editor.
Use it to keep your tasks organized, prioritized, and easily accessible without the overhead of complex project management tools.

---

## ✨ Features

### ✅ Todo List Formatting
- Automatically detects todo items:
  - `[ ]` for incomplete tasks
  - `[x]` for completed tasks
- Multiple bullet styles supported: `-`, `*`, `•`, etc.
- Strikethrough styling for `[x]` completed items
- Bold styling for active `[ ]` tasks
- Faded/italic styling for commented-out tasks (`// - [ ]`, `# - [ ]`)
- Collapsible sections for better organization

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
- Set your default todo file in settings and open it with a single command ("Open Todo File").
- Use `Ctrl+Shift+P` to open the Command Palette and search for "Todo" to see all available commands.

---


## 📄 Example Format

```txt
## 2025-05-06
- [ ] !!! Critical issue     🔴
- [ ] !! Send weekly report  🟠
- [x] Write documentation     (completed)
// - [ ] Cancelled feature     (commented out)
```

## 🛠 File Association
This extension activates on files ending with .todo.txt. Just create a file like myplan.todo.txt and you're ready to go.

## 🙌 Contributing
Open to issues, ideas, and PRs. Feel free to improve or extend this extension.


## 💡 Coming Soon (?)
### ⏲️ Countdown Timers
- Start a countdown timer for any task
- Right click on a task and select "Start Countdown Timer"
- The default countdown duration is 25 minutes, but you can customize it in the settings.
- The timer will show a notification when the time is up.

## 📘 License
MIT — simple and open.