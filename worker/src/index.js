import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();


app.use(
  "*",
  cors({
    origin: "*",
    allowMethods:[
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowHeaders:[
      "Content-Type"
    ],
  })
);



// ===============================
// HOME
// ===============================

app.get("/", (c)=>{

    return c.json({

        name:"PantryCloud API",

        status:"running"

    });

});




// ===============================
// SETTINGS
// ===============================


app.get("/settings", async(c)=>{


    const db=c.env.DB;


    const result =
    await db.prepare(
        "SELECT key,value FROM settings"
    ).all();



    const settings={};



    result.results.forEach(row=>{

        settings[row.key] =
        row.value==="true";

    });



    return c.json(settings);


});





app.put("/settings/:key", async(c)=>{


    const db=c.env.DB;


    const key =
    c.req.param("key");


    const body =
    await c.req.json();



    await db.prepare(`

        INSERT INTO settings
        (key,value)

        VALUES (?,?)

        ON CONFLICT(key)

        DO UPDATE SET value=excluded.value

    `)

    .bind(

        key,

        String(body.value)

    )

    .run();



    return c.json({

        updated:true

    });


});








// ===============================
// ITEMS
// ===============================



app.get("/items", async(c)=>{


    const db=c.env.DB;



    const items =
    await db.prepare(`


    SELECT

    items.*,

    categories.name AS category,

    locations.name AS location


    FROM items


    LEFT JOIN categories

    ON categories.id =
    items.category_id


    LEFT JOIN locations

    ON locations.id =
    items.location_id


    ORDER BY created_at DESC


    `).all();



    return c.json(items.results);


});








// ===============================
// ADD ITEM
// ===============================


app.post("/items", async(c)=>{


try{


    const db=c.env.DB;


    const item =
    await c.req.json();



    await db.prepare(`

    INSERT INTO items

    (

    name,

    category_id,

    location_id,

    quantity,

    unit,

    minimum_quantity,

    notes,

    expiry_date,

    openable,

    opened_quantity,

    unopened_quantity

    )


    VALUES

    (?,?,?,?,?,?,?,?,?,?,?)


    `)


    .bind(

        item.name,

        item.category_id ?? null,

        item.location_id ?? null,

        item.quantity ?? 0,

        item.unit ?? "unit",

        item.minimum_quantity ?? 0,

        item.notes ?? "",

        item.expiry_date ?? null,

        item.openable ?? 0,

        item.opened_quantity ?? 0,

        item.unopened_quantity ?? item.quantity ?? 0

    )

    .run();



    return c.json({

        success:true

    });



}

catch(error){


    return c.json({

        success:false,

        error:error.message

    },500);


}



});









// ===============================
// FULL EDIT ITEM
// ===============================


app.put("/items/:id", async(c)=>{


try{


    const db=c.env.DB;


    const id =
    c.req.param("id");


    const item =
    await c.req.json();



    await db.prepare(`


    UPDATE items

    SET


    name=?,

    category_id=?,

    location_id=?,

    quantity=?,

    unit=?,

    minimum_quantity=?,

    notes=?,

    openable=?,

    opened_quantity=?,

    unopened_quantity=?,

    updated_at=CURRENT_TIMESTAMP


    WHERE id=?


    `)

    .bind(


        item.name,


        item.category_id ?? null,


        item.location_id ?? null,


        item.quantity ?? 0,


        item.unit ?? "unit",


        item.minimum_quantity ?? 0,


        item.notes ?? "",


        item.openable ?? 0,


        item.opened_quantity ?? 0,


        item.unopened_quantity ?? item.quantity ?? 0,


        id


    )

    .run();




    return c.json({

        success:true

    });



}

catch(error){


    return c.json({

        success:false,

        error:error.message

    },500);


}


});









// ===============================
// DELETE ITEM
// ===============================


app.delete("/items/:id", async(c)=>{


    const db=c.env.DB;


    await db.prepare(

        "DELETE FROM items WHERE id=?"

    )

    .bind(

        c.req.param("id")

    )

    .run();



    return c.json({

        deleted:true

    });


});









// ===============================
// CATEGORIES
// ===============================


app.get("/categories", async(c)=>{


    const db=c.env.DB;


    const result =
    await db.prepare(

        "SELECT * FROM categories ORDER BY name"

    ).all();



    return c.json(result.results);


});









// ===============================
// LOCATIONS
// ===============================


app.get("/locations", async(c)=>{


    const db=c.env.DB;


    const result =
    await db.prepare(

        "SELECT * FROM locations ORDER BY name"

    ).all();



    return c.json(result.results);


});









// ===============================
// DEBUG
// ===============================


app.get("/debug", async(c)=>{


    const db=c.env.DB;


    const result =
    await db.prepare(

        "SELECT COUNT(*) AS total FROM items"

    ).first();



    return c.json({

        success:true,

        result

    });


});







export default app;
