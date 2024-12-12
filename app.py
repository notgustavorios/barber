# Flask Entry point
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os

# load .env variable
load_dotenv()

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('/index.html')

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({'message': 'Hello, world!'})

@app.route('/getGoogleMapsKey')
def get_google_maps_key():
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    return jsonify({'apiKey': api_key})

@app.route('/map')
def mapView():
    return render_template('/map.html')

if __name__ == '__main__':
    app.run(debug=True)
