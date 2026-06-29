# Portfolio GitHub Pages · Lorenzo del Barrio Leal

Plantilla estática para publicar en `github.io`, alimentada por un JSON Manfred y por la API pública de GitHub.

## Publicar

1. Crea un repositorio llamado `ldbl1.github.io`.
2. Copia todos estos ficheros en la raíz del repo.
3. Haz commit y push a `main`.
4. En GitHub: `Settings > Pages > Build and deployment > Source: Deploy from a branch > main / root`.
5. Tu web quedará en `https://ldbl1.github.io`.

## Configurar repos visibles

Edita `config.js`:

```js
repos: {
  featuredOnly: true,
  include: ["repo-importante", "otro-repo"],
  exclude: ["repo-privado-que-no-quiero-mostrar"]
}
```

> Nota: solo se pueden mostrar repos públicos usando la API pública de GitHub desde GitHub Pages.

## Contacto sin SMTP

Tienes dos modos:

- Sin configurar nada: el formulario abre `mailto:` usando tu cliente de correo.
- Recomendado: crea cuenta en Formspree y pega el endpoint en `config.js`:

```js
contact: {
  email: "tu-email@gmail.com",
  formspreeEndpoint: "https://formspree.io/f/xxxxxxx"
}
```

## Artículos

Edita `posts/articles.json`. Puedes poner enlaces internos, externos, Medium, DEV.to, Hashnode, LinkedIn, etc.

## Datos del CV

Tu perfil está en `data/manfred.json`. Si exportas otra versión desde Manfred, sustituye ese fichero.
