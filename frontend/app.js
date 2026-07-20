// ===============================
// PantryCloud Frontend JS
// ===============================


const API = "https://musical-fiesta.woodwardjake13.workers.dev";

let items = [];


// ===============================
// Load Dashboard
// ===============================

async function loadDashboard(){

    try {

        const response = await fetch(
            API + "/items"
        );

        const data = await response.json();

        let total = data.length;

        let lowStock = 0;


        data.forEach(item => {

            if(
                item.minimum_quantity > 0 &&
                item.quantity <= item.minimum_quantity
            ){

                lowStock++;

            }

        });


        document.getElementById("stats").innerHTML = `

            <div>
            Total Items:
            <b>${total}</b>
            </div>

            <div>
            Low Stock:
            <b>${lowStock}</b>
            </div>

        `;


    }
    catch(error){

        console.log(error);

        document.getElementById("stats").innerHTML =
        "Unable to load dashboard";

    }

}



// ===============================
// Load Inventory
// ===============================

async function loadItems(){

    try {

        const response =
            await fetch(API + "/items");


        items =
            await response.json();


        let html = "";


        if(items.length === 0){

            html =
            "<p>No items found</p>";

        }


        items.forEach(item => {


            html += `

            <div class="item">

                <b>
                ${item.name}
                </b>

                <br>

                Quantity:
                ${item.quantity}
                ${item.unit}


                <br>

                Location:
                ${item.location || "None"}


                <br><br>

                Category:
                ${item.category || "None"}


                <br><br>


                <button onclick="removeOne(${item.id})">
                    Remove one
                </button>


                <button onclick="deleteItem(${item.id})">
                    Delete
                </button>


            </div>

            <br>

            `;


        });


        document.getElementById("items").innerHTML = html;


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Add Item
// ===============================

async function addItem(){


    const item = {


        name:
        document.getElementById("name").value,


        quantity:
        Number(
            document.getElementById("quantity").value
        ),


        unit:
        document.getElementById("unit").value,


        minimum_quantity:
        Number(
            document.getElementById("minimum").value
        ),


        notes:""

    };



    if(!item.name){

        alert(
            "Please enter item name"
        );

        return;

    }



    await fetch(

        API + "/items",

        {

            method:"POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(item)

        }

    );



    document.getElementById("name").value="";
    document.getElementById("quantity").value="";
    document.getElementById("unit").value="";
    document.getElementById("minimum").value="";


    await loadItems();

    await loadDashboard();

}



// ===============================
// Remove One Quantity
// ===============================

async function removeOne(id){


    const item =
        items.find(i => i.id == id);



    if(!item){

        console.log(
            "Item not found",
            id
        );

        return;

    }



    const newQuantity =
        item.quantity - 1;



    if(newQuantity <= 0){


        await fetch(

            API + "/items/" + id,

            {
                method:"DELETE"
            }

        );


    }
    else {


        await fetch(

            API + "/items/" + id,

            {

                method:"PUT",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify({

                    quantity:
                    newQuantity

                })

            }

        );


    }



    await loadItems();

    await loadDashboard();


}



// ===============================
// Delete Item
// ===============================

async function deleteItem(id){


    if(
        !confirm(
            "Delete this item?"
        )
    ){

        return;

    }



    await fetch(

        API + "/items/" + id,

        {

            method:"DELETE"

        }

    );



    await loadItems();

    await loadDashboard();


}



// ===============================
// Load Settings
// ===============================

async function loadSettings(){

    try {


        const response =
            await fetch(
                API + "/settings"
            );


        const settings =
            await response.json();



        window.settings =
            settings;



        console.log(
            "Settings:",
            settings
        );


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Start App
// ===============================

async function start(){

    await loadSettings();

    await loadItems();

    await loadDashboard();

}


start();


// Auto refresh every second

setInterval(() => {

    loadItems();

    loadDashboard();

}, 1000);