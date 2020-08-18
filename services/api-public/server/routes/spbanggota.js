const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb')
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let spbanggota = require('../models/spbanggota')
let spbuser = require('../models/spbuser')
let spbsatker = require('../models/spbsatker')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient('6479', '103.85.13.5')
router.route('/spbanggota').get(function(req, res) {
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
                "$skip": (parseInt(req['query']['page']) - 1) * parseInt(req['query']['limit'])
            }, {
                "$limit": parseInt(req['query']['limit'])
            })
            spbanggota.aggregate(pipelineData).then(data => {
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

router.route('/spbanggota/login')
.post(function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			spbanggota.countDocuments({nrp : req.body.nrp, satker : mongoose.Types.ObjectId(req.body.satkerId)}, function(err, c){
				if(err) res.status(200).json({'status':0,'type':'error','message':'Service Trouble'});
				if(c!=0){
					spbanggota
					.findOne({nrp : req.body.nrp, satker : mongoose.Types.ObjectId(req.body.satkerId)})
					.populate('satker')
					.exec(function(err, data){
						if(err) res.status(200).json({'status':0,'type':'error','message':'Service Trouble'});
						if(data.satker._id == "5f36386572180a2936a43410"){
							spbuser.countDocuments({individu : data._id}, function(err, c){
								if(err) res.status(200).json({'status':0,'type':'error','message':'Service Trouble'});
								if(c!=0){
									spbuser.findOne({individu : data._id}).exec(function(err, user){
										if(err) res.status(200).json({'status':0,'type':'error','message':'Service Trouble'});
										if(user.group_id == "5f3611edd5495600116cfcce" || user.group_id == "5f321b49b53fc4001193e386"){
											let ada = false;
											data.imei.split(',').forEach(element => {
												if(element == req.body.imei){
													ada = true;
												}
											});
											
											if(ada==false){
												data.imei = data.imei + "," + req.body.imei;
												data.save();
											}
											res.json({'status':1,'message':'Data added','type':'success', 'data' : data, 'user' : user});
										} else {
											res.json({'status':0,'message':'Account are already used','type':'error'});
										}
									});
								} else {
									res.status(200).json({'status':0,'type':'error','message':'No data found'});
								}
							});
						} else {
							if(data.imei == req.body.imei || data.imei == ""){
								spbuser.countDocuments({individu : data._id}, function(err, c){
									if(err) res.status(200).json({'status':0,'type':'error','message':'Service Trouble'});
									if(c!=0){
										spbuser.findOne({individu : data._id}).exec(function(err, user){
											if(err) res.status(200).json({'status':0,'type':'error','message':'Service Trouble'});
											res.json({'status':1,'message':'Data added','type':'success', 'data' : data, 'user' : user});
										});
									} else {
										res.status(200).json({'status':0,'type':'error','message':'No data found'});
									}
								});
							} else {
								res.json({'status':0,'message':'Account are already used','type':'error'});
							}
						}
					
					});
				} else {
					res.status(200).json({'status':0,'type':'error','message':'No data found'});
				}
			});
		}else{
			res.json({'status':0,'message':'Token expired','type':'error'})
		}
	})
})

router.route('/spbanggota/registrasi')
.post(function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			spbanggota.updateOne({
					'_id': mongoose.Types.ObjectId(req.body.id)
				}, {
					'nama_anggota': req.body.nama,
					'telepon': req.body.telepon,
					'email': req.body.email,
					'imei': req.body.imei,
					'photo': req.body.photo
				}).then(data => {
					res.json({
						'status': 1,
						'message': 'Data edited',
						'type': 'success'
					});
				}).catch(err => {
				res.json({'status':0,'message':'Token expired','type':'error'});
			});
		}else{
			res.json({'status':0,'message':'Token expired','type':'error'})
		}
	})
})

router.route('/spbanggota/firebase')
.post(function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			spbanggota.updateOne({'_id':mongoose.Types.ObjectId(req.body.id)},{ 'firebaseid': req.body.firebaseid}).then( data => {
				res.json({'status':1,'message':'Data edited','type':'success'});
			}).catch(err => {
				res.json({'status':0,'message':'Token expired','type':'error'});
			});
		}else{
			res.json({'status':0,'message':'Token expired','type':'error'})
		}
	})
})
.get(function(req, res){
	redisClient.get(req['headers']['token-id'],function(err,reply) {
		if(err){
			res.status(200).json({'status':0,'type':'error','message':'Redis Trouble'})
			return false
		}
		let tokenString = JSON.parse(reply)
		if(tokenString){
			spbsatker
			.findOne({'_id' : mongoose.Types.ObjectId(req.query.satkerId)})
			.exec(function (err, satker) {
				if(err) res.status(200).json({'status':0,'type':'error','message':err['errmsg']});
				spbsatker
				.find({'treecode':satker.ortu})
				.exec(function (err, satker) {
					if(err) res.status(200).json({'status':0,'type':'error','message':err['errmsg']});

					spbuser
					.find({ 
						"satker_id": { 
							"$in": [
								mongoose.Types.ObjectId('5f36386572180a2936a43410'),
								mongoose.Types.ObjectId(satker._id)
							]
						},
					})
					.populate('anggota')
					.then( data => {
						let result = [];
						data.forEach((element) => {
							if(element.usergroup =='Superadmin' || element.usergroup =='Pimpinan'){
								if(element.anggota != null){
									if(element.anggota.firebaseid == null || element.anggota.firebaseid == "" || element.anggota.firebaseid == undefined){} else {
										result.push(element.anggota.firebaseid);
									}
								}
							}
						});
						res.send(result)
					});
				});
			});
		}else{
			res.json({'status':0,'message':'Token expired','type':'error'})
		}
	})
})

module.exports = router