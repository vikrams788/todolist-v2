require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const db = require('./db');
const mongoose = require("mongoose");
const _ = require("lodash");

const app=express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

db.connect();

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your new Todo List"
});

const item2 = new Item({
    name: "Hit the + button to add an item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item>"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

  app.get("/", async function(req, res) {
    try {
      const result = await Item.find({});
      if(result.length===0){
        Item.insertMany(defaultItems)
  .then(() => {
    console.log("Default items inserted successfully");
  })
  .catch((err) => {
    console.error(err);
  });
  res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: result});
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).send("Server error");
    }
  });

  app.get("/:customListName", async function(req, res) {
    const customListName = _.capitalize(req.params.customListName);
    const list = new List({
      name: customListName,
      items: defaultItems
    });
  
    try {
      // Find the list in the database
      const foundList = await List.findOne({ name: customListName });

      if (!foundList) {
        console.log("List Doesn't exist!");

        await list.save();
        console.log("List created successfully!");
        res.render("list", { listTitle: customListName, newListItems: defaultItems });
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items});
      }
    } catch (err) {
      console.log(err);
    }
  });
  
  

  app.post("/", async function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    if (listName === "favicon.ico") {
      // Ignore the favicon request and redirect to the home page
      res.redirect("/");
      return;
    }

    const item = new Item({
      name: itemName
    });
  
    try {
      if (listName === "Today") {
        await item.save();
        res.redirect("/");
      } else {
        const foundList = await List.findOne({ name: listName });
  
        if (foundList) {
          foundList.items.push(item);
          await foundList.save();
          res.redirect("/" + listName);
        } else {
          console.log("List Doesn't exist!");
          res.redirect("/");
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  });
  
  

  app.post("/delete", async (req, res) => {
    try {
      const checkedItemId = req.body.checkbox;
      const result = await Item.findByIdAndRemove(checkedItemId);
      const listName = req.body.listName;
      if (listName === "Today") {
        console.log(result);
        res.redirect("/");
      } else {
        const foundList = await List.findOneAndUpdate(
          { name: listName },
          { $pull: { items: { _id: checkedItemId } } },
          { new: true } // This option returns the modified document after update
        );
        if (foundList) {
          res.redirect("/" + listName);
        } else {
          console.log("List Doesn't exist!");
        }
      }
      // Redirect to the home page after successful item deletion
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).send("Error deleting item");
    }
  });
  

app.get("/work", function(req, res){
     res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
    res.render("about");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server has started");
});