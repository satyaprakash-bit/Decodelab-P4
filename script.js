/**
 * DecodeLabs Full Stack Project 4 - Frontend
 * -------------------------------------------
 * Demonstrates the full IPO (Input -> Process -> Output) loop:
 *   1. Send requests to the backend with fetch() + async/await
 *   2. Parse JSON responses
 *   3. Dynamically inject data into the DOM (textContent, never innerHTML
 *      with untrusted data, to avoid XSS)
 *   4. Handle errors defensively with try/catch/finally + status checks
 */

const API_BASE = "http://localhost:5000/api/interns";
document.getElementById("api-base-display").textContent = API_BASE;

// ---- DOM references --------------------------------------------------------
const form = document.getElementById("intern-form");
const idField = document.getElementById("intern-id");
const nameField = document.getElementById("name");
const roleField = document.getElementById("role");
const emailField = document.getElementById("email");
const contactField = document.getElementById("contact");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const listEl = document.getElementById("intern-list");
const loadingEl = document.getElementById("loading");
const emptyStateEl = document.getElementById("empty-state");
const bannerEl = document.getElementById("banner");
const refreshBtn = document.getElementById("refresh-btn");

// ---- UI helpers -------------------------------------------------------------

function showBanner(message, type = "error") {
  bannerEl.textContent = message;
  bannerEl.className = `banner ${type}`;
  bannerEl.classList.remove("hidden");
  // Auto-hide success banners after a few seconds
  if (type === "success") {
    setTimeout(() => bannerEl.classList.add("hidden"), 3000);
  }
}

function hideBanner() {
  bannerEl.classList.add("hidden");
}

function setLoading(isLoading) {
  loadingEl.classList.toggle("hidden", !isLoading);
}

function resetForm() {
  form.reset();
  idField.value = "";
  formTitle.textContent = "Add New Intern";
  submitBtn.textContent = "Add Intern";
  cancelEditBtn.classList.add("hidden");
}

// Turn a raw fetch Response into parsed JSON, or throw a descriptive error.
// This is the "diagnostic vocabulary" step: never assume success, always
// check response.ok before trusting the payload.
async function parseResponseOrThrow(response) {
  let payload = null;
  try {
    // 204 No Content has no body to parse
    if (response.status !== 204) {
      payload = await response.json();
    }
  } catch (parseErr) {
    // Body wasn't valid JSON (e.g. server returned HTML error page)
    payload = null;
  }

  if (!response.ok) {
    const message =
      (payload && payload.error) ||
      `Request failed with status ${response.status} (${response.statusText})`;
    throw new Error(message);
  }

  return payload;
}

// ---- Rendering ---------------------------------------------------------------

function renderInterns(interns) {
  listEl.innerHTML = ""; // clear previous render (safe: static markup, not user data)

  if (!interns || interns.length === 0) {
    emptyStateEl.classList.remove("hidden");
    return;
  }
  emptyStateEl.classList.add("hidden");

  interns.forEach((intern) => {
    const li = document.createElement("li");
    li.className = "intern-card";

    const info = document.createElement("div");
    info.className = "intern-info";

    const nameEl = document.createElement("strong");
    nameEl.textContent = intern.name; // textContent, not innerHTML -> XSS-safe

    const metaEl = document.createElement("span");
    metaEl.textContent = `${intern.role} • ${intern.email}${intern.contact ? " • " + intern.contact : ""}`;

    info.appendChild(nameEl);
    info.appendChild(metaEl);

    const actions = document.createElement("div");
    actions.className = "intern-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "secondary";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(intern));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteIntern(intern.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);
    listEl.appendChild(li);
  });
}

// ---- API calls (the actual frontend <-> backend integration) ----------------

async function loadInterns() {
  setLoading(true);
  hideBanner();
  try {
    const response = await fetch(API_BASE);
    const data = await parseResponseOrThrow(response);
    renderInterns(data);
  } catch (err) {
    showBanner(`Couldn't load interns: ${err.message}`, "error");
    renderInterns([]); // fallback UI instead of leaving stale/broken state
  } finally {
    setLoading(false);
  }
}

async function createIntern(intern) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intern),
  });
  return parseResponseOrThrow(response);
}

async function updateIntern(id, intern) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intern),
  });
  return parseResponseOrThrow(response);
}

async function deleteIntern(id) {
  if (!confirm("Remove this intern?")) return;
  try {
    const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    await parseResponseOrThrow(response);
    showBanner("Intern removed.", "success");
    await loadInterns();
  } catch (err) {
    showBanner(`Couldn't delete intern: ${err.message}`, "error");
  }
}

// ---- Form handling ------------------------------------------------------------

function startEdit(intern) {
  idField.value = intern.id;
  nameField.value = intern.name;
  roleField.value = intern.role;
  emailField.value = intern.email;
  contactField.value = intern.contact || "";

  formTitle.textContent = `Edit Intern #${intern.id}`;
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelEditBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideBanner();

  const payload = {
    name: nameField.value.trim(),
    role: roleField.value.trim(),
    email: emailField.value.trim(),
    contact: contactField.value.trim(),
  };

  const id = idField.value;
  submitBtn.disabled = true;

  try {
    if (id) {
      await updateIntern(id, payload);
      showBanner("Intern updated successfully.", "success");
    } else {
      await createIntern(payload);
      showBanner("Intern added successfully.", "success");
    }
    resetForm();
    await loadInterns();
  } catch (err) {
    showBanner(`Save failed: ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

refreshBtn.addEventListener("click", loadInterns);

// ---- Kick things off -----------------------------------------------------------
loadInterns();
