"use strict";

document.documentElement.classList.add("js");

const config = window.VYRO_CONFIG || {};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setVisibleText(selector, value) {
  if (!value) return;
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function applyAgencyDetails() {
  const name = String(config.agencyName || "VYRO").trim();
  setVisibleText("[data-agency-name]", name || "VYRO");
  setVisibleText("[data-location]", config.city && config.region ? config.city + " · " + config.region : config.city || config.region || "[VILLE / RÉGION À REMPLACER]");

  document.querySelectorAll("[data-contact-email]").forEach((element) => {
    if (config.email) {
      element.textContent = config.email;
      element.href = "mailto:" + config.email;
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = element.className;
      placeholder.textContent = element.textContent;
      element.replaceWith(placeholder);
    }
  });
  document.querySelectorAll("[data-contact-phone]").forEach((element) => {
    if (config.phone) {
      element.textContent = config.phone;
      element.href = "tel:" + String(config.phone).replace(/[^+\d]/g, "");
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = element.className;
      placeholder.textContent = element.textContent;
      element.replaceWith(placeholder);
    }
  });

  const year = Number(config.currentYear) || new Date().getFullYear();
  const yearElement = document.getElementById("current-year");
  if (yearElement) yearElement.textContent = String(year);

  [["Instagram", config.instagram], ["LinkedIn", config.linkedin]].forEach(([label, url]) => {
    const item = Array.from(document.querySelectorAll(".footer-placeholder")).find((element) => element.textContent.startsWith(label));
    if (!item || !isSafePublicUrl(url)) return;
    const link = document.createElement("a");
    link.className = "footer-placeholder";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    item.replaceWith(link);
  });

  applySeoDetails();
}

function isSafePublicUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function applySeoDetails() {
  const isHomePage = Boolean(document.getElementById("quote-form"));
  if (!isHomePage) {
    if (window.location.pathname.endsWith("mentions-legales.html")) document.title = "Mentions légales — " + String(config.agencyName || "VYRO");
    if (window.location.pathname.endsWith("confidentialite.html")) document.title = "Politique de confidentialité — " + String(config.agencyName || "VYRO");
  } else {
    const title = String(config.agencyName || "VYRO") + " — Votre entreprise mérite un site à son image";
    document.title = title;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (ogTitle) ogTitle.content = title;
    if (twitterTitle) twitterTitle.content = title;
  }
  if (!isSafePublicUrl(config.siteUrl)) return;
  const siteUrl = new URL(config.siteUrl);
  if (!siteUrl.pathname.endsWith("/")) siteUrl.pathname += "/";
  const currentPath = window.location.pathname;
  const relativePath = currentPath.startsWith(siteUrl.pathname)
    ? currentPath.slice(siteUrl.pathname.length)
    : currentPath.replace(/^\/+/, "");
  const canonicalUrl = new URL(relativePath === "index.html" ? "" : relativePath, siteUrl);
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = canonicalUrl.href;
  document.head.append(canonical);
  const ogUrl = document.createElement("meta");
  ogUrl.setAttribute("property", "og:url");
  ogUrl.content = canonicalUrl.href;
  document.head.append(ogUrl);

  if (!isHomePage) return;
  const ogImage = document.querySelector('meta[property="og:image"]');
  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (ogImage) ogImage.content = new URL("og-vyro.svg", siteUrl).href;
  if (twitterImage) twitterImage.content = new URL("og-vyro.svg", siteUrl).href;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: String(config.agencyName || "VYRO"),
    url: siteUrl.href,
    description: document.querySelector('meta[name="description"]').content,
    inLanguage: "fr"
  };
  if (config.email) schema.email = String(config.email);
  if (config.phone) schema.telephone = String(config.phone);
  const socialLinks = [config.instagram, config.linkedin].filter(isSafePublicUrl);
  if (socialLinks.length) schema.sameAs = socialLinks;
  if (config.address || config.city || config.postalCode) {
    const address = { "@type": "PostalAddress" };
    if (config.address) address.streetAddress = String(config.address);
    if (config.city) address.addressLocality = String(config.city);
    if (config.region) address.addressRegion = String(config.region);
    if (config.postalCode) address.postalCode = String(config.postalCode);
    schema.address = address;
  } else if (config.region) {
    schema.areaServed = String(config.region);
  }
  if (config.ownerName) schema.founder = { "@type": "Person", name: String(config.ownerName) };
  const jsonLd = document.createElement("script");
  jsonLd.type = "application/ld+json";
  jsonLd.textContent = JSON.stringify(schema);
  document.head.append(jsonLd);
}

function setupHeader() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!header || !toggle || !nav) return;

  const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeMenu = (returnFocus) => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu de navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Ouvrir le menu de navigation" : "Fermer le menu de navigation");
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen && window.matchMedia("(max-width: 820px)").matches);
    if (!isOpen && window.matchMedia("(max-width: 820px)").matches) nav.querySelector("a")?.focus();
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (toggle.getAttribute("aria-expanded") === "true" && !header.contains(event.target)) closeMenu(false);
  });
  window.matchMedia("(min-width: 821px)").addEventListener("change", () => closeMenu(false));
}

function setupReveals() {
  const elements = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -55px 0px", threshold: 0.08 });
  elements.forEach((element) => observer.observe(element));
}

const formHeadings = [
  "Parlez-nous de votre activité",
  "Que souhaitez-vous pour votre site ?",
  "Parlez-nous de votre projet",
  "Comment pouvons-nous vous contacter ?",
  "Votre demande est prête"
];
const fieldErrorIds = [
  ["business", "contact-name", "sector"],
  ["needs"],
  ["project-details"],
  ["email", "website", "consent"],
  []
];

function setupQuoteForm() {
  const form = document.getElementById("quote-form");
  if (!form) return;
  const steps = Array.from(form.querySelectorAll(".form-step"));
  const heading = document.getElementById("form-heading");
  const label = document.getElementById("form-step-label");
  const count = document.getElementById("form-progress-count");
  const progress = document.getElementById("form-progress");
  const progressFill = progress.querySelector("span");
  const back = document.getElementById("form-back");
  const next = document.getElementById("form-next");
  const submit = document.getElementById("form-submit");
  const status = document.getElementById("form-status");
  const success = document.getElementById("form-success");
  let currentStep = 0;

  const showStatus = (message, kind) => {
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle("is-success", kind === "success");
  };
  const clearStatus = () => {
    status.hidden = true;
    status.textContent = "";
    status.classList.remove("is-success");
  };
  const clearErrors = () => {
    form.querySelectorAll(".field-error").forEach((element) => { element.textContent = ""; });
    form.querySelectorAll("[aria-invalid=true]").forEach((element) => {
      element.removeAttribute("aria-invalid");
      element.removeAttribute("aria-describedby");
    });
  };
  const setError = (id, message) => {
    const error = document.getElementById("error-" + id);
    const field = id === "needs" ? form.querySelector('input[name="needs"]') : document.getElementById(id === "contact-name" ? "contact-name" : id === "project-details" ? "project-details" : id);
    if (error) error.textContent = message;
    if (field) {
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", "error-" + id);
    }
  };
  const moveTo = (index, focusHeading) => {
    currentStep = Math.max(0, Math.min(steps.length - 1, index));
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== currentStep;
      step.classList.toggle("is-active", stepIndex === currentStep);
    });
    heading.textContent = formHeadings[currentStep];
    label.textContent = "ÉTAPE " + String(currentStep + 1).padStart(2, "0") + " / 05";
    count.innerHTML = String(currentStep + 1).padStart(2, "0") + " <i>/ 05</i>";
    progress.setAttribute("aria-valuenow", String(currentStep + 1));
    progressFill.style.width = ((currentStep + 1) * 20) + "%";
    back.hidden = currentStep === 0;
    next.hidden = currentStep === steps.length - 1;
    submit.hidden = currentStep !== steps.length - 1;
    clearErrors();
    clearStatus();
    if (focusHeading) heading.focus({ preventScroll: true });
  };
  heading.tabIndex = -1;

  const validateStep = (stepIndex) => {
    clearErrors();
    let valid = true;
    const fail = (id, message) => { setError(id, message); valid = false; };
    if (stepIndex === 0) {
      const business = document.getElementById("business");
      const name = document.getElementById("contact-name");
      const sector = document.getElementById("sector");
      if (!business.value.trim()) fail("business", "Indiquez le nom de votre entreprise.");
      if (!name.value.trim()) fail("contact-name", "Indiquez votre nom.");
      if (!sector.value) fail("sector", "Choisissez votre secteur d'activité.");
    }
    if (stepIndex === 1 && form.querySelectorAll('input[name="needs"]:checked').length === 0) {
      fail("needs", "Sélectionnez au moins un besoin pour continuer.");
    }
    if (stepIndex === 2) {
      const details = document.getElementById("project-details");
      if (details.value.trim().length < 20) fail("project-details", "Décrivez votre projet en au moins 20 caractères.");
    }
    if (stepIndex === 3) {
      const email = document.getElementById("email");
      const website = document.getElementById("website");
      if (!email.value.trim()) fail("email", "Indiquez votre adresse e-mail.");
      else if (!email.checkValidity()) fail("email", "Vérifiez le format de votre adresse e-mail.");
      if (website.value.trim() && !website.checkValidity()) fail("website", "Saisissez une adresse web valide, par exemple https://exemple.fr.");
      if (!document.getElementById("consent").checked) fail("consent", "Votre accord est nécessaire pour traiter cette demande.");
    }
    if (!valid) {
      const firstErrorId = fieldErrorIds[stepIndex].find((id) => document.getElementById("error-" + id)?.textContent);
      const target = firstErrorId === "needs" ? form.querySelector('input[name="needs"]') : firstErrorId ? document.getElementById(firstErrorId) : null;
      target?.focus({ preventScroll: true });
    }
    return valid;
  };

  const collectData = () => ({
    business: document.getElementById("business").value.trim(),
    name: document.getElementById("contact-name").value.trim(),
    sector: document.getElementById("sector").value,
    needs: Array.from(form.querySelectorAll('input[name="needs"]:checked'), (input) => input.value),
    details: document.getElementById("project-details").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    website: document.getElementById("website").value.trim(),
    consent: document.getElementById("consent").checked
  });

  const appendReview = (term, value) => {
    const row = document.createElement("div");
    row.className = "review-row";
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    if (Array.isArray(value)) {
      if (value.length) {
        const list = document.createElement("span");
        list.className = "review-needs";
        value.forEach((item) => {
          const chip = document.createElement("span");
          chip.textContent = item;
          list.append(chip);
        });
        dd.append(list);
      } else dd.textContent = "Aucun choix";
    } else dd.textContent = value || "Non renseigné";
    row.append(dt, dd);
    document.getElementById("review-list").append(row);
  };

  const renderReview = () => {
    const data = collectData();
    const list = document.getElementById("review-list");
    list.replaceChildren();
    appendReview("Entreprise", data.business);
    appendReview("Votre nom", data.name);
    appendReview("Secteur", data.sector);
    appendReview("Besoins", data.needs);
    appendReview("Projet", data.details);
    appendReview("E-mail", data.email);
    if (data.phone) appendReview("Téléphone", data.phone);
    if (data.website) appendReview("Site actuel", data.website);
  };

  async function submitQuote(payload) {
    if (!config.formEndpoint) {
      const recipient = String(config.email || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
        const error = new Error("L’adresse e-mail de réception n’est pas configurée.");
        error.code = "FORM_NOT_CONFIGURED";
        throw error;
      }
      const subject = "Demande de devis VYRO — " + payload.business;
      const body = [
        "Bonjour Louan Jacob,",
        "",
        "Voici une demande de devis envoyée depuis le site VYRO.",
        "",
        "Entreprise : " + payload.business,
        "Nom : " + payload.name,
        "Secteur : " + payload.sector,
        "Besoins : " + payload.needs.join(", "),
        "Projet : " + payload.details,
        "E-mail de réponse : " + payload.email,
        "Téléphone : " + (payload.phone || "Non renseigné"),
        "Site actuel : " + (payload.website || "Non renseigné")
      ].join("\r\n");
      const mailto = "mailto:" + recipient
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);
      window.location.assign(mailto);
      return { channel: "mailto" };
    }
    if (!isSafePublicUrl(config.formEndpoint)) throw new Error("L’adresse du service d’envoi doit être une URL HTTPS valide.");
    const response = await fetch(config.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("Le service de réception a rencontré une erreur. Votre demande n'a pas été transmise. Réessayez ou contactez-nous directement.");
    return { channel: "endpoint", response };
  }

  next.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 3) renderReview();
    moveTo(currentStep + 1, true);
  });
  back.addEventListener("click", () => moveTo(currentStep - 1, true));
  form.addEventListener("input", (event) => {
    const id = event.target.id;
    if (id) {
      const error = document.getElementById("error-" + (id === "contact-name" ? "contact-name" : id === "project-details" ? "project-details" : id));
      if (error) error.textContent = "";
      event.target.removeAttribute("aria-invalid");
    }
    if (event.target.id === "project-details") document.getElementById("char-count").textContent = event.target.value.length + " / 3000";
    if (event.target.name === "needs") {
      document.getElementById("error-needs").textContent = "";
      form.querySelectorAll('input[name="needs"][aria-invalid="true"]').forEach((field) => {
        field.removeAttribute("aria-invalid");
        field.removeAttribute("aria-describedby");
      });
    }
    if (event.target.id === "consent") document.getElementById("error-consent").textContent = "";
    clearStatus();
  });
  form.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && currentStep < steps.length - 1 && event.target.tagName !== "TEXTAREA" && event.target.type !== "checkbox") {
      event.preventDefault();
      next.click();
    }
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (currentStep !== steps.length - 1) return;
    for (let stepIndex = 0; stepIndex < 4; stepIndex += 1) {
      if (!validateStep(stepIndex)) {
        moveTo(stepIndex, false);
        validateStep(stepIndex);
        return;
      }
    }
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    clearStatus();
    try {
      const result = await submitQuote(collectData());
      if (result.channel === "mailto") {
        showStatus("Votre messagerie s’ouvre avec la demande préremplie. Vérifiez le message puis appuyez sur « Envoyer » pour le transmettre.", "success");
        status.focus();
        return;
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      const message = error.code === "FORM_NOT_CONFIGURED"
        ? "L'envoi n'est pas encore configuré. Votre demande n'a pas été transmise. Vous pouvez contacter l'agence directement à l'adresse indiquée sur cette page."
        : error.message || "Une erreur est survenue. Votre demande n'a pas été transmise. Réessayez plus tard.";
      showStatus(message, "error");
      status.focus();
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
    }
  });
  document.getElementById("new-request").addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    success.hidden = true;
    document.getElementById("char-count").textContent = "0 / 3000";
    moveTo(0, true);
  });
  moveTo(0, false);
}

applyAgencyDetails();
setupHeader();
setupReveals();
setupQuoteForm();
