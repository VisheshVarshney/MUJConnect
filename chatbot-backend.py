import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://127.0.0.1:5500"]}}, supports_credentials=True)

# Load OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Debugging API Key
api_key = os.getenv("OPENAI_API_KEY")
print(f"[DEBUG] Loaded API Key: {api_key}")

# Outlet albums mapped to their Google Photos shared album links
outlet_albums = {
    "chatkara": "https://photos.app.goo.gl/U6ZegD74Jecs3b2g6",
    "zaikaa": "https://photos.app.goo.gl/ocoXSkr5zLKCSHsQ6",
    "theitalianoven": "https://photos.app.goo.gl/V8ZBba9oeopFTSCy9",
    "letsgolive": "https://photos.app.goo.gl/arR4VvE4PprLfoL96",
    "chinatown": "https://photos.app.goo.gl/r9jcCq4jbs9RpDFM6",
    "healthbar": "https://photos.app.goo.gl/VWQagNGQF4sMrqxx7",
    "pizzabakers": "https://photos.app.goo.gl/G3hPcwLZuj17eSyd7",
    "devsweets": "https://photos.app.goo.gl/95LFYLZ6s1DSYHLf6",
    "tandoor": "https://photos.app.goo.gl/PWagb7VkjmkJvC9QA",
    "dialogcafe": "https://photos.app.goo.gl/bBNm4L5cQeg3qb2Z8"
}

# Menu data directory
menu_directory = r"D:\\Projects Git\\Connect\\Menu Json"
menu_data = {}

# Normalize prices
def normalize_price(price):
    if isinstance(price, str):
        return int(price.split('/')[0])  # Convert "50/-" to 50
    elif isinstance(price, list):
        return min(price)  # Use the lowest price
    return price  # Assume it's already an integer/float

# Load menu data dynamically
def load_menu_data():
    global menu_data
    try:
        for file in os.listdir(menu_directory):
            if file.endswith(".json"):
                outlet_name = os.path.splitext(file)[0].lower()
                with open(os.path.join(menu_directory, file), 'r') as json_file:
                    data = json.load(json_file)
                    # Ensure 'menu' key exists and is properly structured
                    if 'menu' not in data or not isinstance(data['menu'], dict):
                        print(f"[ERROR] Invalid structure in file {file}. Skipping.")
                        continue
                    # Normalize prices and add to menu_data
                    for category, items in data['menu'].items():
                        for item in items:
                            item['price'] = normalize_price(item.get('price'))
                            item['cuisine'] = item.get('cuisine', 'unknown')
                    menu_data[outlet_name] = data
                    print(f"[DEBUG] Loaded data for {outlet_name}: {menu_data[outlet_name]}")
        print("[INFO] All menu data loaded successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to load menu data: {e}")

load_menu_data()

# Query OpenAI for intent and details
def analyze_query_with_openai(user_input):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Using GPT Turbo Model
            messages=[
                {"role": "system", "content": "You are a smart chatbot for a campus food service. Always respond in this JSON format: {\"intent\": \"<menu/budget/cuisine>\", \"details\": {\"outlet_name\": \"<outlet_name>\", \"budget\": <budget>, \"cuisine\": \"<cuisine>\"}}.\n\n- If a user mentions 'menu', identify the outlet name and respond with a hardcoded link.\n- If a user specifies a budget, extract the budget and outlet name and respond with appropriate items.\n- If unrelated, respond with: {\"intent\": \"fallback\", \"details\": {}}."},
                {"role": "user", "content": user_input}
            ],
            max_tokens=150,
            temperature=0.7
        )
        print(f"[DEBUG] OpenAI API Response: {response}")  # Log full response for debugging

        # Extract the assistant's message content
        content = response['choices'][0]['message']['content'].strip()

        # Attempt to parse content as JSON
        try:
            parsed_response = json.loads(content)  # Parse JSON-formatted content
            if "intent" in parsed_response and "details" in parsed_response:
                return parsed_response
            else:
                print("[DEBUG] Response JSON is missing required keys.")
                return {"intent": "fallback", "details": {}}
        except json.JSONDecodeError:
            print("[DEBUG] Failed to decode response as JSON.")
            return {"intent": "fallback", "details": {}}
    except Exception as e:
        print(f"[ERROR] OpenAI API failed: {e}")
        return {"intent": "fallback", "details": {}}

# Chat endpoint
@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_input = request.json.get('message', '').strip()
        if not user_input:
            print("[DEBUG] User input was empty.")
            return jsonify({"error": "Your input is empty! Please type something. 🍽️"}), 400

        # Log user input
        print(f"[DEBUG] User input: {user_input}")

        # Analyze query using OpenAI
        analysis_result = analyze_query_with_openai(user_input)
        intent = analysis_result.get("intent")
        details = analysis_result.get("details", {})

        # Log analysis result
        print(f"[DEBUG] Analysis Result: {analysis_result}")

        # Handle menu intent
        if intent == "menu":
            outlet_name = details.get("outlet_name")
            if outlet_name:
                outlet_key = outlet_name.replace(" ", "").lower()  # Normalize outlet name to lowercase and remove spaces
                if outlet_key in outlet_albums:
                    reply = f"Here’s the menu link for {outlet_name.capitalize()}: {outlet_albums[outlet_key]} 🍴"
                    print(f"[DEBUG] Reply: {reply}")
                    return jsonify({"reply": reply})
            reply = f"Sorry, I couldn't find a menu link for {outlet_name.capitalize()}."
            print(f"[DEBUG] Reply: {reply}")
            return jsonify({"reply": reply})

        # Handle budget intent
        if intent == "budget":
            budget = details.get("budget")
            outlet_name = details.get("outlet_name")
            if budget and outlet_name:
                outlet_key = outlet_name.replace(" ", "").lower()  # Normalize outlet name
                items = menu_data.get(outlet_key, {}).get('menu', {}).values()
                affordable_items = [
                    item for category in items for item in category if item['price'] <= budget
                ]
                if affordable_items:
                    items_list = ", ".join([f"{item['name']} (${item['price']})" for item in affordable_items])
                    reply = f"Here are items under ${budget} from {outlet_name.capitalize()}: {items_list}"
                    print(f"[DEBUG] Reply: {reply}")
                    return jsonify({"reply": reply})
                reply = f"Sorry, no items found under ${budget} from {outlet_name.capitalize()}."
                print(f"[DEBUG] Reply: {reply}")
                return jsonify({"reply": reply})

        # Handle cuisine intent
        if intent == "cuisine":
            cuisine = details.get("cuisine")
            matching_items = [
                item for outlet, data in menu_data.items()
                for category in data.get('menu', {}).values()
                for item in category if item['cuisine'].lower() == cuisine.lower()
            ]
            if matching_items:
                items_list = ", ".join([f"{item['name']} (${item['price']})" for item in matching_items])
                reply = f"Here are some {cuisine.capitalize()} dishes: {items_list}"
                print(f"[DEBUG] Reply: {reply}")
                return jsonify({"reply": reply})
            reply = f"Sorry, no {cuisine.capitalize()} dishes found in our outlets."
            print(f"[DEBUG] Reply: {reply}")
            return jsonify({"reply": reply})

        # Fallback for unrecognized intents
        reply = "I didn't catch that. Are you asking about menus, budgets, or outlets? 😊"
        print(f"[DEBUG] Fallback Reply: {reply}")
        return jsonify({"reply": reply})

    except Exception as e:
        print(f"[ERROR] {e}")
        return jsonify({"error": "Something went wrong! Please try again. 💻⚡"}), 500

if __name__ == '__main__':
    app.run(debug=True)
