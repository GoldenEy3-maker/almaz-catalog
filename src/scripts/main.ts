import { SelectorMap } from "./constants";
import {
  blurCounterHandler,
  counterInputHandler,
  decrementCounter,
  incrementCounter,
} from "./counter";
import { initEquipmentPartLinksHandler } from "./equipment";
import {
  formSubmitHandler,
  initFieldsWithSearchParams,
  initValidationWatcher,
} from "./form";
import { initStickyHeader } from "./header";
import { yearMaskHandler } from "./mask";
import { openModal } from "./modal";
import { initSubmenu } from "./submenu";
import {
  suggestionsBlurHandler,
  suggestionsFocusHandler,
  suggestionsArrowFocusHandler,
  suggestionsInputHandler,
} from "./suggestions";
import { getAttrFromSelector } from "./utils";

initStickyHeader();
initSubmenu();
initValidationWatcher();
initFieldsWithSearchParams();
initEquipmentPartLinksHandler();

document.addEventListener("submit", (event) => {
  const formTarget = (event.target as HTMLElement).closest(SelectorMap.Form);
  if (formTarget) formSubmitHandler(event);
});

document.addEventListener("input", (event) => {
  const target = event.target as HTMLElement;
  const yearMaskInput = target.closest<HTMLInputElement>(SelectorMap.YearMask);
  const suggestionsInput = target.closest<HTMLInputElement>(
    SelectorMap.SuggestionsAction,
  );
  const counterInput = target.closest<HTMLInputElement>(
    SelectorMap.CounterInput,
  );

  if (yearMaskInput) yearMaskHandler(yearMaskInput);
  if (suggestionsInput) suggestionsInputHandler(suggestionsInput);
  if (counterInput) counterInputHandler(counterInput);
});

document.addEventListener("focusin", (event) => {
  const target = event.target as HTMLElement;

  const suggestionsInput = target.closest<HTMLInputElement>(
    `${SelectorMap.SuggestionsAction}:not([data-suggestions-focus-events-disabled])`,
  );

  if (suggestionsInput) suggestionsFocusHandler(suggestionsInput);
});

document.addEventListener("focusout", (event) => {
  const target = event.target as HTMLElement;

  const counterInput = target.closest<HTMLInputElement>(
    SelectorMap.CounterInput,
  );

  const suggestionsInput = target.closest<HTMLInputElement>(
    `${SelectorMap.SuggestionsAction}:not([data-suggestions-focus-events-disabled])`,
  );

  if (counterInput) blurCounterHandler(counterInput);
  if (suggestionsInput)
    suggestionsBlurHandler(
      suggestionsInput,
      event.relatedTarget as HTMLElement | null,
    );
});

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  const incrementCounterTrigger = target.closest<HTMLButtonElement>(
    SelectorMap.CounterIncrementTrigger,
  );
  const decrementCounterTrigger = target.closest<HTMLButtonElement>(
    SelectorMap.CounterDecrementTrigger,
  );

  const modalTrigger = target.closest<HTMLButtonElement>(
    SelectorMap.ModalTrigger,
  );

  if (incrementCounterTrigger) incrementCounter(incrementCounterTrigger);
  if (decrementCounterTrigger) decrementCounter(decrementCounterTrigger);

  if (modalTrigger) {
    const key = modalTrigger.getAttribute(
      getAttrFromSelector(SelectorMap.ModalTrigger),
    );
    if (!key) return;
    openModal(key, modalTrigger);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowDown" || event.code === "ArrowUp")
    suggestionsArrowFocusHandler(event);
});
