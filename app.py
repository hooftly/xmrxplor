from flask import Flask, jsonify, render_template, request, abort
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

def fetch_transaction(tx_hash):
    url = 'http://144.91.120.100:18081/get_transactions'
    headers = {'Content-Type': 'application/json'}
    payload = {
        "txs_hashes": [tx_hash],
        "decode_as_json": True
    }
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
        "num_transactions": num_transactions,
        "tx_hashes": block_json['tx_hashes']
    })

@app.route('/get_block/<int:height>')
def get_block(height):
    block_data = fetch_data("get_block", {"height": height})
    return jsonify(block_data)

@app.route('/transaction/<tx_hash>')
def transaction(tx_hash):
    tx_data = fetch_transaction(tx_hash)
    
    if 'txs' not in tx_data:
        # Log the response for debugging
        app.logger.error(f"Transaction data fetch error: {tx_data}")
        abort(500, description="Failed to fetch transaction data")
    
    # Log the entire response for debugging
    app.logger.info(f"Transaction data: {json.dumps(tx_data, indent=2)}")
    
    # Parse the transaction details
    tx_details = json.loads(tx_data['txs'][0]['as_json'])
    
    # Enhanced logging for vin details
    app.logger.info(f"vin details: {json.dumps(tx_details['vin'], indent=2)}")
    
    vin_details = []
    ring_size = 0
    for vin in tx_details.get('vin', []):
        if 'key' in vin:
            vin_details.append({
                'amount': vin['key'].get('amount', 'N/A'),
                'key_image': vin['key'].get('k_image', 'N/A')
            })
            ring_size = max(ring_size, len(vin['key'].get('key_offsets', [])))
    
    vout_details = []
    for vout in tx_details.get('vout', []):
        vout_details.append({
            'amount': vout.get('amount', '0'),
            'target': {'key': vout['target']['tagged_key'].get('key', 'N/A')}
        })
    
    rct_signatures = tx_details.get('rct_signatures', {})
    formatted_fee = rct_signatures.get('txnFee', 0) / 10**12
    
    transaction_info = {
        'tx_hash': tx_data['txs'][0].get('tx_hash', 'N/A'),
        'block_height': tx_data['txs'][0].get('block_height', 'N/A'),
        'timestamp': tx_data['txs'][0].get('block_timestamp', 'N/A'),
        'vin': vin_details,
        'vout': vout_details,
        'rct_signatures': rct_signatures,
        'ring_size': ring_size,
        'formatted_fee': f"{formatted_fee:.12f} XMR"  # Format the fee with 12 decimal places and add "XMR"
    }
    
    return render_template('transaction.html', transaction=transaction_info)

if __name__ == '__main__':
    app.run(debug=True)
