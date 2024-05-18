const fs  = require('fs');
const Category = require('../model/category_model');
const asyncHandler = require('express-async-handler');
const {ApiError} = require('../utils/apiError.js');
const { uploadOnCloudinary } = require('../utils/cloudinary');

const createCategory = asyncHandler(async(req,res)=>{
    try {   
            // get all the necesarry attributes from the user via req.body 
        const { name, description, taxApplicable, tax, taxType } = req.body;
            //get the filepath
        const imageLocalpath = req.file.path;
        //if category already exists throw error
        const oldCategory = await Category.findOne({ name: req.body.name })
            if(oldCategory){
                throw new ApiError(400,"Category already exists");    
            }
        //  console.log("filePath :- ",req.file.path)
            //if not iamgepath then throw error
         if(!imageLocalpath){
            throw new ApiError(400,"Image is required to create the category");
         }  
         //upload the file on cloudinary
         const image = await uploadOnCloudinary(imageLocalpath);
         //if not uploaded throw error
         if(!image){
            throw new ApiError(400,"Image is required to create the category");
         }
            //if uploaded create a new category and save in the Database
         const category = new Category({
            name,
            image: image.url,
            description,
            taxApplicable,
            tax,
            taxType
        });

        await category.save()
        //after saving the image url on cloudinary delete the file from local server
        fs.unlink(imageLocalpath, (err) => {
            if (err) {
                console.error('Failed to delete local image:', err);
            } else {
                console.log('Successfully deleted local image:', imageLocalpath);
            }
        });

        //if everything ok then send response.
        res.status(200)
        .json({message:"Category created Successfully !",category});
    } catch (error) {
        console.error('Error creating Category:', error); // Debugging log
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    try {
        const { categoryId, name, description, taxApplicable, tax, taxType } = req.body;

        // Find the category by ID
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        // Update the category attributes
        if (name) category.name = name;
        if (description) category.description = description;
        if (taxApplicable !== undefined) category.taxApplicable = taxApplicable;
        if (tax !== undefined) category.tax = tax;
        if (taxType) category.taxType = taxType;

        // If a new image is provided, upload it to Cloudinary
        if (req.file) {
            const imageLocalpath = req.file.path;
            const image = await uploadOnCloudinary(imageLocalpath);
            if (!image) {
                throw new ApiError(400, "Failed to upload image to Cloudinary");
            }

            // Update the image URL
            category.image = image.url;

            // Remove the file from local storage
            fs.unlink(imageLocalpath, (err) => {
                if (err) {
                    console.error('Failed to delete local image:', err);
                } else {
                    console.log('Successfully deleted local image:', imageLocalpath);
                }
            });
        }

        // Save the updated category
        await category.save();

        // Send the response with the updated category
        res.status(200).json({ message: "Category updated successfully!", category });
    } catch (error) {
        console.error('Error updating category:', error); // Debugging log
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error getting all categories:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getCategory = asyncHandler(async (req, res) => {
    try {
        const { id, name } = req.query;

        let category;
        if (id) {
            category = await Category.findById(id).populate('subCategories', 'name');
        } else if (name) {
            category = await Category.findOne({ name }).populate('subCategories', 'name');
        } else {
            throw new ApiError(400, "Id or name to get the category is required");
        }

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        res.status(200).json(category);
    } catch (error) {
        console.error('Error getting category:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});



module.exports = {
    createCategory,
    getAllCategories,
    getCategory,
    updateCategory
};