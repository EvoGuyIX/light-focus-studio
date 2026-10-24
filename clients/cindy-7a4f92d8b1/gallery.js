const photos = [
  { file: "1-KitchenLiving_1.jpg", title: "Kitchen & Living", alt: "Open kitchen and living area with a large stone island" },
  { file: "2-KitchenCounterDetail.jpg", title: "Kitchen Detail", alt: "Detail view of the kitchen island and counters" },
  { file: "3-KitchenRange.jpg", title: "Kitchen Range", alt: "Kitchen range and cabinetry" },
  { file: "4-DiningKitchen.jpg", title: "Dining & Kitchen", alt: "Dining area beside the kitchen" },
  { file: "5-LivingRoom.jpg", title: "Living Room", alt: "Bright residential living room" },
  { file: "6-SunRoomEntry.jpg", title: "Sunroom Entry", alt: "Entry into the sunroom" },
  { file: "7-SunRoomTurn.jpg", title: "Sunroom", alt: "Alternate view of the sunroom" },
  { file: "8-SunBedroom.jpg", title: "Bedroom", alt: "Sunlit bedroom interior" },
  { file: "9-HallLaundry.jpg", title: "Hall & Laundry", alt: "Hallway and laundry area" },
  { file: "10-Bath.jpg", title: "Bathroom", alt: "Residential bathroom", portrait: true },
  { file: "11-Bedroom2.jpg", title: "Second Bedroom", alt: "Second bedroom interior" },
];

const storageKey = "lf-cindy-1150-favorites";
const grid = document.querySelector("#photo-grid");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxCounter = document.querySelector("#lightbox-counter");
const lightboxDownload = document.querySelector("#lightbox-download");
const lightboxFavorite = document.querySelector("#lightbox-favorite");
const lightboxPlay = document.querySelector("#lightbox-play");
const favoritesFilter = document.querySelector("#favorites-filter");
const favoriteCount = document.querySelector("#favorite-count");
const visibleCount = document.querySelector("#visible-count");

let favorites = new Set(JSON.parse(localStorage.getItem(storageKey) || "[]"));
let currentIndex = 0;
let showingFavorites = false;
let slideshowTimer = null;
let touchStartX = 0;

function photoPath(folder, file) {
  return folder + "/" + encodeURIComponent(file);
}

function saveFavorites() {
  localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  favoriteCount.textContent = favorites.size;
}

function renderGallery() {
  const visible = photos.map((photo, index) => ({ photo, index }))
    .filter(({ index }) => !showingFavorites || favorites.has(index));
  visibleCount.textContent = visible.length;
  favoriteCount.textContent = favorites.size;
  favoritesFilter.setAttribute("aria-pressed", String(showingFavorites));
  favoritesFilter.firstChild.textContent = showingFavorites ? "All photos " : "Favorites ";
  if (!visible.length) {
    grid.innerHTML = '<p class="empty-state">Tap the heart on a photograph to build a favorites view.</p>';
    return;
  }
  grid.innerHTML = visible.map(({ photo, index }, order) => {
    const selected = favorites.has(index);
    return '<article class="photo-card' + (photo.portrait ? ' portrait' : '') + '" style="animation-delay:' + Math.min(order * 45, 360) + 'ms">' +
      '<button class="photo-button" type="button" data-open="' + index + '" aria-label="Open ' + photo.title + '">' +
      '<img src="' + photoPath("previews", photo.file) + '" alt="' + photo.alt + '" loading="lazy" decoding="async" /></button>' +
      '<div class="photo-meta"><p><span>' + String(index + 1).padStart(2, "0") + '</span>' + photo.title + '</p>' +
      '<button class="favorite-button" type="button" data-favorite="' + index + '" aria-label="' + (selected ? "Remove from" : "Add to") + ' favorites" aria-pressed="' + selected + '">' + (selected ? "♥" : "♡") + '</button></div></article>';
  }).join("");
}

function updateLightbox() {
  const photo = photos[currentIndex];
  lightboxImage.src = photoPath("previews", photo.file);
  lightboxImage.alt = photo.alt;
  lightboxCaption.textContent = photo.title;
  lightboxCounter.textContent = (currentIndex + 1) + " / " + photos.length;
  lightboxDownload.href = photoPath("originals", photo.file);
  lightboxDownload.setAttribute("download", photo.file);
  const selected = favorites.has(currentIndex);
  lightboxFavorite.textContent = selected ? "♥" : "♡";
  lightboxFavorite.setAttribute("aria-pressed", String(selected));
  lightboxFavorite.setAttribute("aria-label", (selected ? "Remove from" : "Add to") + " favorites");
}

function openLightbox(index, play = false) {
  currentIndex = index;
  updateLightbox();
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
  document.querySelector("#lightbox-close").focus();
  if (play) startSlideshow();
}

function closeLightbox() {
  stopSlideshow();
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function changePhoto(offset) {
  currentIndex = (currentIndex + offset + photos.length) % photos.length;
  updateLightbox();
}

function toggleFavorite(index) {
  if (favorites.has(index)) favorites.delete(index);
  else favorites.add(index);
  saveFavorites();
  renderGallery();
  if (lightbox.classList.contains("open")) updateLightbox();
}

function startSlideshow() {
  if (slideshowTimer) return;
  lightboxPlay.textContent = "Pause";
  lightboxPlay.setAttribute("aria-pressed", "true");
  lightboxPlay.setAttribute("aria-label", "Pause slideshow");
  slideshowTimer = window.setInterval(() => changePhoto(1), 3500);
}

function stopSlideshow() {
  window.clearInterval(slideshowTimer);
  slideshowTimer = null;
  lightboxPlay.textContent = "Play";
  lightboxPlay.setAttribute("aria-pressed", "false");
  lightboxPlay.setAttribute("aria-label", "Start slideshow");
}

function toggleSlideshow() {
  if (slideshowTimer) stopSlideshow();
  else startSlideshow();
}

grid.addEventListener("click", (event) => {
  const opener = event.target.closest("[data-open]");
  const favorite = event.target.closest("[data-favorite]");
  if (opener) openLightbox(Number(opener.dataset.open));
  if (favorite) toggleFavorite(Number(favorite.dataset.favorite));
});

favoritesFilter.addEventListener("click", () => {
  showingFavorites = !showingFavorites;
  renderGallery();
});

document.querySelector("#start-slideshow").addEventListener("click", () => openLightbox(0, true));
document.querySelector("#lightbox-close").addEventListener("click", closeLightbox);
document.querySelector("#lightbox-previous").addEventListener("click", () => changePhoto(-1));
document.querySelector("#lightbox-next").addEventListener("click", () => changePhoto(1));
lightboxFavorite.addEventListener("click", () => toggleFavorite(currentIndex));
lightboxPlay.addEventListener("click", toggleSlideshow);
lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
lightbox.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 55) changePhoto(distance > 0 ? -1 : 1);
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") changePhoto(-1);
  if (event.key === "ArrowRight") changePhoto(1);
  if (event.key === " ") { event.preventDefault(); toggleSlideshow(); }
});

saveFavorites();
renderGallery();
