const express = require('express');
const multer = require('multer');
const router = express.Router();
const Reward = require('../models/reward');
const Goal = require('../models/goal');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Routes for rewards
router.get('/', async (req, res) => {
    const rewards = await Reward.find().populate('goalId');
    res.json(rewards);
});

router.get('/unbound', async (req, res) => {
    const rewards = await Reward.find({ status: 'unbound' });
    res.json(rewards);
});

router.post('/', upload.single('file'), async (req, res) => {
    const reward = new Reward({
        name: req.body.name,
        description: req.body.description,
        file: req.file ? req.file.filename : null,
        goalId: req.body.goalId || null, // 确保 goalId 为 null 而不是空字符串
    });
    await reward.save();
    res.json(reward);
});

router.put('/:id', upload.single('file'), async (req, res) => {
    const reward = await Reward.findById(req.params.id);
    reward.name = req.body.name;
    reward.description = req.body.description;
    if (req.file) {
        reward.file = req.file.filename;
    }
    reward.goalId = req.body.goalId || null;
    reward.status = req.body.status || 'unbound';
    await reward.save();
    res.json(reward);
});

router.put('/:id/goal', async (req, res) => {
    const reward = await Reward.findById(req.params.id);
    const goalId = req.body.goalId;

    if (reward) {
        // 解绑之前的 goal
        if (reward.goalId) {
            const previousGoal = await Goal.findById(reward.goalId);
            if (previousGoal) {
                previousGoal.rewardId = null;
                await previousGoal.save();
            }
        }

        // 更新新的 goal
        if (goalId) {
            const newGoal = await Goal.findById(goalId);
            if (newGoal) {
                newGoal.rewardId = reward._id;
                await newGoal.save();
            }
        }

        // 更新 reward，如果goal为空则更新状态为未绑定
        reward.goalId = goalId || null;
        reward.status = goalId ? 'bound' : 'unbound';
        await reward.save();

        res.json(reward);
    } else {
        res.status(404).json({ message: 'Reward not found' });
    }
});

router.put('/:id/status', async (req, res) => {
    const reward = await Reward.findById(req.params.id);
    if (reward) {
        reward.status = req.body.status;
        await reward.save();
        res.json(reward);
    } else {
        res.status(404).json({ message: 'Reward not found' });
    }
});

router.delete('/:id', async (req, res) => {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (reward && reward.goalId) {
        const goal = await Goal.findById(reward.goalId);
        if (goal) {
            goal.rewardId = null;
            await goal.save();
        }
    }
    res.json({ message: 'Reward deleted' });
});

module.exports = router;
