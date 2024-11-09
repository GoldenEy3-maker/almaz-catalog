import { SelectorMap } from "./constants";
import { openCustomSelect } from "./custom-select";
import { formSubmitHandler } from "./form";
import { initSubmenu } from "./submenu";

initSubmenu();

document.addEventListener("submit", formSubmitHandler);
document.addEventListener("click", (event) => {
  const customSelectTrigger = (
    event.target as HTMLElement
  ).closest<HTMLButtonElement>(SelectorMap.CustomSelectTrigger);
  if (customSelectTrigger) openCustomSelect(customSelectTrigger);
});
