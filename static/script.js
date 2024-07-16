document.addEventListener('DOMContentLoaded', function() {
    function fetchBlockCount() {
        fetch('/get_block_count')
            .then(response => response.json())
            .then(data => {
                const blockCountResult = document.getElementById('blockCountResult');
                if (data.result && data.result.count) {
                    blockCountResult.innerText = `Block Count: ${data.result.count}`;
                } else {
                    blockCountResult.innerText = 'Error fetching block count';
                }
                blockCountResult.classList.remove('loading');
            })
            .catch(error => {
                console.error('Error:', error);
                const blockCountResult = document.getElementById('blockCountResult');
                blockCountResult.innerText = 'Error fetching block count';
                blockCountResult.classList.remove('loading');
            });
    }

    function fetchLastBlockInfo() {
        fetch('/get_last_block_info')
            .then(response => response.json())
            .then(data => {
                const lastBlockInfoResult = document.getElementById('lastBlockInfoResult');
                if (data.block_count) {
                    lastBlockInfoResult.innerText = 
                        `Block Count: ${data.block_count}, Time Since Last Block: ${data.time_since_last_block}s, ` +
                        `Number of Transactions: ${data.num_transactions}`;
                } else {
                    lastBlockInfoResult.innerText = 'Error fetching last block info';
                }
                lastBlockInfoResult.classList.remove('loading');
            })
            .catch(error => {
                console.error('Error:', error);
                const lastBlockInfoResult = document.getElementById('lastBlockInfoResult');
                lastBlockInfoResult.innerText = 'Error fetching last block info';
                lastBlockInfoResult.classList.remove('loading');
            });
    }

    function fetchAverageBlockTime() {
        fetch('/get_block_count')
            .then(response => response.json())
            .then(data => {
                if (data.result && data.result.count) {
                    const blockCount = data.result.count;
                    const fetchBlockPromises = [];

                    for (let i = blockCount - 20; i < blockCount; i++) {
                        fetchBlockPromises.push(fetch(`/get_block/${i}`).then(response => response.json()));
                    }

                    return Promise.all(fetchBlockPromises);
                } else {
                    throw new Error('Error fetching block count');
                }
            })
            .then(blockDataArray => {
                const averageBlockTimeResult = document.getElementById('averageBlockTimeResult');
                const timestamps = blockDataArray.map(blockData => blockData.result.block_header.timestamp);
                
                const timeDiffs = timestamps.slice(1).map((timestamp, index) => timestamp - timestamps[index]);
                const averageBlockTime = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;

                averageBlockTimeResult.innerText = 
                    `Average Time Between Last 20 Blocks: ${averageBlockTime.toFixed(2)}s`;
                averageBlockTimeResult.classList.remove('loading');
            })
            .catch(error => {
                console.error('Error:', error);
                const averageBlockTimeResult = document.getElementById('averageBlockTimeResult');
                averageBlockTimeResult.innerText = 'Error fetching average block time';
                averageBlockTimeResult.classList.remove('loading');
            });
    }

    function fetchAllData() {
        fetchBlockCount();
        fetchLastBlockInfo();
        fetchAverageBlockTime();
    }

    // Fetch all data when the page loads
    fetchAllData();

    // Set up an interval to refresh the data every 25 seconds
    setInterval(fetchAllData, 25000);
});
