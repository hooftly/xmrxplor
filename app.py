from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

MONEROD_URL = 'http://144.91.120.100:18081'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transaction/<tx_hash>')
def transaction(tx_hash):
    response = requests.get(f'{MONEROD_URL}/get_transactions', params={'txs_hashes': [tx_hash], 'decode_as_json': True})
    transaction = response.json()['txs'][0]
    return render_template('transaction.html', transaction=transaction)

@app.route('/block/<int:block_height>')
def block(block_height):
    response = requests.get(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_block', 'params': {'height': block_height}})
    block = response.json()['result']['block_header']
    return render_template('block.html', block=block)

@app.route('/get_block_count')
def get_block_count():
    response = requests.get(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_block_count'})
    return jsonify(response.json())

@app.route('/get_info')
def get_info():
    response = requests.get(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_info'})
    return jsonify(response.json())

@app.route('/get_transaction_pool_info')
def get_transaction_pool_info():
    response = requests.get(f'{MONEROD_URL}/get_transaction_pool')
    return jsonify(response.json())

@app.route('/get_latest_blocks')
def get_latest_blocks():
    response = requests.get(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_last_block_header'})
    latest_block_height = response.json()['result']['block_header']['height']
    blocks = []
    for i in range(latest_block_height, latest_block_height - 10, -1):
        response = requests.get(f'{MONEROD_URL}/json_rpc', json={'jsonrpc': '2.0', 'id': '0', 'method': 'get_block', 'params': {'height': i}})
        block = response.json()['result']['block_header']
        blocks.append(block)
    return jsonify({'blocks': blocks})

if __name__ == '__main__':
    app.run(debug=True)
