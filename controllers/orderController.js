const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors/index');
const Order = require('../models/Order');
const Product = require('../models/Product');
const checkPermission = require('../utils/checkPermissions');

const fakeStripePayment = async ({amount,currency}) => {
    const clientSecret = 'randomValue';
    return {
        clientSecret,
        amount
    };
}

const createOrder = async (req,res) => {
    const {items:cartItems,tax,shippingFee} = req.body;
    if (!cartItems || cartItems.length < 1)
    {
        throw new BadRequestError("No items added");
    }
    if (!tax || !shippingFee)
    {
        throw new BadRequestError('Please provide tax and shipping fee');
    }

    let orderItems = [];
    let subtotal = 0;

    for (const item of cartItems)
    {
        const product = await Product.findOne({_id:item.product});
        if (!product){
            throw new NotFoundError(`No product with id:${item.product} exisits`);
        }

        const {name,price,image,_id:productId} = product;
        orderItems.push({name,price,image,amount:item.amount,product:productId});
        subtotal += (price*(item.amount));
    }
    const total = subtotal + tax + shippingFee;
    const paymentIntent = await fakeStripePayment(
        {
            amount:total,
            currency:'rupees'
        }
    );

    const order = await Order.create({tax,shippingFee,subtotal,total,orderItems,user:req.user.id,clientSecret:paymentIntent.clientSecret});
    res.status(StatusCodes.OK).json({order,clientSecret:paymentIntent.clientSecret});
};

const getAllOrders = async (req,res) => {
    const orders = await Order.find({});
    res.status(StatusCodes.OK).json({orders});
};

const getSingleOrder = async (req,res) => {
    const order = await Order.findOne({_id:req.params.id});
    if(!order)
    {
        throw new NotFoundError(`No order exisits with id : ${req.params.id}`);
    }
    checkPermission(req.user,order.user);
    res.status(StatusCodes.OK).json({order});
};


const updateOrder = async (req,res) => {
    const {paymentId} = req.body;
    const order = await Order.findOne({_id:req.params.id});
    if(!order)
    {
        throw new NotFoundError(`No order exisits with id : ${req.params.id}`);
    }
    checkPermission(req.user,order.user);
    order.paymentId = paymentId;
    order.status = 'Paid';
    await order.save();
    res.statuc(StatusCodes.OK).json({msg:'Update successfull'});
};

const getCurrentUserOrders = async (req,res) => {
    const userOrders = await Order.find({user:req.user.id});
    if (!userOrders)
    {
        throw new NotFoundError(`No orders present for the user with id: ${req.user.id}`);
    }
    res.status(StatusCodes.OK).json({orders:userOrders});
};

module.exports = {
    createOrder,
    updateOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders
}
