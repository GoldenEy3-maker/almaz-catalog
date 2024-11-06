import { lockScroll, unlockScroll } from "./utils";

export function initSubmenu() {
  const _animationDuration = 300;
  const trigger = document.querySelector<HTMLElement>("[data-submenu-trigger]");
  const submenu = document.querySelector<HTMLElement>("[data-submenu]");

  if (!trigger || !submenu) return;

  trigger.addEventListener("click", () => {
    submenu.style.transitionDuration = _animationDuration + "ms";
    submenu.style.animationDuration = _animationDuration + "ms";
    submenu.ariaHidden = submenu.ariaHidden === "true" ? "false" : "true";
    if (submenu.ariaHidden === "false") lockScroll();
    else unlockScroll(_animationDuration);
  });
}
