# Nuestro tiempo juntos

Página estática en HTML, CSS y JavaScript puro. Abre `index.html` en el navegador; no requiere instalación, framework ni servidor.

## Contador de tiempo
- **Fecha configurada**: 9 de noviembre de 2026, 2:00 p. m., Ciudad de México.
- **Zona horaria**: El cálculo usa `America/Mexico_City` aunque el dispositivo que lo abra esté en otra zona.
- **Modificación**: Para cambiar el momento inicial, edita la constante `START` al inicio de `script.js` con una fecha ISO con desfase horario (ejemplo: `'2026-11-09T14:00:00-06:00'`).
- Los años, meses y días se calculan como unidades de calendario reales (sin aproximar a 30 días).

---

## Álbum de recuerdos (Diario visual)

Debajo del contador se encuentra una sección de diario visual para registrar citas y momentos especiales juntos.

### ¿Cómo agregar nuevas fotografías?

1. **Guarda la fotografía:**
   Coloca tu imagen dentro de la carpeta `assets/recuerdos/` (formatos recomendados: `.jpg`, `.jpeg`, `.png`, `.webp`). Puedes nombrarla como prefieras, por ejemplo `primera-cita.jpg` o `cafecito-tarde.jpg`.

2. **Abre `script.js` y busca el arreglo `memories`:**
   Encuentra la constante `const memories = [ ... ];` y añade un nuevo objeto con los detalles de la cita:

   ```javascript
   const memories = [
       {
           images: [
               "assets/recuerdos/1stdate_1.jpeg",
               "assets/recuerdos/1stdate_2.jpg",
               "assets/recuerdos/1stdate_3.jpg"
           ],
           date: "9 de noviembre de 2026",
           title: "Nuestro primer día",
           description: "El comienzo de algo muy bonito."
       },
       {
           // Si solo es una foto, también puedes usar `image` o `images` con una sola
           image: "assets/recuerdos/cena.jpg",
           date: "9 de diciembre de 2026",
           title: "Nuestra cena especial",
           description: "Una noche inolvidable."
       }
   ];
   ```

   - **`images`**: Lista con una o varias rutas de fotografías (`[ "assets/recuerdos/foto1.jpg", "assets/recuerdos/foto2.jpg" ]`). *También es compatible con `image: "ruta.jpg"` para una sola imagen.*
   - **`date`**: Fecha de la cita en texto.
   - **`title`**: Título del momento.
   - **`description`** *(opcional)*: Breve detalle o frase sobre la cita.

3. **Guarda el archivo:**
   Al recargar `index.html`, la nueva fotografía aparecerá automáticamente en el álbum con su diseño editorial y se podrá visualizar a pantalla completa en el visor (lightbox) con navegación táctil, flechas del teclado y botón de cierre.

> **Nota:** Si la lista `memories` está vacía (`[]`), la página mostrará automáticamente una tarjeta elegante invitando a guardar el primer recuerdo juntos.

---

## Mini Reproductor Musical
- Ubicado en la esquina superior derecha (`header`).
- Incluye el botón interactivo de activación con animación de notas pulsantes.
- Despliega una tarjeta flotante con carátula del álbum, onda sonora animada, títulos, control de tiempo/avance, control de volumen y **botones para cambiar de canción (⏮ anterior / ⏭ siguiente)**.
- **Lista de reproducción continua**: Las canciones se reproducen automáticamente una detrás de otra (`ended` avanza a la siguiente canción en bucle).
- Para agregar más canciones a la lista, solo añade un nuevo objeto al arreglo `playlist` en [script.js](file:///c:/Users/yaela/Desktop/nuestro-tiempo-juntos/script.js):
  ```javascript
  {
      title: "Nombre Canción",
      artist: "Artista",
      cover: "assets/portada.jpg",
      src: "assets/audio.mp3"
  }
  ```
- Función de acoplado automático lateral (`docked`) para mantenerse visible de forma discreta mientras escuchan juntos.
