// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { parseTodoText } from "./parser";
import { existsSync } from "fs";
import * as path from "path";
import * as os from "os";

import {
  TODO_UNCHECKED_PATTERN,
  COMMENTED_TODO_PATTERN,
  TODO_CHECKED_PATTERN,
  DATE_HEADER_PATTERN,
  ANY_PRIORITY_MARKER,
  isTodoLine,
  toggleTodoState,
  getPriorityLevel,
} from "./todo-patterns";

import {
  doneDecoration,
  todoDecoration,
  commentedDecoration,
  redDotDecoration,
  orangeDotDecoration,
  greenDotDecoration,
  dateHeaderDecoration,
} from "./decorations";

import { startTimer, stopTimer, setExtensionContext, restoreTimer, handleEditorChange } from "./timerManager";
import { moveUnfinishedTasksToToday } from "./moveUnfinishedTasksToToday";
import { fstat } from "fs";
// import { format } from 'date-fns';

const TODO_FILE_LANG = "todo";
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(`[✅ ${TODO_FILE_LANG}] Started`);


  // Set the extension context for the timer manager
  setExtensionContext(context);

  // Restore any active timer from previous session
  restoreTimer();



  vscode.window.onDidChangeActiveTextEditor(
   (editor) => {
      if (editor && editor.document.languageId === TODO_FILE_LANG) {
        updateDecorations(editor);
      }
      
      // Handle timer decoration updates when switching editors
      handleEditorChange(editor);
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (
        vscode.window.activeTextEditor &&
        event.document === vscode.window.activeTextEditor.document &&
        event.document.languageId === TODO_FILE_LANG
      ) {
        updateDecorations(vscode.window.activeTextEditor);
      }
    },
    null,
    context.subscriptions
  );

  if (vscode.window.activeTextEditor) {
    updateDecorations(vscode.window.activeTextEditor);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("todo.todoSmartEnter", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== TODO_FILE_LANG) {
        return;
      }

      const pos = editor.selection.active;
      const line = editor.document.lineAt(pos.line);
      const text = line.text.trimStart();

      const todoPrefixMatch = text.match(TODO_UNCHECKED_PATTERN);
      if (todoPrefixMatch) {
        const indent = line.text.match(/^\s*/)?.[0] || "";
        const prefix = indent + todoPrefixMatch[0];

        await editor.edit((editBuilder) => {
          editBuilder.insert(pos, "\n" + prefix);
        });

        // Move cursor to the end of the inserted prefix
        const newPos = new vscode.Position(pos.line + 1, prefix.length);
        editor.selection = new vscode.Selection(newPos, newPos);
      } else {
        // fallback to normal enter
        await vscode.commands.executeCommand("type", { text: "\n" });
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todo.markTodoDone", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== TODO_FILE_LANG) {
        return;
      }

      const lineNumber = editor.selection.active.line;
      const line = editor.document.lineAt(lineNumber);
      const trimmed = line.text.trimStart();

      // Match lines like: - [ ] Something, * [ ] Something, etc.
      const todoPattern = TODO_UNCHECKED_PATTERN;

      if (!todoPattern.test(trimmed)) {
        vscode.window.showInformationMessage(
          "This line is not an incomplete todo."
        );
        return;
      }

      const updated = line.text.replace(todoPattern, (match) =>
        match.replace("[ ]", "[x]")
      );
      await editor.edit((editBuilder) => {
        editBuilder.replace(line.range, updated);
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todo.toggleTodoDone", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== TODO_FILE_LANG) {
        return;
      }

      const lineNumber = editor.selection.active.line;
      const line = editor.document.lineAt(lineNumber);
      const trimmed = line.text.trimStart();

      // Match leading non-alphanumeric chars + [ ] or [x]

      const match = isTodoLine(trimmed);
      if (!match) {
        vscode.window.showInformationMessage("This line is not a todo item.");
        return;
      }

      const updatedLine = toggleTodoState(line.text);

      await editor.edit((editBuilder) => {
        editBuilder.replace(line.range, updatedLine);
      });
      const saveFile = vscode.workspace
        .getConfiguration("todo")
        .get("saveOnUpdate", false);
      if (saveFile) {
        await editor.document.save();
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todo.startTimer", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "todo") {
        return;
      }
      const timerTime = vscode.workspace
        .getConfiguration("todo")
        .get("defaultTimer", 25);
      const line = editor.selection.active.line;
      startTimer(editor, line, timerTime);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todo.stopTimer", () => {
      stopTimer();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "todo.insertTodayDate",
      insertTodayDateHeader
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "todo.moveUnfinishedToToday",
      moveUnfinishedTasksToToday
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("todo.openTodoFile", openTodoFile)
  );

  vscode.languages.registerFoldingRangeProvider("todo", {
    provideFoldingRanges(document, context, token) {
      const ranges: vscode.FoldingRange[] = [];
      const lines = document.getText().split("\n");
      let currentStart: number | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // TODO: Move this to our constants
        if (/^##\s+.+/.test(line)) {
          if (currentStart !== null) {
            ranges.push(new vscode.FoldingRange(currentStart, i - 1));
          }
          currentStart = i;
        }
      }

      if (currentStart !== null && currentStart < lines.length - 1) {
        ranges.push(new vscode.FoldingRange(currentStart, lines.length - 1));
      }

      return ranges;
    },
  });

  vscode.languages.registerDocumentLinkProvider("todo", {
    provideDocumentLinks(document) {
      const config = vscode.workspace.getConfiguration("todo");
      const baseUrl = config.get<string>("jiraBaseUrl", "").trim();

      if (!baseUrl) {
        return [];
      }

      const links: vscode.DocumentLink[] = [];
      const regex = /\b[A-Z]{2,10}-\d+\b/g; // Matches JIRA-like keys

      for (let line = 0; line < document.lineCount; line++) {
        const text = document.lineAt(line).text;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const key = match[0];
          const start = new vscode.Position(line, match.index);
          const end = new vscode.Position(line, match.index + key.length);
          const range = new vscode.Range(start, end);
          const target = `${baseUrl.replace(/\/+$/, "")}/${key}`;
          links.push(new vscode.DocumentLink(range, vscode.Uri.parse(target)));
        }
      }

      return links;
    },
  });

  // context.subscriptions.push(disposable);
}

function expandHome(filepath: string): string {
  if (filepath.startsWith("~")) {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

export function openTodoFile() {
  const todoFilePath = vscode.workspace
    .getConfiguration("todo")
    .get<string>("defaultTodoFileLocation", "~/my.todo.txt");
  const expandedPath = expandHome(todoFilePath);
  const fileExists = existsSync(expandedPath);
  if (fileExists) {
    vscode.workspace.openTextDocument(expandedPath).then((doc) => {
      vscode.window.showTextDocument(doc);
    });
  } else {
    vscode.window.showErrorMessage("Todo file path is not set in settings.");
  }
}

export async function insertTodayDateHeader() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const config = vscode.workspace.getConfiguration("todo");
  const formatString = config.get<string>("dateFormat", "yyyy-MM-dd");
  const today = new Date();

  // If the format is exactly 'yyyy-MM-dd', format the date manually.
  let formatted: string;
  if (formatString === "yyyy-MM-dd") {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    formatted = `${year}-${month}-${day}`;
  } else {
    // Fallback: use the first 10 characters of ISO string (yyyy-MM-dd)
    formatted = today.toISOString().slice(0, 10);
  }

  const dateHeader = `## ${formatted}`;
  const position = editor.selection.active;
  editor.edit((editBuilder) => {
    editBuilder.insert(position, dateHeader + "\n");
  });
  const saveFile = vscode.workspace
    .getConfiguration("todo")
    .get("saveOnUpdate", false);
  if (saveFile) {
    await editor.document.save();
  }
}

function updateDecorations(editor: vscode.TextEditor) {
  const text = editor.document.getText();
  const lines = text.split("\n");

  const redDots: vscode.DecorationOptions[] = [];
  const orangeDots: vscode.DecorationOptions[] = [];
  const greenDots: vscode.DecorationOptions[] = [];

  const doneRanges: vscode.DecorationOptions[] = [];
  const todoRanges: vscode.DecorationOptions[] = [];
  const commentedRanges: vscode.DecorationOptions[] = [];
  const dateHeaders: vscode.DecorationOptions[] = [];

  lines.forEach((lineText, lineNum) => {
    const trimmed = lineText.trimStart();

    const range = editor.document.lineAt(lineNum).range;
    if (DATE_HEADER_PATTERN.test(trimmed)) {
      dateHeaders.push({ range });
    }
    // Commented out todos (e.g., // - [ ] or # [x])
    if (COMMENTED_TODO_PATTERN.test(trimmed)) {
      commentedRanges.push({ range });
    } else if (TODO_UNCHECKED_PATTERN.test(trimmed)) {
      todoRanges.push({ range });

      if (ANY_PRIORITY_MARKER.test(trimmed)) {
        const priority = getPriorityLevel(trimmed);
        if (priority === "high") {
          redDots.push({ range });
        } else if (priority === "medium") {
          orangeDots.push({ range });
        } else if (priority === "low") {
          greenDots.push({ range });
        }
      }
    } else if (TODO_CHECKED_PATTERN.test(trimmed)) {
      doneRanges.push({ range });
    }
  });

  editor.setDecorations(dateHeaderDecoration, dateHeaders);

  editor.setDecorations(doneDecoration, doneRanges);
  editor.setDecorations(todoDecoration, todoRanges);
  editor.setDecorations(commentedDecoration, commentedRanges);
  editor.setDecorations(redDotDecoration, redDots);
  editor.setDecorations(orangeDotDecoration, orangeDots);
  editor.setDecorations(greenDotDecoration, greenDots);
}

// This method is called when your extension is deactivated
export function deactivate() {}
