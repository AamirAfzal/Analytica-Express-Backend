const { ML_SERVER_BASE, VEGETABLE_PREDICTION_ENDPOINT, PREDICTED_VEG, RISK_PREDICTION_ENDPOINT, CRITICAL, FARM,  } = require('./constants');

const mongoose = require('mongoose');
const FarmPrediction = require("../models/farmPrediction");
const Notification = require("../models/notification");
const axios = require('axios');
const answerRegex = /\&#x27;([^&#x27;]+)&#x27;/g;

module.exports.doRiskAnalysis = async (temp, ph, humidity, farm, user) => {
    try {
        let response = await axios.get(ML_SERVER_BASE + RISK_PREDICTION_ENDPOINT.replace("{ph}", ph).replace("{humidity}", humidity).replace("{temp}", temp));
        if (parseInt(response.status) === 200) {
            //Oh boy we got a response
            let answer = answerRegex.exec(response.data)[1];
            const riskLevel = answer.trim().split(/\s+/g)[0];
            if (/\s*no\s*/g.test(riskLevel.trim().toLowerCase())) {
                //no risk
                await Notification.deleteMany({
                    type: CRITICAL,
                    domain: FARM,
                    target: farm._id,
                    user: user._id,
                });
            } else {
                await Notification.deleteMany({
                    type: CRITICAL,
                    domain: FARM,
                    target: farm._id,
                    user: user._id,
                });
                Notification.create({
                    type: CRITICAL,
                    domain: FARM,
                    target: farm._id,
                    message: `Our systems has detected that there is a risk in your farm ${farm.name} and the risk level is ${riskLevel}`,
                    user: user._id,
                }).then(noti => console.log(noti))
                .catch(e => console.error(e));
            }
        } else { 
            console.log(response);
        }
    } catch(e) {
        console.log(e);
    }
}