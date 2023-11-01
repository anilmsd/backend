const express = require("express");
const mongoose = require("mongoose");
const multer=require("multer");
const app = express();
const helmet = require('helmet');
const cors=require('cors');
const path=require("path");
const  {fileURLToPath} =require("url");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); 
app.use(express.json());
const formRoutes=require("./routes/form.js")
const userResponse=require("./controller/userResponse.js");
const mockdata=require("./Mock_Data.json");

// Set security HTTP headers
app.use(helmet());
app.use(cors());

app.use("/form",formRoutes);



//this line to get the image from backend to fronted , we can access these images http://localhost:3001/assets/p2.jpeg,
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
/* FILE STORAGE */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/assets");
    },
    filename: function (req, file, cb) {
        console.log(file)
        const uniqueFileName = uuidv4(); // Generate a unique identifier
        const fileExtension = file.originalname.split(".").pop(); // Get the file extension
        const originalFileName = file.originalname.split(".")[0]; // Get the original filename without extension
    
        const fileName = `${originalFileName}-${uniqueFileName}.${fileExtension}`;
        cb(null, fileName);
    },
  });
  const upload = multer({ storage });
  app.post("/form/updateSubmitResponse/:userResponseId", upload.single("file"), userResponse.updateSubmitResponse);



mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("DB Connetion Successfull");
    })
    .catch((err) => {
        console.log(err.message);
    });



app.get("/rest/getAllUsers", (req, res) => {
    res.send(mockdata)
   });


app.listen(4000, () =>
    console.log(`Server started on ${process.env.PORT}`)
);
