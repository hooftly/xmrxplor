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
                const transactionHashesResult = document.getElementById('transactionHashesResult');
                
                if (data.block_count) {
                    timeSinceLastBlockCard.innerText = `Time Since Last Block: ${data.time_since_last_block}s`;
                    numTransactionsCard.innerText = `Transactions in Last Block: ${data.num_transactions}`;
                    transactionHashesResult.innerHTML = '';
                    data.tx_hashes.forEach(tx => {
                        const txDiv = document.createElement('div');
                        const txLink = document.createElement('a');
                        txLink.href = `/transaction/${tx}`;
                        txLink.innerText = tx;
                        txDiv.appendChild(txLink);
                        transactionHashesResult.appendChild(txDiv);
                    });
                } else {
                    timeSinceLastBlockCard.innerText = 'Time Since Last Block: Error';
                    numTransactionsCard.innerText = 'Transactions in Last Block: Error';
                    transactionHashesResult.innerText = 'Error loading transaction hashes';
                }
                transactionHashesResult.classList.remove('loading');
            })
            .catch(error => {
                console.error('Error:', error);
                const timeSinceLastBlockCard = document.getElementById('timeSinceLastBlockCard');
                const numTransactionsCard = document.getElementById('numTransactionsCard');
                const transactionHashesResult = document.getElementById('transactionHashesResult');

                timeSinceLastBlockCard.innerText = 'Time Since Last Block: Error';
                numTransactionsCard.innerText = 'Transactions in Last Block: Error';
                transactionHashesResult.innerText = 'Error loading transaction hashes';
                transactionHashesResult.classList.remove('loading');
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
});
