function updateHeaderStation(station) {
  const subtitleEl = document.getElementById("subtitle");
  if (!subtitleEl) return;

  if (!station) {
    // no station hovered – show default help text
    subtitleEl.textContent = "Hover over a station to see the number of bikes";
    return;
  }

  const bikes =
    typeof station.bikesAvailable === "number"
      ? station.bikesAvailable
      : "?";

  subtitleEl.textContent = `${station.name} (bikes: ${bikes})`;
}

function initInfoOverlay() {
  const overlay = document.getElementById("info-overlay");
  const closeBtn = document.getElementById("info-close");

  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener("click", () => {
    overlay.classList.add("hidden");
  });
}

function showInfoOverlay() {
  const overlay = document.getElementById("info-overlay");
  if (!overlay) return;
  overlay.classList.remove("hidden");
}

export { updateHeaderStation, initInfoOverlay, showInfoOverlay };