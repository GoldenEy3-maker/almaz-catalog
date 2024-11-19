import { lockScroll, unlockScroll } from "./utils";

export function initSubmenu() {
  const _animationDuration = 300;
  const trigger = document.querySelector<HTMLElement>("[data-submenu-trigger]");
  const submenu = document.querySelector<HTMLElement>("[data-submenu]");
  const focusGuard =
    submenu?.querySelector<HTMLSpanElement>("[data-focus-guard]");

  if (!trigger || !submenu) return;

  if (focusGuard)
    focusGuard.addEventListener("focus", () => {
      trigger.focus();
    });

  trigger.addEventListener("blur", () => {
    if (submenu.ariaHidden === "false") submenu.querySelector("a")?.focus();
  });

  trigger.addEventListener("click", () => {
    submenu.style.transitionDuration = _animationDuration + "ms";
    submenu.style.animationDuration = _animationDuration + "ms";
    submenu.ariaHidden = submenu.ariaHidden === "true" ? "false" : "true";
    if (submenu.ariaHidden === "false") {
      trigger.ariaCurrent = "true";
      lockScroll();
    } else {
      trigger.ariaCurrent = "false";
      unlockScroll(_animationDuration);
    }
  });
}
