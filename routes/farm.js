const express  = require('express');
const router  = express.Router();
const Farm = require('../models/farm');
const mongoose = require('mongoose');
const Sensor = require('../models/sensor');
const Device = require('../models/device');
const DataPoint = require('../models/dataPoint');
const FarmPrediction = require('../models/farmPrediction');

router.post('/', async (req,res) => {
    try {
        let errors = [];
        if (!req.body.name || req.body.name === '') errors.push("Name is missing");
        if (!req.body.latitude || req.body.latitude === '') errors.push("Latitude is missing");
        if (!req.body.longtitude || req.body.longtitude === '') errors.push("Longtitude is missing");
        if (!req.body.region || req.body.region === '') errors.push("Region is missing");

        if (errors.length > 0) {
            res.json({
                success: false,
                message: errors.join(","),
            });
            return;
        }

        let newFarm = await Farm.create({
            name: req.body.name,
            latitude: req.body.latitude,
            longtitude: req.body.longtitude,
            region: req.body.region,
            device: req.body.device,
            user: req.user._id,
        });
        if (newFarm) {
            res.json({
                success: true,
                farm: newFarm,
                message: "Farm created successfully",
            });
        } else {
            res.json({
                success: false,
                message: "An error occured while creating farm"
            });
        }


    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.toString(),
        })
    }
});


router.get('/',async (req,res) => {
    try {
        let farms = await Farm.find({user: req.user._id});
        if (farms) {
            res.json({
                success: true,
                message: "Got Farms successfully",
                farms
            });
        } else {
            res.json({
                success: false,
                message: "Some error occured",
            })
        }

    } catch (e) {
        res.statusCode(500).json({
            success: false,
            message: e.toString(),
        })
    }
});


router.get('/:id', async(req,res) => {
    try {
        if (!req.params.id || req.params.id === '') {
            res.statusCode(500).json({
                success: false,
                message: "Invalid ID provided",
            });
            return;
        } 

        let farm = await Farm.findOne({_id: req.params.id});
        if (farm) {
            let device = await Device.findOne({_id: farm.device});
            let sensors = await Sensor.find({device: device._id});
           
            let tempSensors = sensors.filter(se => /^TEMP/g.test(se.id));
            let humidSensors = sensors.filter(se => /^HUMID/g.test(se.id));
            let pHSensors = sensors.filter(se => /^PH/.test(se.id));
          
            tempSensors = tempSensors.map(async tS => {
                let data = await DataPoint.find({sensor: tS._id}).sort({time: -1}).limit(30).exec();
                return Promise.resolve({
                    sensor: tS,
                    data,
                });
            });
            let lightSensors = sensors.filter(se => /^LIGHT/.test(se.id));
          
            lightSensors = await Promise.all(lightSensors.map(async tS => {
                let data = await DataPoint.find({sensor: tS._id}).sort({time: -1}).limit(1).exec();
                if (data.length !== 0) {
                    return Promise.resolve(data[0].value)
                } else {
                   return Promise.resolve(undefined);
                }

                
            }));
            tempSensors = await Promise.all(tempSensors);
            humidSensors = humidSensors.map(async hS => {
                let data = await DataPoint.find({sensor: hS._id}).sort({time: -1}).limit(30).exec();
                return Promise.resolve({
                    sensor: hS,
                    data,
                });
            });
            humidSensors = await Promise.all(humidSensors);
            pHSensors = pHSensors.map(async pS => {
                let data = await DataPoint.find({sensor: pS._id}).sort({time: -1}).limit(30).exec();
                return Promise.resolve({
                    sensor: pS,
                    data,
                });
            });
            pHSensors = await Promise.all(pHSensors);

            let predictions = await FarmPrediction.find({farm: farm._id});

            res.json({
                success: true,
                farm,
                pHSensors,
                humidSensors,
                tempSensors,
                lightSensors,
                message: "Farm found successfully'",
                predictions,
            });
        } else {
            res.json({
                success: false,
                message: "Farm not found",
            });
        }
    } catch (e) {
        res.json({
            success: false,
            message: e.toString(),
        })
    }
});



module.exports =  router;
