const express = require("express");
const router = express.Router();

const Retail = require('../models/retail');
const Transaction = require('../models/transaction');
const Device = require('../models/device');
const Sensor = require('../models/sensor');
const DataPoint = require('../models/dataPoint');


const getRetailSummary = async (retail) => {
    return new Promise(async (resolve, reject) => {
        try {
            const sensors = await Sensor.find({ device: retail.device });
            let toR = {
                retail
            };
            if (sensors) {
                let temperatureSensors = sensors.filter(sen => /TEMP_/g.test(sen.id));
                if (temperatureSensors && temperatureSensors.length !== 0) {
                    const dataPoint = await DataPoint.find({ sensor: temperatureSensors[0]._id }).limit(1).sort({ time: -1 }).exec();
                    toR.temperature = dataPoint.length !== 0 ? dataPoint[0].value : undefined;
                }
            }
            let now = new Date();
            let nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const transactions = await Transaction.find({
                store: retail._id,
                time: { $gte: nowDate }
            });
            toR.allTransactions = await Transaction.find({
                store: retail._id,
            });
            if (transactions) {
                toR.customers = transactions.length;
                toR.revenue = transactions.reduce((total, current) => (total + parseFloat(current.amount)), 0);
                toR.productsSold = transactions.reduce((total, current) => (total + current.items ? current.items.reduce((total, current) => (total + current.quantity), 0) : 0), 0);
                toR.transactions = transactions;
            }


            resolve(toR);
        } catch (e) {
            reject(e);
        }
    });
}

const getRetailDetail = async (retail) => {
    return new Promise(async (resolve, reject) => {
        try {
            const retailSummary = await getRetailSummary(retail);
            if (retailSummary) {
                let products = retailSummary.allTransactions.reduce((items, T) => {
                    items.push(...T.items.map(I => I.name))
                    return items;
                }
                    , []);
                products = new Set(products);
                products = [...products].map(P => {
                    let quantity = retailSummary.allTransactions.reduce((C, T) => { C.push(...T.items.map(I => I.name === P ? I.quantity : 0)); return C }, []);
                    quantity = quantity.reduce((total, current) => (total + parseInt(current)), 0);
                    return { product: P, quantity };
                });

                let revenueChart = retailSummary.allTransactions.reduce((current, T) => {
                    let time = `${T.time.getFullYear()}-${T.time.getMonth() + 1}-${T.time.getDate()}`;
                    current[time] = (current[time] ? current[time] : 0) + T.amount;
                    return current;
                }, {});

                let customerFrequencyChart = {};
                retailSummary.allTransactions.forEach(T => {
                    let time = `${T.time.getFullYear()}-${T.time.getMonth() + 1}-${T.time.getDate()}`;
                    customerFrequencyChart[time] = (customerFrequencyChart[time] ? customerFrequencyChart[time] : 0) + 1;
                });

                let productSaleFrequencyChart = retailSummary.allTransactions.reduce((current, T) => {
                    let time = `${T.time.getFullYear()}-${T.time.getMonth() + 1}-${T.time.getDate()}`;
                    current[time] = (current[time] ? current[time] : 0) + T.items.reduce((current, I) => (current + I.quantity), 0);
                    return current;
                }, {});

                retailSummary.customerFrequencyChart = customerFrequencyChart;
                retailSummary.revenueChart = revenueChart;
                retailSummary.productsFrequency = products;
                retailSummary.productSaleFrequencyChart = productSaleFrequencyChart;

                let maxProduct = products.reduce((current, P) => ((P.quantity >= current.quantity || !current.quantity) ? P : current), {});
                let minProduct = products.reduce((current, P) => ((P.quantity <= current.quantity || !current.quantity) ? P : current), {});
                let recommendations = [
                ];
                if (maxProduct.quantity) {
                    recommendations.push(`Please buy more stocks of ${maxProduct.product} as its demand is highest`);
                }
                if (minProduct.quantity) {
                    recommendations.push(`Please buy less stocks of ${minProduct.product} as its demand is lowest`);
                }
                if (parseInt(retailSummary.temperature) < 18) {
                    recommendations.push(`Please increase the ambient temperature as the temperature ${retailSummary.temperature} is low `)
                } else if (parseInt(retailSummary.temperature) > 28) {
                    recommendations.push(`Please decrease the ambient temperature as the temperature ${retailSummary.temperature} is high `)
                }
                if (retailSummary.retail.shelves) {
                    retailSummary.shelves = await Promise.all(retailSummary.retail.shelves.map(shelf => new Promise(async (resolve, reject) => {
                        try {
                            const sensor = await Sensor.findById(shelf.sensor);
                            const value = await DataPoint.find({ sensor: shelf.sensor }).sort({ time: -1 }).limit(1).exec();
                            let frequency = 0;
                            if (value[0].value) {
                                frequency = Math.ceil(parseFloat(value[0].value) / shelf.weight);
                            };
                            resolve({
                                name: sensor.id.split("_")[1],
                                frequency
                            });
                        } catch (e) {
                            reject(e.toString());
                        }
                    })));
                    retailSummary.shelves = retailSummary.shelves.filter(R => !!R);
 
                } else retailSummary.shelves = [];
                retailSummary.recommendations = recommendations;

                resolve(retailSummary);
            } else {
                reject("No retail summary");
            }
        } catch (e) {
            reject(e);
        }
    });
}

router.post('/:id/transaction', async (req, res) => {
    try {
        let errors = [];
        if (!req.params.id) errors.push("No Id found to insert transaction");
        if (!req.body.items) errors.push("No items in transaction");
        if (!req.body.amount) errors.push("No amount in transaction");

        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            });
            return;
        }

        const retail = await Retail.findById(req.params.id);
        if (retail && retail.user.toString() == req.user._id.toString()) {
            const transaction = await Transaction.create({
                items: req.body.items,
                amount: req.body.amount,
                store: req.params.id
            });
            if (transaction) {
                res.json({
                    success: true,
                    transaction,
                    message: "Transaction created successfully",
                });
                return;
            } else {
                res.json({
                    success: false,
                    message: "An unknown error occurred while creating transaction",
                })
            }
        }
        else {
            res.json({

                success: false,
                message: "Retail outlet not found for the id: " + req.params.id,

            });
        }
    } catch (e) {
        res.json({
            success: false,
            message: e
        })
    }
})

router.patch('/:id', async (req, res) => {
    try {
        let errors = [];
        if (!req.params.id) {
            errors.push("ID to update is missing");
        }
        if (!Array.isArray(req.body.shelves)) errors.push("shelves data is not present or in invalid format");
        else {
            req.body.shelves.forEach((shelf, index) => {
                if (!shelf.sensor) errors.push("sensor is missing for shelf at index: " + index);
                if (!shelf.weight) errors.push("weight is missing for shelf at index: " + index);
                else if (!/^[0-9]+(.|,)?[0-9]?$/.test(shelf.weight)) errors.push("weight is not in correct format at index: " + index);

            })
        }
        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(","),
            });
            return;
        }

        const retail = await Retail.findByIdAndUpdate(req.params.id, {
            shelves: req.body.shelves,
        });

        if (retail) {
            res.json({
                success: true,
                message: 'Updated Successfully',
                retail,
            })
        } else {
            res.json({
                success: false,
                message: "Unknown Error Occurred",
            })
        }


    } catch (e) {
        res.json({
            success: false,
            message: e.toString(),
        })
    }
})

router.get('/', async (req, res) => {
    try {
        const retails = await Retail.find({
            user: req.user._id,
        });

        if (retails) {
            try {
                let toR = await Promise.all(retails.map(R => getRetailSummary(R)));
                if (toR) {
                    res.json({
                        success: true,
                        retails: toR,
                        message: "Retrieved Successfully",
                    })
                }
            } catch (e) {
                res.json({
                    success: false,
                    message: "An Error occured: " + e.toString(),
                })
            }

        } else {
            res.json({
                success: false,
                message: "An unknown error occured",
            })
        }

    } catch (e) {
        res.json({
            success: false,
            message: e
        });
    }
});


router.post('/', async (req, res) => {
    try {
        let errors = [];

        if (!req.body.name) errors.push("Name is missing");
        if ((!req.body.location && req.body.location.lot && req.body.location.lat !== 0) || (!req.body.location.long && req.body.location.long !== 0)) errors.push("Location is missing");
        if (!req.body.device) errors.push("Device is missing");

        if (errors.length !== 0) {
            res.json({
                success: false,
                message: errors.join(", "),
            });
            return;
        }

        const retail = await Retail.create({
            name: req.body.name,
            location: req.body.location,
            device: req.body.device,
            user: req.user._id,
        });


        if (retail) {
            res.json({
                success: true,
                retail,
                message: "Retail created successfully",
            });
        } else {
            res.json({
                success: false,
                message: "An unknown error occurred",
            });
        }


    } catch (e) {
        res.json({
            success: false,
            message: e
        });

    }
});

router.get('/:id', async (req, res) => {
    if (!req.params.id) {
        res.json({
            success: false,
            message: "ID Not found"
        });
        return;
    }

    const retail = await Retail.findById(req.params.id);
    if (retail) {
        let summary = await getRetailDetail(retail);
        if (summary) {
            res.json({
                success: true,
                retail: summary,
            });
            return;
        } else {
            res.json({
                success: false,
                message: "An unknown error occured",
            });
            return;
        }

    } else {
        res.json({
            success: false,
            message: "Could not find retail with this ID: " + req.params.id
        });
    }

})

module.exports = router;