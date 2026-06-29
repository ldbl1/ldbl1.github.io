window.PORTFOLIO_CONFIG = {
  // GitHub
  githubUsername: "ldbl1",

  // Secciones visibles
  show: {
    hero: true,
    about: true,
    repos: true,
    timeline: true,
    skills: true,
    articles: true,
    contact: true
  },

  // Repositorios: elige qué se ve y qué no.
  // Si featuredOnly = true, solo se muestran los repos incluidos en include.
  repos: {
    featuredOnly: false,
    include: [],
    exclude: [],
    excludeForks: true,
    excludeArchived: true,
    max: 9,
    sortBy: "updated", // updated | stars | name
    manualDescriptions: {
      // "nombre-del-repo": "Descripción personalizada para el portfolio"
    },
    tags: {
      // "nombre-del-repo": ["Python", "RPA", "Selenium"]
    }
  },

  // Artículos: modo local incluido. Más adelante se puede conectar con RSS/DEV.to/Hashnode.
  articles: {
    source: "local", // local
    localFile: "./posts/articles.json",
    max: 6
  },

  // Contacto sin SMTP:
  // Opción recomendada: Formspree. Crea un endpoint gratis y pega aquí la URL.
  // Mientras tanto, el formulario usa mailto como fallback.
  contact: {
    email: "barrioleal1994@gmail.com",
    formspreeEndpoint: "", // ejemplo: https://formspree.io/f/xxxxxxx
    subjectPrefix: "Contacto desde portfolio"
  },

  // Personalización visual
  theme: {
    defaultMode: "dark", // dark | light
    accent: "#7c3aed"
  }
};
