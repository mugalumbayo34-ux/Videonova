const tabs = document.querySelectorAll(".tab");
const videoPanel = document.getElementById("video-panel");
const filmPanel = document.getElementById("film-panel");
tabs.forEach(tab => tab.addEventListener("click", () => {
  tabs.forEach(t => t.classList.toggle("active", t === tab));
  const film = tab.dataset.tab === "film";
  videoPanel.hidden = film;
  filmPanel.hidden = !film;
}));

const imageInput = document.getElementById("image");
const preview = document.getElementById("image-preview");
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) { preview.hidden = true; preview.removeAttribute("src"); return; }
  if (file.size > 3 * 1024 * 1024) {
    alert("L’image dépasse 3 Mo. Choisis une image plus légère.");
    imageInput.value = ""; preview.hidden = true; return;
  }
  preview.src = URL.createObjectURL(file);
  preview.hidden = false;
});

const form = document.getElementById("video-form");
const generateBtn = document.getElementById("generate-btn");
const result = document.getElementById("result");
const statusMessage = document.getElementById("status-message");
const progressBar = document.getElementById("progress-bar");
const video = document.getElementById("result-video");
const downloadLink = document.getElementById("download-link");

function stylePrompt(prompt, style) {
  const styles = {
    cinematic: "cinematic film, dramatic lighting, smooth camera movement, professional color grading",
    realistic: "photorealistic, natural movement, realistic lighting and textures",
    anime: "high-quality anime style, expressive animation, detailed backgrounds",
    fantasy: "epic fantasy atmosphere, magical details, imaginative cinematic visuals",
    commercial: "polished commercial advertisement, premium product cinematography, clean composition"
  };
  return `${prompt}. Visual style: ${styles[style] || styles.cinematic}.`;
}
function dataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  result.hidden = false;
  video.hidden = true;
  downloadLink.hidden = true;
  generateBtn.disabled = true;
  generateBtn.textContent = "Génération en cours…";
  progressBar.style.width = "8%";
  statusMessage.textContent = "Envoi de la demande au moteur IA…";

  try {
    const selectedImage = imageInput.files[0];
    const payload = {
      prompt: stylePrompt(document.getElementById("prompt").value.trim(), document.getElementById("style").value),
      duration: Number(document.getElementById("duration").value),
      resolution: document.getElementById("resolution").value,
      aspect_ratio: document.getElementById("format").value
    };
    if (selectedImage) payload.image = await dataUrl(selectedImage);

    const createResponse = await fetch("/.netlify/functions/generate", {
      method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload)
    });
    const created = await createResponse.json();
    if (!createResponse.ok) throw new Error(created.error || "Impossible de démarrer la génération.");
    const predictionId = created.id;
    if (!predictionId) throw new Error("Le moteur IA n’a pas renvoyé d’identifiant.");

    let finished = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      await wait(4000);
      const response = await fetch(`/.netlify/functions/status?id=${encodeURIComponent(predictionId)}`);
      const state = await response.json();
      if (!response.ok) throw new Error(state.error || "Erreur pendant la vérification.");
      const progress = Math.min(92, 12 + Math.floor((attempt / 90) * 80));
      progressBar.style.width = `${progress}%`;
      statusMessage.textContent = state.status === "starting" ? "Préparation du modèle…" :
        state.status === "processing" ? "L’IA crée ta vidéo. Cela peut prendre quelques minutes…" :
        "Finalisation de la vidéo…";
      if (state.status === "succeeded") {
        const url = Array.isArray(state.output) ? state.output[0] : state.output;
        if (!url) throw new Error("La génération est terminée, mais aucun fichier vidéo n’a été retourné.");
        video.src = url;
        video.hidden = false;
        downloadLink.href = url;
        downloadLink.hidden = false;
        progressBar.style.width = "100%";
        statusMessage.textContent = "Vidéo prête ! Tu peux la regarder et la télécharger.";
        finished = true;
        break;
      }
      if (state.status === "failed" || state.status === "canceled") {
        throw new Error(state.error || "La génération a échoué. Réessaie avec une autre description.");
      }
    }
    if (!finished) throw new Error("La génération prend plus de temps que prévu. Réessaie plus tard.");
  } catch (error) {
    statusMessage.textContent = error.message || "Une erreur est survenue.";
    progressBar.style.width = "0%";
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = 'Générer ma vidéo <span>→</span>';
  }
});
