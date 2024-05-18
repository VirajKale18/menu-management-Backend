const mongoose = require('mongoose');
const SubCategory = require('./subcategory_model')
//const Category = require('./category_model.js')
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        //Image link uploaded on cloudinary is saved as a string here
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    taxApplicable: {
        type: Boolean,
        default:null
    },
    tax: {
        type: Number,
        default:null
    },
    baseAmount: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
});

    //mongoose pre middleware to save the tax attributes if not provided, then save from it's subcategory
itemSchema.pre('save', async function (next) {
    if (this.taxApplicable === null || this.tax === null) {
        try {
            const subCategory = await SubCategory.findById(this.subCategory);
            if (!subCategory) {
                throw new Error('SubCategory not found');
            }

            if (this.taxApplicable === null) {
                this.taxApplicable = subCategory.taxApplicable;
            }
            if (this.tax === null) {
                this.tax = subCategory.tax;
            }
                //To calculate and save the total amount from the below formula
            //total amount = baseAmount - discount 
            this.totalAmount = this.baseAmount - this.discount;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        this.totalAmount = this.baseAmount - this.discount;
        next();
    }
});

module.exports = mongoose.model('Item', itemSchema);
