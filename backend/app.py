import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from script2 import Script
from dotenv import load_dotenv
from excel_generator import build_excel

load_dotenv()

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ORIGIN')}})

@app.route('/api/comments', methods=['POST'])
def get_comments():
    data = request.get_json()
    post_url = data.get('post_url')

    script = Script(post_url)

    comments = script.getComments()

    return jsonify({'comments': comments})

@app.route('/api/generate-excel', methods=['POST'])
def generate_excel():
    data = request.get_json()
    comments = data.get('comments', [])

    buffer = build_excel(comments)

    return send_file(
        buffer,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='comments.xlsx',
    )

if __name__ == '__main__' :
    app.run(debug=True, port=os.getenv('PORT'))