const mongoose = require('mongoose');

const SingleOrderSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    product:{
        type:mongoose.Schema.ObjectId,
        ref:'Products',
        required:true
    }
});

const OrderSchema = new mongoose.Schema({
    tax:{
        type:Number,
        required:true
    },
    shippingFee:{
        type:Number,
        required:true
    },
    subtotal : {
        type:Number,
        required:true
    },
    total : {
        type:Number,
        required:true
    },
    orderItems : [SingleOrderSchema],
    status:{
        type:String,
        enum:['Paid','Canceled','Failed','In-Transition','Pending'],
        default:'Pending',
        required:true,
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'Users',
        required:true
    },
    clientSecret : {
        type:String,
        required:true
    },
    paymentId : {
        type:String,
    },
},
{timestamps:true});

module.exports = mongoose.model('Orders',OrderSchema);