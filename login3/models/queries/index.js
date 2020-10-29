const user = require("../schemas/user");

let usermodule = {}

usermodule.getUser = function (email) {
   return user.findOne({email:email});  
}

usermodule.addUser = function (username, email, hashPass){
   const userDetails = new user({
      username:username,
      email: email,
      password: hashPass
   });
   return userDetails;
}


module.exports = usermodule