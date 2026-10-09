"use strict";
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if (currentYear) currentYear.textContent = new Date().getFullYear();
function closeMenu() {
  if (!menuToggle || !navLinks) return;
  navLinks.classList.remove("open"); menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false"); menuToggle.setAttribute("aria-label", "Open navigation");
}
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () { const open = navLinks.classList.toggle("open"); menuToggle.classList.toggle("open", open); menuToggle.setAttribute("aria-expanded", String(open)); menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation"); });
  navLinks.querySelectorAll("a").forEach(function (link) { link.addEventListener("click", closeMenu); });
  document.addEventListener("click", function (event) { if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape" && navLinks.classList.contains("open")) { const focusInside = navLinks.contains(document.activeElement); closeMenu(); if (focusInside) menuToggle.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth > 860) closeMenu(); });
}
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
const galleryFilters = Array.from(document.querySelectorAll(".gallery-filter"));
const searchInput = document.getElementById("gallerySearch");
const galleryCount = document.getElementById("galleryCount");
const galleryEmpty = document.getElementById("galleryEmpty");
const galleryGrid = document.getElementById("galleryGrid");
const galleryReset = document.getElementById("galleryReset");
let selectedCategory = "all";
function updateGallery() {
  const words = searchInput.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;
  galleryItems.forEach(function (item) {
    const text = (item.textContent + " " + item.dataset.alt).toLocaleLowerCase();
    item.hidden = !((selectedCategory === "all" || item.dataset.category === selectedCategory) && words.every(function (word) { return text.includes(word); }));
    const tile = item.closest(".gallery-tile");
    if (tile) tile.hidden = item.hidden;
    if (!item.hidden) visible += 1;
  });
  galleryCount.textContent = visible + (visible === 1 ? " highlight" : " highlights");
  galleryEmpty.hidden = visible !== 0;
  galleryGrid.classList.toggle("filtered", words.length > 0 || selectedCategory !== "all");
  galleryFilters.forEach(function (filter) { filter.setAttribute("aria-pressed", String(filter.dataset.filter === selectedCategory)); });
}
if (searchInput && galleryCount && galleryEmpty && galleryGrid && galleryReset) {
  document.querySelectorAll(".gallery-control").forEach(function (control) { control.hidden = false; });
  searchInput.addEventListener("input", updateGallery);
  galleryFilters.forEach(function (filter) { filter.addEventListener("click", function () { selectedCategory = filter.dataset.filter; updateGallery(); }); });
  galleryReset.addEventListener("click", function () { selectedCategory = "all"; searchInput.value = ""; updateGallery(); searchInput.focus(); });
  updateGallery();
}
const viewer = document.getElementById("galleryDialog");
const viewerImage = document.getElementById("viewerImage");
const viewerTitle = document.getElementById("viewerTitle");
const viewerCaption = document.getElementById("viewerCaption");
const viewerPosition = document.getElementById("viewerPosition");
const viewerClose = document.getElementById("viewerClose");
const viewerPrevious = document.getElementById("viewerPrevious");
const viewerNext = document.getElementById("viewerNext");
const viewerStage = document.getElementById("viewerStage");
const viewerFeedback = document.getElementById("viewerFeedback");
const viewerStatus = document.getElementById("viewerStatus");
const viewerRetry = document.getElementById("viewerRetry");
let imageRequest = 0;
let viewerItems = [];
let viewerIndex = 0;
let viewerTrigger = null;
if (viewer && typeof viewer.showModal === "function" && viewerImage && viewerTitle && viewerCaption && viewerPosition && viewerClose && viewerPrevious && viewerNext) {
  function loadImage(item) {
    const request = ++imageRequest;
    viewerImage.hidden = true;
    if (viewerStage) viewerStage.setAttribute("aria-busy", "true");
    if (viewerFeedback) viewerFeedback.hidden = false;
    if (viewerStatus) viewerStatus.textContent = "Loading workshop photo…";
    if (viewerRetry) viewerRetry.hidden = true;
    // A separate request prevents a previous photo's response changing the current view.
    const photo = new Image();
    photo.onload = function () {
      if (request !== imageRequest) return;
      viewerImage.src = photo.src; viewerImage.hidden = false;
      if (viewerStage) viewerStage.setAttribute("aria-busy", "false");
      if (viewerFeedback) viewerFeedback.hidden = true;
      if (viewerStatus) viewerStatus.textContent = "Photo loaded.";
    };
    photo.onerror = function () {
      if (request !== imageRequest) return;
      if (viewerStage) viewerStage.setAttribute("aria-busy", "false");
      if (viewerStatus) viewerStatus.textContent = "This photo could not load. Try again or choose another highlight.";
      if (viewerRetry) viewerRetry.hidden = false;
    };
    photo.src = item.getAttribute("href");
  }
  if (viewerRetry) viewerRetry.addEventListener("click", function () { loadImage(viewerItems[viewerIndex]); });
  function displayImage(index) {
    viewerIndex = (index + viewerItems.length) % viewerItems.length;
    const item = viewerItems[viewerIndex];
    viewerImage.alt = item.dataset.alt; loadImage(item);
    viewerTitle.textContent = item.dataset.title; viewerCaption.textContent = item.dataset.caption;
    viewerPosition.textContent = (viewerIndex + 1) + " of " + viewerItems.length;
    viewerPrevious.disabled = viewerItems.length < 2; viewerNext.disabled = viewerItems.length < 2;
  }
  galleryItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); viewerTrigger = item; viewerItems = galleryItems.filter(function (card) { return !card.hidden; });
      const index = viewerItems.indexOf(item); if (index < 0) return;
      displayImage(index); viewer.showModal(); document.body.classList.add("gallery-open"); viewerClose.focus();
    });
  });
  viewerClose.addEventListener("click", function () { viewer.close(); });
  viewerPrevious.addEventListener("click", function () { displayImage(viewerIndex - 1); });
  viewerNext.addEventListener("click", function () { displayImage(viewerIndex + 1); });
  viewer.addEventListener("keydown", function (event) { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); displayImage(viewerIndex + (event.key === "ArrowRight" ? 1 : -1)); } });
  viewer.addEventListener("click", function (event) { if (event.target !== viewer) return; const box = viewer.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close(); });
  viewer.addEventListener("close", function () { imageRequest += 1; document.body.classList.remove("gallery-open"); if (viewerTrigger) viewerTrigger.focus(); });
}
if (backToTop) {
  function updateScrollButton() { backToTop.classList.toggle("visible", window.scrollY > 500); }
  updateScrollButton(); window.addEventListener("scroll", updateScrollButton, { passive: true });
  backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" }); });
}
