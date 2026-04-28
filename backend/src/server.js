const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SevaSetu Server is running on port ${PORT}`);
    console.log(`Accessible on local network via your IP address`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
