"use strict";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const searchInput = document.getElementById("newsSearch");
const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
const cards = Array.from(document.querySelectorAll(".news-card"));
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");
const resetFilters = document.getElementById("resetFilters");
let activeCategory = "all";

if (currentYear) currentYear.textContent = new Date().getFullYear();

function closeMenu() {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
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
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) closeMenu();
  });
}

// Search and category selection work together; every card remains readable without JavaScript.
function updateResults() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  cards.forEach(function (card) {
    const matchesCategory = activeCategory === "all" || card.dataset.category === activeCategory;
    const searchableText = card.textContent.toLocaleLowerCase();
    const matchesSearch = words.every(function (word) { return searchableText.includes(word); });
    card.hidden = !(matchesCategory && matchesSearch);
    if (!card.hidden) visibleCount += 1;
  });
  resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? "update" : "updates"}`;
  emptyState.hidden = visibleCount !== 0;
  filterButtons.forEach(function (button) {
    const selected = button.dataset.filter === activeCategory;
    button.setAttribute("aria-pressed", String(selected));
  });
}

if (searchInput && resultCount && emptyState) {
  searchInput.addEventListener("input", updateResults);
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeCategory = button.dataset.filter;
      updateResults();
    });
  });
  if (resetFilters) resetFilters.addEventListener("click", function () {
    activeCategory = "all";
    searchInput.value = "";
    updateResults();
    searchInput.focus();
  });
  document.querySelectorAll(".news-control").forEach(function (control) { control.hidden = false; });
  updateResults();
}

// Official post images have a branded fallback if the source is unavailable.
document.querySelectorAll(".post-image").forEach(function (image) {
  function showFallback() { image.hidden = true; }
  image.addEventListener("error", showFallback);
  if (image.complete && image.naturalWidth === 0) showFallback();
});

if (backToTop) {
  function updateBackToTop() { backToTop.classList.toggle("visible", window.scrollY > 500); }
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: motionPreference.matches ? "auto" : "smooth" });
  });
}
