const SubCategory = require('../model/subcategory_model.js');
const Category = require('../model/category_model.js');
const asyncHandler = require('express-async-handler');
const { ApiError } = require('../utils/apiError.js');
const { uploadOnCloudinary } = require('../utils/cloudinary.js');
const fs = require('fs');

const createSubCategory = asyncHandler(async (req, res) => {
    try {
        // getting required attributes from the req.body
        const { name, description, categoryName } = req.body;

        //if subcategory already exists throw error
        const oldCategory = await SubCategory.findOne({ name: req.body.name })
        if (oldCategory) {
            throw new ApiError(400, "SubCategory already exists");
        }
        // if categoryName is not provided then throwing error
        if (!categoryName) {
            throw new ApiError(400, "Category name is required to create a subcategory");
        }

        // Find the category by name to get its ._id
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        // Get the file path from multer
        const imageLocalpath = req.file.path;

        // Ensure image is provided
        if (!imageLocalpath) {
            throw new ApiError(400, "Image is required to create the subcategory");
        }

        // Upload the file to Cloudinary
        const image = await uploadOnCloudinary(imageLocalpath);

        // If not uploaded, throw error
        if (!image) {
            throw new ApiError(400, "Failed to upload image to Cloudinary");
        }

        // Create a new subcategory and save it in the Database
        const subCategory = new SubCategory({
            name,
            image: image.url,
            description,
            category: category._id,
            taxApplicable: req.body.taxApplicable !== undefined ? req.body.taxApplicable : category.taxApplicable,
            tax: req.body.tax !== undefined ? req.body.tax : category.tax
        });

        await subCategory.save();

        // Update the particular category document with the new subcategory
        category.subCategories.push(subCategory._id);
        await category.save();

        // Remove the file from local storage
        fs.unlink(imageLocalpath, (err) => {
            if (err) {
                console.error('Failed to delete local image:', err);
            } else {
                console.log('Successfully deleted local image:', imageLocalpath);
            }
        });

        // If everything is ok, send response
        res.status(200).json({ message: "SubCategory created Successfully!", subCategory });
    } catch (error) {
        console.error('Error creating subcategory:', error); // Debugging log
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getAllSubCategories = asyncHandler(async (req, res) => {
    try {
        //find all the subcategories
        const subCategories = await SubCategory.find();
        //return all the subcategories in response
        res.status(200).json(subCategories);
    } catch (error) {
        console.error('Error fetching all subcategories:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getSubCategoriesByCategory = asyncHandler(async (req, res) => {
    try {   
        const { categoryId, categoryName } = req.query;

        let category;
        if (categoryId) {
            category = await Category.findById(categoryId);
        } else if (categoryName) {
            category = await Category.findOne({ name: categoryName });
        } else {
            throw new ApiError(400, "Category ID or name is required");
        }

        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        const subCategories = await SubCategory.find({ category: category._id });
        res.status(200).json(subCategories);
    } catch (error) {
        console.error('Error fetching subcategories by category:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getSubCategory = asyncHandler(async (req, res) => {
    try {   
        //finding the subcategory by id or name
        const { id, name } = req.query;

        let subCategory;
        if (id) {
            subCategory = await SubCategory.findById(id).populate('category', 'name');
        } else if (name) {
            subCategory = await SubCategory.findOne({ name }).populate('category', 'name');
        } else {
            throw new ApiError(400, "Sub-category ID or name is required");
        }

        if (!subCategory) {
            throw new ApiError(404, "Sub-category not found");
        }

        res.status(200).json(subCategory);
    } catch (error) {
        console.error('Error fetching subcategory by ID or name:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const updateSubCategory = asyncHandler(async (req, res) => {
    try {
        const { subCategoryName, name, description, categoryName, taxApplicable, tax } = req.body;

        // Find the subcategory by ID
        const subCategory = await SubCategory.findOne({name:subCategoryName});
        console.log(subCategory)
        if (!subCategory) {
            throw new ApiError(404, "SubCategory not found");
        }

        // Update the subcategory attributes
        if (name) subCategory.name = name;
        if (description) subCategory.description = description;
        if (taxApplicable !== undefined) subCategory.taxApplicable = taxApplicable;
        if (tax !== undefined) subCategory.tax = tax;

        // If a new image is provided, upload it to Cloudinary
        if (req.file) {
            const imageLocalpath = req.file.path;
            const image = await uploadOnCloudinary(imageLocalpath);
            if (!image) {
                throw new ApiError(400, "Failed to upload image to Cloudinary");
            }

            // Update the image URL
            subCategory.image = image.url;

            // Remove the file from local storage
            fs.unlink(imageLocalpath, (err) => {
                if (err) {
                    console.error('Failed to delete local image:', err);
                } else {
                    console.log('Successfully deleted local image:', imageLocalpath);
                }
            });
        }

        // If a new category name is provided, find the category and update the reference
        if (categoryName) {
            const category = await Category.findOne({ name: categoryName });
            if (!category) {
                throw new ApiError(404, "Category not found");
            }
            subCategory.category = category._id;
        }

        // Save the updated subcategory
        await subCategory.save();

        // Send the response with the updated subcategory
        res.status(200).json({ message: "SubCategory updated successfully!", subCategory });
    } catch (error) {
        console.error('Error updating subcategory:', error); // Debugging log
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});



module.exports = {
    createSubCategory,
    getAllSubCategories,
    getSubCategoriesByCategory,
    getSubCategory,
    updateSubCategory
};
