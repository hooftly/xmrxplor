from flask import Flask, render_template, jsonify, request
import requests

app = Flask(__name__)

MONEROD_URL = "http://144.91.120.100:18081"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/block/<int:block_height>')
def block_details(block_height):
    print(f"Fetching details for block {block_height}")
    block_data = get_block_data(block_height)
    if block_data:
        print(f"Block data retrieved: {block_data}")
        return render_template('block.html', block=block_data)
    else:
        print(f"Block {block_height} not found")
        return render_template('block.html', error="Block not found")

@app.route('/transaction/<tx_hash>')
def transaction_details(tx_hash):
    transaction_data = get_transaction_data(tx_hash)
    return render_template('transaction.html', transaction=transaction_data)

@app.route('/get_block_count')
def get_block_count():
    response = requests.post(f"{MONEROD_URL}/json_rpc", json={
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_block_count"
    })
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Unable to fetch block count"})

@app.route('/get_info')
def get_info():
    response = requests.post(f"{MONEROD_URL}/json_rpc", json={
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_info"
    })
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Unable to fetch info"})

@app.route('/get_transaction_pool_info')
def get_transaction_pool_info():
    response = requests.get(f"{MONEROD_URL}/get_transaction_pool")
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify({"error": "Unable to fetch transaction pool info"})

@app.route('/get_latest_blocks')
def get_latest_blocks():
    latest_blocks = []
    response = requests.post(f"{MONEROD_URL}/json_rpc", json={
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_block_count"
    })
    if response.status_code == 200:
        block_count = response.json().get("result", {}).get("count", 0)
        for height in range(block_count - 10, block_count):
            response = requests.post(f"{MONEROD_URL}/json_rpc", json={
                "jsonrpc": "2.0",
                "id": "0",
                "method": "get_block_header_by_height",
                "params": {"height": height}
            })
            if response.status_code == 200:
                block_header = response.json().get("result", {}).get("block_header", {})
                latest_blocks.append(block_header)
    return jsonify({"blocks": latest_blocks})

def get_block_data(block_height):
    response = requests.post(f"{MONEROD_URL}/json_rpc", json={
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_block",
        "params": {"height": block_height}
    })
    if response.status_code == 200:
        result = response.json().get('result', {})
        block_header = result.get('block_header', {})
        tx_hashes = result.get('tx_hashes', [])
        block_data = {
            "height": block_height,
            "timestamp": block_header.get("timestamp"),
            "block_size": block_header.get("block_size"),
            "tx_hashes": tx_hashes
        }
        return block_data
    return None

def get_transaction_data(tx_hash):
    response = requests.post(f"{MONEROD_URL}/json_rpc", json={
        "jsonrpc": "2.0",
        "id": "0",
        "method": "get_transactions",
        "params": {"txs_hashes": [tx_hash]}
    })
    if response.status_code == 200:
        result = response.json().get('result', {})
        txs = result.get('txs', [])
        if txs:
            tx = txs[0]
            transaction_data = {
                "hash": tx_hash,
                "version": tx.get("version"),
                "unlock_time": tx.get("unlock_time"),
                "vin": tx.get("vin", []),
                "vout": tx.get("vout", []),
                "rct_signatures": tx.get("rct_signatures", {}),
                "ring_size": len(tx.get("vin", [])[0].get("key", {}).get("key_offsets", [])) if tx.get("vin") else 0
            }
            return transaction_data
    return None

if __name__ == '__main__':
    app.run(debug=True)
