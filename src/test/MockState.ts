import * as vscode from 'vscode';

export class MockState implements vscode.Memento {
  private storage = new Map<string, any>();

	keys(): readonly string[]{
    return Array.from(this.storage.keys());
  }

  get<T>(key: string, defaultValue?: T): T {
    return this.storage.has(key) ? this.storage.get(key) : defaultValue!;
  }
  
  update(key: string, value: any): Thenable<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }
}


export function createMockContext(): vscode.ExtensionContext {
  return {
    globalState: new MockState(),
    workspaceState: new MockState(),
    subscriptions: [],
    extensionUri: vscode.Uri.file("/mock"),
    asAbsolutePath: (path: string) => "/mock/" + path,
    storageUri: undefined,
    globalStorageUri: undefined,
    logUri: undefined,
    extensionPath: "/mock",
    environmentVariableCollection: {} as any,
    extensionMode: vscode.ExtensionMode.Test,
    workspaceStorageUri: undefined,
    globalStoragePath: "/mock",
    extension: undefined!,
  } as unknown as vscode.ExtensionContext;
}

