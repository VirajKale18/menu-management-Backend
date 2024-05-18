const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        //Image link uploaded on cloudinary is saved as a string here 
        type:String,
    },
    description:{
        type:String,
        required:true
    },
    taxApplicable:{
        type:Boolean,
    },
    tax:{
        type:Number,
    },
    taxType:{
        type:String
    },
    subCategories:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'SubCategory'
        }
        
    ]
});

module.exports = mongoose.model('Category',categorySchema);