import { SelectorMap } from "./constants";

export function incrementCartCounter() {
  const cartCounter = document.querySelector(SelectorMap.CartCounter);
  if (!cartCounter) return;
  const cartCounterValue = cartCounter.textContent;
  const isCartCounterHidden = cartCounter.ariaHidden === "true";

  if (isCartCounterHidden) cartCounter.ariaHidden = "false";

  if (cartCounterValue) cartCounter.textContent = String(+cartCounterValue + 1);
  else cartCounter.textContent = "1";
}
