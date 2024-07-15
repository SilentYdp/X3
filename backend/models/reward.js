const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
    name: String,
    description: String,
    file: String,
    status: { type: String, enum: ['unbound', 'bound', 'available', 'enjoyed'], default: 'unbound' },
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', default: null }
});

module.exports = mongoose.model('Reward', rewardSchema);
