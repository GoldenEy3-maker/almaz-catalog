export function lockScroll() {
  document.body.style.setProperty(
    "--scrollbar-width",
    window.innerWidth - document.body.offsetWidth + "px",
  );
  document.body.classList.add("lock-scroll");
}

export function unlockScroll(delay = 0) {
  setTimeout(() => {
    document.body.classList.remove("lock-scroll");
  }, delay);
}

export function getAttrFromSelector(selector: string) {
  return selector.replace(/^\[|\]/g, "");
}

export function parseJSONWidthQuotes(value: string) {
  return JSON.parse(value.replace(/&quot;/gi, '"'));
}
