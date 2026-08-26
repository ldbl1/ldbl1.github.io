document.documentElement.classList.add("js");
const CONFIG = window.PORTFOLIO_CONFIG || {};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function escapeHtml(value = "") {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" };
  return String(value).replace(/[&<>'"]/g, (char) => map[char]);
}
function nl2p(text = "") {
  return String(text).split(/\n\s*\n/g).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
}
function formatDate(date) {
  if (!date) return "Actual";
  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(new Date(date));
}
function yearsSince(date) {
  const start = new Date(date); const now = new Date();
  return Math.max(0, Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000)));
}
async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}
function chips(items = []) { return items.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join(""); }
function applyVisibility() {
  Object.entries(CONFIG.show || {}).forEach(([key, visible]) => {
    const id = key === "hero" ? "top" : key;
    const element = document.getElementById(id);
    if (element && !visible) element.classList.add("hidden");
  });
}
function renderProfile(data) {
  const profile = data.aboutMe.profile;
  const fullName = `${profile.name} ${profile.surnames}`;
  $("#profileEyebrow").textContent = CONFIG.profile?.eyebrow || "";
  $("#profileName").textContent = fullName; $("#footerName").textContent = fullName;
  $("#profileTitle").textContent = profile.title;
  $("#profileSummary").textContent = CONFIG.profile?.summary || profile.description.split("\n")[0];
  $("#statusLabel").textContent = CONFIG.profile?.statusLabel || "";
  if (CONFIG.profile?.avatar) $("#profileAvatar").src = CONFIG.profile.avatar;
  $("#aboutText").innerHTML = nl2p(profile.description);
  $("#profileLinks").innerHTML = (data.aboutMe.relevantLinks || []).map((link, index) => `<a class="action-link ${index === 0 ? "primary" : ""}" href="${escapeHtml(link.URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.type)}</a>`).join("");
  $("#mainStack").innerHTML = chips((data.manfredSpecificData?.mainStackTechs || []).map((tech) => tech.name));
  const roles = data.experience.jobs.flatMap((job) => job.roles);
  const first = roles.map((role) => role.startDate).sort()[0];
  $("#yearsExp").textContent = `+${yearsSince(first)}`;
}
function renderTimeline(data) {
  const jobs = data.experience.jobs.flatMap((job) => job.roles.map((role) => ({ job, role }))).sort((a, b) => new Date(b.role.startDate) - new Date(a.role.startDate));
  $("#timelineList").innerHTML = jobs.map(({ job, role }) => {
    const challenge = role.challenges?.[0]?.description || "";
    return `<article class="timeline-item reveal"><span class="timeline-dot" aria-hidden="true"></span><div class="timeline-card"><h3>${escapeHtml(role.name)} · ${escapeHtml(job.organization.name)}</h3><p class="timeline-meta">${formatDate(role.startDate)} → ${formatDate(role.finishDate)}</p>${challenge ? `<div class="rich-text">${nl2p(challenge)}</div>` : ""}<div class="chip-list">${chips((role.competences || []).map((c) => c.name))}</div></div></article>`;
  }).join("");
}
function renderSkills(data) {
  $("#hardSkills").innerHTML = chips((data.knowledge.hardSkills || []).map((s) => s.skill.name));
  $("#softSkills").innerHTML = chips((data.knowledge.softSkills || []).map((s) => s.skill.name));
  const path = CONFIG.languages?.flagsPath || "./assets/"; const flags = CONFIG.languages?.flags || {};
  $("#languages").innerHTML = (data.knowledge.languages || []).map((lang) => { const code = String(lang.name || "").toUpperCase(); const file = flags[code]; return `<div class="language-item">${file ? `<img class="language-flag" src="${escapeHtml(path + file)}" alt="Bandera ${escapeHtml(code)}">` : ""}<div><strong>${escapeHtml(lang.fullName)}</strong><br><span>${escapeHtml(lang.level)}</span></div></div>`; }).join("");
  $("#studies").innerHTML = (data.knowledge.studies || []).map((study) => `<div><strong>${escapeHtml(study.name)}</strong><br><span>${escapeHtml(study.institution?.name || "")}</span></div>`).join("");
}

async function renderHomelab() {
  const introElement = $("#homelabIntro");
  const nodesElement = $("#homelabNodes");
  const servicesElement = $("#homelabServices");
  const skillsElement = $("#homelabSkills");

  try {
    const jsonPath =
      CONFIG.homelab?.localFile || "./data/homelab.json";

    const data = await fetchJson(jsonPath);

    /*
     * Tu JSON utiliza:
     * - description
     * - hosts
     * - serviceCategories
     * - capabilities como objetos
     */

    introElement.textContent =
      data.description || data.summary || "";

    /*
     * Hosts: ServerLorodo y PiLorodo
     */
    nodesElement.innerHTML = (data.hosts || [])
      .map((host) => {
        const hostBadges = [
          ...(host.hardware || []),
          ...(host.software || [])
        ];

        return `
          <article class="panel reveal">
            <p class="eyebrow">
              ${escapeHtml(host.type || "")}
            </p>

            <h3>
              ${escapeHtml(host.name || "")}
            </h3>

            <p class="muted">
              ${escapeHtml(host.description || "")}
            </p>

            <div class="chip-list">
              ${chips(hostBadges)}
            </div>
          </article>
        `;
      })
      .join("");

    /*
     * Categorías y servicios
     */
    servicesElement.innerHTML = "";

    (data.serviceCategories || []).forEach((category) => {
      const article = document.createElement("article");
      article.className = "article-card reveal";

      const title = document.createElement("h3");
      title.className = "card-title";
      title.textContent = category.name || "";

      const description = document.createElement("p");
      description.className = "card-desc";
      description.textContent = category.description || "";

      const chipList = document.createElement("div");
      chipList.className = "chip-list";

      (category.services || []).forEach((service) => {
        const link = document.createElement("a");

        link.className = "chip";
        link.href = service.url || "#";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = service.name || "Ver proyecto";
        link.title = `Abrir la página de ${service.name}`;

        link.setAttribute(
          "aria-label",
          `Abrir la página de ${service.name} en una pestaña nueva`
        );

        chipList.appendChild(link);
      });

      article.appendChild(title);
      article.appendChild(description);
      article.appendChild(chipList);

      servicesElement.appendChild(article);
    });

    /*
     * Capacidades técnicas.
     *
     * En tu JSON son objetos con:
     * - title
     * - description
     */
    skillsElement.innerHTML = (data.capabilities || [])
      .map(
        (capability) => `
          <span
            class="chip"
            title="${escapeHtml(capability.description || "")}"
          >
            ${escapeHtml(capability.title || "")}
          </span>
        `
      )
      .join("");

    /*
     * Activa las animaciones para los elementos
     * que acabamos de crear dinámicamente.
     */
    createRevealObserver();
  } catch (error) {
    console.error("Error cargando el HomeLab:", error);

    introElement.textContent =
      "No se pudo cargar la información del HomeLab.";

    nodesElement.innerHTML = `
      <article class="panel">
        <h3>Error cargando homelab.json</h3>

        <p class="muted">
          ${escapeHtml(error.message)}
        </p>
      </article>
    `;

    servicesElement.innerHTML = "";
    skillsElement.innerHTML = "";
  }
}

async function renderRepos() {
  const list = $("#repoList");
  try {
    const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?per_page=100&sort=updated`);
    if (!response.ok) throw new Error("GitHub API error");
    let repos = await response.json(); $("#repoCount").textContent = repos.length;
    const cfg = CONFIG.repos || {};
    repos = repos.filter((r) => !cfg.excludeForks || !r.fork).filter((r) => !cfg.excludeArchived || !r.archived).filter((r) => !cfg.exclude?.includes(r.name));
    if (cfg.featuredOnly) repos = repos.filter((r) => cfg.include?.includes(r.name));
    if (cfg.sortBy === "stars") repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    if (cfg.sortBy === "name") repos.sort((a, b) => a.name.localeCompare(b.name));
    repos = repos.slice(0, cfg.max || 9);
    list.innerHTML = repos.map((repo) => { const tags = cfg.tags?.[repo.name] || [repo.language].filter(Boolean); const desc = cfg.manualDescriptions?.[repo.name] || repo.description || "Repositorio público de GitHub."; return `<article class="repo-card reveal"><a class="card-title" href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a><p class="card-desc">${escapeHtml(desc)}</p><div class="chip-list">${chips(tags)}</div><div class="card-meta"><span>★ ${repo.stargazers_count}</span><span>Actualizado: ${formatDate(repo.updated_at)}</span></div></article>`; }).join("") || `<article class="panel">No hay repositorios para mostrar.</article>`;
  } catch { list.innerHTML = `<article class="panel">No se pudieron cargar los repositorios ahora mismo.</article>`; }
}
async function renderArticles() {
  const list = $("#articleList");
  try {
    const articles = await fetchJson(CONFIG.articles.localFile);
    list.innerHTML = articles.slice(0, CONFIG.articles.max).map((article) => `<article class="article-card reveal"><a class="card-title" href="${escapeHtml(article.url)}" ${article.external ? 'target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(article.title)}</a><p class="card-desc">${escapeHtml(article.summary)}</p><div class="chip-list">${chips((article.tags || []).map((tag) => `#${tag}`))}</div><div class="card-meta"><span>${formatDate(article.date)}</span></div></article>`).join("");
  } catch { list.innerHTML = `<article class="panel">No se pudieron cargar los artículos.</article>`; }
}
function setupContact() {
  const form = $("#contactForm"); if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault(); const status = $("#formStatus"); const data = new FormData(form); const contact = CONFIG.contact || {};
    status.textContent = "Enviando…";
    const endpoint = contact.formsubmitEndpoint || form.getAttribute("action") || (contact.formsubmitToken ? `https://formsubmit.cloud/f/${contact.formsubmitToken}` : "");
    if (!endpoint) { status.textContent = "No se ha configurado el formulario de contacto."; return; }
    form.querySelectorAll(".formsubmit-hidden").forEach((el) => el.remove());
    const subject = document.createElement("input"); subject.type = "hidden"; subject.name = "_subject"; subject.value = `${contact.subjectPrefix || "Contacto desde portfolio"} - ${data.get("name") || "Nuevo mensaje"}`; subject.className = "formsubmit-hidden"; form.appendChild(subject);
    form.action = endpoint; form.method = "POST"; form.submit();
  });
}
function createRevealObserver() {
  if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("visible")); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
  $$(".reveal:not(.visible)").forEach((el) => observer.observe(el));
}
function setupUi() {
  document.documentElement.dataset.theme = localStorage.getItem("theme") || CONFIG.theme?.defaultMode || "dark";
  if (CONFIG.theme?.accent) document.documentElement.style.setProperty("--accent", CONFIG.theme.accent);
  $("#year").textContent = new Date().getFullYear();
  $("#themeToggle")?.addEventListener("click", () => { const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark"; document.documentElement.dataset.theme = next; localStorage.setItem("theme", next); });
  $("#menuToggle")?.addEventListener("click", () => { const open = $("#navLinks").classList.toggle("open"); $("#menuToggle").setAttribute("aria-expanded", String(open)); });
  $$("#navLinks a").forEach((link) => link.addEventListener("click", () => $("#navLinks").classList.remove("open")));
}
(async function init() {
  try {
    applyVisibility(); setupUi(); setupContact();
    const data = await fetchJson("./data/manfred.json");
    renderProfile(data); renderTimeline(data); renderSkills(data);
    await Promise.all([renderHomelab(), renderRepos(), renderArticles()]);
    createRevealObserver();
  } catch (error) {
    console.error(error); document.documentElement.classList.remove("js");
    if ($("#profileName")) $("#profileName").textContent = "No se pudo cargar el portfolio";
    if ($("#profileSummary")) $("#profileSummary").textContent = "Ejecuta la web mediante un servidor local para permitir la carga de los archivos JSON.";
  }
})();