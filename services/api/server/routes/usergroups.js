const express = require('express'),
    jwt = require("jsonwebtoken"),
    bodyParser = require('body-parser');
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let UserGroup = require('../models/usergroup')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient(process.env.redisPort, process.env.redisHost)
router.route('/usergroups').get(function(req, res) {
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
                    let keyCache = `5f32058cb53fc4001193e35e.usergroups.${tokenString.user.group_id}`
                    redisClient.get(keyCache, function(err, UserGroupRedis) {
                        if (UserGroupRedis) {
                            res.send(JSON.parse(UserGroupRedis))
                        } else {
                            let where = {};
                            where["5f321b49b53fc4001193e386"] = [""];
                            where["5f321b64b53fc4001193e387"] = [""];
                            where["5f3611edd5495600116cfcce"] = [""];
                            UserGroup.aggregate([{
                                $sort: {
                                    _id: 1
                                }
                            }, {
                                $match: {
                                    'usergroup': {
                                        $in: where[tokenString.user.group_id]
                                    }
                                }
                            }, {
                                $project: {
                                    id: "$_id",
                                    usergroup: 1,
                                    color: 1,
                                    avatar: 1,
                                    createdAt: {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: "$createdAt"
                                        }
                                    },
                                    updatedAt: {
                                        $dateToString: {
                                            format: "%Y-%m-%d",
                                            date: "$updatedAt"
                                        }
                                    }
                                }
                            }]).then(data => {
                                redisClient.set(keyCache, JSON.stringify(data), 'EX', 86400)
                                res.status(200).json(data)
                            }).catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    'status': 0,
                                    'message': 'Service error',
                                    'type': 'error'
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
module.exports = router;