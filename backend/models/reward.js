const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    name: String,
    description: String,
    file: String,
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
});

module.exports = mongoose.model('Reward', rewardSchema);
