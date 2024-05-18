const asyncHandler = require('express-async-handler');
const Item = require('../model/item_model');
const Category = require('../model/category_model');
const SubCategory = require('../model/subcategory_model');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');
const { ApiError } = require('../utils/apiError');

const createItem = asyncHandler(async (req, res) => {
    try {
        //get the input fields from the user
        const { name, description, baseAmount, discount, categoryName, subCategoryName, taxApplicable, tax } = req.body;
        const imageLocalpath = req.file.path;
        console.log(imageLocalpath)
        if (!imageLocalpath) {
            throw new ApiError(400, "Image is required to create the item");
        }

        // Upload the image to Cloudinary
        const image = await uploadOnCloudinary(imageLocalpath);
        if (!image) {
            throw new ApiError(400, "Image upload failed");
        }

        // Calculate total amount
        const totalAmount = baseAmount - discount;

        let categoryId = null;
        let subCategoryId = null;
        let applicableTax = tax;
        let applicableTaxApplicable = taxApplicable;

        if (subCategoryName) {
            const subCategory = await SubCategory.findOne({ name: subCategoryName });
            if (!subCategory) throw new ApiError(404, 'Sub-category not found');
            subCategoryId = subCategory._id;
            categoryId = subCategory.category; // Assuming sub-category has a reference to its parent category
            applicableTax = applicableTax || subCategory.tax;
            applicableTaxApplicable = applicableTaxApplicable || subCategory.taxApplicable;
        } else if (categoryName) {
            const category = await Category.findOne({ name: categoryName });
            if (!category) throw new ApiError(404, 'Category not found');
            categoryId = category._id;
            applicableTax = applicableTax || category.tax;
            applicableTaxApplicable = applicableTaxApplicable || category.taxApplicable;
        }

        const item = new Item({
            name,
            image: image.url,
            description,
            baseAmount,
            discount,
            totalAmount,
            taxApplicable: applicableTaxApplicable,
            tax: applicableTax,
            category: categoryId,
            subCategory: subCategoryId
        });

        await item.save();

        if (subCategoryId) {
            await SubCategory.findByIdAndUpdate(
                subCategoryId,
                { $push: { items: item._id } },
                { new: true, useFindAndModify: false }
            );
        } else if (categoryId) {
            await Category.findByIdAndUpdate(
                categoryId,
                { $push: { items: item._id } },
                { new: true, useFindAndModify: false }
            );
        }

        // Remove the local file
        fs.unlink(imageLocalpath, (err) => {
            if (err) {
                console.error('Failed to delete local image:', err);
            } else {
                console.log('Successfully deleted local image:', imageLocalpath);
            }
        });

        res.status(201).json({ message: 'Item created successfully', item });
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

const getAllItems = asyncHandler(async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        console.error('Error getting all items:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getItemsBySubCategory = asyncHandler(async (req, res) => {
    try {
        const { subCategoryName } = req.query;

        // Check if subCategoryName is provided
        if (!subCategoryName) {
            throw new ApiError(400, "Sub-category name is required to get items by sub-category");
        }

        // Find the sub-category by name and populate its items
        const subCategory = await SubCategory.findOne({ name: subCategoryName }).populate('items');

        // Check if the sub-category exists
        if (!subCategory) {
            throw new ApiError(404, "Sub-category not found");
        }

        // Return the items of the sub-category
        res.status(200).json(subCategory.items);
    } catch (error) {
        console.error('Error getting items by sub-category:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const getItemsByCategory = asyncHandler(async (req, res) => {
    try {
        const { categoryName } = req.query;

        // Check if categoryName is provided
        if (!categoryName) {
            throw new ApiError(400, "Category name is required to get items by category");
        }

        // Find the category by name and add its subCategories and their items
        const category = await Category.findOne({ name: categoryName }).populate({
            path: 'subCategories',
            populate: {
                path: 'items', // This populates the items within each sub-category
            },
        });

        // Check if the category exists
        if (!category) {
            throw new ApiError(404, "Category not found");
        }

        // Aggregate all items from the sub-categories
        const items = category.subCategories.reduce((acc, subCategory) => {
            return acc.concat(subCategory.items);
        }, []);

        // Return the aggregated items
        res.status(200).json(items);
    } catch (error) {
        console.error('Error getting items by category:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});
const getItem = asyncHandler(async (req, res) => {
    try {
        const { id, name } = req.query;

        let item;
        //if id provided get the item by id, if not then search by item name
        if (id) {
            item = await Item.findById(id);
        } else if (name) {
            item = await Item.findOne({ name });
        } else {
            throw new ApiError(400, "Please provide either 'id' or 'name' to get the item");
        }

        if (!item) {
            throw new ApiError(404, "Item not found");
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Error getting item:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});

const updateItem = asyncHandler(async (req, res) => {
    try {
        const { itemId, name, description, baseAmount, discount, categoryName, subCategoryName, taxApplicable, tax } = req.body;

        // Find the item by ID
        const item = await Item.findById(itemId);
        if (!item) {
            throw new ApiError(404, "Item not found");
        }

        // Update the item attributes with new values
        if (name) item.name = name;
        if (description) item.description = description;
        if (baseAmount !== undefined) item.baseAmount = baseAmount;
        if (discount !== undefined) item.discount = discount;
        item.totalAmount = (baseAmount !== undefined ? baseAmount : item.baseAmount) - (discount !== undefined ? discount : item.discount);

        // Handle image update if a new image is provided
        if (req.file) {
            const imageLocalpath = req.file.path;
            const image = await uploadOnCloudinary(imageLocalpath);
            if (!image) {
                throw new ApiError(400, "Failed to upload image to Cloudinary");
            }
            item.image = image.url;

            // Remove the file from local storage
            fs.unlink(imageLocalpath, (err) => {
                if (err) {
                    console.error('Failed to delete local image:', err);
                } else {
                    console.log('Successfully deleted local image:', imageLocalpath);
                }
            });
        }

        // Update category and subcategory references if provided
        let categoryId = null;
        let subCategoryId = null;
        if (subCategoryName) {
            const subCategory = await SubCategory.findOne({ name: subCategoryName });
            if (!subCategory) throw new ApiError(404, 'Sub-category not found');
            subCategoryId = subCategory._id;
            categoryId = subCategory.category; // Assuming sub-category has a reference to its parent category
        } else if (categoryName) {
            const category = await Category.findOne({ name: categoryName });
            if (!category) throw new ApiError(404, 'Category not found');
            categoryId = category._id;
        }

        if (categoryId) item.category = categoryId;
        if (subCategoryId) item.subCategory = subCategoryId;
        if (taxApplicable !== undefined) item.taxApplicable = taxApplicable;
        if (tax !== undefined) item.tax = tax;

        // Save the updated item
        await item.save();

        // Update the items reference in the subcategory or category
        if (subCategoryId) {
            await SubCategory.findByIdAndUpdate(
                subCategoryId,
                { $addToSet: { items: item._id } },
                { new: true, useFindAndModify: false }
            );
        } else if (categoryId) {
            await Category.findByIdAndUpdate(
                categoryId,
                { $addToSet: { items: item._id } },
                { new: true, useFindAndModify: false }
            );
        }

        // Send the response with the updated item
        res.status(200).json({ message: "Item updated successfully!", item });
    } catch (error) {
        console.error('Error updating item:', error); 
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});


const searchItem = asyncHandler(async (req, res) => {
    try {
        const { name } = req.query;

        // If not name throw error
        if (!name) {
            return res.status(400).json({ message: 'Item name is required to perform a search' });
        }

        // Find items by name (case-insensitive search) if any word from the item is searched it appears
        const items = await Item.find({ name: new RegExp(name, 'i') });

        // Return the found items
        res.status(200).json(items);
    } catch (error) {
        console.error('Error searching for items:', error);
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});


module.exports = {
    createItem,
    getAllItems,
    getItemsBySubCategory,
    getItemsByCategory,
    getItem,
    updateItem,
    searchItem
};
