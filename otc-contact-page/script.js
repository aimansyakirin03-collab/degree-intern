"use strict";

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const currentYear = document.getElementById("currentYear");
const backToTop = document.getElementById("backToTop");
const contactForm = document.getElementById("contactForm");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");
const faqAccordions = document.querySelectorAll(".faq-accordion");
const revealElements = document.querySelectorAll(".reveal");

const chatToggle = document.getElementById("chatToggle");
const chatBox = document.getElementById("chatBox");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const chatQuestions = document.querySelectorAll(".chat-question");
const chatWhatsappLink = document.getElementById("chatWhatsappLink");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastFocusedElement = null;

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
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

  revealElements.forEach(function (element) {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(function (element) {
    element.classList.add("visible");
  });
}

const validationRules = {
  name: function (value) {
    if (!value.trim()) return "Please enter your name.";
    if (value.trim().length < 2) return "Please enter at least 2 characters.";
    return "";
  },
  email: function (value) {
    if (!value.trim()) return "Please enter your work email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Please enter a valid email address.";
    }
    return "";
  },
  phone: function (value) {
    const digits = value.replace(/\D/g, "");
    if (!value.trim()) return "Please enter your phone number.";
    if (digits.length < 8 || digits.length > 15) {
      return "Please enter a valid phone number.";
    }
    return "";
  },
  company: function (value) {
    if (!value.trim()) return "Please enter your company name.";
    if (value.trim().length < 2) return "Please enter a valid company name.";
    return "";
  },
  programme: function (value) {
    return value ? "" : "Please select a programme area.";
  },
  participants: function (value) {
    const amount = Number(value);
    if (!value) return "Please enter the estimated participant count.";
    if (!Number.isInteger(amount) || amount < 1 || amount > 5000) {
      return "Enter a number between 1 and 5,000.";
    }
    return "";
  },
  trainingMode: function (value) {
    return value ? "" : "Please select a preferred training method.";
  },
  message: function (value) {
    if (!value.trim()) return "Please describe your training requirements.";
    if (value.trim().length < 15) {
      return "Please add a little more detail (at least 15 characters).";
    }
    return "";
  }
};

function validateField(field) {
  const rule = validationRules[field.name];
  if (!rule) return true;

  const errorMessage = rule(field.value);
  const errorElement = document.getElementById(`${field.name}Error`);

  field.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  if (errorElement) errorElement.textContent = errorMessage;

  return !errorMessage;
}

if (contactForm && submitButton && formMessage) {
  const fields = Array.from(contactForm.querySelectorAll("input, select, textarea"));

  fields.forEach(function (field) {
    field.addEventListener("blur", function () {
      validateField(field);
    });

    field.addEventListener("input", function () {
      if (field.getAttribute("aria-invalid") === "true") {
        validateField(field);
      }

      formMessage.textContent = "";
      formMessage.className = "form-message";
    });

    field.addEventListener("change", function () {
      validateField(field);
    });
  });

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fieldResults = fields.map(validateField);
    const firstInvalidField = fields.find(function (field, index) {
      return !fieldResults[index];
    });

    if (firstInvalidField) {
      formMessage.textContent = "Please correct the highlighted fields before continuing.";
      formMessage.className = "form-message error";
      firstInvalidField.focus();
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = "Preparing your enquiry&hellip;";
    formMessage.textContent = "Preparing a secure WhatsApp message for your review...";
    formMessage.className = "form-message";

    const formData = new FormData(contactForm);
    const messageLines = [
      "Hello OTC Training Centre,",
      "",
      "I would like to request a training proposal.",
      "",
      `Name: ${formData.get("name")}`,
      `Work email: ${formData.get("email")}`,
      `Phone: ${formData.get("phone")}`,
      `Company: ${formData.get("company")}`,
      `Programme interest: ${formData.get("programme")}`,
      `Estimated participants: ${formData.get("participants")}`,
      `Preferred training method: ${formData.get("trainingMode")}`,
      "",
      "Training requirements:",
      String(formData.get("message")).trim(),
      "",
      "Please contact me about this enquiry. Thank you."
    ];

    const whatsappUrl = `https://wa.me/60125882263?text=${encodeURIComponent(
      messageLines.join("\n")
    )}`;
    const proposalWindow = window.open("about:blank", "_blank");

    if (proposalWindow) {
      proposalWindow.opener = null;
      proposalWindow.location.href = whatsappUrl;
    }

    window.setTimeout(function () {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Continue with Proposal on WhatsApp <span aria-hidden="true">&rarr;</span>';

      if (proposalWindow) {
        formMessage.textContent =
          "Your proposal is ready in WhatsApp. Review it there, then press Send.";
        formMessage.className = "form-message success";
        return;
      }

      formMessage.textContent = "Your browser blocked the new window. ";
      const fallbackLink = document.createElement("a");
      fallbackLink.href = whatsappUrl;
      fallbackLink.target = "_blank";
      fallbackLink.rel = "noopener noreferrer";
      fallbackLink.textContent = "Open your prepared WhatsApp enquiry";
      formMessage.appendChild(fallbackLink);
      formMessage.className = "form-message error";
    }, 350);
  });
}

faqAccordions.forEach(function (button) {
  button.addEventListener("click", function () {
    const faqItem = button.closest(".faq-item");
    const faqPanel = document.getElementById(button.getAttribute("aria-controls"));
    const wasOpen = faqItem.classList.contains("open");

    faqAccordions.forEach(function (otherButton) {
      const otherItem = otherButton.closest(".faq-item");
      const otherPanel = document.getElementById(otherButton.getAttribute("aria-controls"));

      otherItem.classList.remove("open");
      otherButton.setAttribute("aria-expanded", "false");
      otherPanel.style.maxHeight = null;
    });

    if (!wasOpen) {
      faqItem.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      faqPanel.style.maxHeight = `${faqPanel.scrollHeight}px`;
    }
  });
});

function openChatBox() {
  if (!chatBox || !chatToggle || !closeChat) return;

  lastFocusedElement = document.activeElement;
  chatBox.classList.add("open");
  chatBox.setAttribute("aria-hidden", "false");
  chatToggle.setAttribute("aria-expanded", "true");
  closeChat.focus();
}

function closeChatBox() {
  if (!chatBox || !chatToggle) return;

  const focusWasInsideChat = chatBox.contains(document.activeElement);
  chatBox.classList.remove("open");
  chatBox.setAttribute("aria-hidden", "true");
  chatToggle.setAttribute("aria-expanded", "false");

  if (focusWasInsideChat && lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

if (chatToggle && chatBox) {
  chatToggle.addEventListener("click", function () {
    if (chatBox.classList.contains("open")) {
      closeChatBox();
    } else {
      openChatBox();
    }
  });
}

if (closeChat) {
  closeChat.addEventListener("click", closeChatBox);
}

function createChatMessage(text, type) {
  const message = document.createElement("div");
  message.className = `message ${type}-message`;
  message.textContent = text;
  return message;
}

function createTypingMessage() {
  const typingMessage = document.createElement("div");
  typingMessage.className = "message bot-message typing-message";
  typingMessage.setAttribute("aria-label", "OTC Assistant is typing");
  typingMessage.innerHTML =
    '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  return typingMessage;
}

chatQuestions.forEach(function (button) {
  button.addEventListener("click", function () {
    if (!chatMessages) return;

    const question = button.dataset.question;
    const answer = button.dataset.answer;
    const userMessage = createChatMessage(question, "user");
    const typingMessage = createTypingMessage();

    button.disabled = true;
    chatMessages.appendChild(userMessage);
    chatMessages.appendChild(typingMessage);
    if (chatBox) {
      const chatBody = chatBox.querySelector(".chat-body");
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    if (chatWhatsappLink) {
      const continuation = [
        "Hi OTC,",
        `I was reading about: ${question}`,
        "I would like to discuss this with a training consultant."
      ].join("\n");
      chatWhatsappLink.href = `https://wa.me/60125882263?text=${encodeURIComponent(
        continuation
      )}`;
    }

    window.setTimeout(function () {
      typingMessage.remove();
      chatMessages.appendChild(createChatMessage(answer, "bot"));
      button.disabled = false;

      if (chatBox) {
        chatBox.querySelector(".chat-body").scrollTop =
          chatBox.querySelector(".chat-body").scrollHeight;
      }
    }, prefersReducedMotion.matches ? 0 : 600);
  });
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeMenu();
    if (chatBox && chatBox.classList.contains("open")) closeChatBox();
  }

});
