const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3002; // 使用一个新的端口号

app.use(cors());
app.use(express.json());

app.post('/detect', async (req, res) => {
    try {
        const response = await axios.post('https://contentdetector.ai/detect.php', {
            content: req.body.content
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://contentdetector.ai/'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});