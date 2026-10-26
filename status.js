exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée." }) };
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return { statusCode: 500, body: JSON.stringify({ error: "Le jeton Replicate n’est pas configuré." }) };
  const id = event.queryStringParameters && event.queryStringParameters.id;
  if (!id || !/^[a-f0-9-]{10,}$/i.test(id)) return { statusCode: 400, body: JSON.stringify({ error: "Identifiant de génération invalide." }) };
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${encodeURIComponent(id)}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data.detail || "Impossible de vérifier l’état de la génération." }) };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: data.status, output: data.output, error: data.error })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur pendant la vérification." }) };
  }
};
