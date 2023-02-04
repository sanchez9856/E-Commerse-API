const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:[true,"Please provide a review rating"],
    },
    title:{
        type:String,
        trim:true,
        required:[true,"Please provide a review title"],
        maxlength:100,
    },
    comment:{
        type:String,
        required:[true,"Please provide a review comment"],
        maxlength:50,
    },
    // when refering always use first letter as capital letter
    user:{
        type:mongoose.Types.ObjectId,
        ref:'Users',
        required:true,
    },

    // when refering always use first letter as capital letter
    product:{
        type:mongoose.Types.ObjectId,
        ref:'Products',
        required:true,
    }
},
{timestamps:true}
);

// Here we need to implement a functionality so that a user can have only one review per product
// For that we implement compound index using the below code, so that a pair of user and product can be entered only once
ReviewSchema.index({product:1 , user:1},{unique:true});


// Very very important concept of Aggregation Pipeline
// Static method - This method is present at the schema level not document level as instance method
ReviewSchema.statics.calculateProductProp = async function (productId) {
    const result = await this.aggregate([
        {
            $match : {
                'product':productId
            }
        },
        {
            $group : {
                _id:null,
                averageRating : {$avg : '$rating'},
                numOfReviews : {$sum:1},
            },
        },
    ]);
    try {
        await this.model('Products').findOneAndUpdate({
            _id:productId
        },
        {
            averageRating:Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.numOfReviews || 0,
        })
    } catch (error) {
        console.log(error);
    }
}

// Post hooks for save and review
ReviewSchema.post('save',async function() {
    await this.constructor.calculateProductProp(this.product);
    console.log('Post save');
})

ReviewSchema.post('remove', async function() {
    await this.constructor.calculateProductProp(this.product);
    console.log('Post remove');
})

module.exports = mongoose.model('Review',ReviewSchema);