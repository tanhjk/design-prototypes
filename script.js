const rootElement = document.documentElement;
const scrollThreshold = 80;

function updateScrollState() {
  if (window.scrollY > scrollThreshold) {
    rootElement.classList.add("scrolled");
  } else {
    rootElement.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("DOMContentLoaded", updateScrollState);
