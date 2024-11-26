const counterChangeEvent = new CustomEvent("counter:change");

export function incrementCounter(trigger: HTMLButtonElement) {
  const input = trigger.previousElementSibling as HTMLInputElement | null;

  if (!input) return;

  input.value = (input.valueAsNumber + 1).toString();
  input.dispatchEvent(counterChangeEvent);
}

export function counterInputHandler(input: HTMLInputElement) {
  input.dispatchEvent(counterChangeEvent);
}

export function blurCounterHandler(input: HTMLInputElement) {
  if (input.value === "" || input.valueAsNumber < +input.min) {
    input.value = input.min === "" ? "1" : input.min;
    input.dispatchEvent(counterChangeEvent);
  }
}

export function decrementCounter(trigger: HTMLButtonElement) {
  const input = trigger.nextElementSibling as HTMLInputElement | null;

  if (!input) return;

  if (+input.min === input.valueAsNumber) return;

  input.value = (input.valueAsNumber - 1).toString();

  input.dispatchEvent(counterChangeEvent);
}
