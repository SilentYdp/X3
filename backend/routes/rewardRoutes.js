const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Reward = require('../models/reward');
const Goal = require('../models/goal');

// Define the absolute path for uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
console.log(`Uploads directory: ${uploadsDir}`);
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadsDir}`);
} else {
    console.log(`Uploads directory already exists: ${uploadsDir}`);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(`Saving file to: ${uploadsDir}`);
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log(`Generated filename: ${filename}`);
        cb(null, filename);
    },
});
const upload = multer({ storage });

// Routes for rewards
router.get('/', async (req, res) => {
    console.log('Fetching all rewards...');
    const rewards = await Reward.find().populate('goalId');
    res.json(rewards);
});

router.get('/unbound', async (req, res) => {
    console.log('Fetching unbound rewards...');
    const rewards = await Reward.find({ status: 'unbound' });
    res.json(rewards);
});

router.post('/', upload.single('file'), async (req, res) => {
    console.log('Received new reward creation request...');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const reward = new Reward({
        name: req.body.name,
        description: req.body.description,
        file: req.file ? req.file.filename : null,
        goalId: req.body.goalId || null,
    });
    await reward.save();
    console.log('Saved new reward:', reward);
    res.json(reward);
});

router.put('/:id', upload.single('file'), async (req, res) => {
    console.log(`Received reward update request for ID: ${req.params.id}`);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const reward = await Reward.findById(req.params.id);
    reward.name = req.body.name;
    reward.description = req.body.description;
    if (req.file) {
        reward.file = req.file.filename;
    }
    reward.status = req.body.status || 'unbound';
    await reward.save();
    console.log('Updated reward:', reward);
    res.json(reward);
});

router.put('/:id/goal', async (req, res) => {
    console.log(`Received goal binding request for reward ID: ${req.params.id}`);
    console.log('Request body:', req.body);

    const reward = await Reward.findById(req.params.id);
    const goalId = req.body.goalId;

    if (reward) {
        if (reward.goalId) {
            console.log(`Unbinding previous goal from reward ID: ${reward._id}`);
            const previousGoal = await Goal.findById(reward.goalId);
            if (previousGoal) {
                previousGoal.rewardId = null;
                await previousGoal.save();
            }
        }

        if (goalId) {
            console.log(`Binding new goal to reward ID: ${reward._id}`);
            const newGoal = await Goal.findById(goalId);
            if (newGoal) {
                newGoal.rewardId = reward._id;
                await newGoal.save();
            }
        }

        reward.goalId = goalId || null;
        reward.status = goalId ? 'bound' : 'unbound';
        await reward.save();
        console.log('Updated reward with new goal:', reward);
        res.json(reward);
    } else {
        res.status(404).json({ message: 'Reward not found' });
    }
});

router.put('/:id/status', async (req, res) => {
    console.log(`Received status update request for reward ID: ${req.params.id}`);
    console.log('Request body:', req.body);

    const reward = await Reward.findById(req.params.id);
    if (reward) {
        reward.status = req.body.status;
        await reward.save();
        console.log('Updated reward status:', reward);
        res.json(reward);
    } else {
        res.status(404).json({ message: 'Reward not found' });
    }
});

router.delete('/:id', async (req, res) => {
    console.log(`Received reward deletion request for ID: ${req.params.id}`);

    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (reward && reward.goalId) {
        const goal = await Goal.findById(reward.goalId);
        if (goal) {
            goal.rewardId = null;
            await goal.save();
        }
    }
    console.log('Deleted reward:', reward);
    res.json({ message: 'Reward deleted' });
});

module.exports = router;
