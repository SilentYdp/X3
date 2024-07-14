const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const goalRoutes = require('./routes/goalRoutes');

const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/task-tracker', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Routes
app.use('/tasks', taskRoutes);
app.use('/categories', categoryRoutes);
app.use('/rewards', rewardRoutes);
app.use('/goals', goalRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
