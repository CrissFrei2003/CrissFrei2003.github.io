# Guía: Proyecto de Animación de Título con Imágenes - "El Señor de los Anillos"

## 📋 Tabla de Contenidos
1. [Concepto del Proyecto](#concepto-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Paso a Paso del Desarrollo](#paso-a-paso-del-desarrollo)
4. [Conceptos Técnicos Clave](#conceptos-técnicos-clave)
5. [Personalización](#personalización)
6. [Tips y Buenas Prácticas](#tips-y-buenas-prácticas)

---

## 🎬 Concepto del Proyecto

### Idea General
Crear un efecto visual tipo intro de película donde un **título en grandes letras** muestra imágenes animadas dentro de él. Las imágenes cambian automáticamente en una secuencia sincronizada.

### Características Principales
- Título con múltiples líneas de texto
- Solo los **bordes del texto son visibles** (color blanco)
- Las **imágenes aparecen dentro del relleno** del texto
- Animación automática de 5 segundos que cicla a través de 13 imágenes
- Compatible con múltiples extensiones de imagen (.jpg, .png, .webp, .avif, etc.)
- Diseño responsive

---

## 🏗️ Arquitectura General

### Estructura de Carpetas
```
proyectos/animacion/
├── index.html          # Estructura HTML
├── style.css           # Estilos CSS
├── script.js           # Lógica JavaScript
├── GUIA_DESARROLLO.md  # Esta guía
└── img/
    ├── 1.jpg (o cualquier extensión)
    ├── 2.png
    ├── 3.webp
    ├── 4.avif
    ├── 5.jpg
    ├── 6.png
    ├── 7.webp
    ├── 8.jpg
    ├── 9.png
    ├── 10.avif
    ├── 11.jpg
    ├── 12.png
    └── 13.webp
```

### Flujo de Trabajo
1. **HTML** define la estructura básica
2. **CSS** crea el efecto visual (bordes, fondo clipeado, animaciones)
3. **JavaScript** detecta extensiones de imágenes y establece variables CSS dinámicamente

---

## 👨‍💻 Paso a Paso del Desarrollo

### PASO 1: Estructura HTML Básica

```html
<div class="container">
    <div class="slider-wrapper">
        <h1 class="animated-title">EL SEÑOR<br>DE LOS<br>ANILLOS</h1>
    </div>
</div>
```

**Puntos Clave:**
- Usar `<h1>` para semántica
- `<br>` para múltiples líneas
- Clases descriptivas para CSS

---

### PASO 2: Estilos CSS - Efecto de Bordes

#### 2.1 Text Stroke (Bordes del Texto)
```css
.animated-title {
    color: transparent;                    /* Texto transparente */
    -webkit-text-stroke: 1.5px #fff;      /* Borde del texto */
    text-stroke: 1.5px #fff;              /* Fallback */
}
```

**Explicación:**
- `color: transparent` - Hace el texto invisible
- `-webkit-text-stroke` - Crea los bordes (vendor prefix para compatibilidad)
- Ajusta el grosor según necesites (1.5px es delgado, 3px es grueso)

#### 2.2 Background Clipping (Imágenes Dentro)
```css
.animated-title {
    background-size: 100% 100%;           /* Escala imagen al 100% */
    background-position: center;
    background-clip: text;                /* Recorta fondo al texto */
    -webkit-background-clip: text;        /* Vendor prefix */
}
```

**Explicación:**
- `background-clip: text` - Recorta la imagen SOLO dentro del texto
- Las imágenes solo se ven dentro del relleno de las letras
- Los bordes blancos permanecen visibles siempre

#### 2.3 Animación CSS
```css
.animated-title {
    animation: imageSlider 5s steps(13, end) infinite;
}

@keyframes imageSlider {
    0% { background-image: var(--img-1); }
    8% { background-image: var(--img-2); }
    16% { background-image: var(--img-3); }
    /* ... continúa para 13 imágenes ... */
}
```

**Explicación:**
- `5s` - Duración total de la animación
- `steps(13, end)` - Cambia discretamente entre 13 imágenes (efecto de "fotograma por fotograma")
- `infinite` - Repite indefinidamente
- Cada porcentaje es: 100 / 13 ≈ 7.69% ≈ 8% (por simplificar)
- Las variables CSS (`--img-1`, `--img-2`, etc.) se establecen desde JavaScript

---

### PASO 3: JavaScript - Detectar Extensiones

#### 3.1 Función Principal
```javascript
async function detectarExtension(numeroImagen) {
    for (const ext of extensionesAProbar) {
        const rutaImagen = `${carpetaImagenes}${numeroImagen}.${ext}`;
       
        try {
            const response = await fetch(rutaImagen, { method: 'HEAD' });
            if (response.ok) {
                return rutaImagen;
            }
        } catch (error) {
            // Continuar con siguiente extensión
        }
    }
}
```

**Paso a Paso Explicado:**
1. Recibe un número (1-13)
2. Itera sobre extensiones: `.jpg`, `.png`, `.webp`, `.avif`, etc.
3. Usa `fetch` con `method: 'HEAD'` para verificar si existe sin descargar la imagen
4. Si existe, retorna la ruta correcta
5. Si no, continúa con la siguiente extensión

#### 3.2 Establecer Variables CSS
```javascript
async function inicializarImagenes() {
    const promesas = [];
   
    // Detectar extensión para cada imagen (en paralelo)
    for (let i = 1; i <= totalImagenes; i++) {
        promesas.push(detectarExtension(i));
    }
   
    await Promise.all(promesas);
   
    // Establecer variables CSS
    const root = document.documentElement;
    for (let i = 1; i <= totalImagenes; i++) {
        if (imagenesDetectadas[i]) {
            root.style.setProperty(`--img-${i}`, `url('${imagenesDetectadas[i]}')`);
        }
    }
}
 
document.addEventListener('DOMContentLoaded', inicializarImagenes);
```

**Paso a Paso Explicado:**
1. Crea un array de promesas para ejecutar todas las detecciones en paralelo
2. Espera a que todas terminen con `Promise.all()`
3. Accede a la raíz del documento (`:root`)
4. Establece variables CSS dinámicas: `--img-1`, `--img-2`, etc.
5. Se ejecuta cuando el DOM está completamente cargado

---

## 🔧 Conceptos Técnicos Clave

### 1. Text Stroke vs Text Shadow
| Propiedad | Uso | Resultado |
|-----------|-----|-----------|
| `text-stroke` | Crea bordes alrededor del texto | Bordes limpios, relleno transparente |
| `text-shadow` | Sombra detrás del texto | Efecto de sombra, no es un borde |

### 2. Background Clip
```css
background-clip: text;           /* Recorta al texto */
background-clip: padding-box;    /* Recorta al padding (default) */
background-clip: border-box;     /* Recorta al borde */
```

### 3. Variables CSS
```css
/* Declaración */
:root {
    --img-1: url('img/1.jpg');
    --img-2: url('img/2.png');
}
 
/* Uso */
.animated-title {
    background-image: var(--img-1);
}
```

**Ventajas:**
- Valores dinámicos desde JavaScript
- Fácil de actualizar
- Reutilizable en múltiples selectores

### 4. Fetch API con Method HEAD
```javascript
fetch('archivo.jpg', { method: 'HEAD' })
```

**Ventajas:**
- `HEAD` solo verifica si existe (no descarga la imagen)
- Más rápido que descargar el archivo completo
- Devuelve 200 si existe, 404 si no

### 5. Promise.all() para Paralelismo
```javascript
const promesas = [detectar(1), detectar(2), detectar(3)];
await Promise.all(promesas);  // Espera todas simultáneamente
```

**Ventajas:**
- Todas las promesas se ejecutan en paralelo
- Mucho más rápido que hacerlo secuencialmente

---

## 🎨 Personalización

### Cambiar el Título
En `index.html`:
```html
<h1 class="animated-title">TU TEXTO<br>EN VARIAS<br>LINEAS</h1>
```

### Cambiar la Cantidad de Imágenes
1. En `script.js`: Cambia `const totalImagenes = 13;`
2. En `style.css`: Agrega más líneas en `@keyframes imageSlider`:
```css
@keyframes imageSlider {
    0% { background-image: var(--img-1); }
    10% { background-image: var(--img-2); }
    /* ... más líneas ... */
    100% { background-image: var(--img-1); }
}
```

### Cambiar la Velocidad de Animación
En `style.css`:
```css
animation: imageSlider 5s steps(13, end) infinite;
/*                      ^^^-- cambia esto a 3s, 8s, 10s, etc. */
```

### Cambiar el Grosor del Borde
En `style.css`:
```css
-webkit-text-stroke: 1.5px #fff;
/*                   ^^^^-- 1px = delgado, 3px = grueso */
```

### Cambiar el Color del Borde
En `style.css`:
```css
-webkit-text-stroke: 1.5px #fff;
/*                           ^^^-- #fff (blanco), #000 (negro), #ff0000 (rojo) */
```

---

## 💡 Tips y Buenas Prácticas

### 1. Optimización de Imágenes
- Usa formatos modernos (`.webp`, `.avif`) para reducir tamaño
- Redimensiona las imágenes a un tamaño razonable (no 4K si no lo necesitas)
- Comprime las imágenes con herramientas como TinyPNG o ImageOptim

### 2. Performance
- Usa `fetch` con `method: 'HEAD'` para no descargar imágenes completas
- Ejecuta las detecciones en paralelo con `Promise.all()`
- Caché las rutas detectadas para no re-detectar en cada carga

### 3. Compatibilidad de Navegadores
- Usa prefijos `-webkit-` para text-stroke y background-clip
- Verifica soporte en [caniuse.com](https://caniuse.com)
- Prueba en Chrome, Firefox, Safari, Edge

### 4. Responsive Design
Ajusta tamaño de fuente según pantalla:
```css
@media (max-width: 768px) {
    .animated-title {
        font-size: 80px;
    }
}
```

### 5. Accesibilidad
- Asegúrate de que el texto sea legible
- Proporciona suficiente contraste entre borde y fondo
- Usa semántica HTML correcta (`<h1>` para títulos principales)

---

## 🐛 Solución de Problemas

### Las imágenes no se ven
1. Verifica que las imágenes estén en la carpeta `img/`
2. Abre la consola (F12) y busca errores
3. Verifica que los nombres sean: `1.jpg`, `2.png`, etc.

### El borde sale muy grueso
- Reduce `text-stroke` a `1px` o `0.8px`

### Las imágenes se ven deformadas
- Verifica que `background-size: 100% 100%;` esté en el CSS
- La deformación es normal si las imágenes no tienen el mismo aspect ratio

### La animación se ve entrecortada
- Aumenta la duración (cambia `5s` a `8s`)
- Usa `steps()` en lugar de `linear`

---

## 📚 Recursos Útiles

- [MDN - text-stroke](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke)
- [MDN - background-clip](https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip)
- [MDN - Animaciones CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [CSS-Tricks - Variables CSS](https://css-tricks.com/a-complete-guide-to-custom-properties/)

---

## 🎓 Conclusión

Este proyecto combina:
- **CSS avanzado** (text-stroke, background-clip, animaciones)
- **JavaScript moderno** (async/await, Promise.all, fetch API)
- **Detección dinámica** de archivos sin hardcodear rutas

Es una excelente base para crear efectos visuales similares con otros contenidos (galerías, intros, efectos de carrusel).

**¡A crear! 🚀**
