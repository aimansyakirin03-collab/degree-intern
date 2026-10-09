"use strict";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (currentYear) currentYear.textContent = new Date().getFullYear();

function closeMenu() {
  if (!menuToggle || !navLinks) return;
  menuToggle.classList.remove("open");
  navLinks.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    const open = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  navLinks.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
  document.addEventListener("click", function (event) {
    if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navLinks.classList.contains("open")) {
      const focusWasInside = navLinks.contains(document.activeElement);
      closeMenu();
      if (focusWasInside) menuToggle.focus();
    }
  });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) closeMenu(); });
}

const goalButtons = Array.from(document.querySelectorAll(".goal-button"));
const programmes = Array.from(document.querySelectorAll(".programme-card"));
const programmeCount = document.getElementById("programmeCount");
const goalBar = document.getElementById("goalBar");
if (goalBar && programmeCount && goalButtons.length) {
  goalBar.hidden = false;
  goalButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      let count = 0;
      programmes.forEach(function (card) {
        card.hidden = button.dataset.goal !== "all" && card.dataset.goal !== button.dataset.goal;
        if (!card.hidden) {
          // Newly filtered content must not wait for a scroll animation.
          card.classList.add("visible");
          count += 1;
        }
      });
      goalButtons.forEach(function (other) { other.setAttribute("aria-pressed", String(other === button)); });
      programmeCount.textContent = `${count} ${count === 1 ? "learning area" : "learning areas"}`;
    });
  });
}

const reveals = document.querySelectorAll(".reveal");
function showAllContent() {
  document.documentElement.classList.remove("motion-enabled");
  reveals.forEach(function (element) { element.classList.add("visible"); });
}
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  reveals.forEach(function (element) { observer.observe(element); });
  document.documentElement.classList.add("motion-enabled");
} else {
  showAllContent();
}
if (typeof reducedMotion.addEventListener === "function") {
  reducedMotion.addEventListener("change", function () { if (reducedMotion.matches) showAllContent(); });
}
if (backToTop) {
  function updateScrollButton() { backToTop.classList.toggle("visible", window.scrollY > 500); }
  updateScrollButton();
  window.addEventListener("scroll", updateScrollButton, { passive: true });
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
  });
}

// Native dialog supplies modal keyboard focus and Escape handling. Plain image links remain the fallback.
const showcaseLinks = Array.from(document.querySelectorAll(".showcase-link"));
const showcaseDialog = document.getElementById("showcaseDialog");
const showcaseImage = document.getElementById("showcaseImage");
const showcaseCaption = document.getElementById("showcaseDialogCaption");
const showcasePosition = document.getElementById("showcasePosition");
const showcaseClose = document.getElementById("showcaseClose");
const showcasePrevious = document.getElementById("showcasePrevious");
const showcaseNext = document.getElementById("showcaseNext");
let showcaseIndex = 0;
let showcaseTrigger = null;

if (showcaseDialog && typeof showcaseDialog.showModal === "function" && showcaseLinks.length && showcaseImage && showcaseCaption && showcasePosition && showcaseClose && showcasePrevious && showcaseNext) {
  function showWorkshop(index) {
    showcaseIndex = (index + showcaseLinks.length) % showcaseLinks.length;
    const link = showcaseLinks[showcaseIndex];
    showcaseImage.src = link.getAttribute("href");
    showcaseImage.alt = link.dataset.alt;
    showcaseCaption.textContent = link.dataset.caption;
    showcasePosition.textContent = (showcaseIndex + 1) + " of " + showcaseLinks.length;
  }
  showcaseLinks.forEach(function (link, index) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      showcaseTrigger = link;
      showWorkshop(index);
      showcaseDialog.showModal();
      document.body.classList.add("showcase-open");
      showcaseClose.focus();
    });
  });
  showcaseClose.addEventListener("click", function () { showcaseDialog.close(); });
  showcasePrevious.addEventListener("click", function () { showWorkshop(showcaseIndex - 1); });
  showcaseNext.addEventListener("click", function () { showWorkshop(showcaseIndex + 1); });
  showcaseDialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showWorkshop(showcaseIndex + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  showcaseDialog.addEventListener("click", function (event) {
    if (event.target !== showcaseDialog) return;
    const bounds = showcaseDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) showcaseDialog.close();
  });
  showcaseDialog.addEventListener("close", function () {
    document.body.classList.remove("showcase-open");
    if (showcaseTrigger) showcaseTrigger.focus();
  });
}
