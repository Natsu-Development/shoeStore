const fs = require('fs');
const upload = require('../app/middlewares/upload.mdw');

class imageHelp {
    handleImageUpdate(req, product) {
        // format and trim query
        const {reqQueryForUpdate, reqQueryForAdd} = this.reqQueryTrim(req.query.image, product.arrayImage, 1);
        const reqQueryForDelete = this.reqQueryTrim(req.query.imageDelete, product.arrayImage, 0);

        // have upload file (must have update, add image)
        if(req.files.length !=0) {
            // update and add image
            if((reqQueryForUpdate).length !=0) {
                req.body.arrayImage = this.handleEditImage(product.arrayImage, (reqQueryForUpdate).sort(), req.files);
                // add image
                if((reqQueryForAdd).length != 0) {
                    req.body.arrayImage = this.handleNewImage(product.arrayImage, req.files, (reqQueryForUpdate).sort(), 'addAndUpdate');
                }
            }
            // just add image
            else {
                req.body.arrayImage = this.handleNewImage(product.arrayImage, req.files, 0, 'justAdd');
            }
        }
        // delete image if have req.query.imageDelete
        if((reqQueryForDelete).length != 0) {
            req.body.arrayImage = this.handleDeleteImage(product.arrayImage, (reqQueryForDelete).sort());
        }
        return req.body.arrayImage;
    }

    reqQueryTrim (reqQuery, arrImgShoe, flag) {
        reqQuery = reqQuery.replace(/,+/g, ','); //replace two commas with one commas 
        reqQuery = reqQuery.replace(/,\s*$/, ""); //replace last commas in string
        reqQuery = reqQuery.replace(/^,/, ''); // replace first commas in string
        reqQuery = reqQuery.split(',');
        if(flag === 1) {
            var reqQueryForUpdate = reqQuery.filter(position => position < arrImgShoe.length);
            console.log("🚀 ~ file: imageHelp.js ~ line 38 ~ imageHelp ~ reqQueryTrim ~ reqQueryForUpdate", reqQueryForUpdate)
            var reqQueryForAdd = reqQuery.filter(position => position >= arrImgShoe.length);
            console.log("🚀 ~ file: imageHelp.js ~ line 40 ~ imageHelp ~ reqQueryTrim ~ reqQueryForAdd", reqQueryForAdd)
            if(reqQueryForUpdate[0] === '') {
                reqQueryForUpdate = [];
            }
            if(reqQueryForAdd[0] === '') {
                reqQueryForAdd = [];
            }
            return {reqQueryForUpdate, reqQueryForAdd};
        }
        const reqQueryForDelete = reqQuery.filter(position => position < arrImgShoe.length);
        if(reqQueryForDelete[0] === '') return [];
        return reqQueryForDelete;
    }

    handleEditImage(arrayImageOfShoe, arrayPositionOldImg, reqFiles) {
        const arrDeleteOldImg = arrayPositionOldImg.filter(positionOfImg => arrayPositionOldImg.includes(positionOfImg));
        // value for get new image by sort increase (update first, add after)
        var positionUpdateImg = 0;
        arrDeleteOldImg.forEach(positionOfImg => {
            fs.unlink('src/public/upload/' + arrayImageOfShoe[positionOfImg].filename, (err)=> console.log(err));
            arrayImageOfShoe[positionOfImg].filename = reqFiles[positionUpdateImg].filename;
            positionUpdateImg++;
        });
        console.log("🚀 ~ file: imageHelp.js ~ line 66 ~ imageHelp ~ handleEditImage ~ arrayImageOfShoe", arrayImageOfShoe)
        return arrayImageOfShoe;
    }

    handleNewImage(arrayImageOfShoe, reqFiles, positionOfNewImg, action) {
        var arrayNewImage = [];
        if(action === 'addAndUpdate') {
            // positionOfNewImg.length is reqQueryForUpdate.length to get position of new image in req.files
            arrayNewImage = this.addNewImgToArrImgOfShoe(arrayImageOfShoe, reqFiles, arrayImageOfShoe.length, positionOfNewImg.length);
        }
        else {
            // If just add position of new image must begin from 0
            arrayNewImage = this.addNewImgToArrImgOfShoe(arrayImageOfShoe, reqFiles, arrayImageOfShoe.length, 0);
        }
        console.log("🚀 ~ file: imageHelp.js ~ line 60 ~ imageHelp ~ handleNewImage ~ arrayImageOfShoe", arrayImageOfShoe)
        return arrayImageOfShoe;
    }

    addNewImgToArrImgOfShoe(arrayImageOfShoe, reqFiles, position, positionNewImage) {
        while(positionNewImage<reqFiles.length) {
            arrayImageOfShoe.push({
                'position': position,
                'filename': reqFiles[positionNewImage].filename
            });
            position++;
            positionNewImage++;
        }
        return arrayImageOfShoe;
    }

    handleDeleteImage(arrayImageOfShoe, arrayImageDelete) {
        var arrPositionOfImg = arrayImageOfShoe.map(image => image.position);  
        var arrImgToDelete = arrayImageDelete.filter(positionOfDelete => arrPositionOfImg.includes(parseInt(positionOfDelete)));
        // delete file name in storage (upload)
        arrayImageDelete.forEach(positionOfDelete => {
            fs.unlink('src/public/upload/' + arrayImageOfShoe[positionOfDelete].filename, (err)=> console.log(err));
        })
        // delete file name of image have request delete, not delete position
        arrImgToDelete.forEach(positionOfDelete => {delete arrayImageOfShoe[positionOfDelete].filename;})
        // format arrayImg(position and filename orderly) when have delete 
        arrayImageOfShoe = this.arrayImageFormat(arrayImageOfShoe);
        console.log("🚀 ~ file: imageHelp.js ~ line 106 ~ imageHelp ~ handleDeleteImage ~ arrayImageOfShoe", arrayImageOfShoe)
        return arrayImageOfShoe;  
    }

    arrayImageFormat(arrayImage) {
        var result = [], position = 0;
        arrayImage.forEach(image => {
            if(image.filename != null) {
                result.push({
                    'position': position,
                    'filename': image.filename
                });
                position++;
            }
        })
        return result;
    }

    createArrayImage(reqFiles)  {
        var arrayObjectImage = [], position = 0;
        reqFiles.forEach(image => {
            arrayObjectImage.push({
                'position': position,
                'filename': image.filename
            });
            position++;
        });
        return arrayObjectImage;
    }
}

module.exports = new imageHelp();