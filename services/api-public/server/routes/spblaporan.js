const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    minio = require('minio')
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let spblaporan = require('../models/spblaporan')
let spbuser = require('../models/spbuser')
let spbsatker = require('../models/spbsatker')
let spbanggota = require('../models/spbanggota')
let spbtahapansurat = require('../models/spbtahapansurat')

// REDIS
let redis = require("redis")
let redisClient = redis.createClient('6479', '103.85.13.5')
// Minio
let minioClient = new minio.Client({
    endPoint: "103.85.13.5", // Server IP or Domain Name
    port: 9000,
    useSSL: false, // Default false
    accessKey: "admin",
    secretKey: "gnusa123"
})
router.route('/spblaporan')
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
                    from: 'spbuser',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            }, {
                $lookup:{
                    from: 'spbanggota',
                    localField: 'createdBy.individu',
                    foreignField: '_id',
                    as: 'createdByIndividu'
                }
            },{
                "$skip": (parseInt(req['query']['page']) - 1) * parseInt(req['query']['limit'])
            }, {
                "$limit": parseInt(req['query']['limit'])
            })
            spblaporan.aggregate(pipelineData).then(data => {
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
})
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
            req.body.spbsurat = [];
            spblaporan.create(req.body).then(data => {
                spbuser.findOne({'_id':data.createdBy}, function(err, data){
                    spbanggota.findOne({'_id':data.individu}, function(err, data){
                        res.status(200).json({
                            'status': 1,
                            'message': 'Data added',
                            'type': 'success',
                            'user' : [data],
                            'data' : data
                        })
                    });
                });
            
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
})

router.route('/spblaporan/remove')
.post(function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			spblaporan.deleteMany({
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

				spbtahapansurat.deleteMany({
					'laporan': {
						$in: [req.body.id]
					}
				}).catch(err => {
					console.log('error');
					console.log(err);
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

router.route('/spblaporan/edit')
.post(function (req, res) {
	redisClient.get(req['headers']['token-id'], function (err, reply) {
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
			spblaporan.findByIdAndUpdate(mongoose.Types.ObjectId(req.body.id), req.body).then(data => {
				res.json({
					'status': 1,
					'message': 'Data edited',
					'type': 'success',
					'data' : data
				})
			}).catch(err => {
				res.status(200).json({'status':0,'type':'error','message':'Service Trouble'})
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

router.route('/spblaporan/findone')
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
                    from: 'spbuser',
                    localField: 'createdBy',
                    foreignField: '_id',
                    as: 'createdBy'
                }
            }, {
                $lookup:{
                    from: 'spbanggota',
                    localField: 'createdBy.individu',
                    foreignField: '_id',
                    as: 'createdByIndividu'
                }
            },{
                "$skip": (parseInt(req['query']['page']) - 1) * parseInt(req['query']['limit'])
            }, {
                "$limit": parseInt(req['query']['limit'])
            })
            spblaporan.aggregate(pipelineData).then(data => {
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
})

module.exports = router