const cloudinary = require('cloudinary');
const fs = require('fs');              
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,  
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localfilePath)=>{
        try {
            //if filepath path on the server is not present then return null
            if(!localfilePath) return null
            // else upload the file on cloudinary using the file path as a paramter  
          const response = await cloudinary.uploader.upload(localfilePath,{
                resource_type:'auto'    
            })  
            //file has been succesfully uploaded
            //console.log("The file has been uploaded on cloudinary :- ",response.url );
            return response;

        } catch (error) {
            //if not uploaded the remove the file from the local server and then move ahead
            fs.unlinkSync(localfilePath);

        }
}

module.exports = {uploadOnCloudinary};