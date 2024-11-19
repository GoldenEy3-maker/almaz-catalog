import { z } from "zod";
import { SelectorMap } from "./constants";
import { getAttrFromSelector, getRandomIntInclusive } from "./utils";

type SuggestionsMenuStore = {
  action: string | null;
  menu: HTMLElement | null;
  menuContainer: HTMLElement | null;
  item: HTMLTemplateElement | null;
  empty: HTMLTemplateElement | null;
  allResultsBtn: HTMLButtonElement | null;
  fetchDebounceTimeoutId: NodeJS.Timeout | null;
};

const SuggestionsDataSchema = z.object({
  id: z.string(),
  title: z.string(),
});

const _suggestionsMenuStore: SuggestionsMenuStore = {
  action: null,
  menu: null,
  menuContainer: null,
  item: null,
  empty: null,
  allResultsBtn: null,
  fetchDebounceTimeoutId: null,
};

function getSuggestionsAction(input: HTMLInputElement) {
  const action = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsAction),
  );
  if (!action || action === "")
    throw new Error("Suggestions input must have filled action attr");
  _suggestionsMenuStore.action = action;
  return action;
}

function getSuggestionsMenu(input: HTMLInputElement) {
  const menuRef = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsMenu),
  );
  if (!menuRef || menuRef === "")
    throw new Error("Suggestions input must have filled menu attr");
  const menu = document.getElementById(menuRef);
  if (!menu) throw new Error("Cannot find suggetions menu by given ref");
  _suggestionsMenuStore.menu = menu;
  return menu;
}

function getSuggestionsMenuContainer(input: HTMLInputElement) {
  const containerRef = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsMenuContainer),
  );
  if (!containerRef || containerRef === "")
    throw new Error("Suggestions input must have filled menu container attr");
  const container = document.getElementById(containerRef);
  if (!container)
    throw new Error("Cannot find suggetions menu container by given ref");
  _suggestionsMenuStore.menuContainer = container;
  return container;
}

function getSuggestionsMenuItem(input: HTMLInputElement) {
  const itemRef = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsMenuItem),
  );
  if (!itemRef || itemRef === "")
    throw new Error("Suggestions input must have filled menu item attr");
  const item = document.querySelector<HTMLTemplateElement>(`#${itemRef}`);
  if (!item) throw new Error("Cannot find suggetions menu item by given ref");
  _suggestionsMenuStore.item = item;
  return item;
}

function getSuggestionsMenuEmpty(input: HTMLInputElement) {
  const emptyRef = input.getAttribute(
    getAttrFromSelector(SelectorMap.SuggestionsMenuEmpty),
  );
  if (!emptyRef || emptyRef === "")
    throw new Error("Suggestions input must have filled menu empty attr");
  const empty = document.querySelector<HTMLTemplateElement>(`#${emptyRef}`);
  if (!empty) throw new Error("Cannot find suggetions menu empty by given ref");
  _suggestionsMenuStore.empty = empty;
  return empty;
}

function getSuggestionsMenuAllResultsBtn(menu: HTMLElement) {
  const btn = menu.querySelector<HTMLButtonElement>(
    SelectorMap.SuggestionsAllResults,
  );
  _suggestionsMenuStore.allResultsBtn = btn;
  return btn;
}

function clearSuggestionsMenuContainer(input: HTMLInputElement) {
  const menuContainer =
    _suggestionsMenuStore.menuContainer ?? getSuggestionsMenuContainer(input);
  const menu = _suggestionsMenuStore.menu ?? getSuggestionsMenu(input);
  const allResultsBtn =
    _suggestionsMenuStore.allResultsBtn ??
    getSuggestionsMenuAllResultsBtn(menu);

  allResultsBtn?.setAttribute("aria-hidden", "false");
  menuContainer.innerHTML = "";
}

export function suggestionsFocusHandler(input: HTMLInputElement) {
  const controller = new AbortController();
  const menu = _suggestionsMenuStore.menu ?? getSuggestionsMenu(input);
  const isInputEmpty = input.value !== "";

  if (isInputEmpty) menu.ariaHidden = "false";

  // Click outside handler
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as HTMLElement;
      const isTargetClosestToMenu = target.closest(`#${menu.id}`);
      const isTargetClosestToInput = target.closest(
        `[${getAttrFromSelector(SelectorMap.SuggestionsAction)}='${getSuggestionsAction(input)}']`,
      );

      if (isInputEmpty && (isTargetClosestToMenu || isTargetClosestToInput)) {
        menu.ariaHidden = "false";
      } else {
        menu.ariaHidden = "true";
        if (isInputEmpty) controller.abort();
      }
    },
    { signal: controller.signal },
  );
}

export function suggestionsBlurHandler(
  input: HTMLInputElement,
  relatedTarget: HTMLElement | null,
) {
  const controller = new AbortController();
  const menu = _suggestionsMenuStore.menu ?? getSuggestionsMenu(input);

  menu.addEventListener(
    "focusout",
    (event) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;

      if (relatedTarget && !relatedTarget.closest(`#${menu.id}`)) {
        menu.ariaHidden = "true";
        controller.abort();
      }
    },
    { signal: controller.signal },
  );

  if (relatedTarget && !relatedTarget.closest(`#${menu.id}`))
    menu.ariaHidden = "true";
}

export function suggestionsInputHandler(input: HTMLInputElement) {
  const action = _suggestionsMenuStore.action ?? getSuggestionsAction(input);
  const menu = _suggestionsMenuStore.menu ?? getSuggestionsMenu(input);
  const menuContainer =
    _suggestionsMenuStore.menuContainer ?? getSuggestionsMenuContainer(input);
  const itemTemplate =
    _suggestionsMenuStore.item ?? getSuggestionsMenuItem(input);
  const emptyTemplate =
    _suggestionsMenuStore.empty ?? getSuggestionsMenuEmpty(input);
  const allResultsBtn =
    _suggestionsMenuStore.allResultsBtn ??
    getSuggestionsMenuAllResultsBtn(menu);

  if (_suggestionsMenuStore.fetchDebounceTimeoutId) {
    clearTimeout(_suggestionsMenuStore.fetchDebounceTimeoutId);
    _suggestionsMenuStore.fetchDebounceTimeoutId = null;
  }

  if (input.value === "") {
    menu.ariaHidden = "true";
    return;
  }

  _suggestionsMenuStore.fetchDebounceTimeoutId = setTimeout(async () => {
    try {
      // const res = await fetch(`${action}?${input.name ?? "q"}=${input.value}`);
      // if (!res.ok) throw new Error(res.statusText);
      // const data = (await res.json()) as z.infer<
      //   typeof SuggestionsDataSchema
      // >[];
      const data = [
        { id: "1", title: "Болт М12-6gx80 (S18) ГОСТ 7798-70" },
        { id: "2", title: "Болт М12x1,25-6gx90 ГОСТ 7798-70" },
        { id: "3", title: "Болт М8 - 6g  20.58.019" },
        { id: "4", title: "Болт М12-6gx80 (S18) ГОСТ 7798-70" },
        { id: "5", title: "Болт М12x1,25-6gx90 ГОСТ 7798-70" },
      ] as z.infer<typeof SuggestionsDataSchema>[];

      const randomData = data.slice(0, getRandomIntInclusive(0, 5));

      clearSuggestionsMenuContainer(input);

      if (randomData.length) {
        randomData.forEach((item) => {
          const resolvedItem = SuggestionsDataSchema.parse(item);

          const templateContent = itemTemplate.content.cloneNode(true);

          const link = templateContent.firstChild as HTMLAnchorElement;
          link.href += `?id=${resolvedItem.id}`;
          link.textContent = resolvedItem.title;

          menuContainer.appendChild(link);
        });
      } else {
        const templateContent = emptyTemplate.content.cloneNode(true);
        menuContainer.appendChild(templateContent);
        allResultsBtn?.setAttribute("aria-hidden", "true");
      }

      menu.ariaHidden = "false";
    } catch (error) {
      console.error(error);
    }
  }, 350);
}
