// Inicio: 9 nov 2026, 14:00, hora de Ciudad de México.
const START = new Date('2026-11-09T14:00:00-06:00');
const ZONE = 'America/Mexico_City';

const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
});

function parts(d) {
    return Object.fromEntries(
        fmt.formatToParts(d)
            .filter(x => x.type !== 'literal')
            .map(x => [x.type, +x.value])
    );
}

function difference(aDate, bDate) {
    const a = parts(aDate);
    const b = parts(bDate);

    let y = b.year - a.year;
    let m = b.month - a.month;
    let d = b.day - a.day;
    let h = b.hour - a.hour;
    let mi = b.minute - a.minute;
    let s = b.second - a.second;

    if (s < 0) {
        s += 60;
        mi--;
    }
    if (mi < 0) {
        mi += 60;
        h--;
    }
    if (h < 0) {
        h += 24;
        d--;
    }
    if (d < 0) {
        d += new Date(Date.UTC(b.year, b.month - 1, 0)).getUTCDate();
        m--;
    }
    if (m < 0) {
        m += 12;
        y--;
    }

    return {
        years: y,
        months: m,
        days: d,
        hours: h,
        minutes: mi,
        seconds: s
    };
}

function update() {
    const now = new Date();

    if (now < START) {
        document.querySelector('.live').textContent = 'LA CUENTA REGRESIVA COMIENZA PRONTO';
        return;
    }

    const values = difference(START, now);

    for (const [k, v] of Object.entries(values)) {
        const element = document.getElementById(k);
        if (!element) continue;

        element.textContent = ['hours', 'minutes', 'seconds'].includes(k)
            ? String(v).padStart(2, '0')
            : v;
    }
}

// Inicialización del contador
update();
setInterval(update, 1000);

// Animación de estrellas de fondo y estrellas fugaces (Canvas)
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];
let frame = 0;
let lastShootingStarSpawn = 0;

function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const starCount = Math.min(130, Math.floor((window.innerWidth * window.innerHeight) / 9000));
    stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.25 + 0.2,
        a: Math.random() * 0.55 + 0.15,
        p: Math.random() * Math.PI * 2
    }));
}

function spawnShootingStar() {
    // Ángulo diagonal con variación natural (aprox 35° a 50°)
    const angle = (Math.PI / 180) * (35 + Math.random() * 15);
    const speed = 7 + Math.random() * 7;
    const length = 90 + Math.random() * 100;

    // Se originan en la zona superior o borde superior-izquierdo
    const startFromTop = Math.random() > 0.35;
    const x = startFromTop
        ? Math.random() * (window.innerWidth * 0.9)
        : -20;
    const y = startFromTop
        ? -20
        : Math.random() * (window.innerHeight * 0.45);

    shootingStars.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        length,
        life: 0,
        maxLife: 60 + Math.random() * 35, // Duración en frames
        size: 1 + Math.random() * 1.2,
        hue: Math.random() > 0.4 ? '233, 184, 200' : '255, 255, 255' // Tonalidad rosa/cósmica o blanca
    });
}

function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    frame += 0.012;

    // 1. Dibujar estrellas titilantes de fondo
    for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 220, 245, ${s.a * (0.72 + Math.sin(frame + s.p) * 0.28)})`;
        ctx.fill();
    }

    // 2. Generar estrellas fugaces periódicamente (lluvia con intervalos orgánicos)
    const now = performance.now();
    if (now - lastShootingStarSpawn > 1400 + Math.random() * 2200) {
        // En ocasiones caen de 1 a 2 estrellas en ráfaga
        spawnShootingStar();
        if (Math.random() > 0.65) {
            setTimeout(spawnShootingStar, 250 + Math.random() * 400);
        }
        lastShootingStarSpawn = now;
    }

    // 3. Dibujar y actualizar estrellas fugaces
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];

        star.x += star.dx;
        star.y += star.dy;
        star.life++;

        // Curva suave de opacidad (fade-in y fade-out)
        const progress = star.life / star.maxLife;
        let opacity = 0;
        if (progress < 0.2) {
            opacity = progress / 0.2;
        } else {
            opacity = 1 - (progress - 0.2) / 0.8;
        }
        opacity = Math.max(0, Math.min(1, opacity));

        const tailX = star.x - (star.dx / Math.hypot(star.dx, star.dy)) * star.length;
        const tailY = star.y - (star.dy / Math.hypot(star.dx, star.dy)) * star.length;

        // Estela con gradiente luminoso
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(${star.hue}, ${opacity * 0.95})`);
        gradient.addColorStop(0.25, `rgba(${star.hue}, ${opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${star.hue}, 0)`);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.size;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Destello en la cabeza de la estrella fugaz
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowColor = `rgba(${star.hue}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Eliminar si superó su tiempo de vida o salió de la pantalla
        if (
            star.life >= star.maxLife ||
            star.x - star.length > window.innerWidth ||
            star.y - star.length > window.innerHeight
        ) {
            shootingStars.splice(i, 1);
        }
    }

    requestAnimationFrame(draw);
}

resize();
window.addEventListener('resize', resize);
draw();

// ==========================================================================
// Álbum Cronológico de Recuerdos (Diario Visual)
// ==========================================================================

/**
 * Arreglo con la colección de recuerdos de nuestras citas y momentos.
 * Cada elemento puede tener:
 *   images: lista de imágenes [ "foto1.jpg", "foto2.jpg" ]
 *     o también soporta image: "foto1.jpg" si es una sola fotografía.
 *   date: texto con la fecha de la cita (ej. '9 de noviembre de 2026')
 *   title: título breve del momento (ej. 'Nuestra primera cita')
 *   description: detalle u observación romántica opcional
 */
const memories = [
    // Agrega tus recuerdos aquí:
    {
        images: [
            "assets/recuerdos/1stdate_1.jpeg",
            "assets/recuerdos/1stdate_2.jpg",
            "assets/recuerdos/1stdate_3.jpg",
            "assets/recuerdos/1stdate_4.jpg"
        ],
        date: "9 de noviembre de 2026",
        title: "Nuestro primer día",
        description: "El comienzo de algo muy bonito."
    }
];

// Función utilitaria para normalizar la lista de imágenes de un recuerdo
function getMemoryImages(memory) {
    if (Array.isArray(memory.images) && memory.images.length > 0) {
        return memory.images;
    }
    if (typeof memory.image === 'string' && memory.image.trim() !== '') {
        return [memory.image];
    }
    return [];
}

// Lista plana para navegar de forma continua por todas las fotos en el lightbox
let lightboxGallery = [];
let activePhotoIndex = 0;

function renderMemories() {
    const container = document.getElementById('memories-container');
    if (!container) return;

    if (!Array.isArray(memories) || memories.length === 0) {
        container.innerHTML = `
            <div class="memories-empty">
                <span class="memories-empty-icon">✧</span>
                <h3>Aquí comenzará nuestro álbum</h3>
                <p>Aún no hemos guardado fotografías, pero cada una de nuestras próximas citas se convertirá en un recuerdo inolvidable.</p>
            </div>
        `;
        lightboxGallery = [];
        return;
    }

    // Reconstruir galería plana del Lightbox
    lightboxGallery = [];
    memories.forEach((memory, memIndex) => {
        const imgs = getMemoryImages(memory);
        imgs.forEach((imgUrl, imgIndex) => {
            lightboxGallery.push({
                src: imgUrl,
                title: memory.title,
                date: memory.date,
                description: memory.description,
                memoryIndex: memIndex,
                imageIndex: imgIndex,
                totalInBlock: imgs.length
            });
        });
    });

    const grid = document.createElement('div');
    grid.className = 'memories-grid';

    let currentPhotoCounter = 0;

    memories.forEach((memory) => {
        const imgs = getMemoryImages(memory);
        if (imgs.length === 0) return;

        const blockStartPhotoIndex = currentPhotoCounter;
        currentPhotoCounter += imgs.length;

        const item = document.createElement('article');
        item.className = 'memory-item';

        const card = document.createElement('div');
        card.className = 'memory-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Ver recuerdo: ${memory.title || 'Recuerdo'}`);

        const media = document.createElement('div');
        media.className = 'memory-media';

        const img = document.createElement('img');
        img.src = imgs[0]; // Portada principal
        img.alt = memory.title || 'Recuerdo de nuestra cita';
        img.loading = 'lazy';
        img.decoding = 'async';

        const overlay = document.createElement('div');
        overlay.className = 'memory-overlay';

        media.appendChild(img);
        media.appendChild(overlay);

        // Si el bloque tiene múltiples fotografías, mostramos un badge indicador
        if (imgs.length > 1) {
            const badge = document.createElement('span');
            badge.className = 'memory-badge';
            badge.innerHTML = `✦ ${imgs.length} fotos`;
            media.appendChild(badge);
        }

        const content = document.createElement('div');
        content.className = 'memory-content';

        if (memory.date) {
            const meta = document.createElement('div');
            meta.className = 'memory-meta';
            const date = document.createElement('time');
            date.className = 'memory-date';
            date.textContent = memory.date;
            meta.appendChild(date);
            content.appendChild(meta);
        }

        if (memory.title) {
            const title = document.createElement('h3');
            title.className = 'memory-title';
            title.textContent = memory.title;
            content.appendChild(title);
        }

        if (memory.description) {
            const desc = document.createElement('p');
            desc.className = 'memory-desc';
            desc.textContent = memory.description;
            content.appendChild(desc);
        }

        // Tiras en miniatura (thumbnails) si hay más de 1 foto
        if (imgs.length > 1) {
            const thumbsContainer = document.createElement('div');
            thumbsContainer.className = 'memory-thumbs';

            imgs.forEach((thumbSrc, thumbIdx) => {
                const thumb = document.createElement('button');
                thumb.type = 'button';
                thumb.className = `memory-thumb-btn ${thumbIdx === 0 ? 'is-active' : ''}`;
                thumb.setAttribute('aria-label', `Ver foto ${thumbIdx + 1} de ${imgs.length}`);

                const thumbImg = document.createElement('img');
                thumbImg.src = thumbSrc;
                thumbImg.alt = `Miniatura ${thumbIdx + 1}`;
                thumbImg.loading = 'lazy';

                thumb.appendChild(thumbImg);

                // Clic en la miniatura abre directamente esa foto
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openLightbox(blockStartPhotoIndex + thumbIdx);
                });

                thumbsContainer.appendChild(thumb);
            });

            content.appendChild(thumbsContainer);
        }

        card.appendChild(media);
        card.appendChild(content);

        const openItem = () => openLightbox(blockStartPhotoIndex);
        card.addEventListener('click', openItem);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openItem();
            }
        });

        item.appendChild(card);
        grid.appendChild(item);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

// Funciones del Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxDate = document.getElementById('lightbox-date');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxCounter = document.getElementById('lightbox-counter');
const lightboxCloseBtn = document.querySelector('.lightbox-close');
const lightboxPrevBtn = document.querySelector('.lightbox-prev');
const lightboxNextBtn = document.querySelector('.lightbox-next');
const lightboxBackdrop = document.querySelector('.lightbox-backdrop');

function updateLightboxContent(photoIndex) {
    if (!lightboxGallery[photoIndex]) return;
    const item = lightboxGallery[photoIndex];

    activePhotoIndex = photoIndex;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.title || 'Recuerdo ampliado';
    lightboxDate.textContent = item.date || '';
    lightboxTitle.textContent = item.title || '';
    lightboxDesc.textContent = item.description || '';
    lightboxDesc.style.display = item.description ? 'block' : 'none';

    if (lightboxGallery.length > 1) {
        const extraInfo = item.totalInBlock > 1 ? ` · Foto ${item.imageIndex + 1} de ${item.totalInBlock}` : '';
        lightboxCounter.textContent = `${photoIndex + 1} de ${lightboxGallery.length}${extraInfo}`;
        lightboxCounter.style.display = 'inline-block';
        if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'flex';
        if (lightboxNextBtn) lightboxNextBtn.style.display = 'flex';
    } else {
        lightboxCounter.style.display = 'none';
        if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'none';
        if (lightboxNextBtn) lightboxNextBtn.style.display = 'none';
    }
}

function openLightbox(photoIndex) {
    if (!lightbox || !lightboxGallery[photoIndex]) return;
    updateLightboxContent(photoIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function showPrevMemory() {
    if (!lightboxGallery.length) return;
    const prevIndex = (activePhotoIndex - 1 + lightboxGallery.length) % lightboxGallery.length;
    updateLightboxContent(prevIndex);
}

function showNextMemory() {
    if (!lightboxGallery.length) return;
    const nextIndex = (activePhotoIndex + 1) % lightboxGallery.length;
    updateLightboxContent(nextIndex);
}

// Listeners del Lightbox
if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrevMemory);
if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNextMemory);

window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowLeft') {
        showPrevMemory();
    } else if (e.key === 'ArrowRight') {
        showNextMemory();
    }
});

// Inicializar el renderizado del álbum
renderMemories();

// ==========================================================================
// Mini Reproductor Musical Interactivo con Lista de Pistas
// ==========================================================================

const playlist = [
    {
        title: "I'll Take Care of You",
        artist: "Tyler, The Creator",
        cover: "assets/donttaptheglass.jpg",
        src: "assets/09. I'll Take Care of You.mp3"
    },
    {
        title: "Lovebomb",
        artist: "The Neighbourhood",
        cover: "assets/ultrasound.jpg",
        src: "assets/08 - Lovebomb.mp3"
    }
];

let currentTrackIndex = 0;
const audio = document.getElementById("audioPlayer");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");

const audioPlayerCard = document.getElementById("audioPlayerCard");
const playerPeekTab = document.getElementById("playerPeekTab");
const playerCoverArt = document.getElementById("playerCoverArt");
const playerTrackName = document.getElementById("playerTrackName");
const playerArtistName = document.getElementById("playerArtistName");
const playerProgressBar = document.getElementById("playerProgressBar");
const playerCurrentTime = document.getElementById("playerCurrentTime");
const playerDuration = document.getElementById("playerDuration");
const playerVolumeSlider = document.getElementById("playerVolumeSlider");
const playerVolIcon = document.getElementById("playerVolIcon");
const playerPrevBtn = document.getElementById("playerPrevBtn");
const playerNextBtn = document.getElementById("playerNextBtn");

let isUserSeeking = false;
let autoDockTimer = null;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function loadTrack(index) {
    if (!audio || !playlist[index]) return;
    currentTrackIndex = index;
    const track = playlist[index];
    audio.src = track.src;

    if (playerTrackName) playerTrackName.textContent = track.title;
    if (playerArtistName) playerArtistName.textContent = track.artist;
    if (playerCoverArt) playerCoverArt.src = track.cover;

    if (playerProgressBar) playerProgressBar.value = 0;
    if (playerCurrentTime) playerCurrentTime.textContent = "0:00";
    if (playerDuration) playerDuration.textContent = "0:00";
}

function playTrack(index) {
    loadTrack(index);
    if (!audio) return;
    audio.play().then(() => {
        updateMusicButtonState();
    }).catch(err => {
        console.info("Interacción requerida para audio:", err);
    });
}

function playNextTrack() {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
}

function playPrevTrack() {
    // Si ya lleva más de 3 segundos, reiniciar la misma canción; de lo contrario ir a la anterior
    if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIndex);
}

function startAutoDockTimer() {
    clearTimeout(autoDockTimer);
    if (!audio || audio.paused) return;

    autoDockTimer = setTimeout(() => {
        if (!isUserSeeking && audioPlayerCard && audioPlayerCard.classList.contains("active")) {
            audioPlayerCard.classList.add("docked");
        }
    }, 5000);
}

function undockPlayer() {
    clearTimeout(autoDockTimer);
    if (audioPlayerCard) {
        audioPlayerCard.classList.remove("docked");
    }
    startAutoDockTimer();
}

function updateMusicPlayerUI() {
    if (!audio) return;

    const track = playlist[currentTrackIndex];
    if (playerTrackName && track) playerTrackName.textContent = track.title;
    if (playerArtistName && track) playerArtistName.textContent = track.artist;
    if (playerCoverArt && track && playerCoverArt.getAttribute("src") !== track.cover) {
        playerCoverArt.src = track.cover;
    }

    if (!isUserSeeking && playerProgressBar && playerCurrentTime && audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        playerProgressBar.value = progress || 0;
        playerCurrentTime.textContent = formatTime(audio.currentTime);
        playerDuration.textContent = formatTime(audio.duration);
    } else if (playerDuration && audio.duration) {
        playerDuration.textContent = formatTime(audio.duration);
    }
}

function updateMusicButtonState() {
    if (!audio) return;

    if (!audio.paused) {
        if (musicToggle) {
            musicToggle.classList.add("playing");
            musicToggle.setAttribute("aria-pressed", "true");
        }
        if (musicLabel) {
            musicLabel.textContent = "Pausar música";
        }
        if (audioPlayerCard) {
            audioPlayerCard.classList.add("active");
            audioPlayerCard.setAttribute("aria-hidden", "false");
        }
        updateMusicPlayerUI();
        startAutoDockTimer();
    } else {
        clearTimeout(autoDockTimer);
        if (musicToggle) {
            musicToggle.classList.remove("playing");
            musicToggle.setAttribute("aria-pressed", "false");
        }
        if (musicLabel) {
            musicLabel.textContent = "Activar música";
        }
        if (audioPlayerCard) {
            audioPlayerCard.classList.remove("active", "docked");
            audioPlayerCard.setAttribute("aria-hidden", "true");
        }
    }
}

// Botón de activación / pausa general
if (musicToggle) {
    musicToggle.addEventListener("click", () => {
        if (!audio) return;

        if (!audio.src) {
            loadTrack(currentTrackIndex);
        }

        if (audio.paused) {
            audio.play().then(() => {
                updateMusicButtonState();
            }).catch(err => {
                console.info("Interacción requerida para audio:", err);
            });
        } else {
            audio.pause();
            updateMusicButtonState();
        }
    });
}

// Botones de canción anterior y siguiente
if (playerPrevBtn) {
    playerPrevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playPrevTrack();
    });
}

if (playerNextBtn) {
    playerNextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playNextTrack();
    });
}

// Interacción al hacer clic en la tarjeta o pestaña acoplada
if (audioPlayerCard) {
    audioPlayerCard.addEventListener("click", (e) => {
        if (audioPlayerCard.classList.contains("docked")) {
            e.stopPropagation();
            undockPlayer();
        }
    });

    audioPlayerCard.addEventListener("touchstart", () => {
        if (!audioPlayerCard.classList.contains("docked")) {
            startAutoDockTimer();
        }
    }, { passive: true });

    audioPlayerCard.addEventListener("mouseenter", () => {
        clearTimeout(autoDockTimer);
    });

    audioPlayerCard.addEventListener("mouseleave", () => {
        if (audioPlayerCard.classList.contains("active") && !audioPlayerCard.classList.contains("docked")) {
            startAutoDockTimer();
        }
    });
}

// Barra de progreso interactiva
if (playerProgressBar) {
    playerProgressBar.addEventListener("input", () => {
        isUserSeeking = true;
        if (audio && audio.duration) {
            const seekTime = (playerProgressBar.value / 100) * audio.duration;
            playerCurrentTime.textContent = formatTime(seekTime);
        }
    });

    playerProgressBar.addEventListener("change", () => {
        if (audio && audio.duration) {
            audio.currentTime = (playerProgressBar.value / 100) * audio.duration;
        }
        isUserSeeking = false;
    });
}

// Control de volumen
if (playerVolumeSlider) {
    playerVolumeSlider.addEventListener("input", (e) => {
        const vol = parseFloat(e.target.value);
        if (audio) audio.volume = vol;
        if (playerVolIcon) {
            if (vol === 0) playerVolIcon.textContent = "🔇";
            else if (vol < 0.5) playerVolIcon.textContent = "🔉";
            else playerVolIcon.textContent = "🔊";
        }
    });
}

if (playerVolIcon) {
    playerVolIcon.addEventListener("click", () => {
        if (!audio) return;
        if (audio.volume > 0) {
            audio.dataset.prevVolume = audio.volume;
            audio.volume = 0;
            if (playerVolumeSlider) playerVolumeSlider.value = 0;
            playerVolIcon.textContent = "🔇";
        } else {
            const restored = parseFloat(audio.dataset.prevVolume || 1);
            audio.volume = restored;
            if (playerVolumeSlider) playerVolumeSlider.value = restored;
            playerVolIcon.textContent = restored < 0.5 ? "🔉" : "🔊";
        }
    });
}

// Event listeners del reproductor
if (audio) {
    audio.addEventListener("timeupdate", updateMusicPlayerUI);
    audio.addEventListener("loadedmetadata", updateMusicPlayerUI);
    audio.addEventListener("play", updateMusicButtonState);
    audio.addEventListener("pause", updateMusicButtonState);

    // Reproducción continua: cuando termina una pista, pasa a la siguiente
    audio.addEventListener("ended", () => {
        playNextTrack();
    });

    // Cargar la primera pista por defecto
    loadTrack(0);
}



