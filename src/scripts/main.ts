import { SelectorMap } from "./constants";
import { formSubmitHandler, initValidationWatcher } from "./form";
import { yearMaskHandler } from "./mask";
import { initSubmenu } from "./submenu";

initSubmenu();
initValidationWatcher();

document.addEventListener("submit", formSubmitHandler);
document.addEventListener("input", (event) => {
  const yearMaskInput = (event.target as HTMLElement).closest<HTMLInputElement>(
    SelectorMap.YearMask,
  );

  if (yearMaskInput) yearMaskHandler(yearMaskInput);
});
