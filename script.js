const CONFIG = window.PORTFOLIO_CONFIG;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[c]));
}

function nl2p(text = "") {
  return String(text)
    .split(/\n\s*\n/g)
    .map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "Actual";
  return new Intl.DateTimeFormat("es-ES", { month: "short", year: "numeric" }).format(new Date(dateString));
}

function yearsSince(dateString) {
  const start = new Date(dateString);
  const now = new Date();
  return Math.max(0, Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000)));
}

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

function applyVisibility() {
  Object.entries(CONFIG.show).forEach(([key, visible]) => {
    const id = key === "hero" ? "top" : key;
    const section = document.getElementById(id);
    if (section && !visible) section.classList.add("hidden");
  });
}

function renderProfile(data) {
  const profile = data.aboutMe.profile;
  const fullName = `${profile.name} ${profile.surnames}`;
  $("#profileName").textContent = fullName;
  $("#footerName").textContent = fullName;
  $("#profileTitle").textContent = profile.title;
  $("#profileSummary").textContent = "Diseño, lidero y automatizo procesos con foco en eficiencia, robustez y valor real para negocio.";
  $("#aboutText").innerHTML = nl2p(profile.description);

  const links = data.aboutMe.relevantLinks || [];
  $("#profileLinks").innerHTML = links.map((link, i) => `
    <a class="action-link ${i === 0 ? "primary" : ""}" href="${escapeHtml(link.URL)}" target="_blank" rel="noreferrer">
      ${escapeHtml(link.type)}
    </a>
  `).join("");

  const stack = data.manfredSpecificData?.mainStackTechs || [];
  $("#mainStack").innerHTML = stack.map(t => `<span class="chip">${escapeHtml(t.name)}</span>`).join("");

  const allRoles = data.experience.jobs.flatMap(job => job.roles);
  const firstStart = allRoles.map(r => r.startDate).sort()[0];
  $("#yearsExp").textContent = `+${yearsSince(firstStart)}`;
}

function renderTimeline(data) {
  const jobs = data.experience.jobs.flatMap(job => job.roles.map(role => ({ job, role })));
  jobs.sort((a, b) => new Date(b.role.startDate) - new Date(a.role.startDate));

  $("#timelineList").innerHTML = jobs.map(({ job, role }) => {
    const competences = role.competences || [];
    const challenge = role.challenges?.[0]?.description || "";
    return `
      <article class="timeline-item reveal">
        <span class="timeline-dot"></span>
        <div class="timeline-card">
          <h3>${escapeHtml(role.name)} · ${escapeHtml(job.organization.name)}</h3>
          <p class="timeline-meta">${formatDate(role.startDate)} → ${formatDate(role.finishDate)}</p>
          ${challenge ? `<p class="muted">${escapeHtml(challenge).replace(/\n/g, "<br>")}</p>` : ""}
          <div class="chip-list">${competences.map(c => `<span class="chip">${escapeHtml(c.name)}</span>`).join("")}</div>
        </div>
      </article>`;
  }).join("");
}

function renderSkills(data) {
  const hard = data.knowledge.hardSkills || [];
  const soft = data.knowledge.softSkills || [];
  const languages = data.knowledge.languages || [];
  const studies = data.knowledge.studies || [];

  $("#hardSkills").innerHTML = hard.map(s => `<span class="chip">${escapeHtml(s.skill.name)}</span>`).join("");
  $("#softSkills").innerHTML = soft.map(s => `<span class="chip">${escapeHtml(s.skill.name)}</span>`).join("");
  $("#languages").innerHTML = languages.map(l => `<div><strong>${escapeHtml(l.fullName)}</strong><br>${escapeHtml(l.level)}</div>`).join("");
  $("#studies").innerHTML = studies.map(s => `<div><strong>${escapeHtml(s.name)}</strong><br>${escapeHtml(s.institution?.name || "")}</div>`).join("");
}

async function renderRepos() {
  const list = $("#repoList");
  try {
    const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?per_page=100&sort=updated`);
    if (!response.ok) throw new Error("GitHub API error");
    let repos = await response.json();

    $("#repoCount").textContent = repos.length;

    repos = repos
      .filter(repo => !CONFIG.repos.excludeForks || !repo.fork)
      .filter(repo => !CONFIG.repos.excludeArchived || !repo.archived)
      .filter(repo => CONFIG.repos.include.length === 0 || CONFIG.repos.include.includes(repo.name) || !CONFIG.repos.featuredOnly)
      .filter(repo => !CONFIG.repos.exclude.includes(repo.name));

    if (CONFIG.repos.featuredOnly) repos = repos.filter(repo => CONFIG.repos.include.includes(repo.name));
    if (CONFIG.repos.sortBy === "stars") repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
    if (CONFIG.repos.sortBy === "name") repos.sort((a, b) => a.name.localeCompare(b.name));
    repos = repos.slice(0, CONFIG.repos.max);

    list.innerHTML = repos.map(repo => {
      const tags = CONFIG.repos.tags[repo.name] || [repo.language].filter(Boolean);
      const desc = CONFIG.repos.manualDescriptions[repo.name] || repo.description || "Repositorio público de GitHub.";
      return `
        <article class="repo-card reveal">
          <a class="card-title" href="${repo.html_url}" target="_blank" rel="noreferrer">${escapeHtml(repo.name)}</a>
          <p class="card-desc">${escapeHtml(desc)}</p>
          <div class="chip-list">${tags.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join("")}</div>
          <div class="card-meta"><span>★ ${repo.stargazers_count}</span><span>Actualizado: ${formatDate(repo.updated_at)}</span></div>
        </article>`;
    }).join("") || `<p class="muted">No hay repos para mostrar con la configuración actual.</p>`;
  } catch (error) {
    list.innerHTML = `<p class="muted">No se pudieron cargar los repos ahora mismo. Revisa el usuario en config.js o la disponibilidad de GitHub API.</p>`;
  }
}

async function renderArticles() {
  const list = $("#articleList");
  try {
    const articles = await fetchJson(CONFIG.articles.localFile);
    list.innerHTML = articles.slice(0, CONFIG.articles.max).map(article => `
      <article class="article-card reveal">
        <a class="card-title" href="${escapeHtml(article.url)}" ${article.external ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHtml(article.title)}</a>
        <p class="card-desc">${escapeHtml(article.summary)}</p>
        <div class="card-meta"><span>${formatDate(article.date)}</span>${article.tags?.map(t => `<span>#${escapeHtml(t)}</span>`).join("") || ""}</div>
      </article>
    `).join("");
  } catch (error) {
    list.innerHTML = `<p class="muted">Añade artículos en <code>posts/articles.json</code>.</p>`;
  }
}

function setupContact() {
  const form = $("#contactForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = $("#formStatus");
    const data = new FormData(form);

    if (CONFIG.contact.formspreeEndpoint) {
      status.textContent = "Enviando…";
      try {
        const response = await fetch(CONFIG.contact.formspreeEndpoint, {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" }
        });
        if (!response.ok) throw new Error("Error al enviar");
        form.reset();
        status.textContent = "Mensaje enviado. ¡Gracias!";
      } catch {
        status.textContent = "No se pudo enviar. Prueba con el correo directo.";
      }
      return;
    }

    const subject = encodeURIComponent(`${CONFIG.contact.subjectPrefix} - ${data.get("name")}`);
    const body = encodeURIComponent(`${data.get("message")}\n\nDe: ${data.get("name")} <${data.get("email")}>`);
    window.location.href = `mailto:${CONFIG.contact.email}?subject=${subject}&body=${body}`;
  });
}

function setupUi() {
  document.documentElement.dataset.theme = localStorage.getItem("theme") || CONFIG.theme.defaultMode;
  document.documentElement.style.setProperty("--accent", CONFIG.theme.accent);
  $("#year").textContent = new Date().getFullYear();

  $("#themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  $("#menuToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => observer.observe(el));
}

(async function init() {
  applyVisibility();
  setupUi();
  setupContact();

  const data = await fetchJson("./data/manfred.json");
  renderProfile(data);
  renderTimeline(data);
  renderSkills(data);
  await Promise.all([renderRepos(), renderArticles()]);

  // Observar elementos creados dinámicamente
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  $$(".reveal:not(.visible)").forEach(el => observer.observe(el));
})();
