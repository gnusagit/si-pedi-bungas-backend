const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb')
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let spbuser = require('../models/spbuser')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient('6479', '103.85.13.5')
router.route('/spbuser').get(function(req, res) {
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
            spbuser.aggregate(pipelineData).then(data => {
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