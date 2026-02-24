import json
import os
import uuid
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DATA_FILE = os.path.join(DATA_DIR, 'features.json')

SAMPLE_FEATURES = [
    {
        'id': str(uuid.uuid4()),
        'title': 'User Authentication',
        'description': 'Implement login and signup functionality with OAuth support',
        'status': 'backlog'
    },
    {
        'id': str(uuid.uuid4()),
        'title': 'Dashboard Analytics',
        'description': 'Create interactive charts and metrics visualization',
        'status': 'todo'
    },
    {
        'id': str(uuid.uuid4()),
        'title': 'Dark Mode Support',
        'description': 'Add theme toggling between light and dark modes',
        'status': 'inProgress'
    },
    {
        'id': str(uuid.uuid4()),
        'title': 'Search Functionality',
        'description': 'Implement full-text search with filters and sorting',
        'status': 'backlog'
    }
]

VALID_STATUSES = {'backlog', 'todo', 'inProgress', 'done'}


def load_features():
    if not os.path.exists(DATA_FILE):
        os.makedirs(DATA_DIR, exist_ok=True)
        save_features(SAMPLE_FEATURES)
        return SAMPLE_FEATURES
    with open(DATA_FILE, 'r') as f:
        return json.load(f)


def save_features(features):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(features, f, indent=2)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/features', methods=['GET'])
def get_features():
    return jsonify(load_features())


@app.route('/api/features', methods=['POST'])
def create_feature():
    data = request.get_json()
    if not data or not data.get('title', '').strip():
        return jsonify({'error': 'Title is required'}), 400

    features = load_features()
    new_feature = {
        'id': str(uuid.uuid4()),
        'title': data['title'].strip(),
        'description': data.get('description', '').strip(),
        'status': 'backlog'
    }
    features.append(new_feature)
    save_features(features)
    return jsonify(new_feature), 201


@app.route('/api/features/<feature_id>', methods=['PUT'])
def update_feature(feature_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    features = load_features()
    for feature in features:
        if feature['id'] == feature_id:
            if 'title' in data:
                if not data['title'].strip():
                    return jsonify({'error': 'Title cannot be empty'}), 400
                feature['title'] = data['title'].strip()
            if 'description' in data:
                feature['description'] = data['description'].strip()
            if 'status' in data:
                if data['status'] not in VALID_STATUSES:
                    return jsonify({'error': 'Invalid status'}), 400
                feature['status'] = data['status']
            save_features(features)
            return jsonify(feature)

    return jsonify({'error': 'Feature not found'}), 404


@app.route('/api/features/<feature_id>', methods=['DELETE'])
def delete_feature(feature_id):
    features = load_features()
    original_len = len(features)
    features = [f for f in features if f['id'] != feature_id]
    if len(features) == original_len:
        return jsonify({'error': 'Feature not found'}), 404
    save_features(features)
    return jsonify({'success': True})


if __name__ == '__main__':
    print('\n  Feature Manager is running!')
    print('  Open http://localhost:5000 in your browser\n')
    app.run(debug=True, port=5000)
