const express = require('express');
const router = express.Router();
const Image = require('../models/uploadImage');
const { map } = require('../app');

const uploadImage = async (req, res, next) => {
    // to declare some path to store your converted image
    try {

    const matches = req.body.base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

     console.log(matches)
    if (matches.length !== 3) {
    return new Error('Invalid input string');
    }
     
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    let decodedImg = response;
    let image = decodedImg.data;
    let type = decodedImg.type;
    let filename = "image."+Date.now()+'.' + type;

    const newImage = await Image.create({
        filename,
        type,
        image,
    });

    await newImage.save();
    // fs.writeFileSync("./images/" + fileName, imageBuffer, 'utf8');
    return res.json({"status":"success"});
    } catch (e) {
console.log(e)
return res.json({error:'Not Uploaded'})    }
}

const getAll = async (req,res)=>{
    try {
        const all = await Image.find({});
        let images = [];
        all.forEach((val)=>{
            let image= val.image.toString('base64');
            images.push({image,type:val.type});
            
        })
            return res.json(images);
        // res.json(all[0].image.toString('base64'))
    } catch (e) {
        console.log(e) 
        res.json({error:'00000'})
    }
}

router.get('/all',getAll);

router.post("/upload",uploadImage);
 
module.exports=router;