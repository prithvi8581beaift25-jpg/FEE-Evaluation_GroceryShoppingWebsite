// db.js — SQLite database setup & seeding
const Database = require("better-sqlite3");
const db = new Database("freshmart.db");

// ── Create tables ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,
    created_at TEXT   DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    category    TEXT    NOT NULL,
    price       REAL    NOT NULL,
    unit        TEXT    NOT NULL,
    rating      REAL    DEFAULT 4.5,
    img         TEXT,
    desc        TEXT,
    stock       INTEGER DEFAULT 100,
    badge       TEXT
  );

  CREATE TABLE IF NOT EXISTS cart (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    qty        INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    items       TEXT    NOT NULL,
    subtotal    REAL    NOT NULL,
    delivery    REAL    NOT NULL,
    discount    REAL    DEFAULT 0,
    total       REAL    NOT NULL,
    address     TEXT    NOT NULL,
    status      TEXT    DEFAULT 'confirmed',
    created_at  TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ── Seed products if empty ─────────────────────────────────────
const count = db.prepare("SELECT COUNT(*) as c FROM products").get();
if (count.c === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, price, unit, rating, img, desc, stock, badge)
    VALUES (@name, @category, @price, @unit, @rating, @img, @desc, @stock, @badge)
  `);

  const products = [
    // FRUITS (10)
    { name:"Red Apples",      category:"fruits",     price:80,  unit:"kg",      rating:4.8, img:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",      desc:"Crisp & sweet Shimla apples",           stock:120, badge:null },
    { name:"Bananas",          category:"fruits",     price:40,  unit:"dozen",   rating:4.6, img:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",  desc:"Ripe Robusta bananas",                  stock:200, badge:null },
    { name:"Mangoes",          category:"fruits",     price:120, unit:"kg",      rating:4.9, img:"https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop",      desc:"Alphonso mangoes – king of fruits",     stock:80,  badge:"🔥 Popular" },
    { name:"Grapes",           category:"fruits",     price:90,  unit:"kg",      rating:4.5, img:"https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop",  desc:"Seedless green grapes",                 stock:100, badge:null },
    { name:"Strawberries",     category:"fruits",     price:110, unit:"250g",    rating:4.7, img:"https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",  desc:"Sun-ripened strawberries",              stock:60,  badge:"🌟 Fresh" },
    { name:"Watermelon",       category:"fruits",     price:45,  unit:"kg",      rating:4.4, img:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",  desc:"Sweet seedless watermelon",             stock:50,  badge:null },
    { name:"Oranges",          category:"fruits",     price:70,  unit:"kg",      rating:4.6, img:"https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop",      desc:"Nagpur oranges, full of juice",         stock:150, badge:null },
    { name:"Pomegranate",      category:"fruits",     price:130, unit:"kg",      rating:4.8, img:"https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=400&h=400&fit=crop",  desc:"Ruby-red pomegranate arils",            stock:70,  badge:null },
    { name:"Kiwi",             category:"fruits",     price:150, unit:"4 pcs",   rating:4.7, img:"https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&h=400&fit=crop",  desc:"Vitamin C-packed green kiwi",           stock:80,  badge:"🌟 Fresh" },
    { name:"Pineapple",        category:"fruits",     price:85,  unit:"pc",      rating:4.5, img:"https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=400&h=400&fit=crop",  desc:"Tropical sweet pineapple",              stock:60,  badge:null },
    { name:"Papaya",           category:"fruits",     price:55,  unit:"kg",      rating:4.4, img:"https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400&h=400&fit=crop",  desc:"Ripe & sweet papaya",                   stock:90,  badge:null },
    { name:"Blueberries",      category:"fruits",     price:180, unit:"125g",    rating:4.9, img:"https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop",  desc:"Antioxidant-rich blueberries",          stock:40,  badge:"🔥 Popular" },

    // VEGETABLES (12)
    { name:"Broccoli",         category:"vegetables", price:60,  unit:"head",    rating:4.7, img:"https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop",  desc:"Farm-fresh green broccoli",             stock:100, badge:null },
    { name:"Carrots",          category:"vegetables", price:35,  unit:"kg",      rating:4.5, img:"https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",  desc:"Crunchy orange carrots",                stock:150, badge:null },
    { name:"Tomatoes",         category:"vegetables", price:30,  unit:"kg",      rating:4.4, img:"https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400&h=400&fit=crop",      desc:"Vine-ripened desi tomatoes",            stock:200, badge:null },
    { name:"Spinach",          category:"vegetables", price:25,  unit:"bunch",   rating:4.6, img:"https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",  desc:"Tender baby spinach leaves",            stock:120, badge:"🌟 Fresh" },
    { name:"Bell Peppers",     category:"vegetables", price:55,  unit:"3 pcs",   rating:4.5, img:"https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",      desc:"Mixed red, yellow & green peppers",     stock:90,  badge:null },
    { name:"Onions",           category:"vegetables", price:20,  unit:"kg",      rating:4.3, img:"https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop",  desc:"Nasik red onions",                      stock:300, badge:null },
    { name:"Garlic",           category:"vegetables", price:50,  unit:"250g",    rating:4.7, img:"https://images.unsplash.com/photo-1501420193726-1f65acd36cda?w=400&h=400&fit=crop",  desc:"Aromatic fresh garlic bulbs",           stock:180, badge:null },
    { name:"Cucumber",         category:"vegetables", price:25,  unit:"kg",      rating:4.4, img:"https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop",  desc:"Cool & crispy cucumbers",               stock:160, badge:null },
    { name:"Cauliflower",      category:"vegetables", price:40,  unit:"head",    rating:4.5, img:"https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400&h=400&fit=crop",  desc:"Tender white cauliflower",              stock:80,  badge:null },
    { name:"Potato",           category:"vegetables", price:22,  unit:"kg",      rating:4.3, img:"https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop",  desc:"Starchy Agra potatoes",                 stock:400, badge:null },
    { name:"Green Peas",       category:"vegetables", price:45,  unit:"500g",    rating:4.6, img:"https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=400&fit=crop",  desc:"Sweet tender green peas",               stock:120, badge:"🌟 Fresh" },
    { name:"Mushrooms",        category:"vegetables", price:70,  unit:"200g",    rating:4.7, img:"https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=400&fit=crop",  desc:"Fresh button mushrooms",                stock:70,  badge:null },
    { name:"Zucchini",         category:"vegetables", price:50,  unit:"kg",      rating:4.4, img:"https://images.unsplash.com/photo-1563252722-6434563a985d?w=400&h=400&fit=crop",      desc:"Tender green zucchini",                 stock:90,  badge:null },

    // DAIRY (8)
    { name:"Full Cream Milk",  category:"dairy",      price:58,  unit:"litre",   rating:4.8, img:"https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",      desc:"Fresh cow milk – 3.5% fat",             stock:200, badge:null },
    { name:"Paneer",           category:"dairy",      price:90,  unit:"200g",    rating:4.9, img:"https://media.istockphoto.com/id/2209167127/photo/indian-paneer-cheese-made-from-fresh-milk-and-lemon-juice-on-grey-background-copy-space.webp?a=1&b=1&s=612x612&w=0&k=20&c=PAn7GuHgdN5S4hlXW2lQcUV-OGegD5GuLyvKf-fsr4E=", desc:"Soft homestyle paneer",  stock:150, badge:"🔥 Popular" },
    { name:"Greek Yogurt",     category:"dairy",      price:75,  unit:"400g",    rating:4.7, img:"https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=400&h=400&fit=crop",  desc:"Thick & creamy plain yogurt",           stock:120, badge:null },
    { name:"Butter",           category:"dairy",      price:55,  unit:"100g",    rating:4.6, img:"https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop",  desc:"Salted table butter",                   stock:180, badge:null },
    { name:"Cheddar Cheese",   category:"dairy",      price:140, unit:"200g",    rating:4.7, img:"https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=400&fit=crop",      desc:"Aged sharp cheddar cheese",             stock:80,  badge:null },
    { name:"Whipping Cream",   category:"dairy",      price:95,  unit:"200ml",   rating:4.5, img:"https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=400&fit=crop",  desc:"Fresh whipping cream",                  stock:70,  badge:null },
    { name:"Lassi",            category:"dairy",      price:40,  unit:"500ml",   rating:4.8, img:"https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?w=400&h=400&fit=crop",  desc:"Chilled sweet Punjabi lassi",           stock:100, badge:"🌟 Fresh" },
    { name:"Condensed Milk",   category:"dairy",      price:65,  unit:"400g",    rating:4.6, img:"https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",  desc:"Sweet condensed milk",                  stock:90,  badge:null },

    // BAKERY (6)
    { name:"Sourdough Bread",  category:"bakery",     price:95,  unit:"loaf",    rating:4.9, img:"https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop",  desc:"Slow-fermented sourdough loaf",         stock:50,  badge:"🔥 Popular" },
    { name:"Croissants",       category:"bakery",     price:65,  unit:"4 pcs",   rating:4.8, img:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",      desc:"Buttery flaky croissants",              stock:60,  badge:null },
    { name:"Multigrain Buns",  category:"bakery",     price:50,  unit:"6 pcs",   rating:4.5, img:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",  desc:"Healthy multigrain dinner rolls",       stock:80,  badge:null },
    { name:"Banana Muffins",   category:"bakery",     price:80,  unit:"4 pcs",   rating:4.7, img:"https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop",  desc:"Moist banana-oat muffins",              stock:70,  badge:null },
    { name:"Pita Bread",       category:"bakery",     price:55,  unit:"6 pcs",   rating:4.5, img:"https://images.unsplash.com/photo-1620921594019-8b99d45e7a53?w=400&h=400&fit=crop",  desc:"Soft wholemeal pita pockets",           stock:90,  badge:null },
    { name:"Cinnamon Rolls",   category:"bakery",     price:110, unit:"4 pcs",   rating:4.9, img:"https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&h=400&fit=crop",  desc:"Warm glazed cinnamon rolls",            stock:40,  badge:"🌟 Fresh" },

    // SNACKS (7)
    { name:"Trail Mix",        category:"snacks",     price:140, unit:"300g",    rating:4.6, img:"https://images.unsplash.com/photo-1606833688792-d99a2f2ca755?w=400&h=400&fit=crop",  desc:"Mixed nuts, seeds & dried fruits",      stock:100, badge:null },
    { name:"Popcorn",          category:"snacks",     price:60,  unit:"200g",    rating:4.4, img:"https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&h=400&fit=crop",  desc:"Lightly salted popcorn",                stock:150, badge:null },
    { name:"Rice Cakes",       category:"snacks",     price:85,  unit:"150g",    rating:4.3, img:"https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop",  desc:"Crispy wholegrain rice cakes",          stock:120, badge:null },
    { name:"Dark Chocolate",   category:"snacks",     price:120, unit:"100g",    rating:4.9, img:"https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=400&fit=crop",  desc:"Belgian dark chocolate bar",            stock:80,  badge:"🔥 Popular" },
    { name:"Granola Bars",     category:"snacks",     price:95,  unit:"5 pcs",   rating:4.6, img:"https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=400&h=400&fit=crop",      desc:"Oat & honey granola bars",              stock:110, badge:null },
    { name:"Roasted Almonds",  category:"snacks",     price:160, unit:"200g",    rating:4.7, img:"https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=400&fit=crop",  desc:"Lightly salted roasted almonds",        stock:90,  badge:null },
    { name:"Peanut Butter",    category:"snacks",     price:180, unit:"400g",    rating:4.8, img:"https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?w=400&h=400&fit=crop",      desc:"Creamy natural peanut butter",          stock:70,  badge:"🌟 Fresh" },

    // BEVERAGES (7)
    { name:"Cold-Pressed OJ",  category:"beverages",  price:110, unit:"500ml",   rating:4.8, img:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",  desc:"Fresh cold-pressed orange juice",       stock:100, badge:null },
    { name:"Coconut Water",    category:"beverages",  price:45,  unit:"330ml",   rating:4.7, img:"https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=400&fit=crop",  desc:"Pure tender coconut water",             stock:150, badge:null },
    { name:"Green Tea",        category:"beverages",  price:130, unit:"25 bags", rating:4.6, img:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop",      desc:"Darjeeling first-flush green tea",      stock:120, badge:null },
    { name:"Sparkling Water",  category:"beverages",  price:55,  unit:"750ml",   rating:4.4, img:"https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",      desc:"Natural mineral sparkling water",       stock:200, badge:null },
    { name:"Mango Smoothie",   category:"beverages",  price:90,  unit:"300ml",   rating:4.8, img:"https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop",      desc:"Thick fresh mango smoothie",            stock:80,  badge:"🔥 Popular" },
    { name:"Cold Brew Coffee", category:"beverages",  price:120, unit:"250ml",   rating:4.7, img:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop",  desc:"Smooth slow-steeped cold brew",         stock:60,  badge:null },
    { name:"Turmeric Latte",   category:"beverages",  price:95,  unit:"250ml",   rating:4.6, img:"https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=400&fit=crop",  desc:"Golden milk with turmeric & ginger",    stock:70,  badge:"🌟 Fresh" },

    // NON-VEG (9)
    { name:"Chicken Breast",   category:"nonveg",     price:220, unit:"500g",    rating:4.7, img:"https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop",  desc:"Boneless skinless chicken breast",      stock:100, badge:null },
    { name:"Mutton Keema",     category:"nonveg",     price:380, unit:"500g",    rating:4.6, img:"https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=400&fit=crop",  desc:"Freshly minced goat mutton",            stock:60,  badge:null },
    { name:"Whole Eggs",       category:"nonveg",     price:90,  unit:"12 pcs",  rating:4.8, img:"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=400&fit=crop",  desc:"Free-range brown eggs",                 stock:200, badge:"🔥 Popular" },
    { name:"Salmon Fillet",    category:"nonveg",     price:480, unit:"300g",    rating:4.9, img:"https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400&h=400&fit=crop",  desc:"Atlantic salmon, skin-on fillet",       stock:40,  badge:"🌟 Fresh" },
    { name:"Prawns",           category:"nonveg",     price:350, unit:"500g",    rating:4.7, img:"https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop",  desc:"Tiger prawns, deveined & cleaned",      stock:50,  badge:null },
    { name:"Chicken Sausages", category:"nonveg",     price:160, unit:"6 pcs",   rating:4.5, img:"https://images.unsplash.com/photo-1691480241974-92481cef09ff?w=400&h=400&fit=crop",  desc:"Smoky grilled chicken sausages",        stock:90,  badge:null },
    { name:"Tuna Can",         category:"nonveg",     price:130, unit:"185g",    rating:4.4, img:"https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400&h=400&fit=crop",  desc:"Skipjack tuna in spring water",         stock:120, badge:null },
    { name:"Lamb Chops",       category:"nonveg",     price:490, unit:"400g",    rating:4.8, img:"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=400&fit=crop",  desc:"Tender New Zealand lamb chops",         stock:30,  badge:"🌟 Fresh" },
    { name:"Fish Fillets",     category:"nonveg",     price:260, unit:"400g",    rating:4.6, img:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop",      desc:"Fresh white fish fillets",              stock:70,  badge:null },
  ];

  const insertMany = db.transaction((items) => {
    for (const p of items) insert.run(p);
  });
  insertMany(products);
  console.log(`✅ Seeded ${products.length} products`);
}

module.exports = db;