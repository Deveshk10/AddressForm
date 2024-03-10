const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
mongoose.connect("mongodb://localhost:27017/addressDB", {
  useNewUrlParser: true,
});

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
});

const Address = mongoose.model("Address", addressSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("Form");
});

app.post("/add", (req, res) => {
  Address.findOne({ zip: req.body.zip }, (err, existingAddress) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking zip code existence in the database");
      return;
    }

    if (existingAddress) {
      // Zip code already exists, send a response indicating the conflict
      res.status(409).send("Zip code already exists in the database");
      return;
    }

    // If zip code doesn't exist, proceed with adding the new address
    const newAddress = new Address({
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
    });

    newAddress.save((err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error adding address to database");
      } else {
        res.redirect("/");
      }
    });
  });
});

app.get("/addresses", (req, res) => {
  Address.find({}, (err, addresses) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error fetching addresses from database");
    } else {
      res.render("addresses", { addresses: addresses });
    }
  });
});


app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  Address.findByIdAndRemove(id, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error deleting address from database");
    } else {
      res.status(200).send({ success: true });
    }
  });
});

app.get("/update_form", (req, res) => {
  const { id, street, city, state, zip } = req.query;
  res.render("update_form", { id, street, city, state, zip });
});


app.post("/update", (req, res) => {
  const id = req.body.id;
  const zip = req.body.zip;


  Address.findOne({ zip: zip }, (err, address) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error checking ZIP code in database");
    } else {
    
      if (address && address._id.toString() !== id) {
        res
          .status(409)
          .send("ZIP code already exists in the database");
      } else {
        Address.findByIdAndUpdate(
          id,
          {
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
          },
          (err) => {
            if (err) {
              console.log(err);
              res.status(500).send("Error updating address in database");
            } else {
              res.redirect("/addresses");
            }
          }
        );
      }
    }
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
