export function incrementCounter(trigger: HTMLButtonElement) {
  const input = trigger.previousElementSibling as HTMLInputElement | null;

  if (!input) return;

  input.value = (input.valueAsNumber + 1).toString();
}

export function decrementCounter(trigger: HTMLButtonElement) {
  const input = trigger.nextElementSibling as HTMLInputElement | null;

  if (!input) return;

  if (+input.min === input.valueAsNumber) return;

  input.value = (input.valueAsNumber - 1).toString();
}
