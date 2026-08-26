window.PORTFOLIO_CONFIG = {
  githubUsername: "ldbl1",
  profile: {
    eyebrow: "Automatización · RPA · Power Platform · Self-hosting",
    summary: "Diseño, lidero y automatizo procesos con foco en eficiencia, robustez y valor real para negocio.",
    avatar: "https://media.licdn.com/dms/image/v2/D4E03AQGGafTxgTrx-g/profile-displayphoto-crop_800_800/B4EZ_j8gWJIUAI-/0/1786235718500?e=1789603200&v=beta&t=leS8_4ZnEM6gagMY_ZTo0NyzQveiWdmGzirdpd0asf8",
    statusLabel: "Working with ❤ from Toledo"
  },
  show: { hero: true, about: true, repos: true, timeline: true, skills: true, homelab: true, articles: true, contact: true },
  homelab: { localFile: "./data/homelab.json" },
  repos: {
    featuredOnly: true,
    include: ["dwSongs", "ldbl1.github.io", "dockdwsongs"],
    exclude: [], excludeForks: true, excludeArchived: true, max: 9, sortBy: "updated",
    manualDescriptions: {
      dwSongs: "Aplicación de escritorio escrita en Python para descargar música desde YouTube.",
      "ldbl1.github.io": "Portfolio personal de Lorenzo del Barrio Leal.",
      dockdwsongs: "Versión dockerizada de dwSongs con integración con la API de Jellyfin."
    },
    tags: {}
  },
  articles: { source: "local", localFile: "./posts/articles.json", max: 6 },
  contact: {
    email: "barrioleal1994@gmail.com", provider: "formsubmit",
    formsubmitToken: "963c7093-b423-49fd-bd15-e28757074e08", formspreeEndpoint: "", subjectPrefix: "Contacto desde portfolio"
  },
  languages: { flagsPath: "./assets/", flags: { ES: "es.svg", EN: "en.svg", FR: "fr.svg" } },
  theme: { defaultMode: "dark", accent: "#7c3aed" }
};