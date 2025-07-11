const express = require('express');
const cors = require('cors');

const authRoutes = require('../backend/routes/auth.routes');
const userRoutes = require('../backend/routes/user.route');
const registerRoutes = require('../backend/routes/register.routes');
const caloriesRoutes = require('../backend/routes/calories.routes');
const historysaveRoutes = require('../backend/routes/historysave.route');
const gethistoryRoutes = require('../backend/routes/gethistory.route');
const deletehistoryRoutes = require('../backend/routes/deletehistory.route');

require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api/auth',registerRoutes)
app.use('/api/auth',caloriesRoutes)
app.use('/api/auth',historysaveRoutes)
app.use('/api/auth',gethistoryRoutes)
app.use('/api/auth',deletehistoryRoutes)
const port = process.env.BACKEND_PORT
app.listen(port, () => {
  console.log('Server is running on http://localhost:5050');
});
