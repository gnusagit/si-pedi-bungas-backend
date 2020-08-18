const express = require('express'),
    mongoose = require("mongoose"),
    jwt = require("jsonwebtoken"),
    _ = require('lodash'),
    bodyParser = require('body-parser')
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let Menu = require('../models/menu')
let MenuPermission = require('../models/menuPermission')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
router.route('/menu').get(function(req, res) {
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
                    Menu.aggregate([{
                        "$sort": {
                            "sortnumber": 1
                        }
                    }, {
                        "$project": {
                            "id": "$_id",
                            "parent": 1,
                            "sortnumber": 1,
                            "menu": 1,
                            "value": 1,
                            "icon": 1,
                            "open": 1,
                            "moduleSource": 1,
                            "module_id": 1
                        }
                    }]).then(data => {
                        data.sort(predicateBy("sortnumber"))
                        let dataset = []
                        let arrayData = JSON.stringify(data)
                        dataset = JSON.parse(arrayData)
                        dataset.map(obj => {
                            obj['parent'] = ((obj['parent'] == null) ? "" : String(obj['parent']))
                        })
                        unflatten = function(array, parent, tree) {
                            tree = typeof tree !== 'undefined' ? tree : []
                            parent = typeof parent !== 'undefined' ? parent : {
                                id: ''
                            }
                            var children = _.filter(array, function(child) {
                                return child.parent == parent.id;
                            })
                            if (!_.isEmpty(children)) {
                                if (parent.id == '') {
                                    tree = children;
                                } else {
                                    parent['open'] = true
                                    parent['data'] = children
                                }
                                _.each(children, function(child) {
                                    unflatten(array, child)
                                })
                            }
                            return tree
                        }
                        tree = unflatten(dataset)
                        res.status(200).json(tree)
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
// Sidemenu
router.route('/sidemenu').get(function(req, res) {
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
                    let keyCache = `${tokenString.user.group_id}.sidemenu.eexbshkdtzgqx7`
                    redisClient.get(keyCache, function(err, sidemenuRedis) {
                        if (sidemenuRedis) {
                            res.send(JSON.parse(sidemenuRedis))
                        } else {
                            MenuPermission.aggregate([{
                                "$sort": {
                                    "sortnumber": 1
                                }
                            }, {
                                "$match": {
                                    "guid": mongoose.Types.ObjectId(tokenString.user.group_id)
                                }
                            }, {
                                $lookup: {
                                    from: 'menus',
                                    localField: 'menu_id',
                                    foreignField: '_id',
                                    as: 'menu_docs'
                                }
                            }, {
                                $replaceRoot: {
                                    newRoot: {
                                        $mergeObjects: [{
                                            $arrayElemAt: ["$menu_docs", 0]
                                        }, "$$ROOT"]
                                    }
                                }
                            }, {
                                "$project": {
                                    "id": "$_id",
                                    "menu_id": 1,
                                    "parent": 1,
                                    "sortnumber": 1,
                                    "menu": 1,
                                    "value": 1,
                                    "icon": 1,
                                    "details": 1,
                                    "open": 1
                                }
                            }]).then(data => {
                                data.sort(predicateBy("sortnumber"))
                                let dataset = []
                                let arrayData = JSON.stringify(data)
                                dataset = JSON.parse(arrayData)
                                dataset.map(obj => {
                                    obj['_id'] = obj['menu_id']
                                    obj['id'] = obj['menu']
                                    obj['icon'] = `mdi mdi-${obj['icon']}`
                                    obj['parent'] = ((obj['parent'] == null) ? "" : String(obj['parent']))
                                })
                                unflatten = function(array, parent, tree) {
                                    tree = typeof tree !== 'undefined' ? tree : []
                                    parent = typeof parent !== 'undefined' ? parent : {
                                        _id: ''
                                    }
                                    var children = _.filter(array, function(child) {
                                        return child.parent == parent._id;
                                    })
                                    if (!_.isEmpty(children)) {
                                        if (parent._id == '') {
                                            tree = children
                                        } else {
                                            parent['open'] = true
                                            parent['data'] = children
                                        }
                                        _.each(children, function(child) {
                                            unflatten(array, child)
                                        })
                                    }
                                    return tree
                                }
                                tree = unflatten(dataset)
                                redisClient.set(keyCache, JSON.stringify(tree), 'EX', 86400)
                                res.status(200).json(tree)
                            }).catch(err => {
                                res.status(500).json({
                                    'status': 0,
                                    'type': 'error',
                                    'message': 'Service Trouble'
                                })
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

function predicateBy(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1
        } else if (a[prop] < b[prop]) {
            return -1
        }
        return 0
    }
}
module.exports = router