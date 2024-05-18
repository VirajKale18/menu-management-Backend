// not Found

const notFound = (req, res, next) => {
    const error = new Error(`Not Found : ${req.originalUrl}`);
    console.log("what");
    res.status(404).json({
      status: "404",
      message: "not found"
    })
  };
  
  // Error Handler
  
  const errorHandler = (err, req, res, next) => {
    const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
    res.status(500).json({
      status: "500",
      message: err?.message,
      stack: err?.stack,
    });
  };
  
  module.exports = { errorHandler, notFound };
  