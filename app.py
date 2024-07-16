from flask import Flask, jsonify, render_template
import requests
import json
import time

app = Flask(__name__)

def fetch_data(method, params=None):
    url = 'http://144.91.120.100:18081/json_rpc'
    headers = {'Content-Type': 'application/json'}
    payload = {
        "jsonrpc": "2.0",
        "id": "0",
        "method": method
    }
    if params:
        payload["params"] = params
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    return response.json()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_block_count')
def get_block_count():
    data = fetch_data("get_block_count")
    return jsonify(data)

@app.route('/get_last_block_info')
def get_last_block_info():
    block_count_data = fetch_data("get_block_count")
    block_count = block_count_data['result']['count'] - 1
    block_data = fetch_data("get_block", {"height": block_count})
    block_header = block_data['result']['block_header']
    block_json = json.loads(block_data['result']['json'])
    
    current_time = int(time.time())
    block_time = block_header['timestamp']
    time_since_last_block = current_time - block_time
    
    num_transactions = len(block_json['tx_hashes'])
    
    return jsonify({
        "block_count": block_count + 1,
        "time_since_last_block": time_since_last_block,
        "num_transactions": num_transactions
    })

@app.route('/get_average_block_time')
def get_average_block_time():
    block_count_data = fetch_data("get_block_count")
    block_count = block_count_data['result']['count']
    
    timestamps = []
    for i in range(block_count - 20, block_count):
        block_data = fetch_data("get_block", {"height": i})
        block_header = block_data['result']['block_header']
        timestamps.append(block_header['timestamp'])
    
    if len(timestamps) < 2:
        return jsonify({"average_block_time": None})
    
    time_diffs = [j - i for i, j in zip(timestamps[:-1], timestamps[1:])]
    average_block_time = sum(time_diffs) / len(time_diffs)
    
    return jsonify({"average_block_time": average_block_time})

@app.route('/get_block/<int:height>')
def get_block(height):
    block_data = fetch_data("get_block", {"height": height})
    return jsonify(block_data)

if __name__ == '__main__':
    app.run(debug=True)
