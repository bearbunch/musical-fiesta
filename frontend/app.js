// ===============================
// PantryCloud Frontend JS
// ===============================


const API =
"https://musical-fiesta.woodwardjake13.workers.dev";


let items = [];

let categories = [];

let locations = [];


// ===============================
// Dashboard
// ===============================


async function loadDashboard(){

    try {

        const response =
            await fetch(API + "/items");


        const data =
            await response.json();


        let lowStock = 0;


        data.forEach(item=>{

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
                <b>${data.length}</b>
            </div>

            <div>
                Low Stock:
                <b>${lowStock}</b>
            </div>

        `;


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Categories
// ===============================


async function loadCategories(){

    try {

        const response =
            await fetch(API + "/categories");


        categories =
            await response.json();



        const select =
            document.getElementById("category");


        select.innerHTML =
        `
        <option value="">
        No category
        </option>
        `;



        categories.forEach(category=>{

            select.innerHTML += `

            <option value="${category.id}">
                ${category.name}
            </option>

            `;

        });


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Locations
// ===============================


async function loadLocations(){

    try {

        const response =
            await fetch(API + "/locations");


        locations =
            await response.json();



        const select =
            document.getElementById("location");


        select.innerHTML =
        `
        <option value="">
        No location
        </option>
        `;



        locations.forEach(location=>{

            select.innerHTML += `

            <option value="${location.id}">
                ${location.name}
            </option>

            `;

        });


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Load Items
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


            Category:
            ${item.category || "None"}



            <br>


            Location:
            ${item.location || "None"}



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



        document.getElementById("items")
        .innerHTML = html;


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



        category_id:
        Number(
            document.getElementById("category").value
        ) || null,



        location_id:
        Number(
            document.getElementById("location").value
        ) || null,



        notes:""


    };



    if(!item.name){

        alert(
        "Enter item name"
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
    items.find(
        i=>i.id == id
    );



    if(!item){

        return;

    }



    const newQuantity =
    item.quantity - 1;



    if(newQuantity <= 0){


        await deleteItem(id);


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

                    quantity:newQuantity

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
// Settings
// ===============================


async function loadSettings(){

    try {


        const response =
        await fetch(API + "/settings");


        window.settings =
        await response.json();



        console.log(
            "Settings:",
            window.settings
        );


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Start
// ===============================


async function start(){


    await loadSettings();

    await loadCategories();

    await loadLocations();

    await loadItems();

    await loadDashboard();


}


start();



// Refresh every second

setInterval(()=>{

    loadItems();

    loadDashboard();

},1000);