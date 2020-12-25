const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        Notification.find({user: req.user._id})
        .then(data => {
            res.json({
                success: true,
                message: "Got notifications successfully",
                notifications: data,
            });
        })
        .catch(e => {
            res.json({
                success: false,
                message: e
            });
        })

    } catch (e) {
        res.json({
            success: false,
            message: e
        })
    }
});

module.exports = router;
