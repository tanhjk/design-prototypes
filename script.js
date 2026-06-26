const rootElement = document.documentElement;

// Hysteresis: enter the collapsed state once the user scrolls past
// `enterThreshold`, but only leave it when they come back above
// `exitThreshold`. The gap between the two prevents the collapse from
// shrinking the page enough to bounce the scroll position back across a
// single threshold, which is what caused the jitter.
const enterThreshold = 150;
const exitThreshold = 50;

let isScrolled = false;
let ticking = false;

function applyScrollState() {
  ticking = false;
  const y = window.scrollY;

    console.log(window.scrollY, isScrolled, window.innerHeight);
  if (!isScrolled && y > enterThreshold) {
    isScrolled = true; 
    rootElement.classList.add("scrolled");
  } else if (isScrolled && y < exitThreshold) {
    isScrolled = false;
 
    rootElement.classList.remove("scrolled");
  }
}

function requestScrollState() {
  if (!ticking) { 
    ticking = true;
    window.requestAnimationFrame(applyScrollState);
  }
}

window.addEventListener("scroll", requestScrollState, { passive: true });
window.addEventListener("resize", requestScrollState, { passive: true });
window.addEventListener("DOMContentLoaded", applyScrollState);
