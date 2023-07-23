const mongoose = require('mongoose');

const url = "mongodb+srv://vikramstdnt:vikramstdnt@todolist-v1.lipbnoo.mongodb.net/?retryWrites=true&w=majority"

module.exports.connect = () => {
    mongoose.connect(url).then((res) => console.log('mongodb connected successfully')).catch((err) => console.log("Error: ", err));
};