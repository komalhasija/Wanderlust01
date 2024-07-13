if(process.env.NODE_ENV !="production"){
    require("dotenv").config();
}


const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local").Strategy;
const user= require("./models/user.js");


const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect("mongodb://localhost:27017/wanderlust");
}

app.set("view engine","ejs");
 app.set("views", path.join(__dirname,"templates"));
 app.use(express.static(path.join(__dirname,"/public")));
 app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);


const sessionOption={
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
     expires:Date.now() +1000*60*60*24*7,
     MaxAge:1000*60*60*24*7,
     httponly:true
    },
};
// app.get("/",(req,res)=>{
//     res.send("Hi,i am root");
// });

app.use(session(sessionOption));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());

 passport.use("local",new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
    res.locals.Success=req.flash("success");
    res.locals.Error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);



app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"));
})

app.use((err,req,res,next)=>{
   let{statusCode=500,message="Something went wrong" }=err;
   res.status(statusCode).render("error.ejs",{err});

});

app.listen(process.env.PORT || 8080, () => {
    console.log("server is listening to port 8080");
});