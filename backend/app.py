import os
import io
import json
import random
import logging
import requests
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "mistralai/mistral-7b-instruct:free"

# ─── Mock CNN Prediction ───────────────────────────────────────────────────────
def analyze_image_mock(image_bytes):
    random.seed(len(image_bytes) % 9999)
    probability = round(random.uniform(0.05, 0.92) * 100, 1)
    confidence = round(random.uniform(0.72, 0.96) * 100, 1)
    if probability < 35:
        risk = "Low"
    elif probability < 65:
        risk = "Medium"
    else:
        risk = "High"
    return {
        "risk": risk,
        "probability": probability,
        "confidence": confidence,
        "model_used": "MockCNN-v1",
    }

# ─── OpenRouter LLM Call ───────────────────────────────────────────────────────
def call_openrouter(messages, max_tokens=250):
    if not OPENROUTER_API_KEY:
        return None
    try:
        resp = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://breast-cancer-screening.app",
                "X-Title": "Breast Cancer Screening Assistant",
            },
            json={
                "model": MODEL,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.7,
            },
            timeout=20,
        )
        if resp.status_code == 200:
            data = resp.json()
            return data["choices"][0]["message"]["content"]
        logger.warning(f"OpenRouter status {resp.status_code}: {resp.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"OpenRouter call failed: {e}")
        return None


def build_explanation(risk, probability, confidence, patient_data=None):
    patient_ctx = ""
    if patient_data:
        age = patient_data.get("age", "")
        family = patient_data.get("familyHistory", "")
        if age:
            patient_ctx += f" Patient age: {age}."
        if family:
            patient_ctx += f" Family history: {family}."

    prompt = f"""You are a compassionate medical AI assistant. Provide a brief, calm analysis for a breast screening result.

Result: {risk} risk ({probability}% probability, {confidence}% confidence).{patient_ctx}

Write exactly 4 sentences:
1. Summary of the result in simple, reassuring language.
2. What this means clinically.
3. Recommended next steps based on the risk level.
4. Reminder that this is not a medical diagnosis and they should consult a doctor.

Keep it supportive, non-alarming, and professional."""

    messages = [{"role": "user", "content": prompt}]
    result = call_openrouter(messages, max_tokens=200)

    if result:
        return result.strip()

    # Fallback explanations
    fallbacks = {
        "Low": (
            "Your screening result indicates a low risk level, which is an encouraging sign. "
            "A low probability score suggests no immediate concerning patterns were detected in the image. "
            "We recommend continuing your regular annual screenings as a preventive measure. "
            "Please note this is not a medical diagnosis — consult your doctor for a comprehensive evaluation."
        ),
        "Medium": (
            f"Your screening result shows a medium risk level with {probability}% probability. "
            "This result warrants further attention but should not cause immediate alarm. "
            "We recommend scheduling an appointment with a specialist for additional diagnostic tests. "
            "Please note this is not a medical diagnosis — a qualified physician should evaluate your results."
        ),
        "High": (
            f"Your screening result indicates a high risk level with {probability}% probability. "
            "This result suggests patterns that require prompt medical evaluation by a specialist. "
            "Please consult a doctor or oncologist as soon as possible for a thorough examination. "
            "This is not a medical diagnosis — only a certified medical professional can provide an accurate assessment."
        ),
    }
    return fallbacks.get(risk, fallbacks["Medium"])


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        if not file.filename:
            return jsonify({"error": "Empty filename"}), 400

        image_bytes = file.read()
        if len(image_bytes) == 0:
            return jsonify({"error": "Empty file"}), 400

        # Get patient data if provided
        patient_data = {}
        if "patientData" in request.form:
            try:
                patient_data = json.loads(request.form["patientData"])
            except Exception:
                pass

        # Run prediction
        prediction = analyze_image_mock(image_bytes)

        # Get AI explanation
        explanation = build_explanation(
            prediction["risk"],
            prediction["probability"],
            prediction["confidence"],
            patient_data,
        )

        # Recommendation logic
        risk = prediction["risk"]
        if risk == "High":
            recommendation = "Consult a doctor or oncologist immediately for further evaluation."
            recommendation_level = "urgent"
        elif risk == "Medium":
            recommendation = "Schedule additional diagnostic tests with your healthcare provider."
            recommendation_level = "moderate"
        else:
            recommendation = "Continue regular annual screenings as a preventive measure."
            recommendation_level = "routine"

        return jsonify({
            **prediction,
            "explanation": explanation,
            "recommendation": recommendation,
            "recommendation_level": recommendation_level,
            "timestamp": datetime.utcnow().isoformat(),
            "disclaimer": "This AI analysis is not a medical diagnosis. Always consult a qualified healthcare professional.",
        })

    except Exception as e:
        logger.error(f"Predict error: {e}")
        return jsonify({
            "risk": "Medium",
            "probability": 42.0,
            "confidence": 75.0,
            "model_used": "Fallback",
            "explanation": "AI analysis suggests a medium risk. Please consult a medical professional for an accurate diagnosis.",
            "recommendation": "Schedule an appointment with your healthcare provider for further evaluation.",
            "recommendation_level": "moderate",
            "timestamp": datetime.utcnow().isoformat(),
            "disclaimer": "This AI analysis is not a medical diagnosis.",
        })


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body"}), 400

        user_message = data.get("message", "").strip()
        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        history = data.get("history", [])[-2:]  # last 2 messages only

        system_prompt = """You are a caring, knowledgeable breast health assistant. You help users understand their screening results and answer questions about breast health. Always:
- Be warm, supportive, and non-alarming
- Recommend consulting a doctor for medical decisions
- Keep answers brief (2-3 sentences max)
- Remind users you are not a substitute for medical advice when relevant"""

        messages = [{"role": "system", "content": system_prompt}]
        for h in history:
            messages.append(h)
        messages.append({"role": "user", "content": user_message})

        reply = call_openrouter(messages, max_tokens=150)

        if not reply:
            # Fallback responses
            lc = user_message.lower()
            if any(w in lc for w in ["high risk", "high", "scared", "worried", "cancer"]):
                reply = "I understand this can feel overwhelming. A high risk result means you should consult a doctor promptly for further evaluation — remember, early detection significantly improves outcomes. You're taking the right steps by getting screened."
            elif any(w in lc for w in ["low risk", "safe", "ok", "fine"]):
                reply = "A low risk result is reassuring! Continue with regular annual screenings as prevention is key. Always discuss your results with your doctor for personalized guidance."
            elif any(w in lc for w in ["next step", "do now", "what should"]):
                reply = "Based on your result, the most important next step is to share it with your healthcare provider. They can recommend the appropriate follow-up tests or monitoring plan for your specific situation."
            else:
                reply = "Thank you for your question. For the most accurate guidance regarding your health, please consult a qualified medical professional. I'm here to help you understand your screening results and provide general information."

        return jsonify({"reply": reply, "timestamp": datetime.utcnow().isoformat()})

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({
            "reply": "I'm here to help. For medical questions about your results, please consult a healthcare professional who can provide personalized guidance.",
            "timestamp": datetime.utcnow().isoformat(),
        })


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    index = os.path.join(app.static_folder, "index.html")
    if os.path.exists(index):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({"message": "Breast Cancer Screening API", "status": "running"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
