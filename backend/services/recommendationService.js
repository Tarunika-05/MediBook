const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../database/pool");
const logger = require("../utils/logger");

const fallbackKeywordMatch = async (symptoms) => {
  logger.info("Using local keyword fallback for doctor recommendations");
  const text = symptoms.toLowerCase();
  const matchedSpecs = [];

  if (text.includes("heart") || text.includes("chest") || text.includes("cardio") || text.includes("breathless") || text.includes("palpitation")) {
    matchedSpecs.push("Cardio");
  }
  if (text.includes("skin") || text.includes("rash") || text.includes("itch") || text.includes("acne") || text.includes("mole") || text.includes("spot")) {
    matchedSpecs.push("Derma");
  }
  if (text.includes("headache") || text.includes("brain") || text.includes("migraine") || text.includes("nerve") || text.includes("dizzy") || text.includes("seizure") || text.includes("stroke")) {
    matchedSpecs.push("Neuro");
  }
  if (text.includes("bone") || text.includes("joint") || text.includes("fracture") || text.includes("muscle") || text.includes("knee") || text.includes("spine") || text.includes("back pain")) {
    matchedSpecs.push("Ortho");
  }
  if (text.includes("child") || text.includes("baby") || text.includes("kid") || text.includes("pediatric") || text.includes("infant") || text.includes("toddler")) {
    matchedSpecs.push("Pediatr");
  }
  if (text.includes("eye") || text.includes("vision") || text.includes("sight") || text.includes("blind")) {
    matchedSpecs.push("Ophthal");
  }
  if (text.includes("ear") || text.includes("nose") || text.includes("throat") || text.includes("sinus") || text.includes("hearing")) {
    matchedSpecs.push("ent");
  }
  if (text.includes("depress") || text.includes("anxiety") || text.includes("stress") || text.includes("mental") || text.includes("bipolar")) {
    matchedSpecs.push("Psych");
  }
  if (text.includes("pregnant") || text.includes("woman") || text.includes("gyneco") || text.includes("ovary")) {
    matchedSpecs.push("Gyneco");
  }

  // Default fallback if no keywords matched
  if (matchedSpecs.length === 0) {
    matchedSpecs.push("General");
  }

  // Urgency heuristic
  let urgency = "low";
  if (text.includes("chest pain") || text.includes("severe") || text.includes("breathless") || text.includes("unconscious") || text.includes("seizure") || text.includes("stroke") || text.includes("bleeding")) {
    urgency = "high";
  } else if (text.includes("fever") || text.includes("pain") || text.includes("vomit") || text.includes("cough")) {
    urgency = "medium";
  }

  const reasoning = `Based on matching symptoms to key specialties: [${matchedSpecs.join(", ")}]. Urgency classified as ${urgency}.`;

  const queryParams = matchedSpecs.map(s => `%${s}%`);

  const { rows: doctors } = await pool.query(
    `SELECT d.id, d.user_id, d.specialization, d.experience_years, d.consultation_fee, d.bio,
            u.name, u.email,
            (SELECT COUNT(*)::int FROM slots s WHERE s.doctor_id = d.id AND s.status = 'AVAILABLE' AND s.start_time > NOW()) as available_slots
     FROM doctors d
     JOIN users u ON d.user_id = u.id
     WHERE d.specialization ILIKE ANY($1)
     ORDER BY d.experience_years DESC`,
    [queryParams]
  );

  return {
    specializations: matchedSpecs,
    urgency,
    reasoning,
    doctors: doctors.map(d => ({
      id: d.id,
      userId: d.user_id,
      specialization: d.specialization,
      experienceYears: d.experience_years,
      consultationFee: parseFloat(d.consultation_fee),
      bio: d.bio,
      user: { name: d.name, email: d.email },
      availableSlots: d.available_slots
    }))
  };
};

const getRecommendations = async (symptoms) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn("GEMINI_API_KEY environment variable is not defined");
    return fallbackKeywordMatch(symptoms);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a medical triage assistant. Analyze the patient's symptoms and classify them.
Symptoms: "${symptoms}"

Map this to one or more of these clinical specialties:
- Cardiology (heart, chest pain, palpitations)
- Dermatology (skin, rashes, spots, acne)
- Neurology (brain, severe headaches, dizziness, numbness)
- Orthopedics (bones, joints, fractures, back pain)
- Pediatrics (child care, infant health)
- Ophthalmology (eye care, vision problems)
- ENT (ear, nose, throat, sinus issues)
- Psychiatry (mental health, anxiety, depression)
- Gynecology (women's health, pregnancy)
- General Medicine (cold, cough, fever, general checkups)

Respond in JSON format ONLY. Do not write markdown blocks or any conversational text.
Format:
{
  "specializations": ["Cardiology", "Neurology"],
  "urgency": "low" | "medium" | "high",
  "reasoning": "Brief clinical reasoning explaining the match and urgency."
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip possible markdown code blocks if the model didn't follow instructions exactly
    const jsonStr = text.replace(/^```json/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(jsonStr);

    // Map Gemini specialization terms to search prefixes
    const specMap = {
      "Cardiology": "Cardio",
      "Dermatology": "Derma",
      "Neurology": "Neuro",
      "Orthopedics": "Ortho",
      "Pediatrics": "Pediatr",
      "Ophthalmology": "Ophthal",
      "ENT": "ent",
      "Psychiatry": "Psych",
      "Gynecology": "Gyneco",
      "General Medicine": "General"
    };

    const searchPatterns = parsed.specializations.map(s => {
      const mapped = specMap[s];
      return mapped ? `%${mapped}%` : `%${s}%`;
    });

    if (searchPatterns.length === 0) {
      searchPatterns.push("%General%");
    }

    const { rows: doctors } = await pool.query(
      `SELECT d.id, d.user_id, d.specialization, d.experience_years, d.consultation_fee, d.bio,
              u.name, u.email,
              (SELECT COUNT(*)::int FROM slots s WHERE s.doctor_id = d.id AND s.status = 'AVAILABLE' AND s.start_time > NOW()) as available_slots
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.specialization ILIKE ANY($1)
       ORDER BY d.experience_years DESC`,
      [searchPatterns]
    );

    return {
      specializations: parsed.specializations,
      urgency: parsed.urgency || "low",
      reasoning: parsed.reasoning || "Triage based on symptom classification.",
      doctors: doctors.map(d => ({
        id: d.id,
        userId: d.user_id,
        specialization: d.specialization,
        experienceYears: d.experience_years,
        consultationFee: parseFloat(d.consultation_fee),
        bio: d.bio,
        user: { name: d.name, email: d.email },
        availableSlots: d.available_slots
      }))
    };
  } catch (error) {
    logger.error(error, "Gemini recommendation generation failed, falling back");
    return fallbackKeywordMatch(symptoms);
  }
};

module.exports = { getRecommendations };
