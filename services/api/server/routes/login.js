const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const minio = require('minio')
const _ = require('lodash')
const jwt = require("jsonwebtoken")
// Models
const User = require('../models/spbuser')
const Usergroup = require('../models/usergroup')
const Menu = require('../models/menu')
const MenuPermission = require('../models/menuPermission')
const MenuPermissionAct = require('../models/menuPermissionAct')
const ModulesApp = require('../models/modulesapp')
// Function
const auditTrail = require('../function/audit')
// REDIS
const redis = require("redis")
const redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
// Generate Token
const uniqid = require('uniqid')
// Minio
const minioClient = new minio.Client({
    endPoint: process.env.minioEnpoint, // Server IP or Domain Name
    port: parseInt(process.env.minioPort),
    useSSL: process.env.minioSSL == true, // Default false
    accessKey: process.env.minioaccessKey,
    secretKey: process.env.miniosecretKey
})
// Async foreach Object
async function asyncForEachObject(object, callback) {
    Object.entries(object).forEach(async ([key, value]) => {
        await callback(key, value);
    })
}
// Async foreach array
async function asyncForEachArray(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
// Creating bucket init
async function setupBucketFunc(array, callback) {
    await asyncForEachObject(array, async (key, value) => {
        let bucketName = key
        await minioClient.makeBucket(bucketName, async function(err, etag) {
            if (err) {
                console.log('Error creating bucket.', err)
                throw err
            }
            console.log(`Bucket : ${bucketName}`)
            await asyncForEachArray(value['path'], async (pth) => {
                let subBucket = pth['document']
                // Set Bucket Policy
                let policy = {
                    "version": '2012-10-17',
                    "Statement": [{
                        "Effect": "Allow",
                        "Principal": {
                            "AWS": ["*"]
                        },
                        "Action": ["s3:GetBucketLocation", "s3:ListBucketMultipartUploads"],
                        "Resource": [`arn:aws:s3:::${bucketName}`]
                    }, {
                        "Effect": "Allow",
                        "Principal": {
                            "AWS": ["*"]
                        },
                        "Action": ["s3:ListBucket"],
                        "Resource": [`arn:aws:s3:::${bucketName}`],
                        "Condition": {
                            "StringEquals": {
                                "s3:prefix": [`${subBucket}*`]
                            }
                        }
                    }, {
                        "Effect": "Allow",
                        "Principal": {
                            "AWS": ["*"]
                        },
                        "Action": ["s3:AbortMultipartUpload", "s3:DeleteObject", "s3:GetObject", "s3:ListMultipartUploadParts", "s3:PutObject"],
                        "Resource": [`arn:aws:s3:::${bucketName}/${subBucket}**`]
                    }]
                }
                await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy), async function(err) {
                    if (err) throw err
                    console.log(`Path : ${subBucket}`)
                })
            })
        })
    })
    console.log('all bucket created')
    await callback(array)
}
// Permission Act (Button and toolbar)
async function permissionAct(group_id, callback) {
    MenuPermissionAct.aggregate([{
        $sort: {
            '_id': 1
        }
    }, {
        $match: {
            'guid': mongoose.Types.ObjectId(group_id)
        }
    }, {
        $lookup: {
            from: 'modulesapp',
            localField: 'controller_name',
            foreignField: '_id',
            as: 'controllerData'
        }
    }, {
        $project: {
            id: "$_id",
            label: 1,
            controller_name: 1,
            menu_id: 1,
            guid: 1,
            controllerData: 1
        }
    }]).then(async (data) => {
        let dataTrue = []
        data.forEach(item => {
            if(item['controllerData'].length!=0){
                dataTrue.push({
                    'controller_name': item['controllerData'][0]['controller_name'].toLowerCase(),
                    'label': item['label']
                })
            }
        })
        let result = _(dataTrue).groupBy('controller_name').map((v, controller_name) => ({
            controller_name,
            label: _.map(v, 'label')
        })).value();
        let perms = {}
        result.forEach(item => {
            perms[item['controller_name']] = {
                'addBtn': 0,
                'edit': 0,
                'delete': 0,
                'importBtn': 0,
                'exportBtn': 0,
                'printdoc': 0,
                'dragndrop': 0,
                'doubleclick': 0,
            }
            item['label'].forEach(label => {
                perms[item['controller_name']][label] = 1
            })
        })
        await callback(perms)
    })
}
router.post('/auth/login', (req, res) => {
    jwt.verify(req['headers']['token'], process.env.secretKey, function(err, decoded) {
        if (err) {
            res.status(500).json(err)
            return false
        }
        fs.stat(path.resolve(__dirname, '../../db_files/data.json'), function(err, stats) {
            if (err && err.errno === -2) {
                User.find({
                    idAkses: decoded.user
                }).then(users => {
                    if (users.length == 0) {
                        res.status(400).json({
                            'message': 'account not found'
                        })
                    } else {
                        bcrypt.compare(decoded.pass, users[0].password, function(err, result) {
                            if (err) {
                                console.log('error bro');
                                console.log(err);
                                res.status(500).json(err)
                            }

                            if (result === true) {
                                auditTrail.generate(users[0]._id, 'oauth', 'Login', '', {
                                    'username': users[0]['idAkses'],
                                    'group': users[0]['group_id']
                                })
                                let secretKey = jwt.sign({
                                    'user': users[0]['idAkses'],
                                    'password': users[0]['password']
                                }, process.env.secretKey2, {
                                    algorithm: 'HS256'
                                })
                                MenuPermission.find({
                                    'guid': mongoose.Types.ObjectId(users[0].group_id)
                                }).then(async (dataMenu) => {
                                    let menuArrObj = {}
                                    dataMenu.forEach(item => {
                                        menuArrObj[item.menu_id] = 1
                                    })
                                    await permissionAct(users[0].group_id, async (pth) => {
                                        redisClient.set(secretKey, JSON.stringify({
                                            'user': users[0],
                                            'permission': menuArrObj,
                                            'permissionAct': pth
                                        }), 'EX', 86400)
                                        redisClient.set(`Password.${secretKey}`, JSON.stringify({
                                            '_id': users[0]['_id'],
                                            'password': users[0]['password'],
                                            'pswd': users[0]['pswd']
                                        }), 'EX', 86400)
                                        res.status(200).json({
                                            'token': secretKey
                                        })
                                    })
                                }).catch(err => {
                                    console.log(err)
                                    res.status(500).json(err)
                                })
                            } else {
                                res.status(400).json({
                                    'message': 'passwrod invalid'
                                })
                            }
                        })
                    }
                }).catch(err => {
                    res.status(500).json(err)
                })
            } else {
                fs.readFile(path.resolve(__dirname, '../../db_files/data.json'), 'utf8', function(err, data) {
                    data = JSON.parse(data)
                    Menu.insertMany(data.menu, function(err, sm) {
                        if (err) return console.log(err)
                        Usergroup.insertMany(data.group, function(err, su) {
                            if (err) return console.log(err)
                            MenuPermission.insertMany(data.menu_permission, function(err, smp) {
                                if (err) return console.log(err)
                                ModulesApp.insertMany(data.module_arr, function(err, mr) {
                                    if (err) return console.log(err)
                                    MenuPermissionAct.insertMany(data.menu_permission_act, function(err, menpact) {
                                        if (err) return console.log(err)
                                        let userReg = {}
                                        userReg.idAkses = decoded.user
                                        userReg.password = bcrypt.hashSync(decoded.pass, 10)
                                        userReg.pswd = decoded.pass
                                        userReg.group_id = data.group[0]._id
                                        userReg.usergroup = data.group[0].usergroup
                                        User.create(userReg, function(err, usr) {
                                            fs.unlink(path.resolve(__dirname, '../../db_files/data.json'), function(err, slink) {
                                                User.findOne({
                                                    idAkses: decoded.user
                                                }, function(err, user) {
                                                    fs.access(path.resolve(__dirname, '../../db_files/packageschema.json'), fs.constants.F_OK, (err) => {
                                                        if (!err) {
                                                            fs.readFile(path.resolve(__dirname, '../../db_files/packageschema.json'), 'utf8', function(err, data) {
                                                                redisClient.set('5f32058cb53fc4001193e35e', data)
                                                                fs.unlinkSync(path.resolve(__dirname, '../../db_files/packageschema.json'))
                                                            })
                                                        }
                                                    })
                                                    auditTrail.generate(user._id, 'oauth', 'Login', '', {
                                                        'username': user['idAkses']
                                                    })
                                                    let secretKey = jwt.sign({
                                                        'user': user['idAkses'],
                                                        'password': user['password']
                                                    }, process.env.secretKey2, {
                                                        algorithm: 'HS256'
                                                    })
                                                    MenuPermission.find({
                                                        'guid': mongoose.Types.ObjectId(user.group_id)
                                                    }).then(async (dataMenu) => {
                                                        let menuArrObj = {}
                                                        dataMenu.forEach(item => {
                                                            menuArrObj[item.menu_id] = 1
                                                        })
                                                        await permissionAct(user.group_id, async (permAct) => {
                                                            redisClient.set(secretKey, JSON.stringify({
                                                                'user': user,
                                                                'permission': menuArrObj,
                                                                'permissionAct': permAct
                                                            }), 'EX', 86400)
                                                            redisClient.set(`Password.${secretKey}`, JSON.stringify({
                                                                '_id': user['_id'],
                                                                'password': user['password'],
                                                                'pswd': user['pswd']
                                                            }), 'EX', 86400)
                                                            fs.readFile(path.resolve(__dirname, '../../db_files/bucketname.json'), 'utf8', async function(err, data) {
                                                                data = JSON.parse(data)
                                                                await setupBucketFunc(data, async (pth) => {
                                                                    res.status(200).json({
                                                                        'token': secretKey
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    }).catch(err => {
                                                        console.log(err)
                                                        res.status(500).json(err)
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            }
        })
    })
})
router.post('/auth/status', (req, res) => {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json(err)
            return false
        }
        redisClient.get(req['headers']['token-id'], function(err, value) {
            if (err) {
                res.status(500).json(err)
            } else {
                res.status(200).json(JSON.parse(value) || null)
            }
        })
    })
})
router.get("/auth/getuser", (req, res) => {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json(err)
            return false
        }
        redisClient.get(req['headers']['token-id'], function(err, value) {
            if (err) {
                res.status(500).json(err)
            } else {
                res.status(200).json(JSON.parse(value) || null)
            }
        })
    })
})
router.put("/auth/changepass", (req, res) => {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json(err)
            return false
        }
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
                bcrypt.compare(req.body.oldpass, tokenString.user.password, function(err, oldhash) {
                    if (oldhash === true) {
                        let newpassEncrypt = bcrypt.hashSync(req.body.newpass, 10)
                        req.body.pswd = req.body.newpass
                        req.body.password = newpassEncrypt
                        User.findByIdAndUpdate(tokenString._id, req.body).then(data => {
                            redisClient.set(`Password.${req['headers']['token-id']}`, JSON.stringify({
                                '_id': tokenString._id,
                                'password': newpassEncrypt,
                                'pswd': req.body.newpass
                            }), 'EX', 86400)
                            res.status(200).json({
                                'status': 1,
                                'message': 'Password has change',
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
                            'type': 'error',
                            'message': 'Old password is wrong'
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
    })
})
router.post('/auth/logout', (req, res) => {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json(err)
            return false
        }
        redisClient.del(req['headers']['token-id'], function(err, reply) {
            if (err) {
                res.status(500).json(err)
            }
            if (reply === 1) {
                console.log("Key user is deleted")
                redisClient.del(`Password.${req['headers']['token-id']}`, function(err, replyPassword) {
                    if (err) {
                        res.status(500).json(err)
                    }
                    console.log("Key password is deleted")
                    if (replyPassword === 1) {
                        res.status(200).json({
                            'message': "you're logout"
                        })
                    }
                })
            } else {
                console.log("Doesn't exists")
                res.status(400).json({
                    'status': 0,
                    'message': "Token doesn't exist",
                    'type': 'error'
                })
            }
        })
    })
})
router.post('/auth/rolemenu', (req, res) => {
    jwt.verify(req['headers']['token-id'], process.env.secretKey2, function(err, decoded) {
        if (err) {
            res.status(500).json(err)
            return false
        }
        redisClient.get(req['headers']['token-id'], function(err, value) {
            let tokenString = JSON.parse(value)
            if (tokenString) {
                let keyRole = JSON.parse(value)['permission']
                res.status(200).json({
                    'status': 'success',
                    'msg': keyRole[req.body.menucode] == undefined ? 0 : keyRole[req.body.menucode]
                })
            } else {
                res.status(500).json({
                    'status': 0,
                    'msg': 'Token expired',
                    'type': 'error'
                })
            }
        })
    })
})
module.exports = router