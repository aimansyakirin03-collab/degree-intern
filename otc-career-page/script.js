"use strict";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const reveals = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

function updateBackToTopVisibility() {
  if (!backToTop) return;
  backToTop.classList.toggle("visible", window.scrollY > 500);
}

if (backToTop) {
  updateBackToTopVisibility();
  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });

  backToTop.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });
  });
}

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
}

document.addEventListener("click", function (event) {
  if (
    navLinks &&
    menuToggle &&
    !navLinks.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    closeMenu();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    const focusInMenu = navLinks && navLinks.contains(document.activeElement);
    closeMenu();
    if (focusInMenu && menuToggle) menuToggle.focus();
  }
});

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible"); observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  reveals.forEach(function (element) { revealObserver.observe(element); });
} else {
  reveals.forEach(function (element) { element.classList.add("visible"); });
}

document.querySelectorAll(".faq-item").forEach(function (item, index) {
  const button = item.querySelector(".faq-question");
  if (!button) return;

  if (index === 0) {
    item.classList.add("open");
    button.setAttribute("aria-expanded", "true");
  }

  button.addEventListener("click", function () {
    const isOpen = item.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
});

// Reset the mobile menu when returning to the desktop layout.
window.addEventListener("resize", function () { if (window.innerWidth > 860) closeMenu(); });
