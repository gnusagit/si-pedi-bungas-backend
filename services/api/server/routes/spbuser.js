const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    bcrypt = require('bcryptjs'),
    fs = require('fs'),
    multer = require('multer'),
    minio = require('minio'),
    sharp = require('sharp'),
    jwt = require("jsonwebtoken"),
    UAParser = require("ua-parser-js")
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
// Audit Trails
let auditTrail = require('../function/audit');
let spbuser = require('../models/spbuser')
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
router.route('/spbuser').post(function(req, res) {
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
                    req.body.individu = req.body.individu == '' ? null : req.body.individu;
                    req.body.pswd = req.body.password
                    req.body.password = bcrypt.hashSync(req.body.password, 10)
                    spbuser.create(req.body).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbuser', 'Insert', '', req.body)
                        res.json({
                            'status': 1,
                            'message': 'Data added',
                            'type': 'success'
                        })
                    }).catch(err => {
                        res.status(200).json({
                            'status': 0,
                            'type': 'error',
                            'message': 'Service Trouble'
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
                    req.body.individu = req.body.individu == '' ? null : req.body.individu;
                    if (req.body.changePassword == 0) {
                        delete req.body.pswd;
                        delete req.body.password;
                        spbuser.findByIdAndUpdate(req.body.id, req.body).then(data => {
                            auditTrail.generate(tokenString.user._id, 'spbuser', 'Insert', '', req.body)
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
                        req.body.pswd = req.body.password
                        req.body.password = bcrypt.hashSync(req.body.password, 10)
                        spbuser.findByIdAndUpdate(req.body.id, req.body).then(data => {
                            auditTrail.generate(tokenString.user._id, 'spbuser', 'Insert', '', req.body)
                            res.status(200).json({
                                'status': 1,
                                'message': 'Data added',
                                'type': 'success'
                            })
                        }).catch(err => {
                            res.status(500).json({
                                'status': 0,
                                'type': 'error',
                                'message': 'Service Trouble'
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
                    spbuser.deleteMany({
                        '_id': {
                            $in: JSON.parse(req.body.id)
                        }
                    }).then(data => {
                        auditTrail.generate(tokenString.user._id, 'spbuser', 'Insert', '', req.body)
                        res.status(200).json({
                            'status': 1,
                            'message': 'Data added',
                            'type': 'success'
                        })
                    }).catch(err => {
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
                    spbuser.aggregate([{
                        "$sort": {
                            "createdAt": -1
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "idAkses": 1,
                            "password": 1,
                            "pswd": 1,
                            "group_id": 1,
                            "individu": 1,
                            "role_mobile": 1,
                            "role_backend": 1,
                        }
                    }, {
                        "$lookup": {
                            "from": "llpanggota",
                            "localField": "individu",
                            "foreignField": "_id",
                            "as": "individu_docs"
                        }
                    }, {
                        "$lookup": {
                            "from": "usergroups",
                            "localField": "group_id",
                            "foreignField": "_id",
                            "as": "group_docs"
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
router.route('/spbuser_upload').post(multer({
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
                    let bucketName = "spbuser"
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
router.route('/spbuser_image/*').get(function(req, res) {
    let bucketName = "spbuser"
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
router.route('/spbuser_presignedobject').get(function(req, res) {
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
                    let bucketName = "spbuser"
                    let finalFile = subBucket + '/' + tokenString["user"]["_id"] + "/" + req.query.objectname
                    minioClient.presignedUrl('GET', bucketName, `${finalFile}`, 24 * 60 * 60, function(error, presignedUrl) {
                        if (error) {
                            console.log(error)
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
router.route('/spbuser_remove_file').post(function(req, res) {
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
                    minioClient.removeObjects("spbuser", JSON.parse(req.body.objName).map(i => `${finalFile}` + i), function(err) {
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
module.exports = router