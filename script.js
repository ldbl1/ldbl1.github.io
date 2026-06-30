document.documentElement.classList.add("js");
const CONFIG = window.PORTFOLIO_CONFIG || {};
$ = s => document.querySelector(s);
$$ = s => Array.from(document.querySelectorAll(s));

function escapeHtml(v = "") {
    const m = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    };
    return String(v).replace(/[&<>'"]/g, c => m[c])
}

function nl2p(t = "") {
    return String(t).split(/\n\s*\n/g).map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")
}

function formatDate(d) {
    if (!d) return "Actual";
    return new Intl.DateTimeFormat("es-ES", {
        month: "short",
        year: "numeric"
    }).format(new Date(d))
}

function yearsSince(d) {
    const s = new Date(d),
        n = new Date();
    return Math.max(0, Math.floor((n - s) / (365.25 * 24 * 60 * 60 * 1000)))
}
async function fetchJson(p) {
    const r = await fetch(p);
    if (!r.ok) throw new Error(`No se pudo cargar ${p}`);
    return r.json()
}

function applyVisibility() {
    Object.entries(CONFIG.show || {}).forEach(([k, v]) => {
        const id = k === "hero" ? "top" : k,
            el = document.getElementById(id);
        if (el && !v) el.classList.add("hidden")
    })
}

function renderProfile(data) {
    const p = data.aboutMe.profile,
        full = `${p.name} ${p.surnames}`;
    $("#profileEyebrow").textContent = CONFIG.profile?.eyebrow || "";
    $("#profileName").textContent = full;
    $("#footerName").textContent = full;
    $("#profileTitle").textContent = p.title;
    $("#profileSummary").textContent = CONFIG.profile?.summary || p.description.split("\n")[0];
    $("#statusLabel").textContent = CONFIG.profile?.statusLabel || "";
    if (CONFIG.profile?.avatar) $("#profileAvatar").src = CONFIG.profile.avatar;
    $("#aboutText").innerHTML = nl2p(p.description);
    $("#profileLinks").innerHTML = (data.aboutMe.relevantLinks || []).map((l, i) => `<a class="action-link ${i === 0 ? "primary" : ""}" href="${escapeHtml(l.URL)}" target="_blank" rel="noreferrer">${escapeHtml(l.type)}</a>`).join("");
    $("#mainStack").innerHTML = (data.manfredSpecificData?.mainStackTechs || []).map(t => `<span class="chip">${escapeHtml(t.name)}</span>`).join("");
    const roles = data.experience.jobs.flatMap(j => j.roles),
        first = roles.map(r => r.startDate).sort()[0];
    $("#yearsExp").textContent = `+${yearsSince(first)}`
}

function renderTimeline(data) {
    const jobs = data.experience.jobs.flatMap(job => job.roles.map(role => ({
        job,
        role
    }))).sort((a, b) => new Date(b.role.startDate) - new Date(a.role.startDate));
    $("#timelineList").innerHTML = jobs.map(({
        job,
        role
    }) => {
        const comps = role.competences || [],
            ch = role.challenges?.[0]?.description || "";
        return `<article class="timeline-item reveal"><span class="timeline-dot"></span><div class="timeline-card"><h3>${escapeHtml(role.name)} · ${escapeHtml(job.organization.name)}</h3><p class="timeline-meta">${formatDate(role.startDate)} → ${formatDate(role.finishDate)}</p>${ch ? `<p class="muted">${escapeHtml(ch).replace(/\n/g, "<br>")}</p>` : ""}<div class="chip-list">${comps.map(c => `<span class="chip">${escapeHtml(c.name)}</span>`).join("")}</div></div></article>`
    }).join("")
}

function renderSkills(data) {
    $("#hardSkills").innerHTML = (data.knowledge.hardSkills || []).map(s => `<span class="chip">${escapeHtml(s.skill.name)}</span>`).join("");
    $("#softSkills").innerHTML = (data.knowledge.softSkills || []).map(s => `<span class="chip">${escapeHtml(s.skill.name)}</span>`).join("");
    const path = CONFIG.languages?.flagsPath || "./assets/",
        flags = CONFIG.languages?.flags || {};
    $("#languages").innerHTML = (data.knowledge.languages || []).map(l => {
        const code = String(l.name || "").toUpperCase(),
            file = flags[code],
            flag = file ? `<img class="language-flag" src="${escapeHtml(path + file)}" alt="Bandera ${escapeHtml(code)}"/>` : "";
        return `<div class="language-item">${flag}<div><strong>${escapeHtml(l.fullName)}</strong><br>${escapeHtml(l.level)}</div></div>`
    }).join("");
    $("#studies").innerHTML = (data.knowledge.studies || []).map(s => `<div><strong>${escapeHtml(s.name)}</strong><br>${escapeHtml(s.institution?.name || "")}</div>`).join("")
}
async function renderRepos() {
    const list = $("#repoList");
    try {
        const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?per_page=100&sort=updated`);
        if (!res.ok) throw Error();
        let repos = await res.json();
        $("#repoCount").textContent = repos.length;
        const c = CONFIG.repos || {};
        repos = repos.filter(r => !c.excludeForks || !r.fork).filter(r => !c.excludeArchived || !r.archived).filter(r => !c.exclude?.includes(r.name));
        if (c.featuredOnly) repos = repos.filter(r => c.include?.includes(r.name));
        if (c.sortBy === "stars") repos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        if (c.sortBy === "name") repos.sort((a, b) => a.name.localeCompare(b.name));
        repos = repos.slice(0, c.max || 9);
        list.innerHTML = repos.map(r => {
            const tags = c.tags?.[r.name] || [r.language].filter(Boolean),
                desc = c.manualDescriptions?.[r.name] || r.description || "Repositorio público de GitHub.";
            return `<article class="repo-card reveal"><a class="card-title" href="${r.html_url}" target="_blank" rel="noreferrer">${escapeHtml(r.name)}</a><p class="card-desc">${escapeHtml(desc)}</p><div class="chip-list">${tags.map(t => `<span class="chip">${escapeHtml(t)}</span>`).join("")}</div><div class="card-meta"><span>★ ${r.stargazers_count}</span><span>Actualizado: ${formatDate(r.updated_at)}</span></div></article>`
        }).join("") || `<p class="muted">No hay repos para mostrar con la configuración actual.</p>`
    } catch {
        list.innerHTML = `<p class="muted">No se pudieron cargar los repos ahora mismo.</p>`
    }
}
async function renderArticles() {
    const list = $("#articleList");
    try {
        const a = await fetchJson(CONFIG.articles.localFile);
        list.innerHTML = a.slice(0, CONFIG.articles.max).map(x => `<article class="article-card reveal"><a class="card-title" href="${escapeHtml(x.url)}" ${x.external ? 'target="_blank" rel="noreferrer"' : ""}>${escapeHtml(x.title)}</a><p class="card-desc">${escapeHtml(x.summary)}</p><div class="card-meta"><span>${formatDate(x.date)}</span>${x.tags?.map(t => `<span>#${escapeHtml(t)}</span>`).join("") || ""}</div></article>`).join("")
    } catch {
        list.innerHTML = `<p class="muted">Añade artículos en <code>posts/articles.json</code>.</p>`
    }
}

function setupContact() {
    const f = $("#contactForm");
    if (!f) return;
    f.addEventListener("submit", async e => {
        e.preventDefault();
        const s = $("#formStatus"),
            d = new FormData(f),
            provider = CONFIG.contact.provider || "mailto";
        if (provider === "formspree" && CONFIG.contact.formspreeEndpoint) {
            s.textContent = "Enviando…";
            try {
                const r = await fetch(CONFIG.contact.formspreeEndpoint, {
                    method: "POST",
                    body: d,
                    headers: {
                        Accept: "application/json"
                    }
                });
                if (!r.ok) throw Error();
                f.reset();
                s.textContent = "Mensaje enviado. ¡Gracias!"
            } catch {
                s.textContent = "No se pudo enviar. Prueba con el correo directo."
            }
            return
        }
        if (provider === "formsubmit") {
            f.action = `https://formsubmit.co/${CONFIG.contact.email}`;
            f.method = "POST";
            f.submit();
            return
        }
        location.href = `mailto:${CONFIG.contact.email}?subject=${encodeURIComponent(`${CONFIG.contact.subjectPrefix} - ${d.get("name")}`)}&body=${encodeURIComponent(`${d.get("message")}\n\nDe: ${d.get("name")} <${d.get("email")}>`)}`
    })
}

function createRevealObserver() {
    const o = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) e.target.classList.add("visible")
    }), {
        threshold: .12
    });
    $$(".reveal:not(.visible)").forEach(el => o.observe(el))
}

function setupUi() {
    document.documentElement.dataset.theme = localStorage.getItem("theme") || CONFIG.theme.defaultMode;
    document.documentElement.style.setProperty("--accent", CONFIG.theme.accent);
    $("#year").textContent = new Date().getFullYear();
    $("#themeToggle").addEventListener("click", () => {
        const n = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = n;
        localStorage.setItem("theme", n)
    });
    $("#menuToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
    createRevealObserver()
}
(async function() {
    try {
        applyVisibility();
        setupUi();
        setupContact();
        const data = await fetchJson("./data/manfred.json");
        renderProfile(data);
        renderTimeline(data);
        renderSkills(data);
        await Promise.all([renderRepos(), renderArticles()]);
        createRevealObserver()
    } catch (e) {
        console.error(e);
        document.documentElement.classList.remove("js");
        $("#profileName").textContent = "No se pudo cargar el perfil";
        $("#profileSummary").textContent = "Arranca la web con un servidor local: python -m http.server 8000"
    }
})();