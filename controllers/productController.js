const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors/index');
const path = require('path');
const { findById } = require('../models/Review');


const createProduct = async (req,res) => {
    const userId = req.user.id;
    req.body.user = userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({product});
}

const getAllProducts = async (req,res) => {
    const products = await Product.find({}).select('name price description image category company freeShipping averageRating numOfReviews')
    res.status(StatusCodes.OK).json({products});
}

const getSingleProduct = async (req,res) => {
    const productId = req.params.id;
    let product = Product.findById(productId).populate('reviews');
    if (!product)
    {
        throw new BadRequestError("This product is not found");
    }
    product = await product.select('name price description image category company freeShipping averageRating numOfReviews');
    res.status(StatusCodes.OK).json({product});
}

const updateProduct = async (req,res) => {
    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    if (!product)
    {
        throw new BadRequestError("This product is not found");
    }
    res.status(StatusCodes.OK).json({product});
}

const deleteProduct = async (req,res) => {
    const product = await Product.findById(req.params.id);
    if (!product)
    {
        throw new NotFoundError("Product is not available");
    }

    await product.remove();
    res.status(StatusCodes.OK).send("Product successfully deleted");
}

const uploadImage = async (req,res) => {
    if (!req.files)
    {
        throw new BadRequestError("No image uploaded");
    }
    const image = req.files.image;
    if (!image.mimetype.startsWith('image'))
    {
        throw new BadRequestError('Please upload an image');
    }

    const imgPath = path.join(__dirname,`../public/uploads/${image.name}`);
    await image.mv(imgPath);
    res.status(StatusCodes.OK).json({image:{src:`/uploads/${image.name}`}});
}

module.exports = {
    createProduct, 
    getAllProducts,
    getSingleProduct, 
    updateProduct, 
    deleteProduct, 
    uploadImage
};