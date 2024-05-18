const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

const dotenv = require('dotenv');
const app = express();
const connectDB = require('./src/db/db.js');
const { notFound, errorHandler } = require('./src/utils/errorHandler.js');


dotenv.config();
const PORT = process.env.PORT;
const cookieParser = require('cookie-parser');
app.use(cors({
    origin:[
        "http://localhost:8080",
    ],
    credentials:true,
 })
);


connectDB();

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))

app.use(express.static('public'))
app.use(cookieParser());

const menuRoute = require('./src/routes/menu_routes.js');

app.use('/api/',menuRoute);

app.use(notFound);
app.use(errorHandler);


app.listen(PORT,()=>{
    console.log(`Server listening on PORT http//:localhost:${PORT}`);
})
module.exports = app;