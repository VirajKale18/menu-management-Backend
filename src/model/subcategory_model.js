const mongoose = require('mongoose');
const Category = require('./category_model');
const subcategorySchema = new mongoose.Schema({
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
        default: null
    },
    tax: {
        type: Number,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
    }]

});

  //mongoose pre middleware to save the tax attributes if not provided, then save from it's category
subcategorySchema.pre('save', async function(next) {
    if (this.taxApplicable === null || this.tax === null) {
        try {
            const category = await Category.findById(this.category);
            if (!category) {
                throw new Error('Category not found');
            }
            if (this.taxApplicable === null) {
                this.taxApplicable = category.taxApplicable;
            }
            if (this.tax === null) {
                this.tax = category.tax;
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('SubCategory',subcategorySchema);