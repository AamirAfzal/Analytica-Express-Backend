const express = require('express');
const router = express.Router();
const Report = require('../models/report');
const Sensor = require('../models/sensor');
const Device = require('../models/device');

router.get('/', async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id });
        if (reports) {
            res.json({
                success: true,
                reports,
                message: 'Reports retrieved successfully!'
            });
        } else {
            res.json({
                success: false,
                message: 'An unknown error occured',
            })
        }
    } catch (e) {
        res.json({
            success: false,
            message: e,
        })
    }
});

router.patch('/:id', async (req, res) => {
    try {
        let errors = [];
        if (!req.params.id) errors.push("Id to update is missing"); 
        if (!req.body.reportItems || !Array.isArray(req.body.reportItems)) {
            errors.push("Report Items not found Or Incorrect value");
        } else {
            req.body.reportItems.forEach((reportItem, index) => {
                if (!reportItem.device) errors.push(`Report item ${index} missing device`)
                if (!reportItem.sensor) errors.push(`Report item ${index} missing sensor`)
                if (!reportItem.type) errors.push(`Report item ${index} missing type`)
            })
        }

        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            });
            return;
        }

        const report = await Report.findByIdAndUpdate(req.params.id, {
            reportItems: req.body.reportItems,
        });

        if (report) {
            res.json({
                success: true,
                report,
                message: "Report updated successfully",
            });
        } else {
            res.json({
                success: false,
                message: "An unknown error occurred while updating the report",
            });
        }
    } catch (e) {
        res.json({
            success: false,
            message: e
        });
    }


})

router.post('/', async (req, res) => {
    try {
        let errors = [];
        if (!req.body.name) errors.push("Name parameter is missing");
        if (!req.body.time) errors.push("Time parameter is missing");
        if (!req.body.type && req.body.type !== 0) errors.push("Type is missing");

        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            });
            return;
        }

        const report = await Report.create({
            name: req.body.name,
            time: req.body.time,
            type: req.body.type,
            reportItems: [],
            user: req.user._id,
        });

        if (report) {
            res.json({
                success: true,
                report,
                message: "Report created successfully",
            });
        } else {
            res.json({
                success: false,
                message: "Could not create report",
            })
        }

    } catch (e) {
        res.json({
            success: false,
            message: e,
        })
    }
});

router.get("/:id", async (req, res) => {
    try {
        if (!req.params.id) {
            res.json({
                success: false,
                message: "Id to get report is missing",
            });
            return;
        }

        const report = await Report.findById(req.params.id);
        if (report) {
            res.json({
                success: true,
                report,
                message: "Report fetched successfully",
            });
        } else {
            res.json({
                success: false,
                message: "An unknown error occured",
            });
        }
    } catch (e) {
        res.json({
            success: false,
            message: e,
        })
    }
})

module.exports = router;