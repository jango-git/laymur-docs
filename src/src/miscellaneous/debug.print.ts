let counter = 0;

export function consoleDebug(...args: unknown[]): void {
  counter += 1;
  const localVariable = counter;
  console.debug(`[${localVariable}]`, ...args);
}

export function consoleError(...args: unknown[]): void {
  counter += 1;
  const localVariable = counter;
  console.error(`[${localVariable}]`, ...args);
}
