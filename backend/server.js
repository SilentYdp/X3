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

// Define the absolute path for uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
console.log(`Uploads directory: ${uploadsDir}`);
app.use('/uploads/', express.static(uploadsDir));

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
