const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    minio = require('minio'),
    multer = require('multer');
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let spbsurat = require('../models/spbsurat')
let spbjenissurat = require('../models/spbjenissurat')
let spbtahapansurat = require('../models/spbtahapansurat')

// REDIS
let redis = require("redis")
let redisClient = redis.createClient('6479', '103.85.13.5')
let minioClient = new minio.Client({
    endPoint: "103.85.13.5", // Server IP or Domain Name
    port: 9000,
    useSSL: false, // Default false
    accessKey: "admin",
    secretKey: "gnusa123"
})
router.route('/spbsurat')
.get(function(req, res) {
    redisClient.get(req['headers']['token-id'], function(err, reply) {
        if (err) {
            res.status(200).json({
                'status': 0,
                'type': 'error',
                'message': 'Redis Trouble'
            })
            return false
        }
        let tokenString = JSON.parse(reply)
        if (tokenString) {
            let pipelineData = []
            let matchSett = tokenString[0]['match']
            let objList = Object.keys(req['query'])
            let objGroup = {}
            objList.forEach(el => {
                objGroup[el] = 1
            })
            let objFix = {}
            matchSett.forEach(el => {
                if (objGroup[el.fieldname] != undefined) {
                    if (el.type == 'Likes') {
                        objFix[el.fieldname] = {
                            ['$regex']: req['query'][el.fieldname],
                            ['$options']: 'i'
                        }
                    } else if (el.type == 'Operator') {
                        let valueFilter = ''
                        if (el.operator == '$in' || el.operator == '$nin') {
                            try {
                                JSON.parse(req['query'][el.fieldname])
                            } catch (e) {
                                res.status(200).json({
                                    'status': false,
                                    'type': 'error',
                                    'message': `${req['query'][el.fieldname]} invalid JSON format`
                                })
                                return false;
                            }
                            valueFilter = JSON.parse(req['query'][el.fieldname])
                        } else {
                            valueFilter = req['query'][el.fieldname]
                        }
                        objFix[el.fieldname] = {
                            [el.operator]: valueFilter
                        }
                    } else if (el.type == 'ObjectId') {
                        if (mongodb.ObjectID.isValid(req['query'][el.fieldname]) === false) {
                            res.status(200).json({
                                'status': false,
                                'type': 'error',
                                'message': `${req['query'][el.fieldname]} invalid value. must be ObjectId`
                            })
                            return false
                        }
                        objFix[el.fieldname] = mongoose.Types.ObjectId(req['query'][el.fieldname])
                    }
                }
            })
            let matchQuery = {
                '$match': objFix
            }
            if (matchSett.length != 0) {
                if (Object.entries(objFix).length === 0) {
                    console.log('kosong')
                    res.status(200).json({
                        'status': false,
                        'type': 'error',
                        'message': 'Parameter required. must be define'
                    })
                    return false
                }
            }
            pipelineData.push(matchQuery)
            // Others pipeline except match
            let xx = 0
            tokenString.forEach(ele => {
                xx++
                if (xx > 1) {
                    pipelineData.push(ele)
                }
            })
            pipelineData.push({
                $lookup:{
                    from: 'spbtahapansurat',
                    localField: 'spbjenissurat_docs.tahapanSurat',
                    foreignField: '_id',
                    as: 'tahapanSurat'
                }
            }, {
                "$skip": (parseInt(req['query']['page']) - 1) * parseInt(req['query']['limit'])
            }, {
                "$limit": parseInt(req['query']['limit'])
            })
            spbsurat.aggregate(pipelineData).then(data => {
                res.send(data)
            }).catch(err => {
                console.log(err)
                res.status(200).json({
                    'status': 0,
                    'type': 'error',
                    'message': err['errmsg']
                })
            })
        } else {
            res.json({
                'status': 0,
                'message': 'Token expired',
                'type': 'error'
            })
        }
    })
}).post(function(req, res) {
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

            var params = {
                "laporan" : mongoose.Types.ObjectId(req.body.laporan),
                "tanggal" : req.body.tanggal,
                "nomorSurat" : req.body.nomorSurat,
                "jenisSurat" : mongoose.Types.ObjectId(req.body.jenisSurat),
                "lampiran" : JSON.parse(req.body.lampiran),
                "uraian" : req.body.uraian,
            };

            spbsurat.create(params).then( data => {

                spbjenissurat.findOne({'_id':data.jenisSurat}, function(err, jenissurat){
                    spbtahapansurat.findOne({'_id':jenissurat.tahapanSurat}, function(err, ahapansurat){
                        res.status(200).json({
                            'status': 1,
                            'message': 'Data added',
                            'type': 'success',
                            'data' : {
                                "_id": data._id,
                                "laporan": data.laporan,
                                "tanggal": data.tanggal,
                                "nomorSurat": data.nomorSurat,
                                "jenisSurat": data.jenisSurat,
                                "lampiran": data.lampiran,
                                "uraian": data.uraian,
                                "createdAt": data.createdAt,
                                "updatedAt": data.updatedAt,
                                "spbjenissurat_docs": [jenissurat],
                                "tahapanSurat": [ahapansurat]
                            }
                        })
                    });
                });
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
})

router.route('/spbsurat/edit')
.post(function(req, res) {
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

            var params = {
                "laporan" : mongoose.Types.ObjectId(req.body.laporan),
                "tanggal" : req.body.tanggal,
                "nomorSurat" : req.body.nomorSurat,
                "jenisSurat" : mongoose.Types.ObjectId(req.body.jenisSurat),
                "lampiran" : JSON.parse(req.body.lampiran),
                "uraian" : req.body.uraian,
            };

            spbsurat.findByIdAndUpdate(req.body.id, params).then(data => {
                res.status(200).json({
                    'status': 1,
                    'message': 'Data has changed',
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
})

router.route('/spbsurat_upload')
.post(multer({storage: multer.memoryStorage()}).single("lampiran"), function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			let bucketName = "spbsurat"
			let finalFile = req.query.pathname+'/' + req.query.id + "/"+req.file.originalname
            
            minioClient.putObject(bucketName, finalFile, req.file.buffer, function(err, etag) {
                if(err) {
                    console.log(err)
                    res.status(200).json({'status':'failed','type':'error','message':'Error uploading file.'})
                    return false
                }
                res.status(200).json({'status':'server','type':'success','message':'file uploaded', 'filename':req.file.originalname})
            })
			
		}else{
			res.json({'status':0,'message':'Token expired','type':'error'})
		}
	})
})

router.route('/spbsurat/remove')
.post(function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			spbsurat.deleteMany({
				'_id': {
					$in: [req.body.id]
				}
			}).then(data => {

                minioClient.removeObjects("spbsurat", JSON.parse(req.body.lampiran).map(i => "lampiran/" + req.body.user_id + "/" + i), function (err) {
                    if (err) {
                        return console.log("Unable to remove object", err)
                    }
                    console.log("Removed the object")
                })

				res.json({
					'status': 1,
					'message': 'Data deleted',
					'type': 'success'
				})

			}).catch(err => {
				res.status(200).json({
					'status': 0,
					'type': 'error',
					'message': 'Service Trouble'
				})
			})
		}else{
			res.json({'status':0,'message':'Token expired','type':'error'})
		}
	})
})

router.route('/spbsurat/findone')
.post(function(req, res) {
    redisClient.get(req['headers']['token-id'], function(err, reply) {
        if (err) {
            res.status(200).json({
                'status': 0,
                'type': 'error',
                'message': 'Redis Trouble'
            })
            return false
        }
        let tokenString = JSON.parse(reply)
        if (tokenString) {
            let pipelineData = []
            let matchSett = tokenString[0]['match']
            let objList = Object.keys(req['query'])
            let objGroup = {}
            objList.forEach(el => {
                objGroup[el] = 1
            })
            let objFix = {}
            matchSett.forEach(el => {
                if (objGroup[el.fieldname] != undefined) {
                    if (el.type == 'Likes') {
                        objFix[el.fieldname] = {
                            ['$regex']: req['query'][el.fieldname],
                            ['$options']: 'i'
                        }
                    } else if (el.type == 'Operator') {
                        let valueFilter = ''
                        if (el.operator == '$in' || el.operator == '$nin') {
                            try {
                                JSON.parse(req['query'][el.fieldname])
                            } catch (e) {
                                res.status(200).json({
                                    'status': false,
                                    'type': 'error',
                                    'message': `${req['query'][el.fieldname]} invalid JSON format`
                                })
                                return false;
                            }
                            valueFilter = JSON.parse(req['query'][el.fieldname])
                        } else {
                            valueFilter = req['query'][el.fieldname]
                        }
                        objFix[el.fieldname] = {
                            [el.operator]: valueFilter
                        }
                    } else if (el.type == 'ObjectId') {
                        if (mongodb.ObjectID.isValid(req['query'][el.fieldname]) === false) {
                            res.status(200).json({
                                'status': false,
                                'type': 'error',
                                'message': `${req['query'][el.fieldname]} invalid value. must be ObjectId`
                            })
                            return false
                        }
                        objFix[el.fieldname] = mongoose.Types.ObjectId(req['query'][el.fieldname])
                    }
                }
            })
            let matchQuery = {
                '$match': objFix
            }
            if (matchSett.length != 0) {
                if (Object.entries(objFix).length === 0) {
                    console.log('kosong')
                    res.status(200).json({
                        'status': false,
                        'type': 'error',
                        'message': 'Parameter required. must be define'
                    })
                    return false
                }
            }
            pipelineData.push(matchQuery)
            // Others pipeline except match
            let xx = 0
            tokenString.forEach(ele => {
                xx++
                if (xx > 1) {
                    pipelineData.push(ele)
                }
            })
            pipelineData.push({
                "$match": {
                    "_id": mongoose.Types.ObjectId(req.body.id)
                }
            }, {
                $lookup:{
                    from: 'spbtahapansurat',
                    localField: 'spbjenissurat_docs.tahapanSurat',
                    foreignField: '_id',
                    as: 'tahapanSurat'
                }
            }, {
                "$skip": (parseInt(req['query']['page']) - 1) * parseInt(req['query']['limit'])
            }, {
                "$limit": parseInt(req['query']['limit'])
            })
            spbsurat.aggregate(pipelineData).then(data => {
                res.send(data)
            }).catch(err => {
                res.status(200).json({
                    'status': 0,
                    'type': 'error',
                    'message': err['errmsg']
                })
            })
        } else {
            res.json({
                'status': 0,
                'message': 'Token expired',
                'type': 'error'
            })
        }
    })
})

module.exports = router