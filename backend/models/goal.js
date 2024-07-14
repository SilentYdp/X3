const mongoose = require('mongoose');
const taskSchema = require('./task').schema;

const goalSchema = new mongoose.Schema({
    name: String,
    description: String,
    expectedTime: Number,
    tasks: [taskSchema],
});

module.exports = mongoose.model('Goal', goalSchema);
