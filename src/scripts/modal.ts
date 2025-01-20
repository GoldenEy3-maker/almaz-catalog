import { SelectorMap } from "./constants";
import { handleFormSubmitterReplacer } from "./form";
import {
  getAttrFromSelector,
  lockScroll,
  parseJSONWidthQuotes,
  unlockScroll,
} from "./utils";

const modalOverlay = document.querySelector<HTMLElement>(
  SelectorMap.ModalOverlay,
);

const _modalAnimationDuration = 300;

let _activeModalTrigger: HTMLElement | null = null;

function removeModal(modal: HTMLElement) {
  setTimeout(() => modal.remove(), _modalAnimationDuration);
}

export function closeModal(key: string) {
  const modal = document.querySelector<HTMLElement>(
    `[${getAttrFromSelector(SelectorMap.ModalRoot)}=${key}]`,
  );

  if (!modal) return;

  modal.ariaHidden = "true";
  if (modalOverlay) modalOverlay.ariaHidden = "true";

  unlockScroll(_modalAnimationDuration);
  removeModal(modal);

  if (_activeModalTrigger) {
    _activeModalTrigger.focus();
    _activeModalTrigger.removeAttribute("aria-current");
    _activeModalTrigger = null;
  }
}

export function openModal(key: string, trigger: HTMLElement | null = null) {
  const onCloseController = new AbortController();

  if (_activeModalTrigger) {
    const triggerKey = _activeModalTrigger.getAttribute(
      getAttrFromSelector(SelectorMap.ModalTrigger),
    );

    if (triggerKey === key) {
      onCloseController.abort();

      return;
    }
  }

  const openedModals = document.querySelectorAll<HTMLElement>(
    `[${getAttrFromSelector(SelectorMap.ModalRoot)}]:not([aria-hidden=true])`,
  );

  if (openedModals.length) {
    openedModals.forEach((modal) => {
      modal.ariaHidden = "true";
      removeModal(modal);
    });
  } else {
    _activeModalTrigger = trigger;
    if (trigger) trigger.ariaCurrent = "true";
    lockScroll();
  }

  const template = document.getElementById(key) as HTMLTemplateElement | null;

  if (!template) return;

  const templateContent = template.content.cloneNode(true) as HTMLElement;

  const root = templateContent.querySelector<HTMLElement>(
    SelectorMap.ModalRoot,
  );
  if (!root) return;

  const wrapper = root.querySelector<HTMLElement>(SelectorMap.ModalWrapper);

  const autofocus = root.querySelector<HTMLElement>(
    "[autofocus]:not([disabled])",
  );
  const focusGuard = root.querySelector<HTMLElement>(SelectorMap.FocusGuard);
  const focusable = Array.from(
    root.querySelectorAll<HTMLElement>(SelectorMap.AnyFocusableNode),
  );

  root.style.animationDuration = _modalAnimationDuration + "ms";
  root.style.transitionDuration = _modalAnimationDuration + "ms";

  if (wrapper) {
    wrapper.style.animationDuration = _modalAnimationDuration + "ms";
    wrapper.style.transitionDuration = _modalAnimationDuration + "ms";
  }

  if (trigger) {
    const attrProps = trigger.getAttribute("data-modal-props");
    if (attrProps) {
      const props = parseJSONWidthQuotes(attrProps);
      Object.entries(props).forEach(([key, value]) => {
        const el = root.querySelector<HTMLElement>(`${key}:not(input)`);
        const input = root.querySelector<HTMLInputElement>(`input${key}`);
        if (el) {
          if (value != "undefined") {
            if (key.includes("href") && "href" in el) el.href = String(value);
            else el.textContent = String(value);
          } else {
            const parent =
              el.closest("[data-parent-to-remove]") ?? el.parentElement;
            if (parent) {
              parent.remove();
              wrapper?.setAttribute("data-layout-changed", "true");
            }
          }
        }
        if (input) {
          if (key.includes("input-name")) input.name = String(value);
          else input.value = String(value);
        }
        if (key.includes("form-submitter-replacer")) {
          Object.entries(value as Record<string, string>).forEach(
            ([formSelector, replacerKey]) => {
              const form = root.querySelector<HTMLFormElement>(formSelector);
              if (!form) return;
              handleFormSubmitterReplacer(
                form,
                replacerKey,
                (replacer, submitter) => {
                  const counter = form.querySelector(SelectorMap.CounterInput);
                  counter?.addEventListener("counter:change", () => {
                    replacer.setAttribute("aria-hidden", "true");
                    submitter.setAttribute("aria-hidden", "false");
                  });
                },
              );
            },
          );
        }
        if (key.includes("el-set-attr")) {
          Object.entries(
            value as Record<string, { attr: string; value: string }>,
          ).forEach(([selector, { attr, value }]) => {
            const el = root.querySelector<HTMLElement>(selector);
            if (el) el.setAttribute(attr, value);
          });
        }
      });
    }
  }

  root.addEventListener(
    "pointerdown",
    (event) => {
      if (!(event.target as HTMLElement).closest(SelectorMap.ModalWrapper)) {
        closeModal(key);
        onCloseController.abort();
      }
    },
    { signal: onCloseController.signal },
  );

  // Delay an event in the event loop to handle an enter key down event on an html element like svg
  setTimeout(() => {
    document.addEventListener(
      "click",
      (event) => {
        const closeTrigger = (event.target as HTMLElement).closest(
          SelectorMap.ModalClose,
        );
        if (closeTrigger) {
          const closeTriggerKey = closeTrigger.getAttribute(
            getAttrFromSelector(SelectorMap.ModalClose),
          );
          closeModal(
            closeTriggerKey && closeTriggerKey !== "" ? closeTriggerKey : key,
          );
          onCloseController.abort();
        }
      },
      { signal: onCloseController.signal },
    );
  }, 0);

  if (modalOverlay) {
    modalOverlay.ariaHidden = "false";
    modalOverlay.style.animationDuration = _modalAnimationDuration + "ms";
    modalOverlay.style.transitionDuration = _modalAnimationDuration + "ms";
  }

  focusable[0]?.addEventListener(
    "blur",
    (event) => {
      if (
        event.relatedTarget &&
        !(event.relatedTarget as HTMLElement).closest(
          SelectorMap.ModalWrapper,
        ) &&
        !root.ariaHidden
      ) {
        Array.from(
          root.querySelectorAll<HTMLElement>(SelectorMap.AnyFocusableNode),
        )
          .at(-2)
          ?.focus();
      }
    },
    { signal: onCloseController.signal },
  );

  if (focusGuard)
    focusGuard.addEventListener(
      "focus",
      () => {
        focusable[0]?.focus();
      },
      { signal: onCloseController.signal },
    );

  document.body.appendChild(templateContent);

  (autofocus ?? focusable[0])?.focus({ preventScroll: true });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.code === "Escape") {
        closeModal(key);
        onCloseController.abort();
      }
    },
    { signal: onCloseController.signal },
  );
}
