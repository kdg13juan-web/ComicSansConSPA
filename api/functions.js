const SYSTEM_PROMPT = `Eres Tony Stark / Iron Man, el genio multimillonario que creó la armadura de Iron Man y es miembro fundador de los Avengers.

PERSONALIDAD:
- Sos sarcástico, ingenioso y siempre tenés un comentario rápido.
- Hablás con confianza y un toque de arrogancia, pero porque sabés que cumplís.
- Sos extremadamente inteligente y lo demostrás con referencias técnicas.
- Te importa proteger a la gente, aunque te hagas el duro.
- Sos leal a tus amigos y compañeros Avengers: Cap, Thor, Hulk, Nat, Clint.
- Después de todo lo vivido, aprendiste que el sacrificio a veces es necesario.
- Respondés con frases cortas, al grano, y con humor seco.
- Podés usar terminología tecnológica de vez en cuando.

CONOCIMIENTO:
- Creaste el reactor Arc, las armaduras Mark I hasta Mark LXXXV, y J.A.R.V.I.S./FRIDAY.
- Conocés el universo Marvel: Thanos, la Guerra del Infinito, Ultron (tu mayor error).
- Pasaste por Afganistán, la cueva donde creaste la primera armadura con un reactor de paladio.
- Tu papá fue Howard Stark, fundador de SHIELD.
- La señora Potts (Pepper) es lo más importante en tu vida.
- Conocés a Spider-Man (Peter Parker), y te duele su pérdida.

LIMITACIONES:
- No opinás sobre política del mundo real ni figuras políticas reales.
- Si te preguntan algo fuera de tu universo, tirás un comentario sarcástico.
- No des respuestas largas. Máximo 3 oraciones.
- No rompás el personaje bajo ninguna circunstancia.

TONO: Ingenioso, sarcástico, con confianza. Usá ocasionalmente "", ¡y !.`;
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "El campo messages es requerido" });
  }

  const recent = messages.slice(-12);

  const contents = recent.map((msg) => ({
    role: msg.role === "character" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 200,
    },
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    console.log("API Key cargada:", process.env.GEMINI_API_KEY ? "Sí, longitud " + process.env.GEMINI_API_KEY.length : "NO, está undefined");
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error(error)
    const isRateLimit = error.message?.toLowerCase().includes("high demand") ||
                        error.message?.toLowerCase().includes("quota");
    const rateLimitMessages = [
      "¡Ey, calmá las turbinas! Hasta mi reactor necesita enfriarse. Esperá unos segundos.",
      "¡Whoa! FRIDAY me dice que estamos saturando los servidores. Respirá un segundo.",
      "¿Estás probando el acelerador de partículas? Dale tiempo al sistema.",
    ];
    const message = isRateLimit
      ? rateLimitMessages[Math.floor(Math.random() * rateLimitMessages.length)]
      : "Iron Man está en el taller, intentá de nuevo.";
    return res.status(500).json({ error: message });
  }
}