const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let ADMIN_TOKEN = localStorage.getItem("adminToken"); // Token opslaan in localStorage

// Functie om de zichtbaarheid van schermen te togglen
function showScreen(screenId) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("admin-panel").classList.add("hidden");
  document.getElementById(screenId).classList.remove("hidden");
}

// Functie om te checken of de gebruiker is ingelogd
async function checkLoginStatus() {
  if (ADMIN_TOKEN) {
    // Voor productie: je zou hier de token valideren bij de server
    // Voor nu: ga er vanuit dat de token geldig is als deze bestaat
    await initAanwezigheidsbeheer();
    showScreen("admin-panel");
  } else {
    showScreen("login-screen");
  }
}

// Login form submit handler
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const loginError = document.getElementById("login-error");

  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();

    if (data.success) {
      ADMIN_TOKEN = data.token;
      localStorage.setItem("adminToken", ADMIN_TOKEN); // Token opslaan
      await initAanwezigheidsbeheer();
      showScreen("admin-panel");
    } else {
      loginError.textContent = data.message;
    }
  } catch (error) {
    console.error("Login error:", error);
    loginError.textContent = "Er ging iets mis bij het inloggen.";
  }
});

// Logout knop handler
document.getElementById("logout-btn").addEventListener("click", () => {
  ADMIN_TOKEN = null;
  localStorage.removeItem("adminToken");
  showScreen("login-screen");
});

// Functie om de admin aanwezigheidssectie te initialiseren
async function initAanwezigheidsbeheer() {
  const adminModuleSelect = document.getElementById("adminModuleSelect");
  const adminSessionSelect = document.getElementById("adminSessionSelect");
  const aanwezigheidLijstContainer = document.getElementById(
    "aanwezigheidLijstContainer"
  );
  const aanwezigheidLijstDiv = document.getElementById("aanwezigheidLijst");
  const saveAanwezigheidBtn = document.getElementById("saveAanwezigheidBtn");

  // Leeg en reset selecties
  adminModuleSelect.innerHTML = '<option value="">Kies een module...</option>';
  adminSessionSelect.innerHTML = '<option value="">Kies een sessie...</option>';
  adminSessionSelect.disabled = true;
  aanwezigheidLijstContainer.classList.add("hidden");
  aanwezigheidLijstDiv.innerHTML =
    '<p class="text-gray-600">Selecteer een sessie om de lijst te laden.</p>';
  saveAanwezigheidBtn.disabled = true;

  // Laad modules in de dropdown
  const modulesResponse = await fetch(`${API_BASE_URL}/modules`); // Deze is niet beveiligd
  const modulesData = await modulesResponse.json();
  modulesData.forEach((module) => {
    const option = document.createElement("option");
    option.value = module.id;
    option.textContent = module.naam;
    adminModuleSelect.appendChild(option);
  });

  adminModuleSelect.addEventListener("change", async () => {
    const moduleId = adminModuleSelect.value;
    adminSessionSelect.innerHTML =
      '<option value="">Kies een sessie...</option>';
    adminSessionSelect.disabled = true;
    aanwezigheidLijstContainer.classList.add("hidden");
    aanwezigheidLijstDiv.innerHTML =
      '<p class="text-gray-600">Selecteer een sessie om de lijst te laden.</p>';
    saveAanwezigheidBtn.disabled = true;

    if (moduleId) {
      const response = await fetch(
        `${API_BASE_URL}/admin/modules/${moduleId}/session-dates`,
        {
          headers: { Authorization: ADMIN_TOKEN }, // Token meesturen
        }
      );
      if (!response.ok) {
        alert("Fout bij laden sessies: Mogelijk niet geautoriseerd.");
        // Terug naar login scherm als 403 Forbidden
        if (response.status === 403) {
          ADMIN_TOKEN = null;
          localStorage.removeItem("adminToken");
          showScreen("login-screen");
        }
        return;
      }
      const sessions = await response.json();
      sessions.forEach((session) => {
        const option = document.createElement("option");
        option.value = session.id;
        option.textContent = `${session.formatted_date} om ${
          session.formatted_time
        } (${session.locatie || "Huis 30"}) - Sessie ${session.sessie_nummer}`;
        adminSessionSelect.appendChild(option);
      });
      adminSessionSelect.disabled = false;
    }
  });

  adminSessionSelect.addEventListener("change", async () => {
    const sessieDatumId = adminSessionSelect.value;
    aanwezigheidLijstContainer.classList.add("hidden");
    aanwezigheidLijstDiv.innerHTML = '<p class="text-gray-600">Laden...</p>';
    saveAanwezigheidBtn.disabled = true;

    if (sessieDatumId) {
      const response = await fetch(
        `${API_BASE_URL}/admin/sessie/${sessieDatumId}/aanwezigheid`,
        {
          headers: { Authorization: ADMIN_TOKEN }, // Token meesturen
        }
      );
      if (!response.ok) {
        alert("Fout bij laden aanwezigheid: Mogelijk niet geautoriseerd.");
        // Terug naar login scherm als 403 Forbidden
        if (response.status === 403) {
          ADMIN_TOKEN = null;
          localStorage.removeItem("adminToken");
          showScreen("login-screen");
        }
        return;
      }
      const aanwezigen = await response.json();

      if (aanwezigen.length > 0) {
        let html = '<ul class="space-y-4">';
        aanwezigen.forEach((persoon) => {
          html += `
                        <li class="flex items-center space-x-4 p-3 border-b border-gray-200 last:border-b-0">
                            <input type="checkbox" 
                                   id="aanwezig-${persoon.inschrijving_id}" 
                                   data-inschrijving-id="${
                                     persoon.inschrijving_id
                                   }"
                                   ${persoon.aanwezig ? "checked" : ""} 
                                   class="form-checkbox h-5 w-5 text-blue-DEFAULT">
                            <label for="aanwezig-${
                              persoon.inschrijving_id
                            }" class="flex-1 text-lg font-medium text-indigo-dark">
                                ${persoon.voornaam} ${persoon.achternaam} (${
            persoon.email
          })
                            </label>
                            <input type="text" 
                                   id="opmerking-${persoon.inschrijving_id}"
                                   data-inschrijving-id="${
                                     persoon.inschrijving_id
                                   }"
                                   value="${persoon.opmerkingen || ""}" 
                                   placeholder="Opmerking"
                                   class="flex-none p-2 border border-gray-300 rounded-lg text-sm w-1/3">
                        </li>
                    `;
        });
        html += "</ul>";
        aanwezigheidLijstDiv.innerHTML = html;
        saveAanwezigheidBtn.disabled = false;
      } else {
        aanwezigheidLijstDiv.innerHTML =
          '<p class="text-gray-600">Geen ingeschrevenen voor deze sessie.</p>';
      }
      aanwezigheidLijstContainer.classList.remove("hidden");
    }
  });

  saveAanwezigheidBtn.addEventListener("click", async () => {
    const sessieDatumId = adminSessionSelect.value;
    const updates = [];
    document.querySelectorAll("#aanwezigheidLijst li").forEach((li) => {
      const checkbox = li.querySelector('input[type="checkbox"]');
      const opmerkingInput = li.querySelector('input[type="text"]');
      updates.push({
        inschrijving_id: parseInt(checkbox.dataset.inschrijvingId),
        aanwezig: checkbox.checked,
        opmerkingen: opmerkingInput.value,
      });
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/sessie/${sessieDatumId}/update-aanwezigheid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ADMIN_TOKEN, // Token meesturen
          },
          body: JSON.stringify({ updates }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error || "Fout bij opslaan aanwezigheid.");
      }
    } catch (error) {
      console.error("Fout bij opslaan aanwezigheid:", error);
      alert("Er ging iets mis bij het opslaan van de aanwezigheid.");
    }
  });
}

// Start de login check wanneer de pagina laadt
document.addEventListener("DOMContentLoaded", checkLoginStatus);
