module.exports.ML_SERVER_BASE = `http://127.0.0.1:8000/`;
module.exports.VEGETABLE_PREDICTION_ENDPOINT = `vegetableresult/?SoilPh={ph}&RelativeHumidity={humidity}&SoilTemperature={temp}`;
module.exports.PREDICTED_VEG = 0;
module.exports.PREDICTED_FRUIT = 1;
module.exports.PREDICTED_CROP =2;
module.exports.PREDICTED_PESTS = 3;
module.exports.CROP_PREDICTION_ENDPOINT = `cropresult/?SoilPh={ph}&RelativeHumidity={humidity}&SoilTemperature={temp}`;
module.exports.FRUIT_PREDICTION_ENDPOINT = `fruitresult/?SoilPh={ph}&RelativeHumidity={humidity}&SoilTemperature={temp}`;
module.exports.RISK_PREDICTION_ENDPOINT = `riskresult/?SoilPh={ph}&RelativeHumidity={humidity}&SoilTemperature={temp}`;
module.exports.PEST_PREDICTION_ENDPOINT = `pestresult/?SoilPh={ph}&RelativeHumidity={humidity}&SoilTemperature={temp}`;


module.exports.FARM = 0;
module.exports.TRUCK = 1;

module.exports.CRITICAL = -1;
module.exports.REGULAR = 0;
module.exports.INFO = 1;
