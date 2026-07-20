
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);


app.get("/", (c)=>{
    return c.json({
        name:"PantryCloud API",
        status:"running"
    });
});


// SETTINGS

app.get("/settings", async (c)=>{

    const db=c.env.DB;

    const result=await db
        .prepare(
            "SELECT key,value FROM settings"
        )
        .all();


    const settings={};

    result.results.forEach(row=>{
        settings[row.key]=row.value==="true";
    });


    return c.json(settings);
});


app.put("/settings/:key", async (c)=>{

    const db=c.env.DB;

    const key=c.req.param("key");

    const body=await c.req.json();


    await db.prepare(
        `
        INSERT INTO settings(key,value)
        VALUES(?,?)
        ON CONFLICT(key)
        DO UPDATE SET value=excluded.value
        `
    )
    .bind(
        key,
        String(body.value)
    )
    .run();


    return c.json({
        updated:true
    });

});



// ITEMS


app.get("/items", async (c) => {
    const db = c.env.DB;

    const items = await db.prepare(`
        SELECT
            items.*,
            categories.name AS category,
            locations.name AS location
        FROM items
        LEFT JOIN categories
            ON categories.id = items.category_id
        LEFT JOIN locations
            ON locations.id = items.location_id
        ORDER BY items.created_at DESC
    `).all();

    return c.json(items.results);
});

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

app.get("/debug", async (c) => {
  try {
    const db = c.env.DB;

    const result = await db.prepare(
      "SELECT COUNT(*) AS total FROM items"
    ).first();

    return c.json({
      success: true,
      result
    });

  } catch (err) {
    return c.json({
      success: false,
      error: err.message,
      stack: err.stack
    }, 500);
  }
});



export default app;