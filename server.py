from flask import Flask, request, jsonify, render_template, send_from_directory
import pickle
import base64
import io
from PIL import Image
import os

app = Flask(__name__, template_folder="frontend", static_folder="frontend/dist")

# Load your pickled model (make sure model.pkl is in the same directory)
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

class_map = {
    0: "pothole",
    1: "longitudinal_crack",
    2: "transverse_crack",
    3: "alligator_crack",
    4: "rutting"
}

# This is your prediction logic
def run_prediction(image_path):
    prediction = model.predict(image_path, confidence=20, overlap=30)
    if hasattr(prediction, 'json'):
        try:
            pred_json = prediction.json()
            detections = pred_json.get("predictions", [])
            crack_count = len(detections)
            road_condition = (
                "Good" if crack_count == 0 else
                "Average" if crack_count <= 3 else
                "Bad"
            )
            for i, detection in enumerate(detections, start=1):
                width = detection.get("width", "N/A")
                height = detection.get("height", "N/A")
                class_id = detection.get("class_id", "N/A")
                crack_type = class_map.get(class_id, "Unknown")

            return {
                "road_condition": road_condition,
                "crack_count": crack_count,
                "detections": detections,
                "dimensions": f"width-{width}, height-{height}",
                "crack_type": crack_type
            }
        except Exception as e:
            return {"error": f"Error parsing JSON: {str(e)}"}
    else:
        return {"error": "Prediction response is not in JSON format"}

# Serve index.html
@app.route('/')
def serve_index():
    return render_template('index.html')

# Serve road.html
@app.route('/road')
def serve_road():
    return render_template('road.html')

# Serve static files (CSS, JS, Images)
@app.route('/dist/<path:filename>')
def serve_static(filename):
    return send_from_directory("frontend/dist", filename)

# Serve images & videos
@app.route('/images_videos/<path:filename>')
def serve_media(filename):
    return send_from_directory("frontend/images_videos", filename)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        image_b64 = data.get('image')
        if not image_b64:
            return jsonify({'error': 'No image provided'}), 400

        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes))

        temp_image_path = 'temp_image.jpg'
        image.save(temp_image_path)
        
        result = run_prediction(temp_image_path)

        # Clean up temp file
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
