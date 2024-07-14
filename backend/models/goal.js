const mongoose = require('mongoose');
const taskSchema = require('./task').schema;

const goalSchema = new mongoose.Schema({
    name: String,
    description: String,
    expectedTime: Number,
    tasks: [taskSchema],
    isComplete: { type: Boolean, default: false }, // 新增字段
});

module.exports = mongoose.model('Goal', goalSchema);
