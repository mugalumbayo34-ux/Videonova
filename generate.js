exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée." }) };
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: "Le jeton Replicate n’est pas configuré dans les variables d’environnement Netlify." }) };

  try {
    const body = JSON.parse(event.body || "{}");
    const prompt = String(body.prompt || "").trim();
    if (prompt.length < 5 || prompt.length > 3000) {
      return { statusCode: 400, body: JSON.stringify({ error: "La description doit contenir entre 5 et 3000 caractères." }) };
    }
    const duration = Math.max(2, Math.min(30, Number(body.duration) || 5));
    const aspect = ["16:9", "9:16", "1:1"].includes(body.aspect_ratio) ? body.aspect_ratio : "16:9";
    const resolution = ["720p", "1080p", "480p"].includes(body.resolution) ? body.resolution : "720p";
    const input = {
      prompt,
      duration,
      resolution,
      aspect_ratio: aspect,
      enable_prompt_expansion: true
    };
    if (typeof body.image === "string" && body.image.startsWith("data:image/")) {
      if (body.image.length > 4_200_000) return { statusCode: 413, body: JSON.stringify({ error: "Image trop volumineuse. Utilise une image de moins de 3 Mo." }) };
      input.image = body.image;
    }

    const response = await fetch("https://api.replicate.com/v1/models/alibaba/wan-3/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Prefer": "wait=1"
      },
      body: JSON.stringify({ input })
    });
    const data = await response.json();
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.detail || data.title || "Replicate a refusé la demande. Vérifie la facturation et les paramètres du modèle." }) };
    }
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: data.id, status: data.status }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur pendant la création de la vidéo." }) };
  }
};
