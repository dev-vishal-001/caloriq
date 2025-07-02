const express = require('express');
const cors = require('cors');

const authRoutes = require('../backend/routes/auth.routes'); // ✅ match file name
const userRoutes = require('../backend/routes/user.route');
const registerRoutes = require('../backend/routes/register.routes');
const caloriesRoutes = require('../backend/routes/calories.routes');
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/api/auth',registerRoutes)
app.use('/api/auth',caloriesRoutes)


app.listen(5050, () => {
  console.log('Server is running on http://localhost:5050');
});
