const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const userSchema=new Schema({
email:{
    type:String,
    required:true
}
});
userSchema.methods.verifyPassword = function(password) {
    return password === this.password;
  };
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);
