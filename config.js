window.PORTFOLIO_CONFIG = {
  githubUsername: "ldbl1",
  profile: {
    eyebrow: "Automatización · RPA · Power Platform",
    summary: "Diseño, lidero y automatizo procesos con foco en eficiencia, robustez y valor real para negocio.",
    avatar: "./assets/profile.png",
    statusLabel: "Working with ❤ from Toledo"
  },
  show: {
    hero: true,
    about: true,
    repos: true,
    timeline: true,
    skills: true,
    articles: true,
    contact: true
  },
  repos: {
    featuredOnly: true,
    include: ["dwSongs", "ldbl1.github.io", "dockdwsongs"],
    exclude: [],
    excludeForks: true,
    excludeArchived: true,
    max: 9,
    sortBy: "updated",
    manualDescriptions: {
      "dwSongs": "Aplicación de escritorio escrita en python para poder descargar música desde YouTube.",
      "ldbl1.github.io": "Portfolio personal de Lorenzo del Barrio Leal.",
      "dockdwsongs": "Versión dockerizada de la aplicación dwSongs con integración con la API de Jellyfin."
    },
    tags: {}
  },
  articles: {
    source: "local",
    localFile: "./posts/articles.json",
    max: 6
  },
  contact: {
    email: "barrioleal1994@gmail.com",
    provider: "formsubmit",
    formspreeEndpoint: "",
    subjectPrefix: "Contacto desde portfolio"
  },
  languages: {
    flagsPath: "./assets/",
    flags: {
      ES: "es.svg",
      EN: "en.svg",
      FR: "fr.svg"
    }
  },
  theme: {
    defaultMode: "dark",
    accent: "#7c3aed"
  }
};
