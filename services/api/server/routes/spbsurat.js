const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    bcrypt = require('bcryptjs'),
    path = require('path'),
    xlsxtojson = require('xlsx_buffer_json'),
    multer = require('multer'),
    minio = require('minio'),
    fs = require('fs'),
    PizZip = require('pizzip'),
    zip = require('express-zip'),
    Docxtemplater = require('docxtemplater'),
    sharp = require('sharp'),
    jwt = require("jsonwebtoken"),
    UAParser = require("ua-parser-js")
let router = express.Router()
// Audit Trails
let auditTrail = require('../function/audit')
let spbsurat = require('../models/spbsurat')
// Start add model parent
let spblaporan = require('../models/spblaporan')
// End add model parent
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
// Minio
let minioClient = new minio.Client({
    endPoint: process.env.minioEnpoint, // Server IP or Domain Name
    port: parseInt(process.env.minioPort),
    useSSL: process.env.minioSSL == true, // Default false
    accessKey: process.env.minioaccessKey,
    secretKey: process.env.miniosecretKey
})
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
// Multers upload statement
let upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, callback) {
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'))
        }
        callback(null, true)
    }
}).single('file')
router.route('/spbsurat/:parentID').post(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    req.body.jenisSurat = req.body.jenisSurat == '' ? null : req.body.jenisSurat;
                    req.body.lampiran = JSON.parse(req.body.lampiran);
                    spbsurat.create(req.body).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbsurat', 'Insert', '', req.body)
                        // Start Add child ID to parent
                        spblaporan.findOne({
                            '_id': mongoose.Types.ObjectId(req.params.parentID)
                        }).then(item => {
                            return item
                        }).then(itemb => {
                            itemb.spbsurat.push(data['_id'])
                            return itemb.save()
                        }).then(itemc => {
                            console.log(itemc)
                            res.status(200).json({
                                'status': 1,
                                'message': 'Data added',
                                'type': 'success'
                            })
                        }).catch(err => {
                            console.log(err)
                        })
                        // End Add child ID to parent
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            'status': 0,
                            'type': 'error',
                            'message': 'Service Trouble'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
}).put(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    req.body.jenisSurat = req.body.jenisSurat == '' ? null : req.body.jenisSurat;
                    req.body.lampiran = JSON.parse(req.body.lampiran);
                    spbsurat.findByIdAndUpdate(req.body.id, req.body).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbsurat', 'Update', '', req.body)
                        res.status(200).json({
                            'status': 1,
                            'message': 'Data has changed',
                            'type': 'success'
                        })
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            'status': 0,
                            'type': 'error',
                            'message': 'Service Trouble'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
}).delete(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    spbsurat.deleteMany({
                        '_id': {
                            $in: JSON.parse(req.body.id)
                        }
                    }).then(data => {
                        if (req.body.lampiran != "") {
                            minioClient.removeObjects("spbsurat", JSON.parse(req.body.lampiran).map(i => "lampiran/" + tokenString["user"]["_id"] + "/" + i), function(err) {
                                if (err) {
                                    return console.log("Unable to remove object", err)
                                }
                                console.log("Removed the object")
                            })
                        }
                        auditTrail.generate(tokenString.user._id, 'spbsurat', 'Delete', '', req.body)
                        return data
                    }).then(datab => {
                        // Start Delete child ID to parent
                        return spblaporan.updateOne({
                            '_id': mongoose.Types.ObjectId(req.params.parentID)
                        }, {
                            '$pull': {
                                'spbsurat': {
                                    '$in': JSON.parse(req.body.id)
                                }
                            }
                        })
                        // End Delete child ID to parent
                    }).then(datac => {
                        console.log(datac)
                        res.status(200).json({
                            'status': 1,
                            'message': 'Data deleted',
                            'type': 'success'
                        })
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            'status': 0,
                            'type': 'error',
                            'message': 'Service Trouble'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
}).get(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    spbsurat.aggregate([{
                        "$sort": {
                            "createdAt": -1
                        }
                    }, {
                        "$match": {
                            "laporan": mongoose.Types.ObjectId(req.params.parentID)
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "createdBy": 1,
                            "idAkses": 1,
                            "tanggal": 1,
                            "laporan": 1,
                            "nomorSurat": 1,
                            "jenisSurat": 1,
                            "lampiran": 1,
                            "uraian": 1
                        }
                    }, {
                        "$lookup": {
                            "from": "spbjenissurat",
                            "localField": "jenisSurat",
                            "foreignField": "_id",
                            "as": "jenisSurat_docs"
                        }
                    }]).then(data => {
                        res.status(200).json(data)
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            'status': 0,
                            'type': 'error',
                            'message': 'Service Trouble'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
router.route('/spbsurat_filter').get(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    spbsurat.aggregate([{
                        "$sort": {
                            "createdAt": -1
                        }
                    }, {
                        "$match": where[tokenString.user.group_id]
                    }, {
                        "$project": {
                            "id": "$_id",
                            "createdBy": 1,
                            "idAkses": 1,
                            "tanggal": 1,
                            "laporan": 1,
                            "nomorSurat": 1,
                            "jenisSurat": 1,
                            "lampiran": 1,
                            "uraian": 1
                        }
                    }]).then(data => {
                        res.status(200).json(data)
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            'status': 0,
                            'type': 'error',
                            'message': 'Service Trouble'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
router.route('/spbsurat_upload').post(multer({
    storage: multer.memoryStorage()
}).single("upload"), function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    let bucketName = "spbsurat"
                    let subBucket = req.query.document.replace(/_/g, '-').toLowerCase()
                    let finalFile = subBucket + '/' + tokenString["user"]["_id"] + "/" + req.file.originalname
                    if (req.query.compress == 'true') {
                        let fileType = req['file']['mimetype'].split('/')
                        let objFormat = []
                        objFormat['image/png'] = {
                            quality: Number(req.query.quality)
                        }
                        sharp(req.file.buffer).toFormat(fileType[1], objFormat[req['file']['mimetype']]).toBuffer().then(data => {
                            minioClient.putObject(bucketName, finalFile, data, function(err, etag) {
                                if (err) {
                                    console.log(err)
                                    res.status(500).json({
                                        'status': 'failed',
                                        'type': 'error',
                                        'message': 'Error uploading file.'
                                    })
                                    return false
                                }
                                res.status(200).json({
                                    'status': 'server',
                                    'type': 'success',
                                    'message': 'file uploaded'
                                })
                            })
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({
                                'status': 'failed',
                                'type': 'error',
                                'message': 'Error uploading file. (Compressing failed)'
                            })
                            return false
                        })
                    } else {
                        minioClient.putObject(bucketName, finalFile, req.file.buffer, function(err, etag) {
                            if (err) {
                                console.log(err)
                                res.status(500).json({
                                    'status': 'failed',
                                    'type': 'error',
                                    'message': 'Error uploading file.'
                                })
                                return false
                            }
                            res.status(200).json({
                                'status': 'server',
                                'type': 'success',
                                'message': 'file uploaded'
                            })
                        })
                    }
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})

router.route('/spbsurat_image/*').get(function(req, res) {
    let bucketName = "spbsurat"
    let buff = []
    let imagePath = decodeURI(req.url.split("/").slice(2).join("/"));
    let imagePathQuery = imagePath.split("?");
    let imageExt = imagePathQuery[0].split(".");
    //CHECK BROWSER
    let parser = new UAParser();
    let ua = req.headers["user-agent"];
    let browserName = parser.setUA(ua).getBrowser().name;
    let t;
    if ((browserName == "IE") || (browserName == "IEMobile") || (browserName == "Safari") || (browserName == "Mobile Safari")) {
        if (imageExt[imageExt.length - 1] == "png") {
            t = "png";
        } else {
            t = "jpg";
        }
    } else {
        t = "webp";
    }
    let finalFile = req.query.pathname + '/' + req["query"]["id"] + "/" + imagePathQuery[0];
    minioClient.getObject(bucketName, finalFile, function(err, dataStream) {
        if (err) {
            return console.log(err)
        }
        dataStream.on('data', function(chunk) {
            buff.push(chunk)
        })
        dataStream.on('end', function() {
            sharp(Buffer.concat(buff)).toFormat(t, {
                quality: Number(req.query.quality),
            }).toBuffer().then((data) => {
                res.end(data)
            }).
            catch(err => {
                console.log(err)
            })
        })
        dataStream.on('error', function(err) {
            console.log(err)
        })
    })
})
router.route('/spbsurat_presignedobject').get(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    let bucketName = "spbsurat"
                    let subBucket = req.query.document.replace(/_/g, '-').toLowerCase()
                    let finalFile = subBucket + '/' + tokenString["user"]["_id"] + "/" + req.query.objectname
                    minioClient.presignedUrl('GET', bucketName, `${finalFile}`, 24 * 60 * 60, function(error, presignedUrl) {
                        if (error) {
                            res.status(500).json({
                                'status': 0,
                                'message': error,
                                'type': 'error'
                            })
                            return false
                        }
                        res.status(200).json({
                            'status': 1,
                            'message': presignedUrl,
                            'type': 'success'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
router.route('/spbsurat_remove_file').post(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    let subBucket = req.body.documentName.replace(/_/g, '-').toLowerCase()
                    let finalFile = subBucket + '/' + tokenString["user"]["_id"] + "/"
                    minioClient.removeObjects("spbsurat", JSON.parse(req.body.objName).map(i => `${finalFile}` + i), function(err) {
                        if (err) {
                            console.log(err)
                            res.status(500).json({
                                'status': 0,
                                'type': 'error',
                                'message': 'Unable to remove object'
                            })
                            return false
                        }
                        res.status(200).json({
                            'type': 'success',
                            'message': 'file deleted'
                        })
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
router.route('/spbsurat_import/:parentID').post(function(req, res) {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json({
                'status': 0,
                'type': 'error',
                'message': err['message']
            })
        } else {
            redisClient.get(req['headers']['token-id'], function(err, reply) {
                if (err) {
                    res.status(500).json({
                        'status': 0,
                        'type': 'error',
                        'message': 'Redis Trouble'
                    })
                    return false
                }
                let tokenString = JSON.parse(reply)
                if (tokenString) {
                    let arrData = []
                    let exceltojson = xlsxtojson
                    upload(req, res, function(err) {
                        if (err) {
                            res.status(500).json({
                                error_code: 1,
                                err_desc: err
                            })
                            return false
                        }
                        if (!req.file) {
                            res.status(500).json({
                                error_code: 1,
                                err_desc: "No file passed"
                            })
                            return false
                        }
                        try {
                            exceltojson({
                                input: req.file.buffer,
                                output: null,
                                lowerCaseHeaders: false
                            }, function(err, result) {
                                if (err) {
                                    res.status(500).json({
                                        error_code: 1,
                                        err_desc: err,
                                        data: null
                                    })
                                    return false
                                }
                                result.forEach(element => {
                                    element['_id'] = mongoose.Types.ObjectId()
                                    element.laporan = mongoose.Types.ObjectId(req.params.parentID)
                                    element.jenisSurat = element.jenisSurat != '' && element.jenisSurat != undefined ? element.jenisSurat : null;
                                    arrData.push(element)
                                });
                                if (req.query.type == 'append') {
                                    spbsurat.create(arrData, (err, success) => {
                                        auditTrail.generate(tokenString.user._id, 'spbsurat', 'Import', '', '')
                                        // Start Add child ID to parent
                                        spblaporan.findOne({
                                            '_id': mongoose.Types.ObjectId(req.params.parentID)
                                        }).then(item => {
                                            return item
                                        }).then(itemb => {
                                            arrData.forEach(xx => {
                                                itemb.spbsurat.push(xx['_id'])
                                            })
                                            return itemb.save()
                                        }).then(itemc => {
                                            res.status(200).json(itemc)
                                        }).catch(err => {
                                            console.log(err)
                                            res.status(500).json({
                                                error_code: 1,
                                                err_desc: "Service Error"
                                            })
                                        })
                                        // End Add child ID to parent
                                    })
                                } else {
                                    spbsurat.deleteMany({
                                        'laporan': mongoose.Types.ObjectId(req.params.parentID)
                                    }, (err, success) => {
                                        if (err) res.status(200).json({
                                            error_code: 1,
                                            err_desc: err
                                        })
                                        spblaporan.updateOne({
                                            '_id': mongoose.Types.ObjectId(req.params.parentID)
                                        }, {
                                            'spbsurat': []
                                        }).then(data => {
                                            return data
                                        }).then(datab => {
                                            return spbsurat.create(arrData)
                                        }).then(datac => {
                                            auditTrail.generate(req.user.id, req.user.email, 'spbsurat', 'Import', '', req.body)
                                            return spblaporan.findOne({
                                                '_id': mongoose.Types.ObjectId(req.params.parentID)
                                            })
                                        }).then(datad => {
                                            arrData.forEach(xx => {
                                                datad.spbsurat.push(xx['_id'])
                                            })
                                            return datad.save()
                                        }).then(datae => {
                                            res.status(200).json(datae)
                                        }).catch(err => {
                                            console.log(err)
                                            res.status(500).json({
                                                error_code: 1,
                                                err_desc: "Service Error"
                                            })
                                        })
                                    })
                                }
                            })
                        } catch (e) {
                            res.status(500).json({
                                error_code: 1,
                                err_desc: "Corupted excel file"
                            })
                        }
                    })
                } else {
                    res.status(400).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
module.exports = router