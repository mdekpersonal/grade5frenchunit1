from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

def load_content():
    """Load content from unit1.json"""
    json_path = os.path.join(os.path.dirname(__file__), 'unit1.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            content = file.read().strip()
            if not content:
                raise ValueError("JSON file is empty")
            return json.loads(content)
    except (FileNotFoundError, json.JSONDecodeError, ValueError) as e:
        print(f"Error loading JSON: {e}")
        # Fallback content for French lessons
        return {
            "appTitle": "Révisions de Français - Unité 1",
            "sections": [
                {
                    "title": "Leçons Orales - Dialogues",
                    "description": "Mini-dialogues pour pratiquer le récit d'événements.",
                    "cards": [
                        {
                            "type": "dialogue",
                            "theme": "Exemple de dialogue",
                            "exchange": [
                                {"speaker": "A", "line": "Bonjour, comment allez-vous?"},
                                {"speaker": "B", "line": "Je vais très bien, merci!"}
                            ]
                        }
                    ]
                },
                {
                    "title": "Conjugaison & Temps",
                    "description": "Règles de conjugaison française.",
                    "cards": [
                        {
                            "type": "language_card",
                            "lesson": "Le Présent de l'Indicatif",
                            "rule": "On l'utilise pour une action maintenant.",
                            "examples": ["Je parle français."]
                        }
                    ]
                }
            ]
        }

@app.route('/')
def home():
    """Homepage with all sections and carousels"""
    content = load_content()
    return render_template('index.html', content=content)

@app.route('/api/content')
def api_content():
    """API endpoint to get content (useful for dynamic updates)"""
    content = load_content()
    return jsonify(content)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)