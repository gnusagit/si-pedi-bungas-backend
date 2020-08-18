const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    uniqid = require('uniqid'),
    jwt = require("jsonwebtoken")
let router = express.Router()
let apigenerator = require('../models/apigenerator')
let apigeneratorconfig = require('../models/apigeneratorconfig')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
router.route('/apigeneratorconfig/:parentID').post(function(req, res) {
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
                let secretKey = `API${uniqid()}`
                if (tokenString) {
                    apigeneratorconfig.aggregate([{
                        "$match": {
                            "apiId": mongoose.Types.ObjectId(req.params.parentID)
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "apiId": 1,
                            "fieldname": 1,
                            "filterType": 1,
                            "operatorFilter": 1,
                            "pullField": 1,
                            "lookup": 1
                        }
                    }]).then(data => {
                        let dataMatch = data.filter(datafilter => {
                            return datafilter.filterType != ''
                        })
                        let dataSelect = data.filter(datafilter => {
                            return datafilter.pullField == 1
                        })
                        let dataLookup = data.filter(datafilter => {
                            return datafilter.lookup != ''
                        })
                        let queryArray = []
                        let dataMatchFinal = []
                        dataMatch.forEach(el => {
                            let obj = {}
                            obj['fieldname'] = el['fieldname']
                            obj['type'] = el['filterType']
                            if (el['filterType'] == 'Operator') {
                                obj['operator'] = el['operatorFilter']
                            }
                            dataMatchFinal.push(obj)
                        })
                        let dataSelectFinal = {
                            'createdAt': 1,
                            'updatedAt': 1
                        }
                        dataSelect.forEach(el => {
                            dataSelectFinal[el['fieldname']] = 1
                        })
                        queryArray.push({
                            'match': dataMatchFinal
                        }, {
                            '$sort': {
                                'createdAt': -1
                            }
                        }, {
                            '$project': dataSelectFinal
                        })
                        dataLookup.forEach(ele => {
                            queryArray.push({
                                '$lookup': {
                                    "from": ele['lookup'],
                                    "localField": ele['fieldname'],
                                    "foreignField": "_id",
                                    "as": `${ele.lookup}_docs`
                                }
                            })
                        })
                        return queryArray
                    }).then(datab => {
                        redisClient.set(secretKey, JSON.stringify(datab))
                        if (req.body.ttl == 1) {
                            redisClient.expire(secretKey, parseInt(req.body.ttlValue))
                        }
                        let objUpdate = {
                            'ttl': req.body.ttl,
                            'ttlValue': req.body.ttlValue,
                            'ttlStartDate': req.body.ttlStartDate,
                            'ttlEndDate': req.body.ttlEndDate,
                            'status': 1,
                            'apiKey': secretKey
                        }
                        return apigenerator.findByIdAndUpdate(req.params.parentID, objUpdate)
                    }).then(datac => {
                        res.status(200).json({
                            'status': 1,
                            'message': `API Started with token : ${secretKey}`,
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
                    apigeneratorconfig.findByIdAndUpdate(req.body.id, req.body).then(data => {
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
                    apigeneratorconfig.aggregate([{
                        "$match": {
                            "apiId": mongoose.Types.ObjectId(req.params.parentID)
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "apiId": 1,
                            "fieldname": 1,
                            "filterType": 1,
                            "operatorFilter": 1,
                            "pullField": 1
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
module.exports = router