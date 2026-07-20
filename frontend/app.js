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
// Openable Toggle
// ===============================


function toggleOpenable(){


    isOpenable = !isOpenable;


    const button =
    document.getElementById("openableButton");


    const normal =
    document.getElementById("normalQuantity");


    const open =
    document.getElementById("openQuantityFields");



    if(isOpenable){


        button.textContent =
        "Openable: ON";


        button.classList.add("active");


        if(normal)
        normal.style.display="none";


        if(open)
        open.style.display="block";


    }
    else{


        button.textContent =
        "Openable: OFF";


        button.classList.remove("active");


        if(normal)
        normal.style.display="block";


        if(open)
        open.style.display="none";


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


    try{


        const response =
        await fetch(API+"/categories");


        categories =
        await response.json();



        const selects = [

            document.getElementById("category"),

            document.getElementById("editCategory")

        ];



        selects.forEach(select=>{


            if(!select)
            return;



            select.innerHTML = `

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


    try{


        const response =
        await fetch(API+"/locations");


        locations =
        await response.json();



        const selects=[

            document.getElementById("location"),

            document.getElementById("editLocation")

        ];



        selects.forEach(select=>{


            if(!select)
            return;



            select.innerHTML = `

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



    const locationList=[


        "All",

        ...new Set(

            items

            .map(i=>i.location)

            .filter(Boolean)

        )


    ];



    locationDiv.innerHTML =
    "<b>Locations:</b>";



    locationList.forEach(location=>{


        locationDiv.innerHTML += `


        <button onclick="selectLocation('${location}')">

        ${location}

        </button>


        `;


    });




    const categoryList=[


        "All",

        ...new Set(

            items

            .filter(i=>

                selectedLocation==="All" ||

                i.location===selectedLocation

            )

            .map(i=>i.category)

            .filter(Boolean)

        )


    ];



    categoryDiv.innerHTML =
    "<b>Categories:</b>";



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


    const box =
    document.getElementById("searchBox");


    if(!box)
    return;



    searchText =
    box.value.toLowerCase();



    renderItems();


}







// ===============================
// Filters
// ===============================


function selectLocation(location){


    selectedLocation =
    location;


    selectedCategory =
    "All";


    createTabs();


    renderItems();


}




function selectCategory(category){


    selectedCategory =
    category;


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


        return (

            selectedLocation==="All" ||

            item.location===selectedLocation

        )

        &&

        (

            selectedCategory==="All" ||

            item.category===selectedCategory

        )

        &&

        item.name

        .toLowerCase()

        .includes(searchText);


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
            ${item.unopened_quantity || 0}
            ${item.unit}

            <br>

            Opened:
            ${item.opened_quantity || 0}
            ${item.unit}

            `


            :


            `

            Quantity:
            ${item.quantity}
            ${item.unit}

            `

        }



        <br><br>


        <div class="itemButtons">



        ${
            item.openable == 1

            ?

            `

            <button onclick="openOne(${item.id})">

            Open 1

            </button>

            `

            :

            ""

        }




        <button onclick="removeOne(${item.id})">

        Remove one

        </button>





        <button onclick="editItem(${item.id})">

        Edit

        </button>





        <button onclick="deleteItem(${item.id})">

        Delete

        </button>



        </div>



        </div>


        <br>


        `;


    });



    container.innerHTML =
    html;


}








// ===============================
// Add Item
// ===============================


async function addItem(){


    const quantity =

    isOpenable

    ?

    Number(document.getElementById("unopenedQuantity").value)

    +

    Number(document.getElementById("openedQuantity").value)


    :

    Number(document.getElementById("quantity").value);




    const item={


        name:
        document.getElementById("name").value,


        quantity,


        unit:
        document.getElementById("unit").value,



        minimum_quantity:

        Number(
        document.getElementById("minimum").value
        ),



        category_id:

        Number(
        document.getElementById("category").value
        )
        || null,



        location_id:

        Number(
        document.getElementById("location").value
        )
        || null,



        openable:

        isOpenable ? 1 : 0,



        opened_quantity:

        isOpenable

        ?

        Number(
        document.getElementById("openedQuantity").value
        )

        :

        0,



        unopened_quantity:

        isOpenable

        ?

        Number(
        document.getElementById("unopenedQuantity").value
        )

        :

        quantity,



        notes:""


    };




    await fetch(API+"/items",{

        method:"POST",

        headers:{

            "Content-Type":
            "application/json"

        },


        body:

        JSON.stringify(item)


    });



    await loadItems();

    await loadDashboard();


}








// ===============================
// EDIT ITEM
// ===============================


function editItem(id){


    const item =
    items.find(i=>i.id==id);



    if(!item)
    return;



    document.getElementById("editBox")
    .style.display="block";



    document.getElementById("editId")
    .value=item.id;



    document.getElementById("editName")
    .value=item.name;



    document.getElementById("editQuantity")
    .value=item.quantity;



    document.getElementById("editUnit")
    .value=item.unit;



    document.getElementById("editMinimum")
    .value=item.minimum_quantity;



    document.getElementById("editCategory")
    .value=item.category_id || "";



    document.getElementById("editLocation")
    .value=item.location_id || "";



    document.getElementById("editOpenable")
    .checked=item.openable==1;



    document.getElementById("editOpened")
    .value=item.opened_quantity || 0;



    document.getElementById("editUnopened")
    .value=item.unopened_quantity || 0;



    toggleEditOpen();


}






function toggleEditOpen(){


    const checked =
    document.getElementById("editOpenable").checked;



    document.getElementById("editOpenFields")
    .style.display =

    checked

    ?

    "block"

    :

    "none";


}



document.addEventListener(
"change",
(e)=>{


    if(
        e.target.id==="editOpenable"
    ){

        toggleEditOpen();

    }


});








async function saveEdit(){


    const id =
    document.getElementById("editId").value;



    const openable =
    document.getElementById("editOpenable").checked
    ? 1
    : 0;



    let quantity =
    Number(
    document.getElementById("editQuantity").value
    );



    if(openable){


        quantity =

        Number(
        document.getElementById("editOpened").value
        )

        +

        Number(
        document.getElementById("editUnopened").value
        );


    }



    const item={


        name:
        document.getElementById("editName").value,


        quantity,


        unit:
        document.getElementById("editUnit").value,


        minimum_quantity:

        Number(
        document.getElementById("editMinimum").value
        ),



        category_id:

        Number(
        document.getElementById("editCategory").value
        )
        || null,



        location_id:

        Number(
        document.getElementById("editLocation").value
        )
        || null,



        openable,


        opened_quantity:

        Number(
        document.getElementById("editOpened").value
        ),



        unopened_quantity:

        Number(
        document.getElementById("editUnopened").value
        ),



        notes:""


    };



    await fetch(

        API+"/items/"+id,

        {

        method:"PUT",

        headers:{

        "Content-Type":
        "application/json"

        },


        body:

        JSON.stringify(item)


        }

    );



    cancelEdit();


    await loadItems();

    await loadDashboard();


}




function cancelEdit(){


    document.getElementById("editBox")
    .style.display="none";


}

// ===============================
// Open One
// ===============================


async function openOne(id){


    const item =
    items.find(i=>i.id==id);



    if(!item)
    return;



    if(
        Number(item.unopened_quantity) <= 0
    ){

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


        body:JSON.stringify({

            quantity:
            Number(item.quantity),


            opened_quantity:

            Number(item.opened_quantity || 0)
            + 1,



            unopened_quantity:

            Number(item.unopened_quantity)
            - 1,


            name:item.name,

            category_id:item.category_id,

            location_id:item.location_id,

            unit:item.unit,

            minimum_quantity:item.minimum_quantity,

            openable:1,

            notes:item.notes || ""

        })


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
    items.find(i=>i.id==id);



    if(!item)
    return;




    if(item.openable == 1){



        let opened =
        Number(item.opened_quantity || 0);



        let unopened =
        Number(item.unopened_quantity || 0);



        if(opened > 0){

            opened--;

        }

        else if(unopened > 0){

            unopened--;

        }

        else{

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


            body:JSON.stringify({

                name:item.name,

                category_id:item.category_id,

                location_id:item.location_id,

                unit:item.unit,

                minimum_quantity:item.minimum_quantity,

                openable:1,

                opened_quantity:opened,

                unopened_quantity:unopened,

                quantity:
                opened + unopened,

                notes:item.notes || ""

            })

            }

        );


    }

    else{



        await fetch(

            API+"/items/"+id,

            {

            method:"PUT",

            headers:{

                "Content-Type":
                "application/json"

            },


            body:JSON.stringify({

                name:item.name,

                category_id:item.category_id,

                location_id:item.location_id,

                unit:item.unit,

                minimum_quantity:item.minimum_quantity,

                openable:0,

                quantity:
                Number(item.quantity)-1,

                opened_quantity:0,

                unopened_quantity:
                Number(item.quantity)-1,

                notes:item.notes || ""

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


    try{


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







let editOpenable = false;


function toggleEditOpenable(){


    editOpenable = !editOpenable;


    const button =
    document.getElementById("editOpenableButton");


    const normal =
    document.getElementById("editNormalQuantity");


    const open =
    document.getElementById("editOpenQuantityFields");



    if(!button)
    return;



    if(editOpenable){


        button.textContent =
        "Openable: ON";


        button.classList.add("active");



        if(normal)
        normal.style.display="none";



        if(open)
        open.style.display="block";


    }
    else{


        button.textContent =
        "Openable: OFF";


        button.classList.remove("active");



        if(normal)
        normal.style.display="block";



        if(open)
        open.style.display="none";


    }


}



start();



// Refresh every second


setInterval(()=>{


    loadItems();


    loadDashboard();


},1000);