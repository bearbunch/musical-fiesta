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

let searchText = "";


let isOpenable = false;



// ===============================
// Openable Toggle Button
// ===============================


function toggleOpenable(){


    isOpenable = !isOpenable;


    const button =
    document.getElementById("openableButton");


    const fields =
    document.getElementById("openQuantityFields");



    if(!button){

        console.error(
        "openableButton missing"
        );

        return;

    }



    if(isOpenable){


        button.innerHTML =
        "Openable: ON";


        button.classList.add("active");


        if(fields){

            fields.style.display="block";

        }


    }
    else{


        button.innerHTML =
        "Openable: OFF";


        button.classList.remove("active");


        if(fields){

            fields.style.display="none";

        }


    }

}



// ===============================
// Dashboard
// ===============================


async function loadDashboard(){


    try{


        const response =
        await fetch(API+"/items");

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


    const response =
    await fetch(API+"/categories");


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




// ===============================
// Locations
// ===============================


async function loadLocations(){


    const response =
    await fetch(API+"/locations");


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




// ===============================
// Load Items
// ===============================


async function loadItems(){


    try{


        const response =
        await fetch(API+"/items");


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
// Search
// ===============================


function searchItems(){


    searchText =

    document.getElementById("searchBox")

    .value

    .toLowerCase();



    renderItems();


}





// ===============================
// Filter Buttons
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
// Display Items
// ===============================


function renderItems(){


    const container =
    document.getElementById("items");


    let filtered =

    items.filter(item=>{


        return (

            (selectedLocation==="All" ||
            item.location===selectedLocation)


            &&


            (selectedCategory==="All" ||
            item.category===selectedCategory)


            &&


            item.name
            .toLowerCase()
            .includes(searchText)

        );


    });




    let html="";



    if(filtered.length===0){

        html="<p>No items found</p>";

    }



    filtered.forEach(item=>{


        html += `

        <div class="item">


        <b>
        ${item.name}
        </b>


        <br>


        Category:
        ${item.category || "None"}


        <br>


        Location:
        ${item.location || "None"}


        <br>


        ${
        item.openable == 1

        ?

        `

        Unopened:
        ${item.unopened_quantity}
        ${item.unit}


        <br>


        Opened:
        ${item.opened_quantity}
        ${item.unit}


        <br><br>


        <button onclick="openOne(${item.id})">

        Open 1

        </button>

        `

        :

        `

        Quantity:
        ${item.quantity}
        ${item.unit}

        `

        }



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



        openable:
        isOpenable ? 1 : 0,



        opened_quantity:
        Number(
        document.getElementById("openedQuantity").value
        ) || 0,



        unopened_quantity:

        Number(
        document.getElementById("unopenedQuantity").value
        )

        ||

        Number(
        document.getElementById("quantity").value
        ),



        notes:""


    };



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



    await loadItems();

    await loadDashboard();


}





// ===============================
// Open One
// ===============================


async function openOne(id){


    const item =
    items.find(i=>i.id==id);



    if(!item)
    return;



    if(item.unopened_quantity <= 0){

        alert(
        "No unopened items"
        );

        return;

    }



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

            unopened_quantity:
            item.unopened_quantity - 1,


            opened_quantity:
            item.opened_quantity + 1


        })


        }

    );


    await loadItems();


}





// ===============================
// Remove One
// ===============================


async function removeOne(id){


    const item =
    items.find(i=>i.id==id);



    if(!item)
    return;



    let quantity =
    item.quantity - 1;



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



    await loadItems();


}





// ===============================
// Delete Item
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


    const response =
    await fetch(API+"/settings");


    window.settings =
    await response.json();


    console.log(
    "Settings:",
    window.settings
    );


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