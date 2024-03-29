const mongoose = require('mongoose')
const bcrypt=require('bcryptjs')
const validator = require('validator')
const jwt=require('jsonwebtoken')
const  userSchema =new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
   email:{
        type:String,
        required:true,
        trim:true,
        unique:[true,"Email address is already taken."],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is not valid")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:[6,"Password must be minimum 6 characters"]
    },
    role:{
        type:String,
        default:"basic"
    },
    tokens:[{
        token:{
            type:String,
            required:true,
            trim:true
            },
    },
],
});
userSchema.virtual("notices",{
    ref:"Notice",
    localField:"_id",
    foreignField:"author",
});
userSchema.method.toJSON=function(){
    const user=this;
    const userObject=user.toObject();
    delete userObject.password;
    delete userObject.token;
    return userObject;
};
userSchema.methods.generateAuthToken=async function(){

    const user=this;
    const token=jwt.sign({_id:user._id},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token});
    await user.save();
    return token;
};
userSchema.statics.findByCredentials = async (email,password)=>{
    const user=await User.findOne({email});
    if(!user){
        throw new Error("User doesnot exist");
    }
    const isMatch= await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error("Username and password doesnot match");
    }
    return user;
};
userSchema.pre("save",async function(next){
    const user=this;
    if(user.isModified("password")){
        user.password=await bcrypt.hash(user.password,8);
    }
    next();
});
const User=mongoose.model("User",userSchema);
module.exports=User;

