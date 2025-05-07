import * as vscode from "vscode";
import { TODO_UNCHECKED_PATTERN } from "./todo-patterns";

export async function moveUnfinishedTasksToToday() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "todo") {
    return;
  }

  const doc = editor.document;
  const lines = doc.getText().split("\n");

  // Use the same config and formatting logic as insertTodayDateHeader
  const config = vscode.workspace.getConfiguration("todo");
  const formatString = config.get<string>("dateFormat", "yyyy-MM-dd");
  const today = new Date();

  let formatted: string;
  if (formatString === "yyyy-MM-dd") {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    formatted = `${year}-${month}-${day}`;
  } else {
    formatted = today.toISOString().slice(0, 10);
  }

  const todayHeader = `## ${formatted}`;
  let todayIndex = lines.findIndex((line) => line.trim() === todayHeader);

  const linesToMove: string[] = [];
  const indicesToRemove: number[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trimStart();
    if (TODO_UNCHECKED_PATTERN.test(trimmed)) {
      linesToMove.push(line);
      indicesToRemove.push(i);
    }
  });

  if (linesToMove.length === 0) {
    vscode.window.showInformationMessage("✅ No unfinished tasks to move.");
    return;
  }

  await editor.edit((editBuilder) => {
    // Remove lines in reverse to preserve correct indices
    indicesToRemove.reverse().forEach((index) => {
      const range = doc.lineAt(index).rangeIncludingLineBreak;
      editBuilder.delete(range);
    });

    // Insert header if not found
    if (todayIndex === -1) {
      const insertAt = doc.lineCount;
      editBuilder.insert(
        new vscode.Position(insertAt, 0),
        `\n${todayHeader}\n`
      );
      todayIndex = insertAt + 1;
    }

    // Insert tasks under today
    const insertPos = new vscode.Position(todayIndex + 1, 0);
    editBuilder.insert(insertPos, linesToMove.join("\n") + "\n");
  });

  // Collapse all other date sections except today
  const editorAfterEdit = vscode.window.activeTextEditor;
  if (!editorAfterEdit) {
    return;
  }

  const newDoc = editorAfterEdit.document;
  const lineCount = newDoc.lineCount;

  for (let i = 0; i < lineCount; i++) {
    const lineText = newDoc.lineAt(i).text.trim();
    if (lineText.startsWith("##") && lineText !== todayHeader) {
      const foldingRange = new vscode.Range(i, 0, i, 0);
      editorAfterEdit.selection = new vscode.Selection(i, 0, i, 0);
      await vscode.commands.executeCommand("editor.fold");
    }
  }

  vscode.window.showInformationMessage(
    `📌 Moved ${linesToMove.length} unfinished task(s) to ${todayHeader}`
  );
}
