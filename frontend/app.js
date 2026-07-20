// ===============================
// PantryCloud Frontend JS
// ===============================


const API =
"https://musical-fiesta.woodwardjake13.workers.dev";


let items = [];

let categories = [];

let locations = [];


let selectedLocation = "All";

let selectedCategory = "All";



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
// Load Categories
// ===============================


async function loadCategories(){

    try {

        const response =
        await fetch(API + "/categories");


        categories =
        await response.json();


        const select =
        document.getElementById("category");


        if(!select) return;


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
// Load Locations
// ===============================


async function loadLocations(){

    try {


        const response =
        await fetch(API + "/locations");


        locations =
        await response.json();



        const select =
        document.getElementById("location");


        if(!select) return;


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



        createTabs();


        renderItems();


    }
    catch(error){

        console.log(error);

    }

}



// ===============================
// Create Tabs
// ===============================


function createTabs(){


    const locationDiv =
    document.getElementById("locationTabs");


    const categoryDiv =
    document.getElementById("categoryTabs");



    if(!locationDiv || !categoryDiv)
    return;



    let locationList = [

        "All",

        ...new Set(
            items
            .map(i=>i.location)
            .filter(Boolean)
        )

    ];



    locationDiv.innerHTML =
    "<b>Locations:</b> ";



    locationList.forEach(location=>{


        locationDiv.innerHTML += `

        <button onclick="selectLocation('${location}')">

        ${location}

        </button>

        `;


    });




    let categoryList = [

        "All",

        ...new Set(

            items
            .filter(item=>

                selectedLocation==="All" ||
                item.location===selectedLocation

            )
            .map(i=>i.category)
            .filter(Boolean)

        )

    ];



    categoryDiv.innerHTML =
    "<b>Categories:</b> ";



    categoryList.forEach(category=>{


        categoryDiv.innerHTML += `

        <button onclick="selectCategory('${category}')">

        ${category}

        </button>

        `;


    });


}




// ===============================
// Select Tabs
// ===============================


function selectLocation(location){

    selectedLocation = location;

    selectedCategory = "All";

    createTabs();

    renderItems();

}



function selectCategory(category){

    selectedCategory = category;

    renderItems();

}




// ===============================
// Render Items
// ===============================


function renderItems(){


    const container =
    document.getElementById("items");


    if(!container)
    return;



    let filtered =
    items.filter(item=>{


        let locationMatch =

        selectedLocation==="All" ||

        item.location===selectedLocation;



        let categoryMatch =

        selectedCategory==="All" ||

        item.category===selectedCategory;



        return locationMatch && categoryMatch;


    });



    let html="";



    if(filtered.length===0){

        html =
        "<p>No items found</p>";

    }



    filtered.forEach(item=>{


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



    container.innerHTML = html;


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

        alert("Enter item name");

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



    await loadItems();

    await loadDashboard();


}




// ===============================
// Remove One
// ===============================


async function removeOne(id){


    const item =
    items.find(
        i=>i.id==id
    );



    if(!item)
    return;



    let quantity =
    item.quantity - 1;



    if(quantity <= 0){


        await deleteItem(id);


    }
    else {


        await fetch(

            API+"/items/"+id,

            {

            method:"PUT",

            headers:{

            "Content-Type":
            "application/json"

            },


            body:
            JSON.stringify({

            quantity:quantity

            })


            }

        );


    }



    await loadItems();

    await loadDashboard();


}




// ===============================
// Delete
// ===============================


async function deleteItem(id){


    await fetch(

        API+"/items/"+id,

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
        await fetch(API+"/settings");


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