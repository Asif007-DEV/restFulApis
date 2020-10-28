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

    let user = usermodule.getUser(email);
    user.exec((err,data)=>{
        if(err) return res.json({error: err});
        if(data){
            res.json({
                message:"user exist..."
            })
        }else{
            bcrypt.genSalt(10,(err,salt)=>{
                if(err) return res.json({error: err});
                bcrypt.hash(password,salt,(err,hashPass)=>{
                    const result = usermodule.addUser(username, email, hashPass);
                    result.save((err,data)=>{
                        if(err) return res.json({error: err});
                        res.status(200).json({
                            message : "User register successfully",
                            user : data   
                        });
                    })
                });
            });
        }  
    })    
});


routes.post("/login",(req,res)=>{
    const {email,password}= req.body;
    
    if(!email) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter email'});
    if(!password) return res.status(422).send({ code : 422, status : 'failed', message : 'Please enter password'});

    let user = usermodule.getUser(email);
    user.exec((err,data)=>{
        if(err) return res.json({error: err});
        if(!data){
            res.status(401).send({code : 401, ststus : "failed",message:"user does not exist..."});
        }else{
            bcrypt.compare(password,data.password,(err,match)=>{
                if(err) return res.json({error: err});
                if(!match){
                    res.status(401).send({code : 401, ststus : "failed",message:"Password dose not match..."});
                }else{
                    const token = jwt.sign(
                        {
                            email : data.email,
                            username : data.username,
                            id : data._id
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
            });
        }
    });
});

routes.get("/dashboard",check_auth,(req,res,next)=>{
    res.status(200).json({
        message : "User authinticate Successfully",
        welcome : "welcome... "+req.userData.username
    });
});




module.exports = routes;