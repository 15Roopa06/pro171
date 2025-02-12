var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function() {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    var dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(dishes, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askTableNumber: function() {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title:"Welcome to Hunger",
      icon:iconUrl,
      content:{
        element:"input",
        attributes:{
          placeholder:"TYPE YOUR TABLE NUMBER",
          type:"number",
          min:1
        }
      },
      closeOnClickOutside:false
    }).then((inputvalue)=>{
      tablenumber=inputvalue

    })
    
    
      
      
      
    
    
  },

  handleMarkerFound: function(dishes, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    
    // Sunday - Saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    var dish = dishes.filter(dish => dish.id === markerId)[0];

    if (dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
       // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      //Update UI conent VISIBILITY of AR scene(MODEL , INGREDIENTS & PRICE)

      model.setAttribute("visible",true)
      var ingredinents_container=document.querySelector(`#main-plane-${dish.id}`)
      ingredinents_container.setAttribute("visible",true)
      var priceplane=document.querySelector(`#price-plane-${dish.id}`)
      priceplane.setAttribute("visible",true)

      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      // Handling Click Events
      ratingButton.addEventListener("click", function() {
        swal({
          icon: "warning",
          title: "Rate Dish",
          text: "Work In Progress"
        });
      });

      orderButtton.addEventListener("click", () => {
        var tNumber;
        tableNumber<=9?(tnumber= `T0${tableNumber}`) : `T${tableNumber}`;
        this.handleOrder(tNumber, dish);


        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon on your table!",
          timer: 2000,
          buttons: false
        });
      });
    }
  },
  handleOrder: function(tNumber, dish) {
    firebase.firestore().collection("tables").doc(tNumber).get().then((doc)=>{
      var details=doc.data()
       if (details["current_orders"][dish.id]){
        details["current_orders"][dish.id]["quantity"]+=1
       var currentquantity=details["current_orders"][dish.id]["quantity"];

       details["current_orders"][dish.id]["subtotal"] =
         currentquantity * dish.price;
     } else {
      details["current_orders"][dish.id]={
        item:dish.dish_name,
        price:dish.price,
        quantity:1,
        subtotal:dish.price * 1
      }
     }
       details.total_bill+=dish.price
       firebase.firestore().collection("tables").doc(doc.id).update(details)
    })
  },

  getDishes: async function() {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
