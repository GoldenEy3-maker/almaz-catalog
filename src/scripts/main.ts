import { handleSubmitForm } from "./forms-handler";
import { initSubmenu } from "./submenu";

initSubmenu();

document.addEventListener("submit", handleSubmitForm);
