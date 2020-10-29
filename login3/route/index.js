const express = require("express");
const bcrypt = require("bcryptjs");
const usermodule = require('../models/queries');
const jwt = require("jsonwebtoken");
const check_auth = require("../middleware/check-auth");
const routes = express.Router();

routes.post("/register",(req, res)=>{
    const {username, email, password } = req.body;
    if(!username) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter username'});
    if(!email) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter email'});
    if(!password) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter password'});

    usermodule.getUser(email).exec().then(user=>{
        if(user) return res.status(422).send({code : 422, status : 'failed', Message: 'user already exist...'});
        bcrypt.genSalt(10,(err,salt)=>{
            if(err) return res.json({error: err});
            bcrypt.hash(password,salt,(err,hashPass)=>{
                usermodule.addUser(username, email, hashPass).save().then(result=>{
                    res.status(200).json({message: "User registrate successfully"});
                }).catch(err=>{
                    res.status(500).json({error:err});
                });
                
            });
        });        
    }).catch(err =>{
        res.status(500).json({error:err});
    })    
});




routes.post("/login",(req,res)=>{
    const {email,password}= req.body;    
    if(!email) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter email'});
    if(!password) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter password'});

    usermodule.getUser(email).exec().then(user=>{
        if(!user) return res.status(401).send({code : 401, status : "failed",message:"user does not exist..."});
            bcrypt.compare(password,user.password).then(match=>{
                if(!match) return res.status(401).send({code : 401, status : "failed",message:"Password not match..."});
                if(match){
                    const token = jwt.sign(
                        {
                            email : user.email,
                            username : user.username,
                            id : user._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn : "1h"
                        }
                    );
                    res.status(200).json({
                        message:"User login successfully...",
                        token : token
                    });   
                }
            }).catch(err =>{
                res.status(500).json({error:err});
            });
    }).catch(err =>{
        res.status(500).json({error:err});
    });
});



routes.get("/dashboard",check_auth,(req,res,next)=>{
    res.status(200).json({
        message : "User authenticate Successfully",
        welcome : "welcome... "+req.userData.username
    });
});




module.exports = routes;