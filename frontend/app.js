// ===============================
// PantryCloud Frontend JS
// ===============================


// CHANGE THIS TO YOUR WORKER URL

const API = "musical-fiesta.woodwardjake13.workers.dev";


// ===============================
// Load Dashboard
// ===============================

async function loadDashboard(){

    try {

        const response = await fetch(
            API + "/items"
        );

        const items = await response.json();


        let total = items.length;

        let lowStock = 0;


        items.forEach(item=>{

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
            await fetch(API+"/items");


        const items =
            await response.json();


        let html="";


        if(items.length===0){

            html =
            "<p>No items found</p>";

        }


        items.forEach(item=>{


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


            <br>


            Category:

            ${item.category || "None"}


            <br>


            <button onclick="deleteItem(${item.id})">
            Delete
            </button>


            </div>

            `;


        });



        document.getElementById("items")
        .innerHTML=html;


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

        API+"/items",

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

        API+"/items/"+id,

        {

            method:"DELETE"

        }

    );


    loadItems();

    loadDashboard();


}



// ===============================
// Load Settings
// ===============================


async function loadSettings(){


    try {


        const response =
        await fetch(
        API+"/settings"
        );


        const settings =
        await response.json();


        window.settings=settings;


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