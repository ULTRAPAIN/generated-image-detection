from flask import Flask, request, jsonify
from flask_cors import CORS
from inference import run_inference

app = Flask(__name__)
CORS(app)

@app.route('/api/detect-image', methods=['POST'])
def image_detection_endpoint():
    data = request.get_json()
    image_base64 = data.get("image")
    
    if not image_base64:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        result = run_inference(image_base64)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)