import { SelectorMap } from "./constants";
import {
  blurCounterHandler,
  decrementCounter,
  incrementCounter,
} from "./counter";
import { initEquipmentPartLinksHandler } from "./equipment";
import {
  formSubmitHandler,
  initFieldsWithSearchParams,
  initValidationWatcher,
} from "./form";
import { yearMaskHandler } from "./mask";
import { openModal } from "./modal";
import { initSubmenu } from "./submenu";
import { getAttrFromSelector } from "./utils";

initSubmenu();
initValidationWatcher();
initFieldsWithSearchParams();
initEquipmentPartLinksHandler();

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
document.addEventListener("focusout", (event) => {
  const target = event.target as HTMLElement;

  const counterInput = target.closest<HTMLInputElement>(
    SelectorMap.CounterInput,
  );

  if (counterInput) blurCounterHandler(counterInput);
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
