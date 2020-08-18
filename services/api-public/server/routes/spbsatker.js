const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb')
let router = express.Router()
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(bodyParser.json())
let spbsatker = require('../models/spbsatker')
// REDIS
let redis = require("redis")
let redisClient = redis.createClient('6479', '103.85.13.5')
router.route('/spbsatker').get(function(req, res) {
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
        if(tokenString){
			spbsatker.find({}).exec(function (err, data) {
				if(err) res.status(200).json({'status':0,'type':'error','message':err['errmsg']});
				res.send(data)
			});
			}else{
				res.json({'status':0,'message':'Token expired','type':'error'})
			}
    })
})
module.exports = router