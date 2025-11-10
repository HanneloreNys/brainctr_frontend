const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("De API_BASE_URL in script.js is:", API_BASE_URL);
// met VITE

// Module data (zal dynamisch geladen worden)
let modulesData = []; // Deze array bevat de basis module info voor de visualisatie en overzicht
let currentModuleId = null;

// Functie om modules te laden van de backend
async function loadModules() {
  try {
    const response = await fetch(`${API_BASE_URL}/modules`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    modulesData = await response.json();
  } catch (error) {
    console.error("Fout bij het laden van modules:", error);
  }
}

// Functie om de cirkelvormige module reis visualisatie te renderen (niet actief, hardcoded in HTML)
function renderModuleJourney() {
  const container = document.getElementById("module-circles-container");
  const svgLines = document.getElementById("module-lines-svg");
  if (!container || !svgLines) {
    console.warn(
      "Module circles container or SVG lines not found. Skipping renderModuleJourney."
    );
    return;
  }
  container.innerHTML = ""; // Maak container leeg
  svgLines.innerHTML = ""; // Maak SVG leeg

  const journeyVisualisationData = [
    { id: 1, image: "module1_bg.jpg", borderColor: "border-blue-200" },
    { id: 2, image: "module2_bg.jpg", borderColor: "border-green-200" },
    { id: 3, image: "module3_bg.jpg", borderColor: "border-teal-200" },
    { id: 4, image: "moduleO_bg.jpg", borderColor: "border-purple-200" },
    { id: 5, image: "moduleX_bg.jpg", borderColor: "border-pink-200" },
  ];

  const positions = {
    1: { x: 16.5, y: 25 },
    2: { x: 50, y: 25 },
    3: { x: 83.5, y: 25 },
    4: { x: 33.5, y: 75 },
    5: { x: 66.5, y: 75 },
  };

  const drawLine = (x1, y1, x2, y2) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    svgLines.appendChild(line);
  };

  drawLine(positions[1].x, positions[1].y, positions[2].x, positions[2].y);
  drawLine(positions[2].x, positions[2].y, positions[3].x, positions[3].y);
  drawLine(positions[1].x, positions[1].y, positions[1].x, positions[4].y);
  drawLine(positions[1].x, positions[4].y, positions[4].x, positions[4].y);
  drawLine(positions[3].x, positions[3].y, positions[3].x, positions[5].y);
  drawLine(positions[3].x, positions[5].y, positions[5].x, positions[5].y);

  journeyVisualisationData.forEach((visualModule) => {
    const module = modulesData.find((m) => m.id === visualModule.id);
    if (!module) return;

    const moduleCircleWrapper = document.createElement("div");
    let lgColClass = "",
      lgRowClass = "",
      mtClass = "";

    if (module.id === 1) {
      lgColClass = "lg:col-start-1";
      lgRowClass = "lg:row-start-1";
    } else if (module.id === 2) {
      lgColClass = "lg:col-start-3";
      lgRowClass = "lg:row-start-1";
    } else if (module.id === 3) {
      lgColClass = "lg:col-start-5";
      lgRowClass = "lg:row-start-1";
    } else if (module.id === 4) {
      lgColClass = "lg:col-start-2";
      lgRowClass = "lg:row-start-2";
      mtClass = "mt-16 lg:mt-0";
    } else if (module.id === 5) {
      lgColClass = "lg:col-start-4";
      lgRowClass = "lg:row-start-2";
      mtClass = "mt-16 lg:mt-0";
    }

    moduleCircleWrapper.className = `relative module-circle-wrapper ${visualModule.borderColor} ${lgColClass} ${lgRowClass} ${mtClass}`;
    moduleCircleWrapper.id = `journey-module-${module.id}`;

    moduleCircleWrapper.innerHTML = `
            <img src="${visualModule.image}" alt="${module.naam} Achtergrond" class="module-bg-image">
            <div class="module-circle-overlay module-overlay-blue"></div>
            <div class="module-circle-content">
                <h3 class="font-black text-white text-xl mb-2">${module.naam}</h3>
                <p class="text-lg text-white mb-1 leading-tight">${module.korte_beschrijving}</p>
                <p class="text-sm text-white font-light mt-1">${module.beschrijving}</p>
                <button onclick="showModule(${module.id})" class="absolute bottom-6 text-white text-lg w-24 h-24 rounded-full bg-blue-DEFAULT hover:bg-indigo-dark transition-colors flex items-center justify-center">Meer</button>
            </div>
        `;
    container.appendChild(moduleCircleWrapper);
  });
}

// renderModulesOverview is niet langer actief
function renderModulesOverview() {
  console.log("renderModulesOverview is niet langer actief.");
}

// Toon module details modal
async function showModule(moduleId) {
  currentModuleId = moduleId;

  try {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const module = data.module;
    const availableSessions = data.availableSessions;

    if (!module) {
      alert("Module details konden niet worden geladen.");
      return;
    }

    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const registerBtn = document.getElementById("registerBtn");

    modalTitle.textContent = module.naam;
    modalTitle.classList.add("text-indigo-brand");

    let sessionDatesListHtml = "";
    let sessionTimeText = "Vrijdag 10:00 of 11:30"; // Default
    let upcomingSessions = [];

    if (availableSessions && availableSessions.length > 0) {
      const uniqueTimes = [
        ...new Set(
          availableSessions.map((s) => s.formatted_time).filter((t) => t)
        ),
      ];
      if (uniqueTimes.length > 0) {
        sessionTimeText = `Vrijdag ${uniqueTimes.join(" of ")}`;
      }

      const sessionsWithSpots = availableSessions.filter(
        (s) => s.max_deelnemers - s.huidige_deelnemers > 0
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      upcomingSessions = sessionsWithSpots.filter((s) => {
        if (!s.datum) return true;
        const sessionDate = new Date(s.datum);
        return sessionDate >= today;
      });

      if (upcomingSessions.length > 0) {
        sessionDatesListHtml = `
                    <h4 class="font-bold text-xl pt-6 mb-2 text-indigo-dark">Komende Sessies:</h4>
                    <ul class="list-disc list-inside space-y-2 text-base font-light text-indigo-dark"> <!-- text-base FIX -->
                        ${upcomingSessions
                          .map((session) => {
                            const remainingSpots =
                              session.max_deelnemers -
                              session.huidige_deelnemers;
                            let spotsText = "",
                              spotsClass = "";

                            if (remainingSpots > 0 && remainingSpots <= 3) {
                              spotsText = ` - Nog ${remainingSpots} plaats${
                                remainingSpots === 1 ? "" : "en"
                              }`;
                              spotsClass = "text-red-dark font-bold";
                            } else if (remainingSpots <= 0) {
                              spotsText = ` - Volgeboekt`;
                              spotsClass = "text-red-dark font-bold";
                            }

                            return `
                                <li>
                                    ${
                                      session.formatted_date || "Datum TBD"
                                    } om ${
                              session.formatted_time || "Tijd TBD"
                            } 
                                    (${
                                      session.locatie
                                    }) <span class="${spotsClass}">${spotsText}</span>
                                </li>
                            `;
                          })
                          .join("")}
                    </ul>
                `;
      }
    }

    sessionDatesListHtml += `
            <p class="text-base font-light text-indigo-dark bg-blue-light p-4 rounded-lg" style="margin-top: 3rem;">
                💡&nbsp;&nbsp;Je kunt je altijd inschrijven voor deze module. 
                ${
                  upcomingSessions.length > 0
                    ? "Als de huidige sessies vol zijn of al gestart, word je automatisch geplaatst voor de volgende reeks."
                    : "Je ontvangt een bevestigingsmail zodra de sessiedata zijn ingepland."
                }
            </p>
        `;

    modalContent.innerHTML = `
            <p class="text-xl font-light text-indigo-dark mb-8">${
              module.korte_beschrijving || module.beschrijving
            }</p>
            <div class="bg-sand-light p-4 rounded-lg mt-4 mb-8 grid grid-cols-2 gap-4 text-base text-black"> 
                <div class="font-bold text-lg">Aantal sessies: <span class="text-base font-light"> <!-- text-base FIX -->${
                  module.aantal_sessies
                }</span></div>
                <div class="font-bold text-lg">Deelnemers: <span class="text-base font-light"> <!-- text-base FIX -->${
                  module.min_deelnemers
                }-${module.max_deelnemers}</span></div>
                <div class="font-bold text-lg">Tijd: <span class="text-base font-light"> <!-- text-base FIX -->${sessionTimeText}</span></div>
                <div class="font-bold text-lg">Locatie: <span class="text-base font-light"> <!-- text-base FIX -->Hasseltsestraat 30, Diest</span></div>
                ${
                  module.formatted_start_date
                    ? `<div class="font-bold text-lg">Volgende start: <span class="text-base font-light"> <!-- text-base FIX -->${module.formatted_start_date}</span></div>`
                    : ""
                } 
            </div>
            <h4 class="font-bold text-2xl pt-6 mb-2 text-indigo-dark">Programma en Inzichten:</h4> 
            <p class="text-lg font-light">${module.beschrijving}</p> 
            ${
              module.vereisten
                ? `<h4 class="font-semibold text-xl mt-4 mb-2 text-indigo-dark">Vereisten:</h4><p class="text-red-dark text-lg font-light">${module.vereisten}</p>`
                : ""
            } 
            ${
              module.doelgroep
                ? `<h4 class="font-semibold text-xl mt-4 mb-2 text-indigo-dark">Doelgroep:</h4><p class="text-lg font-light">${module.doelgroep}</p>`
                : ""
            } 
            ${sessionDatesListHtml}
        `;

    registerBtn.onclick = () => showRegistrationForm(moduleId, module.naam);

    const moduleModal = document.getElementById("moduleModal");
    moduleModal.classList.remove("hidden");
    setTimeout(() => {
      moduleModal
        .querySelector("div")
        .classList.remove("opacity-0", "scale-95");
      moduleModal
        .querySelector("div")
        .classList.add("opacity-100", "scale-100");
    }, 10);
  } catch (error) {
    console.error("Fout bij het ophalen van module details of sessies:", error);
    alert(
      "Er ging iets mis bij het laden van module details of sessies. Probeer het later opnieuw."
    );
  }
}

// Maak showModule globaal beschikbaar
window.showModule = showModule;

// Sluit module details modal
function closeModal() {
  const moduleModal = document.getElementById("moduleModal");
  moduleModal.querySelector("div").classList.remove("opacity-100", "scale-100");
  moduleModal.querySelector("div").classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    moduleModal.classList.add("hidden");
  }, 300); // Wacht op de animatie
}
window.closeModal = closeModal;

// Toon inschrijfformulier modal (vult modules en voorsorteert)
function showRegistrationForm(
  preselectedModuleId = null,
  preselectedModuleName = null
) {
  closeModal(); // Sluit eerst de module details modal
  document.getElementById("preselectedModuleId").value = preselectedModuleId; // Zet de voorgesorteerde module ID

  const registrationModuleSelect = document.getElementById(
    "registrationModuleSelect"
  );
  registrationModuleSelect.innerHTML =
    '<option value="">Kies een Module...</option>'; // Reset opties

  if (modulesData.length > 0) {
    modulesData.forEach((module) => {
      const option = document.createElement("option");
      option.value = module.id;
      option.textContent = module.naam;
      registrationModuleSelect.appendChild(option);
    });

    if (preselectedModuleId) {
      registrationModuleSelect.value = preselectedModuleId;
    }
  } else {
    alert("Er konden geen modules geladen worden voor het inschrijfformulier.");
    return;
  }

  const registrationModal = document.getElementById("registrationModal");
  registrationModal.classList.remove("hidden");
  setTimeout(() => {
    registrationModal
      .querySelector("div")
      .classList.remove("opacity-0", "scale-95");
    registrationModal
      .querySelector("div")
      .classList.add("opacity-100", "scale-100");
  }, 10);
}

window.showRegistrationForm = showRegistrationForm;

// Sluit inschrijfformulier modal
function closeRegistrationModal() {
  const registrationModal = document.getElementById("registrationModal");
  registrationModal
    .querySelector("div")
    .classList.remove("opacity-100", "scale-100");
  registrationModal.querySelector("div").classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    registrationModal.classList.add("hidden");
  }, 300); // Wacht op de animatie
}
window.closeRegistrationModal = closeRegistrationModal;

// Toggle verwijzerNaam veld op basis van verwijzerType (voor groepssessies)
function toggleVerwijzerNaam() {
  const verwijzerType = document.getElementById("verwijzerType").value;
  const verwijzerNaamDiv = document.getElementById("verwijzerNaamDiv");

  if (
    [
      "huisarts",
      "ocmw-diest",
      "therapeut",
      "apotheker",
      "caw",
      "anders",
    ].includes(verwijzerType)
  ) {
    verwijzerNaamDiv.classList.remove("hidden");
  } else {
    verwijzerNaamDiv.classList.add("hidden");
  }
}
window.toggleVerwijzerNaam = toggleVerwijzerNaam;

// Generieke letter-voor-letter animatie functie
function animateTitle(elementId, className, delayMultiplier = 0.1) {
  const titleElement = document.getElementById(elementId);
  if (!titleElement) return;

  const text = titleElement.dataset.text || titleElement.textContent;
  titleElement.innerHTML = "";

  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    span.textContent = text[i];
    span.className = className;
    span.style.animationDelay = `${i * delayMultiplier}s`;
    titleElement.appendChild(span);
  }
}

// Intersection Observer voor scroll-triggered animaties
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.3, // Trigger wanneer 30% van het element zichtbaar is
    rootMargin: "0px 0px -100px 0px", // Start iets eerder
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (
        entry.isIntersecting &&
        !entry.target.classList.contains("animated")
      ) {
        const elementId = entry.target.id;
        animateTitle(
          elementId,
          "buongiorno-letter font-black text-indigo-brand"
        );
        entry.target.classList.add("animated"); // Voorkom her-animatie
      }
    });
  }, observerOptions);

  // Observeer alle Buongiorno titels
  const titles = [
    "buongiorno-title",
    "therapy-buongiorno-title",
    "modules-buongiorno-title",
  ];

  titles.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      observer.observe(element);
    }
  });
}

// Sluit modals bij klik buiten de modal content (voor betere UX)
window.addEventListener("click", function (event) {
  const moduleModal = document.getElementById("moduleModal");
  const registrationModal = document.getElementById("registrationModal");
  const individueleModal = document.getElementById("individueleModal");

  if (event.target === moduleModal) {
    closeModal();
  }
  if (event.target === registrationModal) {
    closeRegistrationModal();
  }
  if (event.target === individueleModal) {
    closeIndividueleModal();
  }
});

// Toon individuele inschrijving modal
function showIndividueleInschrijving() {
  const modal = document.getElementById("individueleModal");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.querySelector("div").classList.remove("opacity-0", "scale-95");
    modal.querySelector("div").classList.add("opacity-100", "scale-100");
  }, 10);
}

// Maak showIndividueleInschrijving globaal beschikbaar
window.showIndividueleInschrijving = showIndividueleInschrijving;

// Sluit individuele modal
function closeIndividueleModal() {
  const modal = document.getElementById("individueleModal");
  modal.querySelector("div").classList.remove("opacity-100", "scale-100");
  modal.querySelector("div").classList.add("opacity-0", "scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}
window.closeIndividueleModal = closeIndividueleModal;

// Toggle verwijzer naam voor individuele inschrijving
function toggleIndVerwijzerNaam() {
  const verwijzerType = document.getElementById("ind_verwijzerType").value;
  const verwijzerNaamDiv = document.getElementById("ind_verwijzerNaamDiv");

  if (
    [
      "huisarts",
      "ocmw-diest",
      "therapeut",
      "apotheker",
      "caw",
      "anders",
    ].includes(verwijzerType)
  ) {
    verwijzerNaamDiv.classList.remove("hidden");
  } else {
    verwijzerNaamDiv.classList.add("hidden");
  }
}
window.toggleIndVerwijzerNaam = toggleIndVerwijzerNaam;

// Toggle "Geen voorkeur" checkbox
function toggleGeenVoorkeur(checkbox) {
  const dagMomentCheckboxes = document.querySelectorAll(".dag-moment");
  if (checkbox.checked) {
    dagMomentCheckboxes.forEach((cb) => {
      cb.checked = false;
      cb.disabled = true;
    });
  } else {
    dagMomentCheckboxes.forEach((cb) => {
      cb.disabled = false;
    });
  }
}
window.toggleGeenVoorkeur = toggleGeenVoorkeur;

// Handle groepssessie inschrijfformulier submit
document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Disable submit button
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Bezig met inschrijven...";
    submitBtn.style.opacity = "0.6";

    try {
      // Haal reCAPTCHA token op
      const recaptchaToken = await grecaptcha.execute(
        "6Lf1cQcsAAAAANMAuk7KaPWe0Rc-ZkcS_N4I-ADe",
        {
          action: "inschrijving",
        }
      );

      const formData = new FormData(this);
      const moduleId = formData.get("moduleId");

      const registrationData = {
        recaptchaToken: recaptchaToken,
        moduleId: moduleId,
        voornaam: formData.get("voornaam"),
        achternaam: formData.get("achternaam"),
        rijksregisternummer: formData.get("rijksregisternummer"),
        email: formData.get("email"),
        telefoon: formData.get("telefoon"),
        verwijzerType: formData.get("verwijzerType"),
        verwijzerNaam: formData.get("verwijzerNaam"),
        bijzondereBehoeften: formData.get("bijzondereBehoeften"),
      };

      console.log("Frontend verzendt data:", registrationData); //log errors

      let endpoint = `${API_BASE_URL}/inschrijvingen`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          "Bedankt voor je inschrijving! Je ontvangt een bevestiging per e-mail met de sessiedetails en een herinneringsmail voor elke sessie."
        );
        closeRegistrationModal();
        this.reset();
        loadModules();
      } else {
        alert(
          result.error ||
            "Er ging iets mis bij de inschrijving. Controleer je gegevens en probeer opnieuw."
        );
      }
    } catch (error) {
      console.error("Fout bij inschrijving:", error);
      alert(
        "Er ging iets mis bij de inschrijving. Controleer je internetverbinding en probeer opnieuw."
      );
    } finally {
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = "1";
    }
  });

// Handle individuele inschrijving submit
document
  .getElementById("individueleForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Disable submit button
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Bezig met inschrijven...";
    submitBtn.style.opacity = "0.6";

    try {
      // Haal reCAPTCHA token op
      const recaptchaToken = await grecaptcha.execute(
        "6Lf1cQcsAAAAANMAuk7KaPWe0Rc-ZkcS_N4I-ADe",
        {
          action: "inschrijving",
        }
      );

      const formData = new FormData(this);
      const voorkeurDagen = formData.getAll("voorkeurDagen");
      const weekVoorkeur = formData.getAll("weekVoorkeur");

      const registrationData = {
        recaptchaToken: recaptchaToken,
        voornaam: formData.get("voornaam"),
        achternaam: formData.get("achternaam"),
        rijksregisternummer: formData.get("rijksregisternummer"),
        email: formData.get("email"),
        telefoon: formData.get("telefoon"),
        verwijzerType: formData.get("verwijzerType"),
        verwijzerNaam: formData.get("verwijzerNaam"),
        bijzondereBehoeften: formData.get("bijzondereBehoeften"),
        voorkeurDagen: voorkeurDagen,
        weekVoorkeur: weekVoorkeur,
      };

      const response = await fetch(`${API_BASE_URL}/individuele-inschrijving`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          "Bedankt voor je inschrijving! Je staat nu op de wachtlijst voor individuele begeleiding. Je ontvangt binnenkort een bevestigingsmail."
        );
        closeIndividueleModal();
        this.reset();
      } else {
        alert(
          result.error ||
            "Er ging iets mis bij de inschrijving. Controleer je gegevens en probeer opnieuw."
        );
      }
    } catch (error) {
      console.error("Fout bij individuele inschrijving:", error);
      alert(
        "Er ging iets mis bij de inschrijving. Controleer je internetverbinding en probeer opnieuw."
      );
    } finally {
      // ✅ Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = "1";
    }
  });

// LIST ITEM ANIMATIES (kan hier geplaatst worden)

function setupListItemAnimations() {
  const listItems = document.querySelectorAll(".custom-bullet-list li");

  const observerOptions = {
    root: null, // De viewport
    rootMargin: "0px",
    threshold: 0.5, // Trigger wanneer 50% van het item zichtbaar is
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        observer.unobserve(entry.target); // Stop observeren na animatie
      }
    });
  }, observerOptions);

  listItems.forEach((item) => {
    observer.observe(item);
  });
}

// Zorg dat toggleVerwijzerNaam en moduleID voorsortering werkt bij laden van de modal
document.addEventListener("DOMContentLoaded", () => {
  loadModules();
  setupScrollAnimations();

  // Voor moduleID inschrijving
  const moduleId = document.getElementById("preselectedModuleId").value;

  // Voor groepssessie verwijzer
  const verwijzerTypeSelect = document.getElementById("verwijzerType");
  if (verwijzerTypeSelect) {
    verwijzerTypeSelect.addEventListener("change", toggleVerwijzerNaam);
  } // <-- Correcte sluiting van de 'if' statement

  // Voor individuele verwijzer
  const indVerwijzerTypeSelect = document.getElementById("ind_verwijzerType");
  if (indVerwijzerTypeSelect) {
    indVerwijzerTypeSelect.addEventListener("change", toggleIndVerwijzerNaam);
  }

  // Start de animaties voor de lijstitems
  setupListItemAnimations();
});
