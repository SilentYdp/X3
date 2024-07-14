const express = require('express');
const router = express.Router();
const Goal = require('../models/goal');

// Routes for goals
router.get('/', async (req, res) => {
    const goals = await Goal.find().populate('tasks');
    res.json(goals);
});

router.post('/', async (req, res) => {
    const goal = new Goal(req.body);
    await goal.save();
    res.json(goal);
});

router.get('/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id).populate('tasks');
        if (goal) {
            res.json(goal);
        } else {
            res.status(404).json({ message: 'Goal not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    if (goal) {
        goal.name = req.body.name;
        goal.description = req.body.description;
        goal.expectedTime = req.body.expectedTime;
        goal.isComplete = req.body.isComplete;  // 新增字段：isComplete
        await goal.save();
        res.json(goal);
    } else {
        res.status(404).json({ message: 'Goal not found' });
    }
});

router.delete('/:id', async (req, res) => {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted' });
});

router.post('/:id/tasks', async (req, res) => {
    const goal = await Goal.findById(req.params.id);
    if (goal) {
        const newTask = {
            task: req.body.task,
            category: req.body.category,
            expectedTime: req.body.expectedTime,
            investedTime: 0,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            isComplete: req.body.isComplete, // 新增字段
        };
        goal.tasks.push(newTask);
        await goal.save();
        res.json(goal);
    } else {
        res.status(404).json({ message: 'Goal not found' });
    }
});

router.put('/:goalId/tasks/:taskId', async (req, res) => {
    const goal = await Goal.findById(req.params.goalId);
    if (goal) {
        const taskIndex = goal.tasks.findIndex(task => task._id.toString() === req.params.taskId);
        if (taskIndex >= 0) {
            goal.tasks[taskIndex] = { ...goal.tasks[taskIndex], ...req.body };
            await goal.save();
            res.json(goal);
        } else {
            console.log(`Task not found: ${req.params.taskId}`);
            res.status(404).json({ message: 'Task not found' });
        }
    } else {
        console.log(`Goal not found: ${req.params.goalId}`);
        res.status(404).json({ message: 'Goal not found' });
    }
});

router.delete('/:goalId/tasks/:taskId', async (req, res) => {
    const goal = await Goal.findById(req.params.goalId);
    if (goal) {
        goal.tasks = goal.tasks.filter(task => task._id.toString() !== req.params.taskId);
        await goal.save();
        res.json(goal);
    } else {
        res.status(404).json({ message: 'Goal not found' });
    }
});

module.exports = router;
