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
let ModulesApp = require('../models/modulesapp')
let MenuPermissionAct = require('../models/menuPermissionAct')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
router.route('/menu_permission_act/module/:moduleId').get(function(req, res) {
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
                    ModulesApp.aggregate([{
                        $sort: {
                            '_id': 1
                        }
                    }, {
                        $match: {
                            'module_id': mongoose.Types.ObjectId(req.params.moduleId)
                        }
                    }, {
                        $project: {
                            id: "$_id",
                            module_id: 1,
                            parent: 1,
                            controller_name: 1,
                            grid_type: 1,
                            label: 1,
                            addBtn: 1,
                            editBtn: 1,
                            deleteBtn: 1,
                            importBtn: 1,
                            printBtn: 1,
                            exportBtn: 1,
                        }
                    }]).then(data => {
                        let dataset = []
                        let arrayData = JSON.stringify(data)
                        dataset = JSON.parse(arrayData)
                        dataset.map(obj => {
                            obj['parent'] = ((obj['parent'] == null) ? "" : String(obj['parent']))
                        })
                        res.status(200).json(dataset)
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
router.route('/menu_permission_act/:menuID/:guid').get(function(req, res) {
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
                            let labelParams = []
                            ModulesApp.find({
                                '_id': mongoose.Types.ObjectId(req.query.id)
                            }).then(data => {
                                if (data[0]['addBtn'] == 1) {
                                    labelParams.push({
                                        'id': 'addBtn',
                                        'value': 'Create',
                                        'urut': '1',
                                        'color': '#f8b195'
                                    })
                                }
                                if (data[0]['editBtn'] == 1) {
                                    labelParams.push({
                                        'id': 'edit',
                                        'value': 'Update',
                                        'urut': '2',
                                        'color': '#f67280'
                                    })
                                }
                                if (data[0]['deleteBtn'] == 1) {
                                    labelParams.push({
                                        'id': 'delete',
                                        'value': 'Delete',
                                        'urut': '3',
                                        'color': '#c06c84'
                                    })
                                }
                                if (data[0]['importBtn'] == 1) {
                                    labelParams.push({
                                        'id': 'importBtn',
                                        'value': 'Import',
                                        'urut': '4',
                                        'color': '#6c567b'
                                    })
                                }
                                if (data[0]['exportBtn'] == 1) {
                                    labelParams.push({
                                        'id': 'exportBtn',
                                        'value': 'Export',
                                        'urut': '5',
                                        'color': '#b0a160'
                                    })
                                }
                                if (data[0]['printBtn'] == 1) {
                                    labelParams.push({
                                        'id': 'printdoc',
                                        'value': 'Print to Doc',
                                        'urut': '6',
                                        'color': '#f64b3c'
                                    })
                                }
                                if (data[0]['grid_type'] != 'datatable') {
                                    labelParams.push({
                                        'id': 'dragndrop',
                                        'value': 'Drag n Drop',
                                        'urut': '7',
                                        'color': '#678a74'
                                    }, {
                                        'id': 'doubleclick',
                                        'value': 'Double Click',
                                        'urut': '7',
                                        'color': '#30475e'
                                    })
                                }
                                callback(null, labelParams)
                            })
                        },
                        function(labelParams, callback) {
                            let ulabels = []
                            async.each(labelParams, function(label, next) {
                                MenuPermissionAct.find({
                                    menu_id: mongoose.Types.ObjectId(req.params.menuID),
                                    guid: mongoose.Types.ObjectId(req.params.guid),
                                    controller_name: mongoose.Types.ObjectId(req.query.id)
                                }).exec(function(err, ulabel) {
                                    let item = {}
                                    item.urut = label['urut']
                                    item.id = label['id']
                                    item.label = label['value']
                                    item.color = label['color']
                                    let groupLabel = []
                                    for (let i = 0; i < ulabel.length; i++) {
                                        groupLabel[ulabel[i].label] = 1
                                    }
                                    item.markCheckbox = (groupLabel[label['id']]) ? groupLabel[label['id']] : 0
                                    ulabels.push(item)
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
                                ulabels.sort(predicateBy("urut"));
                                callback(err, ulabels)
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
router.route('/menu_permission_act/:mode/:menuId/:guid/:label').get(function(req, res) {
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
                        var newPermission = new MenuPermissionAct({
                            label: req.params.label,
                            controller_name: req.query.controllerName,
                            menu_id: req.params.menuId,
                            guid: req.params.guid
                        });
                        MenuPermissionAct.create(newPermission).then(data => {
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
                        MenuPermissionAct.find({
                            menu_id: req.params.menuId,
                            guid: req.params.guid,
                            label: req.params.label,
                            controller_name: req.query.controllerName
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