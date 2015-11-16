/**
 * MainController
 *
 * @description :: Server-side logic for managing mains
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    /**
     * `MainController.show_code()`
     */
    show_code: function(req, res) {
        var code = Math.floor(Math.random() * (9999 - 1111) + 1111);
        var player = req.params.player;
        User.create({
            code: code,
            player_cnt: 1
        }).exec(function createCB(err, created) {
            console.log('Created user with code ' + created.code);
        });
        res.view('code_player', {
            code: code,
            player: player
        });
    },
    activate: function(req, res) { //for web 
        if (req.isSocket) { //if socket then web join
            sails.sockets.join(req.socket, req.params.code); //create the room
            res.json({
                message: 'Subscribed to a fun room code = ' + req.params.code + '!'
            });
        } else {
            res.json({
                msg: "Please use via websocket!"
            });
        }
    },
    validate: function(req, res) { //for android
        var subscribers = sails.sockets.subscribers(req.params.code);
        if (subscribers.length) { // if there is a subscriber in the room
            User.findOne({code: req.params.code}).exec(function findOneCB(err, found) {
                console.log('you are ' + found.player_cnt + 'player');
                User.update({code: req.params.code}, {
                    player_cnt: found.player_cnt + 1
                }).exec(function afterwards(err, updated) {
                    console.log('Updated');
                });
                sails.sockets.emit( // send a messags to the subscriber
                    subscribers, 'message', {
                        msg: 'player joined',
                        player_cnt: found.player_cnt
                    });
                res.json({
                    player: found.player_cnt,
                    success: true,
                    code: req.params.code
                });
            });
        } else {
            res.json({
                success: false,
                code: req.params.code
            });
        }
    },
    game_main: function(req, res) {
        res.view('game_main', {
            code: req.params.code,
            choose_1p: req.params.choose_1p,
            choose_2p: req.params.choose_2p
        });
    },
    run: function(req, res) {
    	//socket will disconnect when change page,then you need to reconnect
        var subscribers = sails.sockets.subscribers(req.params.code);
        if (subscribers.length) { // if there is a subscriber in the room
                sails.sockets.emit( // send a messags to the subscriber
                    subscribers, 'run', {
                        code: req.params.code,
                        p: req.params.p,
                        step: req.params.step
                    });
                res.json({
                    success: true,
                    code: req.params.code,
                    p: req.params.p,
                    step: req.params.step
                });
        } 
        else {
            res.json({
                success: false,
                code: req.params.code
            });
        }
    },
    choose: function(req, res){

    	//socket will disconnect when change page,then you need to reconnect
    	var subscribers = sails.sockets.subscribers(req.params.code);
        if (subscribers.length) { // if there is a subscriber in the room
                sails.sockets.emit( // send a messags to the subscriber
                    subscribers, 'choose', {
                        code: req.params.code,
                        p: req.params.p,
                        choose: req.params.choose,
                        submit:req.params.submit
                    });
                res.json({
                    success: true,
                    code: req.params.code,
                    p: req.params.p,
                    choose: req.params.choose,
                    submit:req.params.submit
                });
        } 
        else {
            res.json({
                success: false,
                code: req.params.code
            });
        }
    },
    character: function(req, res){
    	res.view('character', {
    	    code: req.params.code,
    	    player: req.params.player
    	});

    }
};