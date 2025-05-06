export interface TodoItem {
  date: string;
  lines: string[];
  todos: string[];
  done: string[];
}

export function parseTodoText(text: string): TodoItem[] {
  const lines = text.split('\n');
  const result: TodoItem[] = [];
  let currentDate: string | null = null;
  let currentGroup: TodoItem | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trimStart(); // Normalize leading whitespace

    const dateMatch = line.match(/^##\s*(\d{4}-\d{2}-\d{2})$/);
    if (dateMatch) {
      if (currentGroup) {
        result.push(currentGroup);
      }
      currentDate = dateMatch[1];
      currentGroup = {
        date: currentDate,
        lines: [],
        todos: [],
        done: []
      };
    }

    if (currentGroup) {
      currentGroup.lines.push(rawLine); // preserve formatting
      if (/^[^\w\d]*\[\s\]\s+/.test(line)) {
        currentGroup.todos.push(rawLine);
      } else if (/^[^\w\d]*\[x\]\s+/i.test(line)) {
        currentGroup.done.push(rawLine);
      }
    }
  }

  if (currentGroup) {
    result.push(currentGroup);
  }

  return result;
}
