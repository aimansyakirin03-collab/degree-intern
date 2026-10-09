"use strict";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const reveals = document.querySelectorAll(".reveal");
const stats = document.querySelectorAll(".stat strong[data-target]");
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
  if (event.key === "Escape") closeMenu();
});

function showStat(element) {
  const target = Number(element.dataset.target);
  const suffix = element.dataset.suffix || "";
  element.textContent = `${target.toLocaleString()}${suffix}`;
}

function animateStat(element) {
  const target = Number(element.dataset.target);
  const suffix = element.dataset.suffix || "";
  const duration = 1300;
  const startTime = performance.now();

  function update(now) {
    if (prefersReducedMotion.matches) {
      showStat(element);
      return;
    }

    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(target * eased);
    element.textContent = `${value.toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  if (prefersReducedMotion.matches) {
    showStat(element);
    return;
  }
  requestAnimationFrame(update);
}

function showContentWithoutAnimation() {
  reveals.forEach(function (element) {
    element.classList.add("visible");
  });
  stats.forEach(showStat);
}

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach(function (element) {
    revealObserver.observe(element);
  });

  const statObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateStat(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.7 }
  );

  stats.forEach(function (stat) {
    statObserver.observe(stat);
  });
} else {
  showContentWithoutAnimation();
}

if (typeof prefersReducedMotion.addEventListener === "function") {
  prefersReducedMotion.addEventListener("change", function () {
    if (prefersReducedMotion.matches) showContentWithoutAnimation();
  });
}
