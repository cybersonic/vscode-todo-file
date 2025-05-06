export const TODO_UNCHECKED_PATTERN:RegExp = /^[^\w\d]*\[\s\]\s+/;
export const TODO_CHECKED_PATTERN:RegExp = /^[^\w\d]*\[x\]\s+/i;
export const TODO_ANY_PATTERN:RegExp = /^[^\w\d]*\[(\s|x)\]\s+/i;
export const COMMENTED_TODO_PATTERN:RegExp = /^\s*(\/\/|#)\s*[^\w\d]*\[(\s|x)\]/i;
// Priority markers (with prefix !, !!, !!!)
export const PRIORITY_HIGH_PATTERN = /^[^\w\d]*\[\s\]\s+!!!/;  // High priority
export const PRIORITY_MED_PATTERN = /^[^\w\d]*\[\s\]\s+!!/;   // Medium
export const PRIORITY_LOW_PATTERN  = /^[^\w\d]*\[\s\]\s+!/;    // Low

// Alternate: if you ever want just standalone detection (not tied to todo)
export const ANY_PRIORITY_MARKER = /(?<!\!)\!{1,3}(?!\!)/;

export function toggleTodoState(line: string): string {
    if (TODO_UNCHECKED_PATTERN.test(line)) {
      return line.replace(/\[\s\]/, '[x]');
    } else if (TODO_CHECKED_PATTERN.test(line)) {
      return line.replace(/\[x\]/i, '[ ]');
    }
    return line;
  }
  
  export function isTodoLine(line: string): boolean {
    return TODO_UNCHECKED_PATTERN.test(line) || TODO_CHECKED_PATTERN.test(line);
  }
  export function getPriorityLevel(line: string): 'high' | 'medium' | 'low' | null {
    if (PRIORITY_HIGH_PATTERN.test(line)) return 'high';
    if (PRIORITY_MED_PATTERN.test(line)) return 'medium';
    if (PRIORITY_LOW_PATTERN.test(line)) return 'low';
    return null;
  }
