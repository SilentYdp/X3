const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Routes for categories
router.get('/', async (req, res) => {
    const categories = await Category.find();
    res.json(categories);
});

router.post('/', async (req, res) => {
    const category = new Category(req.body);
    await category.save();
    res.json(category);
});

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(category);
});

router.delete('/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
});

module.exports = router;
