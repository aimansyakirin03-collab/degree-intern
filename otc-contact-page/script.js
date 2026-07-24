"use strict";

const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const currentYear = document.getElementById("currentYear");

const chatToggle = document.getElementById("chatToggle");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const chatBody = document.getElementById("chatBody");
const chatQuestions = document.querySelectorAll(".chat-question");

const faqAccordions = document.querySelectorAll(".faq-accordion");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (contactForm && formMessage) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const submitButton = contactForm.querySelector(".submit-button");

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    window.setTimeout(function () {
      formMessage.textContent =
        "Thank you. Your enquiry has been received. Our team will contact you within 24 hours.";

      submitButton.disabled = false;
      submitButton.textContent = "Get Free Consultation";

      contactForm.reset();
    }, 700);
  });
}

function openChat() {
  chatBox.classList.add("open");
  chatBox.setAttribute("aria-hidden", "false");
  chatToggle.setAttribute("aria-expanded", "true");
}

function closeChatBox() {
  chatBox.classList.remove("open");
  chatBox.setAttribute("aria-hidden", "true");
  chatToggle.setAttribute("aria-expanded", "false");
}

if (chatToggle && chatBox) {
  chatToggle.addEventListener("click", function () {
    const isOpen = chatBox.classList.contains("open");

    if (isOpen) {
      closeChatBox();
    } else {
      openChat();
    }
  });
}

if (closeChat) {
  closeChat.addEventListener("click", closeChatBox);
}

chatQuestions.forEach(function (button) {
  button.addEventListener("click", function () {
    const question = button.dataset.question;
    const answer = button.dataset.answer;

    const userMessage = document.createElement("div");
    userMessage.className = "message user-message";
    userMessage.textContent = question;

    const botMessage = document.createElement("div");
    botMessage.className = "message bot-message";
    botMessage.textContent = answer;

    chatBody.insertBefore(userMessage, document.querySelector(".quick-questions"));

    window.setTimeout(function () {
      chatBody.insertBefore(
        botMessage,
        document.querySelector(".quick-questions")
      );

      chatBody.scrollTop = chatBody.scrollHeight;
    }, 300);
  });
});

faqAccordions.forEach(function (button) {
  button.addEventListener("click", function () {
    const faqItem = button.closest(".faq-item");
    const faqPanel = faqItem.querySelector(".faq-panel");
    const isOpen = faqItem.classList.contains("open");

    faqAccordions.forEach(function (otherButton) {
      const otherItem = otherButton.closest(".faq-item");
      const otherPanel = otherItem.querySelector(".faq-panel");

      otherItem.classList.remove("open");
      otherButton.setAttribute("aria-expanded", "false");
      otherPanel.style.maxHeight = null;
    });

    if (!isOpen) {
      faqItem.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      faqPanel.style.maxHeight = `${faqPanel.scrollHeight}px`;
    }
  });
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeChatBox();
  }
});
