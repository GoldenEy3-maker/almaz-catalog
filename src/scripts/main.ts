import { SelectorMap } from "./constants";
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
  const formTarget = (event.target as HTMLElement).closest("[data-form]");
  if (formTarget) formSubmitHandler(event);
});
document.addEventListener("input", (event) => {
  const yearMaskInput = (event.target as HTMLElement).closest<HTMLInputElement>(
    SelectorMap.YearMask,
  );

  if (yearMaskInput) yearMaskHandler(yearMaskInput);
});
