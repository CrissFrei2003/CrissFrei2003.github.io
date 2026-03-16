Propuesta de esquema para `data.json`

Descripción corta
- Este archivo propone un esquema completo y reutilizable para poblar el `index.html` del portafolio. Mantener datos separados del código facilita reutilizar la misma plantilla para distintas versiones.

Campos principales (resumen)
- `nombre`, `titulo`, `profile_pic`, `bio`: información personal para el header.
- `contact`: email, teléfono y ubicación.
- `socials`: lista de redes con `name` y `url`.
- `badges`: etiquetas cortas para mostrar en el header.
- `about`: sección de historia con `titulo` y `texto`.
- `skills`: array por categoría con `items`.
- `projects`: array de proyectos con `id`, `nombre`, `folder`, `descripcion`, `thumbnail`, `demo`, `tecnologias`, `rol`.
- `gallery`, `education`, `experience`, `meta`.

Uso recomendado (ejemplo rápido)
1. Mantener `proyectos/<nombre>/index.html` y `proyectos/<nombre>/data.json` para datos específicos si hace falta.
2. Hacer que `script.js` (o el script que cargue datos) use la ruta raíz `data.json` (o `data.proposal.json`) y renderice las secciones. Ejemplo mínimo:

```js
fetch('data.proposal.json')
  .then(r => r.json())
  .then(data => {
    document.getElementById('name').textContent = data.nombre;
    document.getElementById('career').textContent = data.titulo;
    // Render badges
    const badges = document.getElementById('badges');
    badges.innerHTML = data.badges.map(b => `<span class="badge">${b}</span>`).join('');
    // Render projects list
    const projectsEl = document.getElementById('projects');
    projectsEl.innerHTML = data.projects.map(p => `\n      <article class="project">\n        <a href="${p.demo}">\n          <img src="${p.thumbnail}" alt="${p.nombre}">\n          <h3>${p.nombre}</h3>\n          <p>${p.descripcion}</p>\n        </a>\n      </article>`).join('\n');
  });
```

Siguientes pasos sugeridos
- Revisar y adaptar `data.proposal.json` a contenido real (fotos, rutas, descripciones).
- Reemplazar `data.json` raíz con la versión final o actualizar `script.js` para cargar la nueva ruta.
- Usar `shared/js/utils.js` para centralizar fetch/render si se desea.
