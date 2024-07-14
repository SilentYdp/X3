const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: String,
    category: String,
    duration: Number,
    expectedTime: Number,
    startTime: Date,
    endTime: Date,
    investedTime: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false }, // 新增字段
});

module.exports = mongoose.model('Task', taskSchema);
