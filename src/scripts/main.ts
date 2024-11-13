import { SelectorMap } from "./constants";
import { decrementCounter, incrementCounter } from "./counter";
import {
  formSubmitHandler,
  initFieldsWithSearchParams,
  initValidationWatcher,
} from "./form";
import { yearMaskHandler } from "./mask";
import { initSubmenu } from "./submenu";

initSubmenu();
initValidationWatcher();
initFieldsWithSearchParams();

document.addEventListener("submit", (event) => {
  const formTarget = (event.target as HTMLElement).closest(SelectorMap.Form);
  if (formTarget) formSubmitHandler(event);
});
document.addEventListener("input", (event) => {
  const yearMaskInput = (event.target as HTMLElement).closest<HTMLInputElement>(
    SelectorMap.YearMask,
  );

  if (yearMaskInput) yearMaskHandler(yearMaskInput);
});
document.addEventListener("click", (event) => {
  const incrementCounterTrigger = (
    event.target as HTMLElement
  ).closest<HTMLButtonElement>(SelectorMap.CounterIncrementTrigger);
  const decrementCounterTrigger = (
    event.target as HTMLElement
  ).closest<HTMLButtonElement>(SelectorMap.CounterDecrementTrigger);

  if (incrementCounterTrigger) incrementCounter(incrementCounterTrigger);
  if (decrementCounterTrigger) decrementCounter(decrementCounterTrigger);
});
