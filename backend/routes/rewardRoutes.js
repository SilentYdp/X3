const express = require('express');
const multer = require('multer');
const router = express.Router();
const Reward = require('../models/reward');

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
        goalId: req.body.goalId,
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
    reward.goalId = req.body.goalId;
    await reward.save();
    res.json(reward);
});

router.put('/:id/bind', async (req, res) => {
    const reward = await Reward.findById(req.params.id);
    if (reward) {
        reward.goalId = req.body.goalId;
        reward.status = 'bound';
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
    await Reward.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reward deleted' });
});

module.exports = router;
