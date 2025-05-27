import * as vscode from "vscode";

interface ActiveTimer {
  line: number;
  endTime: number;
  interval: NodeJS.Timeout;
  fileName: string;
  startTime: number;
}

let activeTimer: ActiveTimer | null = null;
let timerDecoration: vscode.TextEditorDecorationType;
let extensionContext: vscode.ExtensionContext;

// Call this from activate() to set the context
export function setExtensionContext(context: vscode.ExtensionContext) {
  extensionContext = context;
}

export function startTimer(
  editor: vscode.TextEditor,
  line: number,
  durationMinutes = 25
) {
  stopTimer(); // Only one timer at a time

  const startTime = Date.now();
  const endTime = startTime + durationMinutes * 60 * 1000;
  const fileName = editor.document.uri.toString();

  // Store timer state in extension context (more reliable than configuration)
  if (extensionContext) {
    extensionContext.globalState.update('activeTimer', {
      fileName,
      line,
      endTime,
      startTime
    });
  }

  timerDecoration = vscode.window.createTextEditorDecorationType({
    after: {
      color: "#888",
      fontStyle: "italic",
      margin: "0 0 0 1em",
    },
  });

  const update = () => {
    const remainingMs = endTime - Date.now();
    if (remainingMs <= 0) {
      completeTimer();
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    const display = `⏱️ ${minutes}:${seconds.toString().padStart(2, "0")} left`;

    // Only update decoration if the editor is still active and showing the same document
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.toString() === fileName) {
      const range = activeEditor.document.lineAt(line).range;
      activeEditor.setDecorations(timerDecoration, [
        {
          range,
          renderOptions: {
            after: { contentText: display },
          },
        },
      ]);
    }
  };

  update(); // first render
  const interval = setInterval(update, 1000);

  activeTimer = { line, endTime, interval, fileName, startTime };
}

async function completeTimer() {
  if (!activeTimer) return;

  const fileName = activeTimer.fileName;
  
  stopTimer();
  
  // Clear stored timer state
  if (extensionContext) {
    extensionContext.globalState.update('activeTimer', undefined);
  }

  try {
    // Focus back on the todo file
    const uri = vscode.Uri.parse(fileName);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.Active,
      preview: false
    });
    
    // Show completion notification
    vscode.window.showInformationMessage("⏱️ Timer complete!");
  } catch (error) {
    console.error('Failed to focus todo file after timer completion:', error);
    vscode.window.showInformationMessage("⏱️ Timer complete!");
  }
}

export function stopTimer() {
  if (activeTimer) {
    clearInterval(activeTimer.interval);
    activeTimer = null;
  }
  if (timerDecoration) {
    timerDecoration.dispose();
    timerDecoration = undefined as any;
  }
  
  // Clear stored timer state
  if (extensionContext) {
    extensionContext.globalState.update('activeTimer', undefined);
  }
}

// Function to restore timer from stored state (call this from activate)
export function restoreTimer(): void {
  if (!extensionContext) return;

  const stored = extensionContext.globalState.get<any>('activeTimer');
  if (!stored) return;

  const now = Date.now();
  const remainingMs = stored.endTime - now;

  if (remainingMs <= 0) {
    // Timer has already expired, clear it and complete
    extensionContext.globalState.update('activeTimer', undefined);
    
    // Still show completion message and try to focus the file
    vscode.workspace.openTextDocument(vscode.Uri.parse(stored.fileName))
      .then(doc => vscode.window.showTextDocument(doc))
      .then(() => vscode.window.showInformationMessage("⏱️ Timer completed while extension was inactive!"))
      // .catch(() => vscode.window.showInformationMessage("⏱️ Timer completed while extension was inactive!"));
    return;
  }

  // Timer is still running, restore it
  const remainingMinutes = remainingMs / 60000;
  
  vscode.workspace.openTextDocument(vscode.Uri.parse(stored.fileName))
    .then(doc => vscode.window.showTextDocument(doc))
    .then(editor => {
      startTimer(editor, stored.line, remainingMinutes);
    })
    // .catch(error => {
    //   console.error('Failed to restore timer document:', error);
    //   // Clear the stored timer if we can't restore it
    //   extensionContext.globalState.update('activeTimer', undefined);
    // });
}

// Function to handle editor changes without interfering with the timer
export function handleEditorChange(editor: vscode.TextEditor | undefined): void {
  if (!editor || !activeTimer) return;
  
  // If we're looking at the same document that has the active timer, refresh the decoration
  if (editor.document.uri.toString() === activeTimer.fileName) {
    const remainingMs = activeTimer.endTime - Date.now();
    if (remainingMs > 0) {
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      const display = `⏱️ ${minutes}:${seconds.toString().padStart(2, "0")} left`;
      
      const range = editor.document.lineAt(activeTimer.line).range;
      if (timerDecoration) {
        editor.setDecorations(timerDecoration, [
          {
            range,
            renderOptions: {
              after: { contentText: display },
            },
          },
        ]);
      }
    }
  }
}