import os
from datetime import datetime
import requests, json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

OPENAI_API_KEY = "NOPITYNOPENOPE"
OPENAI_API_URL = "https://api.openai.com/v1/engines/davinci/completions"
LOG_FILE = "open_ai_api_prompts_log.json"
TABLE_CONTENT_FILE = "table_content.json"

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        prompt = request.form['prompt']
        print(f"Prompt received: {prompt}")  # Debug print
        response = call_openai_api(prompt)
        print(f"API response: {response}")  # Debug print
        if response['success']:
            save_to_log(prompt, response['result'])
            return jsonify(response)
        else:
            return jsonify({'error': response['error']}), 400
    return render_template('index.html')

@app.route('/save_table_data', methods=['POST'])
def save_table_data():
    table_data = request.get_json()
    with open(TABLE_CONTENT_FILE, 'a+') as file:
        json.dump(table_data, file, indent=4)
    return jsonify({"success": True})

@app.route('/load_table_data', methods=['GET'])
def load_table_data():
    try:
        with open(TABLE_CONTENT_FILE, 'r') as file:
            table_data = json.load(file)
        return jsonify(table_data)
    except:
        return jsonify([])

def call_openai_api(prompt):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {OPENAI_API_KEY}'
    }
    data = {
        'model': 'gpt-3.5-turbo',
        'messages': [{"role": "user", "content": prompt}],
        'temperature': 0.7
    }
    try:
        response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data)
        response.raise_for_status()
        print(f"Full API response: {response.json()}")  # Debug print
        result = response.json()['choices'][0]['message']['content'].strip()
        print(f"Generated text: {result}")  # Debug print
        return {
            'success': True,
            'result': result,
            'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'response_code': 200,
            'model': 'gpt-3.5-turbo',
            'prompt_tokens': 5,
            'completion_tokens': 5,
            'total_tokens': 10,
        }
    except requests.exceptions.RequestException as e:
        print(f"API error: {str(e)}")  # Debug print
        return {'success': False, 'error': str(e)}

def save_to_log(prompt, result):
    log_entry = {
        'prompt': prompt,
        'response': result,
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    if os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'r') as file:
            log_data = json.load(file)
    else:
        log_data = []

    log_data.append(log_entry)

    with open(LOG_FILE, 'a+') as file:
        json.dump(log_data, file, indent=4)

if __name__ == '__main__':
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, 'w') as file:
            json.dump([], file, indent=4)
    if not os.path.exists(TABLE_CONTENT_FILE):
        with open(TABLE_CONTENT_FILE, 'w') as file:
            json.dump([], file, indent=4)
    app.run()
