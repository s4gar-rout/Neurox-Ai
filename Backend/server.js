import dns from 'dns';
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");
import 'dotenv/config';
import app from './src/app.js'
import connectDB from './src/config/databse.js';

import http from 'http';
import { initSocket } from './src/sockets/server.socket.js';

const PORT = process.env.PORT;
const httpServer = http.createServer(app);
initSocket(httpServer);

connectDB();


httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;