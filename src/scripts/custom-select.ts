import { SelectorMap } from "./constants";
import { getAttrFromSelector } from "./utils";

let _activeCustomSelectKey: string | null = null;

function getCustomSelectSelectorWithKey(key: string) {
  return `[${getAttrFromSelector(SelectorMap.CustomSelect)}='${key}']`;
}

function closeCustomSelect(key: string) {
  const customSelect = document.querySelector<HTMLDivElement>(
    getCustomSelectSelectorWithKey(key),
  );

  if (!customSelect) return;

  const trigger = customSelect.querySelector<HTMLButtonElement>(
    SelectorMap.CustomSelectTrigger,
  );
  const content = customSelect.querySelector<HTMLDivElement>(
    SelectorMap.CustomSelectContent,
  );

  if (!trigger || !content) return;

  trigger.ariaExpanded = "false";
  content.ariaHidden = "true";

  _activeCustomSelectKey = null;
}

export function openCustomSelect(trigger: HTMLButtonElement) {
  const controller = new AbortController();
  const container = trigger.closest<HTMLDivElement>(SelectorMap.CustomSelect);

  if (!container) return;

  let key = container.getAttribute(
    getAttrFromSelector(SelectorMap.CustomSelect),
  );

  if (key && _activeCustomSelectKey === key) {
    closeCustomSelect(key);
    return;
  }

  if (key === "")
    container.setAttribute(
      getAttrFromSelector(SelectorMap.CustomSelect),
      (key = crypto.randomUUID()),
    );

  const content = container.querySelector<HTMLDivElement>(
    SelectorMap.CustomSelectContent,
  );

  if (!content) return;

  trigger.ariaExpanded = "true";
  content.ariaHidden = "false";

  _activeCustomSelectKey = key;

  document.addEventListener(
    "click",
    (event) => {
      if (
        !(event.target as HTMLElement).closest(
          getCustomSelectSelectorWithKey(key!),
        )
      ) {
        closeCustomSelect(key!);
        controller.abort();
      }
    },
    { signal: controller.signal },
  );
}
