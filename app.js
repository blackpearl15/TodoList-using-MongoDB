//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-yash:Test124589@cluster0.suok5nc.mongodb.net/todolistDB");

const itemsSchema = {
    name : String,
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
   name : "Welcome to your TodoList!"
});

const item2 = new Item({
   name : "Hit the + button to add an item."
});

const item3 = new Item({
   name : "Delete an item."
});

const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {


  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err) console.log(err);
        else console.log("Successfully inserted");
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item  = new Item({
    name : itemName,
  });

  if(listTitle === "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name : listTitle},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle);
    });
  }



});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err) {
       console.log("Successfully Deleted");
       res.redirect("/");
     }
    });
  }
  else{
    //pull function hai jo thik se samajh nhi aaya hai
    List.findOneAndUpdate({name : listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }




});


const listSchema = {
   name : String,
   items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name : customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a New List
        const list = new List({
          name : customListName,
          items : defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //Show a existing list
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items});

      }
    }
  })






});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port , function() {
  console.log("Server has started successfully.");
});
