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

    function fetchLastBlockInfo() {
        return fetch('/get_last_block_info')
            .then(response => response.json())
            .then(data => {
                const timeSinceLastBlockCard = document.getElementById('timeSinceLastBlockCard');
                const numTransactionsCard = document.getElementById('numTransactionsCard');
                const transactionTableBody = document.getElementById('transactionTable').querySelector('tbody');

                if (data.block_count) {
                    timeSinceLastBlockCard.innerText = `Time Since Last Block: ${data.time_since_last_block}s`;
                    numTransactionsCard.innerText = `Transactions in Last Block: ${data.num_transactions}`;
                    transactionTableBody.innerHTML = '';
                    data.transactions.forEach(tx => {
                        const txRow = document.createElement('tr');
                        
                        const txHashCell = document.createElement('td');
                        const txLink = document.createElement('a');
                        txLink.href = `/transaction/${tx.tx_hash}`;
                        txLink.innerText = tx.tx_hash;
                        txHashCell.appendChild(txLink);
                        
                        const timestampCell = document.createElement('td');
                        timestampCell.innerText = new Date(tx.timestamp * 1000).toLocaleString();

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
                } else {
                    timeSinceLastBlockCard.innerText = 'Time Since Last Block: Error';
                    numTransactionsCard.innerText = 'Transactions in Last Block: Error';
                    transactionTableBody.innerHTML = '<tr><td colspan="4">Error loading transaction hashes</td></tr>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const timeSinceLastBlockCard = document.getElementById('timeSinceLastBlockCard');
                const numTransactionsCard = document.getElementById('numTransactionsCard');
                const transactionTableBody = document.getElementById('transactionTable').querySelector('tbody');

                timeSinceLastBlockCard.innerText = 'Time Since Last Block: Error';
                numTransactionsCard.innerText = 'Transactions in Last Block: Error';
                transactionTableBody.innerHTML = '<tr><td colspan="4">Error loading transaction hashes</td></tr>';
            });
    }

    function fetchAllData() {
        fetchBlockCount();
        fetchLastBlockInfo();
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
