import * as vscode from 'vscode';

export const doneDecoration = vscode.window.createTextEditorDecorationType({
  textDecoration: 'line-through',
  opacity: '0.6',
  color: new vscode.ThemeColor('descriptionForeground'),
});

export const todoDecoration = vscode.window.createTextEditorDecorationType({
  fontWeight: 'bold',
});

export const dateHeaderDecoration = vscode.window.createTextEditorDecorationType({
  fontWeight: 'bold',
  color: new vscode.ThemeColor('editorLineNumber.foreground'),
  border: "none",
  backgroundColor: new vscode.ThemeColor('editorHoverWidget.background'),
});

export const commentedDecoration = vscode.window.createTextEditorDecorationType({
  opacity: '0.5',
  fontStyle: 'italic',
  color: new vscode.ThemeColor('editorCodeLens.foreground'),
});

export const redDotDecoration = vscode.window.createTextEditorDecorationType({
  after: {
    contentText: ' 🔴',
    margin: '0 8px 0 0',
  },
});

export const orangeDotDecoration = vscode.window.createTextEditorDecorationType({
  after: {
    contentText: ' 🟠',
    margin: '0 8px 0 0',
  },
});

export const greenDotDecoration = vscode.window.createTextEditorDecorationType({
  after: {
    contentText: ' 🟢',
    margin: '8px 0px 0 0',
  },
});
