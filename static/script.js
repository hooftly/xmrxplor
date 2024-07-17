document.addEventListener('DOMContentLoaded', function() {
    function fetchBlockCount() {
        return fetch('/get_block_count')
            .then(response => response.json())
            .then(data => {
                const blockHeightCard = document.getElementById('blockHeightCard');
                if (data.result && data.result.count) {
                    blockHeightCard.innerText = `Block Height: ${data.result.count}`;
                } else {
                    blockHeightCard.innerText = 'Block Height: Error';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const blockHeightCard = document.getElementById('blockHeightCard');
                blockHeightCard.innerText = 'Block Height: Error';
            });
    }

    function fetchInfo() {
        return fetch('/get_info')
            .then(response => response.json())
            .then(data => {
                const networkDifficultyCard = document.getElementById('networkDifficultyCard');
                const networkHashrateCard = document.getElementById('networkHashrateCard');
                if (data.result) {
                    networkDifficultyCard.innerText = `Network Difficulty: ${data.result.difficulty}`;
                    networkHashrateCard.innerText = `Network Hashrate: ${(data.result.difficulty / data.result.target).toFixed(2)} H/s`;
                } else {
                    networkDifficultyCard.innerText = 'Network Difficulty: Error';
                    networkHashrateCard.innerText = 'Network Hashrate: Error';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const networkDifficultyCard = document.getElementById('networkDifficultyCard');
                const networkHashrateCard = document.getElementById('networkHashrateCard');
                networkDifficultyCard.innerText = 'Network Difficulty: Error';
                networkHashrateCard.innerText = 'Network Hashrate: Error';
            });
    }

    function fetchTransactionPool() {
        return fetch('/get_transaction_pool_info')
            .then(response => response.json())
            .then(data => {
                const transactionTableBody = document.getElementById('transactionTable').querySelector('tbody');
                transactionTableBody.innerHTML = '';
                data.transactions.forEach(tx => {
                    const txRow = document.createElement('tr');
                    
                    const txHashCell = document.createElement('td');
                    const txLink = document.createElement('a');
                    txLink.href = `/transaction/${tx.tx_hash}`;
                    txLink.innerText = tx.tx_hash;
                    txHashCell.appendChild(txLink);
                    
                    const timestampCell = document.createElement('td');
                    if (tx.timestamp !== 'N/A') {
                        timestampCell.innerText = new Date(tx.timestamp * 1000).toLocaleString();
                    } else {
                        timestampCell.innerText = 'N/A';
                    }

                    const feeCell = document.createElement('td');
                    feeCell.innerText = tx.fee.toFixed(12);

                    const sizeCell = document.createElement('td');
                    sizeCell.innerText = tx.size;

                    txRow.appendChild(txHashCell);
                    txRow.appendChild(timestampCell);
                    txRow.appendChild(feeCell);
                    txRow.appendChild(sizeCell);
                    
                    transactionTableBody.appendChild(txRow);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                const transactionTableBody = document.getElementById('transactionTable').querySelector('tbody');
                transactionTableBody.innerHTML = '<tr><td colspan="4">Error loading transaction pool</td></tr>';
            });
    }

    function fetchLatestBlocks() {
        return fetch('/get_latest_blocks')
            .then(response => response.json())
            .then(data => {
                const blocksTableBody = document.getElementById('blocksTable').querySelector('tbody');
                blocksTableBody.innerHTML = '';
                data.blocks.forEach(block => {
                    const blockRow = document.createElement('tr');

                    const heightCell = document.createElement('td');
                    heightCell.innerText = block.height;

                    const timestampCell = document.createElement('td');
                    timestampCell.innerText = new Date(block.timestamp * 1000).toLocaleString();

                    const sizeCell = document.createElement('td');
                    sizeCell.innerText = block.block_size;

                    const txCountCell = document.createElement('td');
                    txCountCell.innerText = block.num_txes;

                    blockRow.appendChild(heightCell);
                    blockRow.appendChild(timestampCell);
                    blockRow.appendChild(sizeCell);
                    blockRow.appendChild(txCountCell);

                    blocksTableBody.appendChild(blockRow);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                const blocksTableBody = document.getElementById('blocksTable').querySelector('tbody');
                blocksTableBody.innerHTML = '<tr><td colspan="4">Error loading latest blocks</td></tr>';
            });
    }

    function fetchAllData() {
        fetchBlockCount();
        fetchInfo();
        fetchTransactionPool();
        fetchLatestBlocks();
    }

    // Fetch all data when the page loads
    fetchAllData();

    // Set up an interval to refresh the data every 25 seconds
    setInterval(fetchAllData, 25000);

    // Add event listener for search form
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput').value.trim();
        if (searchInput) {
            window.location.href = `/transaction/${searchInput}`;
        }
    });
});
