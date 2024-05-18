const router = require('express').Router();
const { createCategory, getAllCategories, getCategory,updateCategory } = require('../controller/category_controller.js');
const { createSubCategory, getAllSubCategories, getSubCategoriesByCategory, getSubCategory, updateSubCategory } = require('../controller/subcategory_controller')
const {createItem,getAllItems,getItemsBySubCategory,getItemsByCategory,getItem,updateItem,searchItem} = require('../controller/item_controller.js')
const { upload } = require('../middleware/multer_middleware.js');

//API to create a category
router.post('/create-category', upload.single('image'), createCategory);
//API to create a Subcategory
router.post('/create-subcategory', upload.single('image'), createSubCategory);
//API to create a Items
router.post('/create-item', upload.single('image'), createItem);
//API's to GET Subcategories
router.get('/getAllsubcategories', getAllSubCategories);
router.get('/getSubcategoriesUnderCategory', getSubCategoriesByCategory);
router.get('/getSubcategory', getSubCategory)

//API's to GET Categories
router.get('/getAllcategories', getAllCategories);
router.get('/getCategory', getCategory)
//API's to GET Items
router.get('/getAllItems',getAllItems)
router.get('/getItemsBySubCategory',getItemsBySubCategory)
router.get('/getItemsByCategory',getItemsByCategory)
router.get('/getItem',getItem)
//API's to Edit Subcategories
router.post('/edit-category',updateCategory);
router.post('/edit-subcategory',updateSubCategory)
router.post('/edit-items',updateItem)

//API to search an Item
router.get('/search-items',searchItem)
module.exports = router;