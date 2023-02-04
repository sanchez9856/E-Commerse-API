const {StatusCodes} = require('http-status-codes');
const Review = require('../models/Review');
const Product = require('../models/Product');
const {BadRequestError,NotFoundError,UnauthenticatedError} = require('../errors/index');

const createReview = async (req,res) => {
    const {product:productId} = req.body;

    // we need to check weather the product that is being sent, exisits or not
    const isProductFound = await Product.findOne({_id:productId});
    if (!isProductFound)
    {
        throw new NotFoundError("Product not found");
    }

    req.body.user = req.user.id;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({review});
}

const getAllReviews = async (req,res) => {
    const reviews = await Review.find({}).populate({path:'product',select:"name price company"});
    res.status(StatusCodes.OK).json({reviews:reviews,nbits:reviews.length});
}

const getSingleReview = async (req,res) => {

    // .populate method is used to display documents from related collection (i.e Review is related to Product using product)
    const review = await Review.findById(req.params.id).populate({path:'product',select:"name price company"});
    if (!review)
    {
        throw new NotFoundError("This Review doesn't exisits");
    }
    res.status(StatusCodes.OK).json({review:review});
}

const updateReview = async (req,res) => {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review)
    {
        throw new NotFoundError("Review not found");
    }

    // We need to check weather the person who is deleting is the person who created it.
    if (req.user.id.toString() !== review.user.toString()){
        throw new UnauthenticatedError("You dont have permission to update the review");
    }

    const {rating,title,comment} = req.body;
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    res.status(StatusCodes.OK).json({review});
}

const deleteReview = async (req,res) => {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);
    if (!review)
    {
        throw new NotFoundError("Review not found");
    }

    // We need to check weather the person who is deleting is the person who created it.
    if (req.user.id.toString() !== review.user.toString()){
        throw new UnauthenticatedError("You dont have permission to delete the review")
    }

    await review.remove();
    res.status(StatusCodes.OK).json({msg:"Review Deleted"});
}

const getSingleProductReview = async (req,res) => {
    const productId = req.params.id;
    const isProductValid = await Product.findById(productId);
    if (!isProductValid)
    {
        throw new NotFoundError("Product doesn't exisits");
    }
    const reviews = await Review.find({product:productId});
    res.status(StatusCodes.OK).json({productName:isProductValid.name,productReviews:reviews});
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReview,
}