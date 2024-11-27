import { SelectorMap } from "./constants";

export function setCartCounter(value: string) {
  const cartCounter = document.querySelector(SelectorMap.CartCounter);

  if (!cartCounter) return;

  const isCartCounterHidden = cartCounter.ariaHidden === "true";

  if (isCartCounterHidden) cartCounter.ariaHidden = "false";

  cartCounter.textContent = value;
}
