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
                if (data.transactions && data.transactions.length > 0) {
                    data.transactions.forEach(tx => {
                        const txRow = document.createElement('tr');

                        const txHashCell = document.createElement('td');
                        const txLink = document.createElement('a');
                        txLink.href = `/transaction/${tx.id_hash}`;
                        txLink.innerText = tx.id_hash;
                        txHashCell.appendChild(txLink);

                        const feeCell = document.createElement('td');
                        feeCell.innerText = (tx.fee / 1e12).toFixed(12);

                        const sizeCell = document.createElement('td');
                        sizeCell.innerText = tx.blob_size;

                        txRow.appendChild(txHashCell);
                        txRow.appendChild(feeCell);
                        txRow.appendChild(sizeCell);

                        transactionTableBody.appendChild(txRow);
                    });
                } else {
                    transactionTableBody.innerHTML = '<tr><td colspan="3">No transactions available</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const transactionTableBody = document.getElementById('transactionTable').querySelector('tbody');
                transactionTableBody.innerHTML = '<tr><td colspan="3">Error loading transaction pool</td></tr>';
            });
    }

    function fetchLatestBlocks() {
        return fetch('/get_latest_blocks')
            .then(response => response.json())
            .then(data => {
                const blocksTableBody = document.getElementById('blocksTable').querySelector('tbody');
                blocksTableBody.innerHTML = '';
                if (data.blocks && data.blocks.length > 0) {
                    data.blocks.forEach(block => {
                        const blockRow = document.createElement('tr');

                        const heightCell = document.createElement('td');
                        const heightLink = document.createElement('a');
                        heightLink.href = `/block/${block.height}`;
                        heightLink.innerText = block.height;
                        heightCell.appendChild(heightLink);

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
                } else {
                    blocksTableBody.innerHTML = '<tr><td colspan="4">No blocks available</td></tr>';
                }
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

    fetchAllData();

    setInterval(fetchAllData, 25000);

    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput').value.trim();
        if (searchInput) {
            window.location.href = `/transaction/${searchInput}`;
        }
    });
});
