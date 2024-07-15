const mongoose = require('mongoose');
const taskSchema = require('./task').schema;

const goalSchema = new mongoose.Schema({
    name: String,
    description: String,
    expectedTime: Number,
    tasks: [taskSchema],
    isComplete: { type: Boolean, default: false }, // 新增字段
    rewardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', default: null },
});

module.exports = mongoose.model('Goal', goalSchema);
