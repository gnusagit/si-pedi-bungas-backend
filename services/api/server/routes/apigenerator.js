const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    jwt = require("jsonwebtoken")
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let apigenerator = require('../models/apigenerator')
let apigeneratorconfig = require('../models/apigeneratorconfig')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
router.route('/apigenerator').post(function(req, res) {
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
                    apigenerator.create(req.body).then(data => {
                        let addSchema = redisClient.get('5f32058cb53fc4001193e35e', function(err, reply) {
                            let dataparse = JSON.parse(reply)
                            let datafix = dataparse.filter(datafilter => {
                                return datafilter.id == data['packagename']
                            })
                            let objInsert = []
                            datafix[0]['field_name'].forEach(element => {
                                let objfield = {}
                                objfield['apiId'] = data['_id']
                                objfield['fieldname'] = element.id
                                objfield['filterType'] = ''
                                objfield['operatorFilter'] = ''
                                objfield['pullField'] = 1
                                objfield['lookup'] = element.lookup != undefined ? element.lookup : ''
                                objInsert.push(objfield)
                            });
                            apigeneratorconfig.insertMany(objInsert)
                        })
                        return addSchema
                    }).then(datab => {
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
                    apigenerator.findByIdAndUpdate(req.body.id, req.body).then(data => {
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
                    apigenerator.deleteMany({
                        '_id': {
                            $in: JSON.parse(req.body.id)
                        }
                    }).then(data => {
                        return apigeneratorconfig.deleteMany({
                            'apiId': {
                                $in: JSON.parse(req.body.id)
                            }
                        })
                    }).then(datab => {
                        if (JSON.parse(req.body.delApi).length != 0) {
                            JSON.parse(req.body.delApi).forEach(token => {
                                redisClient.del(token, function(err, reply) {
                                    console.log(reply)
                                })
                            })
                        }
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
                    apigenerator.aggregate([{
                        "$sort": {
                            "createdAt": -1
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "packagename": 1,
                            "description": 1,
                            "ttl": 1,
                            "ttlValue": 1,
                            "ttlStartDate": 1,
                            "ttlEndDate": 1,
                            "status": 1,
                            "apiKey": 1
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
router.route('/apigenerator-packagelist').post(function(req, res) {
    redisClient.get('5f32058cb53fc4001193e35e', function(err, reply) {
        res.send(reply)
    })
})
router.route('/apigenerator-check-api').post(function(req, res) {
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
                    apigenerator.findOne({
                        '_id': mongoose.Types.ObjectId(req.body.dataID)
                    }).then(data => {
                        res.status(200).send(data)
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
router.route('/apigenerator-stop').post(function(req, res) {
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
                    apigenerator.findOne({
                        '_id': mongoose.Types.ObjectId(req.body.dataID)
                    }).then(data => {
                        redisClient.del(data['apiKey'], function(err, reply) {
                            if (reply === 1) {
                                console.log("Key is deleted")
                            } else {
                                console.log("Does't exists")
                            }
                        })
                        data['apiKey'] = ''
                        data['status'] = 0
                        data['ttl'] = 0
                        data['ttlStartDate'] = ''
                        data['ttlEndDate'] = ''
                        data['ttlValue'] = 0
                        return data.save()
                    }).then(datab => {
                        res.status(200).json({
                            'status': 1,
                            'type': 'success',
                            'message': 'API Stopped'
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
})
module.exports = router