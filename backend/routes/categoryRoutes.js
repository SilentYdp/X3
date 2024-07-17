const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// 获取所有分类
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 创建新分类
router.post('/', async (req, res) => {
    const category = new Category(req.body);
    try {
        const newCategory = await category.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 更新分类
router.put('/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 删除分类
router.delete('/:name', async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({ name: req.params.name });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
