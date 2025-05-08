import * as vscode from 'vscode';

interface ActiveTimer {
  line: number;
  endTime: number;
  interval: NodeJS.Timeout;
}

let activeTimer: ActiveTimer | null = null;
let timerDecoration: vscode.TextEditorDecorationType;

export function startTimer(editor: vscode.TextEditor, line: number, durationMinutes = 25) {
  stopTimer(); // Only one timer at a time

  const endTime = Date.now() + durationMinutes * 60 * 1000;
  const range = editor.document.lineAt(line).range;

  timerDecoration = vscode.window.createTextEditorDecorationType({
    after: {
      color: '#888',
      fontStyle: 'italic',
      margin: '0 0 0 1em'
    }
  });

  const update = () => {
    const remainingMs = endTime - Date.now();
    if (remainingMs <= 0) {
      stopTimer();
      
      vscode.window.showInformationMessage('⏱️ Pomodoro complete!');
      return;
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    const display = `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')} left`;

    editor.setDecorations(timerDecoration, [
      {
        range,
        renderOptions: {
          after: { contentText: display }
        }
      }
    ]);
  };

  update(); // first render
  const interval = setInterval(update, 1000);

  activeTimer = { line, endTime, interval };
}

export function stopTimer() {
  if (activeTimer) {
    clearInterval(activeTimer.interval);
    activeTimer = null;
  }
  if (timerDecoration) {
    timerDecoration.dispose();
  }
}

