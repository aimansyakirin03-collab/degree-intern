"use strict";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
const searchInput = document.getElementById("programmeSearch");
const filters = Array.from(document.querySelectorAll(".category-filter"));
const cards = Array.from(document.querySelectorAll(".learning-card"));
const count = document.getElementById("learningCount");
const empty = document.getElementById("catalogueEmpty");
const reset = document.getElementById("resetCatalogue");
let selectedCategory = "all";
const searchExpansionState = new WeakMap();
function updateCatalogue() {
  const words = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let visibleCount = 0;
  cards.forEach(function (card) {
    const categoryMatches = selectedCategory === "all" || card.dataset.category === selectedCategory;
    const text = card.textContent.toLocaleLowerCase();
    card.hidden = !(categoryMatches && words.every(function (word) { return text.includes(word); }));
    const exampleList = card.querySelector(".course-examples");
    if (exampleList) {
      const exampleMatches = words.length > 0 && !card.hidden && Array.from(exampleList.querySelectorAll("li")).some(function (example) {
        const exampleText = example.textContent.toLocaleLowerCase();
        return words.every(function (word) { return exampleText.includes(word); });
      });
      if (exampleMatches) {
        if (!searchExpansionState.has(exampleList)) searchExpansionState.set(exampleList, exampleList.open);
        exampleList.open = true;
      } else if (searchExpansionState.has(exampleList)) {
        exampleList.open = searchExpansionState.get(exampleList);
        searchExpansionState.delete(exampleList);
      }
    }
    if (!card.hidden) visibleCount += 1;
  });
  count.textContent = `${visibleCount} ${visibleCount === 1 ? "learning area" : "learning areas"}`;
  empty.hidden = visibleCount !== 0;
  filters.forEach(function (filter) { filter.setAttribute("aria-pressed", String(filter.dataset.filter === selectedCategory)); });
}
if (searchInput && count && empty && reset) {
  document.querySelectorAll(".catalogue-control").forEach(function (control) { control.hidden = false; });
  searchInput.addEventListener("input", updateCatalogue);
  filters.forEach(function (filter) {
    filter.addEventListener("click", function () { selectedCategory = filter.dataset.filter; updateCatalogue(); });
  });
  reset.addEventListener("click", function () { selectedCategory = "all"; searchInput.value = ""; updateCatalogue(); searchInput.focus(); });
  updateCatalogue();
}
// Compare published start dates against the calendar date in Malaysia, rather than the visitor's timezone.
function malaysiaDate(now) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  function part(type) { return parts.find(function (item) { return item.type === type; }).value; }
  return `${part("year")}-${part("month")}-${part("day")}`;
}
const sessions = Array.from(document.querySelectorAll(".session-card[data-start]"));
const scheduleEmpty = document.getElementById("scheduleEmpty");
const publicSearch = document.getElementById("publicSearch");
const publicMonth = document.getElementById("publicMonth");
const publicDelivery = document.getElementById("publicDelivery");
const publicCount = document.getElementById("publicCount");
const publicFilters = document.getElementById("publicFilters");
const resetPublic = document.getElementById("resetPublic");
const publicFilterToolbar = document.getElementById("publicFilterToolbar");
const publicFilterToggle = document.getElementById("publicFilterToggle");
const publicFilterActive = document.getElementById("publicFilterActive");
const publicQuickReset = document.getElementById("publicQuickReset");
const emptyTitle = document.getElementById("scheduleEmptyTitle");
const emptyText = document.getElementById("scheduleEmptyText");
const courseStatus = document.getElementById("courseScheduleStatus");
function updateSessions() {
  const today = malaysiaDate(new Date());
  const query = publicSearch ? publicSearch.value.trim().toLocaleLowerCase() : "";
  const words = query.split(/\s+/).filter(Boolean);
  const month = publicMonth ? publicMonth.value : "all";
  const delivery = publicDelivery ? publicDelivery.value : "all";
  let upcoming = 0;
  let visible = 0;
  sessions.forEach(function (session) {
    const inFuture = session.dataset.start >= today;
    if (inFuture) upcoming += 1;
    const matchesTopic = words.every(function (word) { return session.textContent.toLocaleLowerCase().includes(word); });
    const matchesMonth = month === "all" || session.dataset.month === month;
    const formats = (session.dataset.delivery || "").split(" ");
    const matchesDelivery = delivery === "all" || formats.includes(delivery);
    session.hidden = !(inFuture && matchesTopic && matchesMonth && matchesDelivery);
    if (!session.hidden) visible += 1;
  });
  const filtersApplied = words.length > 0 || month !== "all" || delivery !== "all";
  if (publicFilterActive) publicFilterActive.hidden = !filtersApplied;
  if (publicQuickReset) publicQuickReset.hidden = !filtersApplied;
  if (publicCount) publicCount.textContent = visible + (visible === 1 ? " scheduled course" : " scheduled courses");
  if (scheduleEmpty) scheduleEmpty.hidden = visible !== 0;
  if (emptyTitle) emptyTitle.textContent = upcoming === 0 ? "Explore the current public schedule." : "No matching scheduled courses.";
  if (emptyText) emptyText.textContent = upcoming === 0 ? "These featured sessions have started. Visit OTC’s official schedule for current dates." : "Try a different topic, month or delivery option, or reset the filters.";
  if (courseStatus && courseStatus.dataset.start < today) courseStatus.textContent = "This listed session has started. Ask OTC about the next available date and current fees.";
}
if (publicSearch && publicMonth && publicDelivery && publicFilters && resetPublic) {
  if (publicFilterToolbar && publicFilterToggle) {
    publicFilterToolbar.hidden = false;
    publicFilterToggle.addEventListener("click", function () {
      const open = publicFilterToggle.getAttribute("aria-expanded") !== "true";
      publicFilters.hidden = !open;
      publicFilterToggle.setAttribute("aria-expanded", String(open));
      publicFilterToggle.innerHTML = 'Search &amp; filter courses <span aria-hidden="true">' + (open ? '−' : '+') + '</span>';
      if (open) publicSearch.focus();
    });
    publicFilters.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      publicFilters.hidden = true;
      publicFilterToggle.setAttribute("aria-expanded", "false");
      publicFilterToggle.innerHTML = 'Search &amp; filter courses <span aria-hidden="true">+</span>';
      publicFilterToggle.focus();
    });
    if (publicQuickReset) publicQuickReset.addEventListener("click", function () {
      publicSearch.value = ""; publicMonth.value = "all"; publicDelivery.value = "all";
      updateSessions(); publicFilterToggle.focus();
    });
  } else {
    publicFilters.hidden = false;
  }
  publicSearch.addEventListener("input", updateSessions);
  publicMonth.addEventListener("change", updateSessions);
  publicDelivery.addEventListener("change", updateSessions);
  resetPublic.addEventListener("click", function () { publicSearch.value = ""; publicMonth.value = "all"; publicDelivery.value = "all"; updateSessions(); publicSearch.focus(); });
}
updateSessions();
document.addEventListener("visibilitychange", function () { if (!document.hidden) updateSessions(); });
window.addEventListener("pageshow", updateSessions);
if (backToTop) {
  function updateScrollButton() { backToTop.classList.toggle("visible", window.scrollY > 500); }
  updateScrollButton();
  window.addEventListener("scroll", updateScrollButton, { passive: true });
  backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" }); });
}
