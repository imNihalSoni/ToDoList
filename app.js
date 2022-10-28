//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const day = date.getDate();

mongoose.connect("mongodb+srv://nihal:Y2opUIBC7EGetE2l@cluster0.s0qzgfg.mongodb.net/todolistDB");

const itemSchema = {
  name:String,
  date:String 
}

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({name:"Welcome to do list",
date:day});

const item2=new Item({name:"Hit the + button to add a new item",
date:day});

const item3=new Item({name:"<-- Hit this to delete an item",
date:day});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
 
    Item.find({date:day},function(err,foundItems){
      if(foundItems.length===0)
      {
        Item.insertMany(defaultItems,function(err)
        {
          if(err)
          {console.log(err);}
        
        else{
          console.log("Success");
        }
        });
        res.redirect("/");
      }else{
    res.render("list", {listTitle: day, newListItems: foundItems});
      }

  });

  
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({name:itemName,
  date:day});

    if(listName===day){
      item.save();
      res.redirect("/");}
      else{
        List.findOne({name:listName},function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
        });
      }
});

app.post("/delete",function(req, res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName===day){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err)
    {console.log(err);}
    else{
      console.log("Successfully removed");
    }
  });
  res.redirect("/");
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err, results){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(err){}
    else{
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });

  // Y2opUIBC7EGetE2l
  // 0awkc18zWqUR095pMPLncks7l5BkxEC2tPZrkQCTT9pz7bfou6DL72FWbBA97O28
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
