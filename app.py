from flask import Flask, render_template, jsonify, request
import requests
import json

app = Flask(__name__)

MONEROD_URL = 'http://144.91.120.100:18081'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transaction/<tx_hash>')
def transaction(tx_hash):
    try:
        response = requests.post(f'{MONEROD_URL}/get_transactions', json={'txs_hashes': [tx_hash], 'decode_as_json': True})
        response.raise_for_status()
        data = response.json()
        if 'txs_as_json' not in data or len(data['txs_as_json']) == 0:
            return f"No transaction found for hash: {tx_hash}", 404
        transaction = json.loads(data['txs_as_json'][0])  # Convert JSON string to dictionary
        transaction['hash'] = tx_hash  # Ensure the hash is included in the template

        # Debugging: Print the fee value
        print(f"Transaction Fee (atomic units): {transaction['rct_signatures']['txnFee']}")

        return render_template('transaction.html', transaction=transaction)
    except requests.exceptions.RequestException as e:
        return f"Error fetching transaction data: {str(e)}", 500


@app.route('/block/<int:block_height>')
def block(block_height):
    try:
        response = requests.post(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_block', 'params': {'height': block_height}})
        response.raise_for_status()
        data = response.json()
        if 'result' not in data or 'block_header' not in data['result']:
            return f"No block found for height: {block_height}", 404
        block = data['result']['block_header']
        return render_template('block.html', block=block)
    except requests.exceptions.RequestException as e:
        return f"Error fetching block data: {str(e)}", 500

@app.route('/get_block_count')
def get_block_count():
    response = requests.post(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_block_count'})
    return jsonify(response.json())

@app.route('/get_info')
def get_info():
    response = requests.post(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_info'})
    return jsonify(response.json())

@app.route('/get_transaction_pool_info')
def get_transaction_pool_info():
    response = requests.get(f'{MONEROD_URL}/get_transaction_pool')
    return jsonify(response.json())

@app.route('/get_latest_blocks')
def get_latest_blocks():
    try:
        response = requests.post(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_last_block_header'})
        response.raise_for_status()
        latest_block_height = response.json()['result']['block_header']['height']
        blocks = []
        for i in range(latest_block_height, latest_block_height - 10, -1):
            response = requests.post(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_block', 'params': {'height': i}})
            response.raise_for_status()
            block = response.json()['result']['block_header']
            blocks.append(block)
        return jsonify({'blocks': blocks})
    except requests.exceptions.RequestException as e:
        return f"Error fetching latest blocks: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)
