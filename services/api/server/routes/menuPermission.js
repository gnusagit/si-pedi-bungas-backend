const express = require('express'),
    mongoose = require("mongoose"),
    async = require('async'),
        jwt = require("jsonwebtoken"),
        bodyParser = require('body-parser')
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let UserGroup = require('../models/usergroup')
let MenuPermission = require('../models/menuPermission')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
router.route('/menu_permission/:menuID').get(function(req, res) {
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
                    async.waterfall([
                        function(callback) {
                            UserGroup.find().exec(function(err, usergroups) {
                                if (err) return callback(err)
                                callback(null, usergroups)
                            });
                        },
                        function(usergroups, callback) {
                            let ugroups = []
                            async.each(usergroups, function(usergroup, next) {
                                MenuPermission.find({
                                    menu_id: mongoose.Types.ObjectId(req.params.menuID)
                                }).exec(function(err, ugroup) {
                                    let item = {}
                                    item.id = usergroup._id
                                    item.usergroup = usergroup.usergroup
                                    item.color = usergroup.color
                                    let groupPermission = []
                                    for (let i = 0; i < ugroup.length; i++) {
                                        groupPermission[ugroup[i].guid] = 1
                                    }
                                    item.markCheckbox = (groupPermission[usergroup._id]) ? groupPermission[usergroup._id] : 0
                                    ugroups.push(item)
                                    next(err)
                                });
                            }, function(err) {
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
                                ugroups.sort(predicateBy("id"));
                                callback(err, ugroups)
                            });
                        }
                    ], function(err, results) {
                        if (err) {
                            console.log(err)
                            res.status(500).json({
                                'status': 0,
                                'type': 'error',
                                'message': 'Service Trouble'
                            })
                            return false
                        }
                        res.status(200).json(results)
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
router.route('/menu_permission/:mode/:menuId/:guid').get(function(req, res) {
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
                    let modManage = req.params.mode
                    if (modManage == 'add') {
                        var newPermission = new MenuPermission({
                            menu_id: req.params.menuId,
                            guid: req.params.guid
                        });
                        MenuPermission.create(newPermission).then(data => {
                            res.status(200).json({
                                'result': 'success'
                            })
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({
                                'result': 'failed'
                            })
                        })
                    } else if (modManage == 'delete') {
                        MenuPermission.find({
                            menu_id: req.params.menuId,
                            guid: req.params.guid
                        }).deleteOne().then(data => {
                            res.status(200).json({
                                'result': 'success'
                            })
                        }).catch(err => {
                            console.log(err)
                            res.status(500).json({
                                'result': 'failed'
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
module.exports = router