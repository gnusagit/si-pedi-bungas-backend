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
let spbsatker = require('../models/spbsatker')
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
// Multers upload statement (import excel)
let upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, callback) {
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
            return callback(new Error('Wrong extension type'))
        }
        callback(null, true)
    }
}).single('file')
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
router.route('/spbsatker').post(function(req, res) {
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
                    delete req.body.$count;
                    delete req.body.$level;
                    delete req.body.$parent;
                    spbsatker.create(req.body).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbsatker', 'Insert', '', req.body)
                        res.status(200).json({
                            'status': 1,
                            'message': 'Data added',
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
                    delete req.body.$count;
                    delete req.body.$level;
                    delete req.body.$parent;
                    spbsatker.findByIdAndUpdate(req.body.id, req.body).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbsatker', 'Update', '', req.body)
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
                    spbsatker.deleteMany({
                        '_id': {
                            $in: JSON.parse(req.body.id)
                        }
                    }).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbsatker', 'Delete', '', req.body)
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
                    spbsatker.aggregate([{
                        "$sort": {
                            "sortitem": 1
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "treecode": 1,
                            "ortu": 1,
                            "sortitem": 1,
                            "nama": 1,
                            "label": 1,
                            "tipe": 1
                        }
                    }]).then(data => {
                        var dataset = []
                        let arrayData = JSON.stringify(data)
                        dataset = JSON.parse(arrayData)
                        dataset.map(obj => {
                            obj['value'] = obj['nama'];
                            obj['ortu'] = obj['ortu'] == "" ? "" : obj['ortu'];
                        })
                        let _ = require('lodash');
                        unflatten = function(array, ortu, tree) {
                            tree = typeof tree !== 'undefined' ? tree : []
                            ortu = typeof ortu !== 'undefined' ? ortu : {
                                treecode: ''
                            }
                            var children = _.filter(array, function(child) {
                                return child.ortu == ortu.treecode;
                            })
                            if (!_.isEmpty(children)) {
                                if (ortu.treecode == '') {
                                    tree = children;
                                } else {
                                    ortu['open'] = true
                                    ortu['data'] = children
                                }
                                _.each(children, function(child) {
                                    unflatten(array, child)
                                });
                            }
                            return tree;
                        }
                        tree = unflatten(dataset);
                        res.json(200).json(tree);
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
router.route('/spbsatker_filter').get(function(req, res) {
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
                    spbsatker.aggregate([{
                        "$sort": {
                            "sortitem": 1
                        }
                    }, {
                        "$match": {
                            [req.query.fieldVar]: mongoose.Types.ObjectId(req.query.valVar)
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "treecode": 1,
                            "ortu": 1,
                            "sortitem": 1,
                            "nama": 1,
                            "label": 1,
                            "tipe": 1
                        }
                    }]).then(data => {
                        var dataset = []
                        let arrayData = JSON.stringify(data)
                        dataset = JSON.parse(arrayData)
                        dataset.map(obj => {
                            obj['value'] = obj['nama'];
                            obj['ortu'] = obj['ortu'] == "" ? "" : obj['ortu'];
                        })
                        let _ = require('lodash');
                        unflatten = function(array, ortu, tree) {
                            tree = typeof tree !== 'undefined' ? tree : []
                            ortu = typeof ortu !== 'undefined' ? ortu : {
                                treecode: ''
                            }
                            var children = _.filter(array, function(child) {
                                return child.ortu == ortu.treecode;
                            })
                            if (!_.isEmpty(children)) {
                                if (ortu.treecode == '') {
                                    tree = children;
                                } else {
                                    ortu['open'] = true
                                    ortu['data'] = children
                                }
                                _.each(children, function(child) {
                                    unflatten(array, child)
                                });
                            }
                            return tree;
                        }
                        tree = unflatten(dataset);
                        res.json(200).json(tree);
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
router.route('/spbsatker_upload').post(multer({
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
                    let bucketName = "spbsatker"
                    let subBucket = req.query.document.replace(/_/g, '-').toLowerCase()
                    let finalFile = subBucket + '/' + req.file.originalname
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
router.route('/spbsatker_image/*').get(function(req, res) {
    let bucketName = "spbsatker"
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
    let finalFile = req.query.pathname + '/' + imagePathQuery[0];
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
router.route('/spbsatker_presignedobject').get(function(req, res) {
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
                    let bucketName = "spbsatker"
                    let subBucket = req.query.document.replace(/_/g, '-').toLowerCase()
                    let finalFile = subBucket + '/' + req.query.objectname
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
                    res.status(500).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
router.route('/spbsatker_remove_file').post(function(req, res) {
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
                    let finalFile = subBucket + '/'
                    minioClient.removeObjects("spbsatker", JSON.parse(req.body.objName).map(i => `${finalFile}` + i), function(err) {
                        if (err) {
                            console.log("Unable to remove object", err)
                            res.status(500).json({
                                'status': 0,
                                'message': 'Unable to remove object',
                                'type': 'error'
                            })
                            return false
                        }
                        console.log("Removed the object")
                        res.status(200).json({
                            'type': 'success',
                            'message': 'file deleted'
                        })
                    })
                } else {
                    res.status(500).json({
                        'status': 0,
                        'message': 'Token expired',
                        'type': 'error'
                    })
                }
            })
        }
    })
})
router.route('/spbsatker_import').post(function(req, res) {
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
                                    arrData.push(element)
                                });
                                if (req.query.type == 'append') {
                                    spbsatker.create(arrData, (err, success) => {
                                        if (err) {
                                            res.status(500).json({
                                                error_code: 1,
                                                err_desc: err
                                            })
                                            return false
                                        }
                                        auditTrail.generate(tokenString.user._id, 'spbsatker', 'Import', '', '')
                                        res.status(200).send(success)
                                    })
                                } else {
                                    spbsatker.deleteMany({}, (err, success) => {
                                        if (err) {
                                            res.status(500).json({
                                                error_code: 1,
                                                err_desc: err
                                            })
                                            return false
                                        }
                                        spbsatker.create(arrData, (err, success) => {
                                            auditTrail.generate(tokenString.user._id, 'spbsatker', 'Import', '', '')
                                            res.status(200).json(success)
                                        })
                                    })
                                }
                            });
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