const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req,res,next){
    res.json({ data:dishes })
}

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({
          status: 400,
          message: `Must include a ${propertyName}`
      });
    };
  }

  function priceIsValidNumber(req, res, next){
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)){
        return next({status:400,message:"Dish must have a price that is an integer greater than 0"});
    }
    next();
  }

function create(req,res,next){
    const { data:{name, description, price, image_url} = {}} = req.body;
    const id = nextId()

    const newDish = {
        id,
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish)
    
    res.status(201).json({data:newDish})
}

function dishExists(req,res,next){
    const {dishId} = req.params;
    const foundDish = dishes.find((dish)=>dish.id === dishId)
    
    if(foundDish){
        res.locals.id = dishId
        res.locals.dish = foundDish
        return next()
    }
    return next({status:404,message:`Dish does not exist: ${dishId}.`})
}

function matchId(req,res,next){
    const dish = res.locals.dish
    const {dishId} = req.params

    if(req.body.data.id && req.body.data.id != dishId){
        return next({status:400,message:`Dish id does not match route id. Dish: ${req.body.data.id}, Route: ${dishId}`})
    }
    if(dishId === dish.id){
       return next()
    }
}

function read(req,res,next){
    res.json({data:res.locals.dish})
}

function update(req,res,next){
    const {data:{name,description,price,image_url}={}} = req.body;
    const dish = res.locals.dish;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({ data: dish });
}


module.exports = {
    list,
    read:[dishExists,read],
    create:[
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValidNumber,create],
    update:[dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        priceIsValidNumber,
        matchId,
        update]
}