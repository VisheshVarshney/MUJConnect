export interface MenuItem {
  name: string;
  price: number;
  cuisine: string;
  category: string;
  available: boolean;
  size?: string;
}

export interface Restaurant {
  name: string;
  menu: MenuItem[];
}

export const restaurants: Restaurant[] = [
  {
    name: 'Amul',
    menu: [
      ...Object.entries({
        'Ice Creams': [
          {
            name: 'Vanilla Ice Cream (Single Scoop)',
            price: 40,
            cuisine: 'Indian',
          },
          {
            name: 'Vanilla Ice Cream (Double Scoop)',
            price: 70,
            cuisine: 'Indian',
          },
          {
            name: 'Strawberry Ice Cream (Single Scoop)',
            price: 40,
            cuisine: 'Indian',
          },
          {
            name: 'Strawberry Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Butter Scotch Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Butter Scotch Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Kesar Pasta Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Kesar Pasta Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Mango Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Mango Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Choco Chips Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Choco Chips Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Chocolate Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Chocolate Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Tutti Fruity Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Tutti Fruity Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Raj Bhog Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'American Nuts Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'American Nuts Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Kaju Draksh Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Kaju Draksh Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Afahan Dry Fruit Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Afahan Dry Fruit Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Anjir Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Anjir Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Krime Almonds Nuts Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Krime Almonds Nuts Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Cookies N Cream Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Cookies N Cream Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Moroccan Dry Fruit Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Moroccan Dry Fruit Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Friot Bonanza Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Friot Bonanza Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
          {
            name: 'Pan Ice Cream (Single Scoop)',
            price: 50,
            cuisine: 'Indian',
          },
          {
            name: 'Pan Ice Cream (Double Scoop)',
            price: 90,
            cuisine: 'Indian',
          },
        ],
        Beverages: [
          { name: 'Waffle Cone', price: 10, cuisine: 'Indian' },
          { name: 'Tea', price: 15, cuisine: 'Indian' },
          { name: 'Kulhad Tea', price: 20, cuisine: 'Indian' },
          { name: 'Hot Coffee', price: 30, cuisine: 'Indian' },
          { name: 'Hot Milk', price: 30, cuisine: 'Indian' },
          { name: 'Flavour Hot Milk', price: 50, cuisine: 'Indian' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Havmor',
    menu: [
      ...Object.entries({
        Pizza: [
          {
            name: 'Onion Feast',
            price: 85,
            cuisine: 'Italian',
            description: '(custom veggies)',
          },
          {
            name: 'Margherita',
            price: 99,
            cuisine: 'Italian',
            description: '(Simple Cheese)',
          },
          {
            name: 'Golden Corn',
            price: 110,
            cuisine: 'Italian',
            description: '(Cheese, Corn)',
          },
          {
            name: 'Nova Margherita',
            price: 140,
            cuisine: 'Italian',
            description: '(Extra Cheese On Cheese)',
          },
          {
            name: 'Veggie Paradise',
            price: 140,
            cuisine: 'Italian',
            description: '(Onion, Capsicum, Sweet Corn)',
          },
          {
            name: 'Veggie Deluxe',
            price: 140,
            cuisine: 'Italian',
            description:
              '(Onion, Capsicum, Sweet Corn, Tomato, Olives, Jalapeno)',
          },
          {
            name: 'Country Special',
            price: 160,
            cuisine: 'Italian',
            description: '(Onion, Capsicum, Sweet Corn, Tomato, Red Paprika)',
          },
          {
            name: 'Exotica',
            price: 160,
            cuisine: 'Italian',
            description: '(Jalapeno, Olives, Red Paprika, Capsicum)',
          },
          {
            name: 'Tandoori Paneer',
            price: 170,
            cuisine: 'Italian/Indian',
            description: '(Paneer, Capsicum, Tomato, Onion, Red Paprika)',
          },
          {
            name: 'Paneer Do Pyaza',
            price: 170,
            cuisine: 'Italian/Indian',
            description: '(Onion, Paneer, Red Paprika)',
          },
          {
            name: 'Peppy Paneer',
            price: 190,
            cuisine: 'Italian/Indian',
            description: '(Paneer, Red Capsicum, Red Paprika)',
          },
          {
            name: 'Veggie Supreme',
            price: 190,
            cuisine: 'Italian',
            description:
              '(Onion, Capsicum, Sweet Corn, Tomato, Red Paprika, Jalapeno, Olives, Mushrooms)',
          },
          {
            name: 'Farmhouse',
            price: 200,
            cuisine: 'Italian/Indian',
            description: '(Fried Mushroom, Paneer, Red Capsicum, Golden Corn)',
          },
          {
            name: 'Paneer Makhani',
            price: 240,
            cuisine: 'Indian/Italian',
            description: '(Paneer and Capsicum on Makhani Sauce)',
          },
        ],
        'Garlic Bread': [
          { name: 'Cheese Garlic Bread', price: 80, cuisine: 'Italian' },
          { name: 'Exotica Garlic Bread', price: 99, cuisine: 'Italian' },
          { name: 'Stuffed Garlic Bread', price: 139, cuisine: 'Italian' },
          {
            name: 'Paneer stuffed garlic bread',
            price: 149,
            cuisine: 'Italian/Indian',
          },
          { name: 'Corn stuffed Garlic Bread', price: 149, cuisine: 'Italian' },
        ],
        Pasta: [
          { name: 'White Sauce Pasta', price: 90, cuisine: 'Italian' },
          { name: 'Red Sauce Pasta', price: 90, cuisine: 'Italian' },
          { name: 'Pink Sauce Pasta', price: 110, cuisine: 'Italian' },
          {
            name: 'Makhani Sauce pasta',
            price: 110,
            cuisine: 'Indian/Italian',
          },
          { name: 'Cheese Corn Pasta', price: 110, cuisine: 'Italian' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Zaikaa',
    menu: [
      ...Object.entries({
        Kabab: [
          { name: 'Paneer Tikka (6 Pcs)', price: 280, cuisine: 'Indian' },
          { name: 'Paneer Malai Tikka (6 Pcs)', price: 220, cuisine: 'Indian' },
          {
            name: 'Chicken Lahori Tikka (6 Pcs)',
            price: 200,
            cuisine: 'Indian',
          },
          {
            name: 'Chicken Makhmali Tikka (6 Pcs)',
            price: 220,
            cuisine: 'Indian',
          },
          {
            name: 'Chicken Sheekh Kabab (6 Pcs)',
            price: 200,
            cuisine: 'Indian',
          },
        ],
        'Curries Veg': [
          { name: 'Paneer Butter Masala', price: 200, cuisine: 'Indian' },
          { name: 'Paneer Tikka Lababdar', price: 200, cuisine: 'Indian' },
          { name: 'Paneer Laziz', price: 200, cuisine: 'Indian' },
          { name: 'Kadai Paneer', price: 200, cuisine: 'Indian' },
          { name: 'Paneer Do Pyaaza', price: 200, cuisine: 'Indian' },
          { name: 'Paneer Khurchan', price: 200, cuisine: 'Indian' },
          { name: 'Shahi Paneer', price: 200, cuisine: 'Indian' },
          { name: 'Paneer Handi', price: 200, cuisine: 'Indian' },
          { name: 'Paneer Kolhapuri', price: 200, cuisine: 'Indian' },
          { name: 'Mutter Paneer', price: 200, cuisine: 'Indian' },
          { name: 'Green Peas Masala', price: 160, cuisine: 'Indian' },
          { name: 'Mix Veg Handi', price: 160, cuisine: 'Indian' },
          { name: 'Mushroom Do Pyaaza', price: 180, cuisine: 'Indian' },
          { name: 'Mutter Mushroom', price: 180, cuisine: 'Indian' },
          { name: 'Sev Tamater', price: 160, cuisine: 'Indian' },
          { name: 'Kofta Birbali', price: 180, cuisine: 'Indian' },
          { name: 'Malai Kofta', price: 190, cuisine: 'Indian' },
        ],
        'Curries Non Veg': [
          { name: 'Egg Curry', price: 140, cuisine: 'Indian' },
          { name: 'Chicken Masala', price: 230, cuisine: 'Indian' },
          { name: 'Chicken Do Pyaaza', price: 230, cuisine: 'Indian' },
          { name: 'Chicken Rara', price: 280, cuisine: 'Indian' },
          { name: 'Chicken Keema Masala', price: 260, cuisine: 'Indian' },
          { name: 'Murgh Khurchan', price: 230, cuisine: 'Indian' },
          { name: 'Butter Chicken', price: 230, cuisine: 'Indian' },
          { name: 'Kadai Chicken', price: 230, cuisine: 'Indian' },
          { name: 'Murgh Tikka Lababdar', price: 240, cuisine: 'Indian' },
          { name: 'Chicken Tikka Masala', price: 240, cuisine: 'Indian' },
          { name: 'Chicken Mughlai', price: 250, cuisine: 'Indian' },
          { name: 'Kolhapur Chicken', price: 250, cuisine: 'Indian' },
          { name: 'Mutten Masala', price: 300, cuisine: 'Indian' },
          { name: 'Mutten Roganjosh', price: 320, cuisine: 'Indian' },
        ],
        'Biryani & Rice': [
          { name: 'Veg Biryani', price: 140, cuisine: 'Indian' },
          { name: 'Paneer Tikka Biryani', price: 160, cuisine: 'Indian' },
          { name: 'Egg Biryani', price: 150, cuisine: 'Indian' },
          { name: 'Chicken Dum Biryani', price: 180, cuisine: 'Indian' },
          { name: 'Chicken Tikka Biryani', price: 190, cuisine: 'Indian' },
          { name: 'Achari Chicken Biryani', price: 180, cuisine: 'Indian' },
          { name: 'Mutten Biryani', price: 250, cuisine: 'Indian' },
          { name: 'Veg Pulao', price: 120, cuisine: 'Indian' },
          { name: 'Jeera Rice', price: 120, cuisine: 'Indian' },
          { name: 'Steamed Rice', price: 100, cuisine: 'Indian' },
        ],
        Parathas: [
          { name: 'Aloo Paratha', price: 59, cuisine: 'Indian' },
          { name: 'Aloo Pyaaz Paratha', price: 69, cuisine: 'Indian' },
          { name: 'Paneer Paratha', price: 99, cuisine: 'Indian' },
          { name: 'Masala Cheese Paratha', price: 109, cuisine: 'Indian' },
          { name: 'Chicken Tikka Paratha', price: 129, cuisine: 'Indian' },
          { name: 'Chicken Cheese Paratha', price: 139, cuisine: 'Indian' },
          { name: 'Chicken Keema Paratha', price: 129, cuisine: 'Indian' },
          { name: 'Egg Paratha', price: 99, cuisine: 'Indian' },
        ],
        Breads: [
          { name: 'Plain Roti', price: 12, cuisine: 'Indian' },
          { name: 'Butter Roti', price: 15, cuisine: 'Indian' },
          { name: 'Plain Naan', price: 30, cuisine: 'Indian' },
          { name: 'Butter Naan', price: 35, cuisine: 'Indian' },
          { name: 'Lacha Naan', price: 40, cuisine: 'Indian' },
          { name: 'Lacha Paratha', price: 40, cuisine: 'Indian' },
          { name: 'Garlic Naan', price: 45, cuisine: 'Indian' },
          { name: 'Cheese Naan', price: 60, cuisine: 'Indian' },
        ],
        Extras: [
          { name: 'Papad', price: 20, cuisine: 'Indian' },
          { name: 'Chaach', price: 30, cuisine: 'Indian' },
          { name: 'Lassi', price: 50, cuisine: 'Indian' },
          { name: 'Boondi Raitha', price: 70, cuisine: 'Indian' },
          { name: 'Mix Veg Raitha', price: 70, cuisine: 'Indian' },
          { name: 'Green Salad', price: 60, cuisine: 'Indian' },
        ],
        'Thaali Combos': [
          { name: 'Lunch Thaali Veg', price: 130, cuisine: 'Indian' },
          { name: 'Lunch Thaali Non Veg', price: 160, cuisine: 'Indian' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Zero Degree',
    menu: [
      ...Object.entries({
        hot_beverages: [
          { name: 'Madras Sp. Filter Coffee', price: 20, cuisine: 'Indian' },
          { name: 'Masala Tea', price: 20, cuisine: 'Indian' },
          { name: 'Lemon Tea', price: 20, cuisine: 'Indian' },
          { name: 'Hot Chocolate', price: 25, cuisine: 'Western' },
        ],
        dimsums: [
          { name: 'Veg Dimsums', price: 60, cuisine: 'Chinese' },
          { name: 'Veg Kabab Dimsums', price: 80, cuisine: 'Chinese' },
          { name: 'Paneer Dimsums', price: 90, cuisine: 'Chinese' },
          { name: 'Chicken Dimsums', price: 100, cuisine: 'Chinese' },
        ],
        spring_rolls: [
          { name: 'Veg Spring Roll', price: 90, cuisine: 'Chinese' },
          { name: 'Chicken Spring Roll', price: 100, cuisine: 'Chinese' },
        ],
        burgers: [
          { name: 'Aloo Tikki Burger', price: 100, cuisine: 'Indian' },
          { name: 'Achari Aloo Burger', price: 100, cuisine: 'Indian' },
          { name: 'Crispy Veggie Burger', price: 100, cuisine: 'American' },
          { name: 'Spicy Paneer Burger', price: 100, cuisine: 'Indian' },
          { name: 'Mexican Burger', price: 100, cuisine: 'Mexican' },
          { name: 'Grilled Chicken Burger', price: 100, cuisine: 'American' },
          {
            name: 'Crispy Fried Chicken Burger',
            price: 100,
            cuisine: 'American',
          },
          { name: 'Chicken Burger', price: 100, cuisine: 'American' },
          { name: 'Grilled Mutton Burger', price: 100, cuisine: 'Indian' },
          { name: 'Egg Burger', price: 100, cuisine: 'American' },
        ],
        biryani: [
          { name: 'Veg Biryani', price: 60, cuisine: 'Indian' },
          { name: 'Chicken Biryani', price: 150, cuisine: 'Indian' },
          { name: 'Paneer Biryani', price: 120, cuisine: 'Indian' },
        ],
        pizzas: [
          { name: 'Paneer Capsicum Pizza', price: 100, cuisine: 'Italian' },
          { name: 'Chicken and Corn Pizza', price: 130, cuisine: 'Italian' },
        ],
        fries: [
          { name: 'French Fries', price: 70, cuisine: 'American' },
          { name: 'Peri Peri Fries', price: 80, cuisine: 'American' },
          { name: 'Masala Fries', price: 80, cuisine: 'Indian' },
          { name: 'Melted Cheese Fries', price: 100, cuisine: 'American' },
        ],
        wraps: [
          { name: 'Aloo Tikki Wrap', price: 70, cuisine: 'Indian' },
          { name: 'Spicy Fried Chicken Wrap', price: 90, cuisine: 'American' },
          { name: 'Spicy Paneer Wrap', price: 90, cuisine: 'Indian' },
          { name: 'Tandoori Chicken Tikka Wrap', price: 90, cuisine: 'Indian' },
          { name: 'Mutton Seekh Kabab Wrap', price: 110, cuisine: 'Indian' },
        ],
        sandwiches: [
          {
            name: 'Veggie Delight Sandwich',
            price: 50,
            cuisine: 'Continental',
          },
          {
            name: 'Tandoori Paneer Tikka Sandwich',
            price: 90,
            cuisine: 'Indian',
          },
          { name: 'Mexican Sandwich', price: 80, cuisine: 'Mexican' },
          {
            name: 'Smoky BBQ Chicken Sandwich',
            price: 100,
            cuisine: 'American',
          },
          { name: 'Mutton Seekh Sandwich', price: 130, cuisine: 'Indian' },
        ],
        pasta: [
          { name: 'Red Sauce Pasta', price: 130, cuisine: 'Italian' },
          { name: 'White Sauce Pasta', price: 130, cuisine: 'Italian' },
          { name: 'Mix Sauce Pasta', price: 130, cuisine: 'Italian' },
        ],
        main_meals: [
          { name: 'Chicken Schnitzel', price: 200, cuisine: 'Continental' },
          { name: 'Chicken Parma', price: 220, cuisine: 'Continental' },
          {
            name: 'Peri Peri Chicken & Fries',
            price: 210,
            cuisine: 'American',
          },
          { name: 'Southwest Chicken', price: 210, cuisine: 'American' },
          { name: 'BBQ Chicken & Chips', price: 210, cuisine: 'American' },
          { name: 'Grilled Chicken & Chips', price: 220, cuisine: 'American' },
          { name: 'Fish & Chips', price: 250, cuisine: 'American' },
          { name: 'Chicken with Rice', price: 220, cuisine: 'Continental' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'The Crazy Chef',
    menu: [
      ...Object.entries({
        'Veg Burgers': [
          { name: 'Achari Aloo Burger', price: 60, cuisine: 'Indian' },
          { name: 'Masala Veg Burger', price: 70, cuisine: 'Indian' },
          { name: 'Falafel Burger', price: 90, cuisine: 'Middle Eastern' },
          { name: 'Mexican Bean Burger', price: 90, cuisine: 'Mexican' },
          { name: 'Crispy Paneer Burger', price: 100, cuisine: 'Indian' },
        ],
        'Non-Veg Burgers': [
          { name: 'Simply Chicken Burger', price: 70, cuisine: 'American' },
          { name: 'Tandoori Chicken Burger', price: 100, cuisine: 'Indian' },
          { name: 'Chicken Seekh Burger', price: 100, cuisine: 'Indian' },
          { name: 'Spicy Chicken Burger', price: 100, cuisine: 'American' },
          { name: 'Crazy Chicken Burger', price: 100, cuisine: 'American' },
          { name: 'Italian Parma Burger', price: 100, cuisine: 'Italian' },
          { name: 'Mustard Mutton Burger', price: 140, cuisine: 'Indian' },
          { name: 'Mutton Seekh Burger', price: 140, cuisine: 'Indian' },
          { name: 'Fish Burger', price: 140, cuisine: 'American' },
        ],
        Snacks: [
          { name: 'Garlic Bread', price: 80, cuisine: 'Italian' },
          { name: 'Cheesy Garlic Bread', price: 110, cuisine: 'Italian' },
          { name: 'Chicken Pop Corn', price: 100, cuisine: 'American' },
          { name: 'Paneer Pop Corn', price: 90, cuisine: 'Indian' },
          { name: 'Fried Chicken Wings', price: 160, cuisine: 'American' },
          { name: 'Chicken Salad', price: 220, cuisine: 'Continental' },
          { name: 'Paneer Salad', price: 220, cuisine: 'Continental' },
          { name: 'French Fries', price: 90, cuisine: 'American' },
          { name: 'Cheesy Fries', price: 120, cuisine: 'American' },
        ],
        'Veg Pizzas': [
          {
            name: 'Basil Tomato Margarita Pizza',
            price: 140,
            cuisine: 'Italian',
          },
          { name: 'Corn and Olives Pizza', price: 160, cuisine: 'Italian' },
          { name: 'Exotic Veg Pizza', price: 170, cuisine: 'Italian' },
          { name: 'Paneer Tikka Pizza', price: 170, cuisine: 'Indian-Italian' },
          {
            name: 'Peprika Paneer Pizza',
            price: 170,
            cuisine: 'Indian-Italian',
          },
        ],
        'Non-Veg Pizzas': [
          {
            name: 'Chicken Tikka Pizza',
            price: 180,
            cuisine: 'Indian-Italian',
          },
          {
            name: 'Chicken Seekh Pizza',
            price: 180,
            cuisine: 'Indian-Italian',
          },
          {
            name: 'BBQ Chicken Pizza',
            price: 180,
            cuisine: 'American-Italian',
          },
          {
            name: 'Firebreather Chicken Pizza',
            price: 180,
            cuisine: 'Spicy-Italian',
          },
          { name: 'Chicken Basil Pizza', price: 180, cuisine: 'Italian' },
          { name: 'Chicken Meatball Pizza', price: 190, cuisine: 'Italian' },
          {
            name: 'Triple Chicken Loaded Pizza',
            price: 220,
            cuisine: 'Italian',
          },
        ],
        Sandwiches: [
          { name: 'Bombay Aloo Sandwich', price: 70, cuisine: 'Indian' },
          { name: 'Grilled Veg Sandwich', price: 80, cuisine: 'Continental' },
          {
            name: 'Onion & Cheese Sandwich',
            price: 90,
            cuisine: 'Continental',
          },
          { name: 'Caprese Sandwich', price: 80, cuisine: 'Italian' },
          { name: 'Kadhai Paneer Sandwich', price: 90, cuisine: 'Indian' },
          { name: 'Tandoori Paneer Sandwich', price: 90, cuisine: 'Indian' },
          {
            name: 'Chicken Corn Cheese Sandwich',
            price: 100,
            cuisine: 'Continental',
          },
          { name: 'Spicy Chicken Sandwich', price: 100, cuisine: 'American' },
          { name: 'Tandoori Chicken Sandwich', price: 100, cuisine: 'Indian' },
          { name: 'Kadhai Chicken Sandwich', price: 100, cuisine: 'Indian' },
        ],
        'Loaded Fries': [
          { name: 'Cheesy Italian Fries', price: 130, cuisine: 'Italian' },
        ],
        'Meal Deals': [
          {
            name: 'Meal Deal (Ice Tea + Small Fries)',
            price: 100,
            cuisine: 'American',
          },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'The Italian Oven',
    menu: [
      ...Object.entries({
        'Chaap and Rolls': [
          { name: 'Achari Chaap', price: 160, cuisine: 'Indian' },
          { name: 'Achari Chaap Roll', price: 190, cuisine: 'Indian' },
          { name: 'Afghani Chaap', price: 160, cuisine: 'Indian' },
          { name: 'Afghani Chaap Roll', price: 190, cuisine: 'Indian' },
          { name: 'Afghani Stuff Chaap', price: 180, cuisine: 'Indian' },
          { name: 'Lemon Chaap Roll', price: 190, cuisine: 'Indian' },
        ],
        Sides: [
          { name: 'Spring Roll', price: 99, cuisine: 'Chinese' },
          { name: 'Cheese Garlic Bread', price: 99, cuisine: 'Italian' },
          { name: 'Exotica Garlic Bread', price: 110, cuisine: 'Italian' },
          { name: 'Classic Fries', price: 110, cuisine: 'American' },
          { name: 'Masala Fries', price: 120, cuisine: 'American' },
          { name: 'Peri Peri Fries', price: 120, cuisine: 'American' },
        ],
        'Italian Pizza': [
          { name: 'Classic Margarita', price: 130, cuisine: 'Italian' },
          { name: 'Margarita Loaded Cheese', price: 180, cuisine: 'Italian' },
          { name: 'Veggie Feast', price: 200, cuisine: 'Italian' },
          { name: "Veggie Lover's", price: 200, cuisine: 'Italian' },
          { name: 'Toasted Paneer King Pizza', price: 210, cuisine: 'Italian' },
        ],
        'Hot Beverages': [
          { name: 'Hot Milk Tea', price: 25, cuisine: 'Beverages' },
          { name: 'Black Tea', price: 29, cuisine: 'Beverages' },
          { name: 'Hot Chocolate Tea', price: 39, cuisine: 'Beverages' },
          { name: 'Lemon Tea', price: 39, cuisine: 'Beverages' },
          { name: 'Green Tea', price: 39, cuisine: 'Beverages' },
        ],
        'Cold Beverages': [
          { name: 'Ice Tea', price: 49, cuisine: 'Beverages' },
          { name: 'Lemon Iced Tea', price: 79, cuisine: 'Beverages' },
          { name: 'Virgin Mint Mojito', price: 79, cuisine: 'Beverages' },
          { name: 'Blue Lagoon', price: 79, cuisine: 'Beverages' },
          { name: 'Blue Berry Mojito', price: 79, cuisine: 'Beverages' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Chatkara',
    menu: [
      ...Object.entries({
        'Chaap/Chinese/Momos/More': [
          { name: 'Chole Bhature', price: 100, cuisine: 'Indian' },
          { name: 'Paneer Chole Bhature', price: 120, cuisine: 'Indian' },
          { name: 'Extra Bhatura', price: 35, cuisine: 'Indian' },
          { name: 'Chole Chur Chur Naan', price: 130, cuisine: 'Indian' },
          { name: 'Chole Kulche', price: 100, cuisine: 'Indian' },
          { name: 'Paneer Chole Kulche', price: 120, cuisine: 'Indian' },
          { name: 'Extra Kulcha', price: 30, cuisine: 'Indian' },
          { name: 'Pav Bhaji', price: 100, cuisine: 'Indian' },
          { name: 'Masala Pav Bhaji', price: 110, cuisine: 'Indian' },
          { name: 'Paneer Pav Bhaji', price: 120, cuisine: 'Indian' },
          { name: 'Extra (Pav/Bhaji/Chole)', price: 30, cuisine: 'Indian' },
        ],
        Paratha: [
          { name: 'Aloo Paratha', price: 75, cuisine: 'Indian' },
          { name: 'Aloo Onion Paratha', price: 75, cuisine: 'Indian' },
          { name: 'Laccha Paratha', price: 45, cuisine: 'Indian' },
          { name: 'Paneer Paratha', price: 90, cuisine: 'Indian' },
          { name: 'Veg Keema Paratha', price: 110, cuisine: 'Indian' },
          { name: 'Jungli Paratha', price: 110, cuisine: 'Indian' },
          { name: 'Cheese Paneer Paratha', price: 120, cuisine: 'Indian' },
        ],
        'Veg Combos': [
          {
            name: 'Rajma/Chhole Chawal',
            price: 140,
            cuisine: 'Indian',
            includes: ['Rice', 'Tandoori Roti (2 pcs)'],
          },
          {
            name: 'Kadhai Paneer/Tawa Paneer',
            price: 170,
            cuisine: 'Indian',
            includes: ['Rice', 'Tandoori Roti (2 pcs)'],
          },
          {
            name: 'Paneer Lababdar/Paneer Butter Masala',
            price: 170,
            cuisine: 'Indian',
            includes: ['Rice', 'Tandoori Roti (2 pcs)'],
          },
        ],
        'Non-Veg Combos': [
          {
            name: 'Egg Curry (2 Eggs)',
            price: 150,
            cuisine: 'Indian',
            includes: ['Rice', 'Tandoori Roti (2 pcs)'],
          },
          {
            name: 'Kadhai Chicken/Handi Chicken',
            price: 190,
            cuisine: 'Indian',
            includes: ['Rice', 'Tandoori Roti (2 pcs)'],
          },
          {
            name: 'Butter Chicken/Punjabi Chicken',
            price: 190,
            cuisine: 'Indian',
            includes: ['Rice', 'Tandoori Roti (2 pcs)'],
          },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'China Town',
    menu: [
      ...Object.entries({
        'Soups Veg': [
          { name: 'Veg Sweet Corn Soup', price: 105, cuisine: 'Chinese' },
          { name: 'Veg Hot and Sour Soup', price: 105, cuisine: 'Chinese' },
          { name: 'Veg Clear Soup', price: 105, cuisine: 'Chinese' },
          { name: 'Veg Canton Corn Soup', price: 105, cuisine: 'Chinese' },
          { name: 'Veg Manchow Soup', price: 120, cuisine: 'Chinese' },
        ],
        'Soups Non Veg': [
          { name: 'Chicken Sweet Corn Soup', price: 160, cuisine: 'Chinese' },
          { name: 'Chicken Hot and Sour Soup', price: 160, cuisine: 'Chinese' },
          { name: 'Chicken Clear Soup', price: 160, cuisine: 'Chinese' },
          { name: 'Chicken Canton Corn Soup', price: 160, cuisine: 'Chinese' },
          {
            name: 'Minced Chicken Coriander Soup',
            price: 160,
            cuisine: 'Chinese',
          },
          { name: 'Chicken Manchow Soup', price: 170, cuisine: 'Chinese' },
        ],
        'Appetizers Veg': [
          { name: 'French Fries', price: 110, cuisine: 'Chinese' },
          { name: 'Peri Peri Fries', price: 120, cuisine: 'Chinese' },
          { name: 'Veg Spring Roll', price: 130, cuisine: 'Chinese' },
          { name: 'Veg Salt and Pepper', price: 150, cuisine: 'Chinese' },
          { name: 'Crispy Chilly Potato', price: 150, cuisine: 'Chinese' },
          { name: 'Honey Chilly Potato', price: 180, cuisine: 'Chinese' },
        ],
        'Combo Meals Veg': [
          {
            name: 'Manchurian Combo with Choice of Rice/Noodles',
            price: 200,
            cuisine: 'Chinese',
          },
          {
            name: 'Hot Garlic Sauce Combo with Choice of Rice/Noodles',
            price: 200,
            cuisine: 'Chinese',
          },
          {
            name: 'Paneer Chilly Combo with Choice of Rice/Noodles',
            price: 210,
            cuisine: 'Chinese',
          },
        ],
        'Main Course Non Veg': [
          { name: 'Chilly Chicken Gravy', price: 245, cuisine: 'Chinese' },
          { name: 'Chicken Hot Garlic Sauce', price: 255, cuisine: 'Chinese' },
          { name: 'Chicken Manchurian Gravy', price: 240, cuisine: 'Chinese' },
        ],
        'Dimsum (Momos)': [
          { name: 'Veg Dimsum', price: 130, cuisine: 'Chinese' },
          { name: 'Veg Schezwan Dimsum', price: 140, cuisine: 'Chinese' },
          { name: 'Chicken Dimsum', price: 180, cuisine: 'Chinese' },
          { name: 'Chicken Schezwan Dimsum', price: 190, cuisine: 'Chinese' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Tandoor',
    menu: [
      ...Object.entries({
        'Veg Starters': [
          {
            name: 'Mushroom Matar',
            price: 260,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Mushroom Matar',
            price: 170,
            cuisine: 'Indian',
            size: 'Half',
          },
          { name: 'Paneer Tikka (6 Pcs.)', price: 270, cuisine: 'Indian' },
          {
            name: 'Paneer Malai Tikka (6 Pcs.)',
            price: 280,
            cuisine: 'Indian',
          },
          {
            name: 'Paneer Pudina Tikka (6 Pcs.)',
            price: 270,
            cuisine: 'Indian',
          },
          {
            name: 'Paneer Achari Tikka (6 Pcs.)',
            price: 270,
            cuisine: 'Indian',
          },
          { name: 'Mushroom Tikka', price: 270, cuisine: 'Indian' },
          { name: 'Soya Chaap Tikka', price: 260, cuisine: 'Indian' },
          { name: 'Malai Soya Chaap', price: 260, cuisine: 'Indian' },
        ],
        'Non-Veg Starters': [
          {
            name: 'Tandoori Chicken',
            price: 500,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Tandoori Chicken',
            price: 320,
            cuisine: 'Indian',
            size: 'Half',
          },
          {
            name: 'Chicken Malai Tikka (6 pcs)',
            price: 360,
            cuisine: 'Indian',
          },
          {
            name: 'Chicken Pudina Tikka (6 pcs)',
            price: 360,
            cuisine: 'Indian',
          },
          { name: 'Murg Achari Tikka (6 pcs)', price: 370, cuisine: 'Indian' },
          { name: 'Murgh Tangdi Kabab (4 pcs)', price: 360, cuisine: 'Indian' },
          { name: 'Chicken Seekh Kabab', price: 390, cuisine: 'Indian' },
        ],
        'Veg Gravy': [
          { name: 'Shahi Paneer', price: 280, cuisine: 'Indian', size: 'Full' },
          { name: 'Shahi Paneer', price: 200, cuisine: 'Indian', size: 'Half' },
          {
            name: 'Paneer Butter Masala',
            price: 310,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Paneer Butter Masala',
            price: 220,
            cuisine: 'Indian',
            size: 'Half',
          },
          {
            name: 'Paneer Lababdar',
            price: 280,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Paneer Lababdar',
            price: 200,
            cuisine: 'Indian',
            size: 'Half',
          },
          {
            name: 'Paneer Tikka Masala',
            price: 290,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Paneer Tikka Masala',
            price: 210,
            cuisine: 'Indian',
            size: 'Half',
          },
          { name: 'Kadai Paneer', price: 280, cuisine: 'Indian', size: 'Full' },
          { name: 'Kadai Paneer', price: 200, cuisine: 'Indian', size: 'Half' },
          {
            name: 'Tufani Paneer',
            price: 280,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Tufani Paneer',
            price: 200,
            cuisine: 'Indian',
            size: 'Half',
          },
          {
            name: 'Takatak Paneer',
            price: 280,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Takatak Paneer',
            price: 200,
            cuisine: 'Indian',
            size: 'Half',
          },
          { name: 'Dhaba Paneer', price: 280, cuisine: 'Indian', size: 'Full' },
          { name: 'Dhaba Paneer', price: 200, cuisine: 'Indian', size: 'Half' },
          {
            name: 'Paneer Lazeez',
            price: 285,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Paneer Lazeez',
            price: 205,
            cuisine: 'Indian',
            size: 'Half',
          },
          {
            name: 'Paneer Bhurji',
            price: 270,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Paneer Bhurji',
            price: 190,
            cuisine: 'Indian',
            size: 'Half',
          },
          { name: 'Malai Kofta', price: 290, cuisine: 'Indian', size: 'Full' },
          { name: 'Malai Kofta', price: 210, cuisine: 'Indian', size: 'Half' },
          { name: 'Kaju Curry', price: 290, cuisine: 'Indian', size: 'Full' },
          { name: 'Kaju Curry', price: 210, cuisine: 'Indian', size: 'Half' },
          { name: 'Chana Masala', price: 240, cuisine: 'Indian', size: 'Full' },
          { name: 'Chana Masala', price: 160, cuisine: 'Indian', size: 'Half' },
          { name: 'Mix Veg.', price: 235, cuisine: 'Indian', size: 'Full' },
          { name: 'Mix Veg.', price: 155, cuisine: 'Indian', size: 'Half' },
          {
            name: 'Mushroom Kadai',
            price: 280,
            cuisine: 'Indian',
            size: 'Full',
          },
          {
            name: 'Mushroom Kadai',
            price: 190,
            cuisine: 'Indian',
            size: 'Half',
          },
        ],
        'Rice/Noodles': [
          { name: 'Steamed Rice', price: 140, cuisine: 'Indian' },
          { name: 'Jeera Rice', price: 200, cuisine: 'Indian' },
          { name: 'Veg Pulao', price: 230, cuisine: 'Indian' },
          { name: 'Veg Biryani', price: 260, cuisine: 'Indian' },
          { name: 'Paneer Tikka Biryani', price: 280, cuisine: 'Indian' },
          { name: 'Hyderabadi Biryani', price: 270, cuisine: 'Indian' },
          { name: 'Paneer Mushroom Biryani', price: 280, cuisine: 'Indian' },
          { name: 'Mushroom Biryani', price: 260, cuisine: 'Indian' },
          { name: 'Curd Rice', price: 200, cuisine: 'Indian' },
          { name: 'Dal Khichdi', price: 190, cuisine: 'Indian' },
          { name: 'Veg Chowmein', price: 160, cuisine: 'Chinese' },
          { name: 'Chicken Chowmein', price: 180, cuisine: 'Chinese' },
          { name: 'Hakka Noodles', price: 140, cuisine: 'Chinese' },
          { name: 'Garlic Noodles', price: 150, cuisine: 'Chinese' },
          { name: 'Veg Fried Rice', price: 180, cuisine: 'Chinese' },
          { name: 'Mushroom Fried Rice', price: 190, cuisine: 'Chinese' },
          { name: 'Chicken Fried Rice', price: 220, cuisine: 'Chinese' },
          { name: 'Schezwan Rice', price: 190, cuisine: 'Chinese' },
        ],
        Rolls: [
          { name: 'Veg Roll', price: 110, cuisine: 'Indian' },
          { name: 'Paneer Roll', price: 130, cuisine: 'Indian' },
          { name: 'Paneer Tikka Roll', price: 140, cuisine: 'Indian' },
          { name: 'Mushroom Roll', price: 130, cuisine: 'Indian' },
        ],
        Combos: [
          { name: 'Veg Combo', price: 160, cuisine: 'Indian' },
          { name: 'Non Veg Combo', price: 180, cuisine: 'Indian' },
          { name: 'Tandoor Mini Veg Thali', price: 180, cuisine: 'Indian' },
          { name: 'Tandoor Mini Non Veg Thali', price: 280, cuisine: 'Indian' },
          { name: 'Tandoor Special Veg Thali', price: 260, cuisine: 'Indian' },
          {
            name: 'Tandoor Special Non Veg Thali',
            price: 350,
            cuisine: 'Indian',
          },
        ],
        Breads: [
          { name: 'Tandoori Roti (Plain)', price: 18, cuisine: 'Indian' },
          { name: 'Tandoori Roti (Butter)', price: 21, cuisine: 'Indian' },
          { name: 'Khamiri Roti (Plain)', price: 35, cuisine: 'Indian' },
          { name: 'Khamiri Roti (Butter)', price: 40, cuisine: 'Indian' },
          { name: 'Laccha Paratha (Plain)', price: 55, cuisine: 'Indian' },
          { name: 'Laccha Paratha (Butter)', price: 60, cuisine: 'Indian' },
          {
            name: 'Pudina Laccha Paratha (Plain)',
            price: 55,
            cuisine: 'Indian',
          },
          {
            name: 'Pudina Laccha Paratha (Butter)',
            price: 60,
            cuisine: 'Indian',
          },
          {
            name: 'Stuffed Paratha (Paneer/Aloo/Mix Veg.)',
            price: 95,
            cuisine: 'Indian',
          },
          { name: 'Naan (Plain)', price: 50, cuisine: 'Indian' },
          { name: 'Naan (Butter)', price: 55, cuisine: 'Indian' },
          { name: 'Garlic Naan', price: 75, cuisine: 'Indian' },
          { name: 'Cheese Naan', price: 100, cuisine: 'Indian' },
          { name: 'Cheese Garlic Naan', price: 110, cuisine: 'Indian' },
          { name: 'Chur Chur Naan', price: 85, cuisine: 'Indian' },
          { name: 'Paneer Chur Chur Naan', price: 95, cuisine: 'Indian' },
        ],
        Extras: [
          { name: 'Butter Milk', price: 60, cuisine: 'Indian' },
          { name: 'Lassi', price: 70, cuisine: 'Indian' },
          { name: 'Rose Lassi', price: 80, cuisine: 'Indian' },
          { name: 'Curd Plate', price: 70, cuisine: 'Indian' },
          { name: 'Papad Roasted', price: 35, cuisine: 'Indian' },
          { name: 'Fried Papad', price: 40, cuisine: 'Indian' },
          { name: 'Masala Papad', price: 70, cuisine: 'Indian' },
          { name: 'Green Salad', price: 110, cuisine: 'Indian' },
          { name: 'Boondi Raita', price: 120, cuisine: 'Indian' },
          { name: 'Veg Raita', price: 130, cuisine: 'Indian' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Burger Farm',
    menu: [
      ...Object.entries({
        Beverages: [
          { name: 'Hot Coffee', price: 99, cuisine: 'American' },
          { name: 'Cappuccino', price: 99, cuisine: 'American' },
          { name: 'Cafe Latte', price: 129, cuisine: 'American' },
          { name: 'Hot Chocolate', price: 99, cuisine: 'American' },
          { name: 'Cold Coffee', price: 149, cuisine: 'American' },
          { name: 'Classic Frappe', price: 149, cuisine: 'American' },
          { name: 'Mocha Frappe', price: 169, cuisine: 'American' },
          { name: 'Caramelado Frappe', price: 179, cuisine: 'American' },
          { name: 'Masala Lemonade', price: 89, cuisine: 'Indian' },
          { name: 'Masala Coke Lemonade', price: 89, cuisine: 'Indian' },
          { name: 'Lemon Iced Tea', price: 89, cuisine: 'American' },
          { name: 'Virgin Mojito', price: 109, cuisine: 'International' },
          {
            name: 'Passion Fruit Mojito',
            price: 129,
            cuisine: 'International',
          },
          { name: 'Oreo Shake', price: 149, cuisine: 'American' },
          { name: 'Strawberry Shake', price: 169, cuisine: 'American' },
          { name: 'Gulkand Paan Shake', price: 169, cuisine: 'Indian' },
          {
            name: 'Salted Caramel & Popcorn Shake',
            price: 179,
            cuisine: 'American',
          },
          {
            name: 'Bubble Gum Strawberry Shake',
            price: 179,
            cuisine: 'American',
          },
          { name: 'Kit Kat Shake', price: 189, cuisine: 'American' },
          {
            name: 'Belgian Chocolate Shake',
            price: 199,
            cuisine: 'International',
          },
        ],
        'Farm Wraps': [
          { name: 'Farm Aloo Tikki Wrap', price: 99, cuisine: 'Indian' },
          { name: 'Cheesy Masala Wrap', price: 129, cuisine: 'Indian' },
          { name: 'Farm Spicy Paneer Wrap', price: 209, cuisine: 'Indian' },
          {
            name: 'Farm Spicy Chicken Wrap',
            price: 229,
            cuisine: 'Indian/American',
          },
        ],
        Munchies: [
          { name: 'Veggie Strips', price: 129, cuisine: 'American' },
          { name: 'Cheddar Cheese Doughnuts', price: 129, cuisine: 'American' },
          { name: 'Onion Rings', price: 149, cuisine: 'American' },
          { name: 'Cheese Corn Nuggets', price: 159, cuisine: 'American' },
          { name: 'Chicken Fingers', price: 149, cuisine: 'American' },
          {
            name: 'Chicken Strips (Thyme Flavoured)',
            price: 199,
            cuisine: 'International',
          },
        ],
        Fries: [
          { name: 'Regular Fries', price: 79, cuisine: 'American' },
          { name: 'Medium Fries', price: 99, cuisine: 'American' },
          { name: 'Peri-Peri Fries', price: 99, cuisine: 'International' },
          {
            name: 'Cheesy Peri-Peri Fries',
            price: 149,
            cuisine: 'International',
          },
        ],
        'Gourmet Series': [
          { name: 'Farm Cheese Burst Burger', price: 209, cuisine: 'American' },
          {
            name: 'Crispy Paneer Italia Burger',
            price: 209,
            cuisine: 'Italian/Indian',
          },
          { name: 'Big Fried Chicken Burger', price: 249, cuisine: 'American' },
          {
            name: 'Chicken Cheese Burst Burger',
            price: 279,
            cuisine: 'American',
          },
        ],
        'Farm Classic Meals': [
          { name: 'Go Green Burger', price: 109, cuisine: 'American' },
          { name: 'Popeye Burger', price: 109, cuisine: 'American' },
          {
            name: "Devil's Chicken Delight Burger",
            price: 139,
            cuisine: 'American',
          },
          {
            name: 'Farm Grilled Chicken Burger',
            price: 149,
            cuisine: 'American',
          },
        ],
        'Farm Signature Meals': [
          {
            name: 'Pepper Jack Cheese Burger',
            price: 129,
            cuisine: 'American',
          },
          { name: 'Farm Spicy Paneer Burger', price: 159, cuisine: 'Indian' },
          {
            name: 'Farm Spicy Chicken Burger',
            price: 189,
            cuisine: 'American',
          },
          {
            name: 'Tandoori Chicken Tikka Burger',
            price: 239,
            cuisine: 'Indian',
          },
        ],
        'Pocket Saver Meals': [
          { name: 'Farm Aloo Tikki Burger', price: 55, cuisine: 'Indian' },
          { name: 'Fiery Aloo Tikki Burger', price: 65, cuisine: 'Indian' },
          { name: 'Crispy Masala Burger', price: 79, cuisine: 'Indian' },
          { name: 'Cheesy Masala Burger', price: 89, cuisine: 'Indian' },
          { name: 'Farm Egg Burger', price: 49, cuisine: 'Indian' },
          { name: 'Chicken Burger Shot', price: 89, cuisine: 'American' },
          {
            name: 'Paprika Grilled Chicken Burger',
            price: 99,
            cuisine: 'American',
          },
          {
            name: 'Chicken Pickle Tickle Burger',
            price: 99,
            cuisine: 'American',
          },
        ],
        'Add Ons': [
          { name: 'Regular Fries', price: 39, cuisine: 'American' },
          { name: 'Wheat Bun', price: 10, cuisine: 'General' },
          { name: 'Cheese Slice', price: 18, cuisine: 'American' },
          { name: 'Dip', price: 14, cuisine: 'General' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Cook House',
    menu: [
      ...Object.entries({
        Soups: [
          { name: 'Tomato Basil Soup', price: 120, cuisine: 'International' },
          { name: 'Minestrone Soup', price: 150, cuisine: 'Italian' },
          {
            name: 'Broccoli Almond Soup',
            price: 120,
            cuisine: 'International',
          },
          { name: 'Roasted Tomato Soup', price: 120, cuisine: 'International' },
          { name: 'Mulligatawny Soup', price: 120, cuisine: 'Indian' },
          { name: 'Tomato Dhaniya Shorba', price: 120, cuisine: 'Indian' },
          { name: 'Sweetcorn Soup Veg', price: 110, cuisine: 'Chinese' },
          { name: 'Sweetcorn Soup Non Veg', price: 140, cuisine: 'Chinese' },
          { name: "Hot'n Sour Soup veg", price: 110, cuisine: 'Chinese' },
          { name: "Hot'n Sour Soup nonveg", price: 140, cuisine: 'Chinese' },
          { name: 'Manchaw Soup Veg', price: 110, cuisine: 'Chinese' },
          { name: 'Manchaw Soup non Veg', price: 140, cuisine: 'Chinese' },
          { name: 'Murgh Shejani Shorb', price: 150, cuisine: 'Indian' },
        ],
        Salads: [
          { name: 'Green Salad', price: 70, cuisine: 'General' },
          { name: 'Sprout Salad', price: 120, cuisine: 'Indian' },
          { name: 'Cesar Salad', price: 150, cuisine: 'International' },
          { name: 'Greek Salad', price: 150, cuisine: 'Greek' },
          { name: 'Russian Salad', price: 120, cuisine: 'Russian' },
          { name: 'Power Pack Salad', price: 250, cuisine: 'International' },
        ],
        'Times Pass': [
          {
            name: 'Chilli Garlic Potato Nuggets (8pcs)',
            price: 120,
            cuisine: 'Chinese',
          },
          { name: 'Peri-Peri Fries', price: 120, cuisine: 'International' },
          { name: 'Masala Fries', price: 140, cuisine: 'Indian' },
          {
            name: 'Potato Cheese Pops (8Pcs)',
            price: 140,
            cuisine: 'International',
          },
          {
            name: 'Veggie Finger (6 pcs)',
            price: 120,
            cuisine: 'International',
          },
          {
            name: 'Cottage Cheese Pops (8 pcs)',
            price: 160,
            cuisine: 'Indian',
          },
          { name: 'Cocktail samosa (5 pcs)', price: 100, cuisine: 'Indian' },
          { name: 'Cheese Corn Samosa (5 pcs)', price: 120, cuisine: 'Indian' },
          { name: 'Chicken Nuggets (8pcs)', price: 200, cuisine: 'American' },
          {
            name: 'Chicken Cheese Pops (8pcs)',
            price: 220,
            cuisine: 'American',
          },
          { name: 'Fish Finger', price: 180, cuisine: 'International' },
        ],
        'Maggi Junction': [
          { name: 'Butter Maggi', price: 50, cuisine: 'Indian' },
          { name: 'Cheese Maggi', price: 60, cuisine: 'Indian' },
          {
            name: 'Hot Chilli Garlic Maggi',
            price: 60,
            cuisine: 'Chinese/Indian',
          },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Dialog Cafe',
    menu: [
      ...Object.entries({
        'Coffee Shots': [
          {
            name: 'Espresso Yourself (Single Shot)',
            price: 55,
            cuisine: 'Beverages',
          },
          {
            name: 'Dope Espresso (Double Shot)',
            price: 70,
            cuisine: 'Beverages',
          },
          { name: 'Café Macchiato', price: 70, cuisine: 'Beverages' },
        ],
        'Hot Coffees': [
          { name: 'Café Americano', price: 90, cuisine: 'Beverages' },
          { name: 'Iced Americano', price: 100, cuisine: 'Beverages' },
          { name: 'Cappuccino', price: 120, cuisine: 'Beverages' },
          { name: 'Café Latte', price: 130, cuisine: 'Beverages' },
          { name: 'Café Mocha', price: 130, cuisine: 'Beverages' },
          { name: 'Hazelnut Latte', price: 130, cuisine: 'Beverages' },
          { name: 'Caramel Latte', price: 130, cuisine: 'Beverages' },
        ],
        'Hot Beverages': [
          { name: 'Hot Chocolate', price: 120, cuisine: 'Desserts' },
          { name: 'Nutella Hot Chocolate', price: 140, cuisine: 'Desserts' },
        ],
        'Cold Coffees': [
          { name: 'Café Dialog Frappe', price: 80, cuisine: 'Beverages' },
          { name: 'Irish Iced Frappe', price: 100, cuisine: 'Beverages' },
          {
            name: "Dialog's Dare Devil Frappe",
            price: 110,
            cuisine: 'Beverages',
          },
          { name: 'Crunchy Caramel Frappe', price: 110, cuisine: 'Beverages' },
          { name: 'Hazelnut Frappe', price: 110, cuisine: 'Beverages' },
          {
            name: 'Double Choco Chip Frappe',
            price: 120,
            cuisine: 'Beverages',
          },
        ],
        'Milk Shakes & Smoothies': [
          {
            name: 'Frozen Strawberry Margarita Delight',
            price: 80,
            cuisine: 'Beverages',
          },
          {
            name: 'Chocolate Heaven Pleasure',
            price: 100,
            cuisine: 'Beverages',
          },
          { name: 'Toasted Marsh Mallow', price: 100, cuisine: 'Beverages' },
          {
            name: 'Cadbury-Gems Meets Kit-Kat',
            price: 100,
            cuisine: 'Desserts',
          },
          { name: 'No Cardio Only Oreo', price: 100, cuisine: 'Desserts' },
          {
            name: 'Strawberry Toasted Marsh Mallow',
            price: 100,
            cuisine: 'Desserts',
          },
          { name: 'Nutella Love Story', price: 120, cuisine: 'Desserts' },
          { name: 'Snickers Shake', price: 120, cuisine: 'Desserts' },
          { name: 'Mango Smoothie', price: 130, cuisine: 'Beverages' },
          { name: 'Choco Lava Shake', price: 140, cuisine: 'Desserts' },
          { name: 'Ferrero Rocher Shake', price: 150, cuisine: 'Desserts' },
        ],
        'Crispy Toasties': [
          { name: 'Cheese Garlic Bread', price: 100, cuisine: 'Snacks' },
          {
            name: 'Cheese Garlic Bread Supreme',
            price: 120,
            cuisine: 'Snacks',
          },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Health Bar',
    menu: [
      ...Object.entries({
        Sandwich: [
          {
            name: 'Aloo Cheese Grilled Sandwich',
            price: 50,
            cuisine: 'Healthy',
          },
          {
            name: 'Paneer Cheese Grilled Sandwich',
            price: 70,
            cuisine: 'Healthy',
          },
          { name: 'Spinach Corn Sandwich', price: 60, cuisine: 'Healthy' },
          { name: 'Smoked Chicken Sandwich', price: 90, cuisine: 'Healthy' },
        ],
        Rolls: [
          { name: 'Veg. Roll', price: 50, cuisine: 'Healthy' },
          { name: 'Chicken Cheese Roll', price: 90, cuisine: 'Healthy' },
        ],
        'Cereals & More': [
          { name: 'Corn Flakes', price: 50, cuisine: 'Healthy' },
          {
            name: 'Cut Fruits Basket (4 Seasonal Fruits)',
            price: 60,
            cuisine: 'Healthy',
          },
        ],
        'Egg Station': [
          {
            name: 'Masala Omelette + Butter Toast',
            price: 50,
            cuisine: 'Healthy',
          },
          {
            name: 'Egg White Omelette (Low cholesterol)',
            price: 65,
            cuisine: 'Healthy',
          },
        ],
        Pasta: [
          { name: 'White Sauce Pasta', price: 90, cuisine: 'Healthy' },
          { name: 'Chicken White Sauce Pasta', price: 130, cuisine: 'Healthy' },
        ],
        'Special Noodles': [
          { name: 'Veg. Noodles', price: 50, cuisine: 'Healthy' },
          { name: 'Chicken Noodles', price: 80, cuisine: 'Healthy' },
        ],
        'Rice & More': [
          { name: 'Veg. Fried Rice', price: 80, cuisine: 'Healthy' },
          { name: 'Chicken Brown Fried Rice', price: 100, cuisine: 'Healthy' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Pizza Bakers',
    menu: [
      ...Object.entries({
        Pizzas: [
          {
            name: 'Classic Margherita Cheese',
            price: 99,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Classic Margherita Cheese',
            price: 219,
            cuisine: 'Italian',
            size: 'Medium',
          },
          {
            name: 'Classic Margherita Cheese',
            price: 429,
            cuisine: 'Italian',
            size: 'Large',
          },
          {
            name: 'Double Cheese Margherita',
            price: 219,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Double Cheese Margherita',
            price: 399,
            cuisine: 'Italian',
            size: 'Medium',
          },
          {
            name: 'Double Cheese Margherita',
            price: 669,
            cuisine: 'Italian',
            size: 'Large',
          },
          {
            name: 'Pepper Barbeque Chicken',
            price: 189,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Pepper Barbeque Chicken',
            price: 319,
            cuisine: 'Italian',
            size: 'Medium',
          },
          {
            name: 'Pepper Barbeque Chicken',
            price: 529,
            cuisine: 'Italian',
            size: 'Large',
          },
          {
            name: 'Barbeque Chicken & Onion',
            price: 259,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Barbeque Chicken & Onion',
            price: 469,
            cuisine: 'Italian',
            size: 'Medium',
          },
          {
            name: 'Barbeque Chicken & Onion',
            price: 719,
            cuisine: 'Italian',
            size: 'Large',
          },
          {
            name: 'Chicken Tikka',
            price: 309,
            cuisine: 'Indian-Italian Fusion',
            size: 'Regular',
          },
          {
            name: 'Chicken Tikka',
            price: 579,
            cuisine: 'Indian-Italian Fusion',
            size: 'Medium',
          },
          {
            name: 'Chicken Tikka',
            price: 879,
            cuisine: 'Indian-Italian Fusion',
            size: 'Large',
          },
          {
            name: 'Garden Farm',
            price: 259,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Garden Farm',
            price: 479,
            cuisine: 'Italian',
            size: 'Medium',
          },
          {
            name: 'Garden Farm',
            price: 719,
            cuisine: 'Italian',
            size: 'Large',
          },
          {
            name: 'Veggie Extravagnaza',
            price: 309,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Veggie Extravagnaza',
            price: 599,
            cuisine: 'Italian',
            size: 'Medium',
          },
          {
            name: 'Veggie Extravagnaza',
            price: 899,
            cuisine: 'Italian',
            size: 'Large',
          },
        ],
        Sides: [
          {
            name: 'Stuffed Garlic Bread',
            price: 99,
            cuisine: 'Italian',
            size: 'Regular',
          },
          {
            name: 'Stuffed Garlic Bread',
            price: 169,
            cuisine: 'Italian',
            size: 'Medium',
          },
          { name: 'Chicken Wings', price: 179, cuisine: 'American' },
          { name: 'Cheesy Dip', price: 29, cuisine: 'American' },
        ],
        'Pizza Mania': [
          {
            name: 'Pizza Mania - Cheese & Onion',
            price: 89,
            cuisine: 'Italian',
          },
          {
            name: 'Pizza Mania - Barbeque Chicken',
            price: 159,
            cuisine: 'Italian',
          },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: "Let's Go Live",
    menu: [
      ...Object.entries({
        'Customizable Pasta': [
          {
            name: 'Customizable Pasta (Veg)',
            price: 150,
            cuisine: 'Fusion',
            description:
              'Choose from Penne, Macaroni, Spaghetti, Fusilli with Pink Sauce, White Sauce, Bhuna Masala, Red Sauce, or Makhani Sauce',
          },
          {
            name: 'Customizable Pasta (Non Veg)',
            price: 180,
            cuisine: 'Fusion',
            description:
              'Choose from Penne, Macaroni, Spaghetti, Fusilli with Pink Sauce, White Sauce, Bhuna Masala, Red Sauce, or Makhani Sauce',
          },
        ],
        Naanzas: [
          { name: 'Mushroom Naanza', price: 180, cuisine: 'Fusion' },
          { name: 'Five Pepper Naanza', price: 180, cuisine: 'Fusion' },
          { name: 'Paneer Tikka Naanza', price: 190, cuisine: 'Fusion' },
          { name: 'Farm House Naanza', price: 190, cuisine: 'Fusion' },
          { name: 'African Paneer Naanza', price: 190, cuisine: 'Fusion' },
          { name: 'Malai Paneer Naanza', price: 200, cuisine: 'Fusion' },
          { name: 'Butter Paneer Naanza', price: 200, cuisine: 'Fusion' },
          { name: 'Chicken Tikka Naanza', price: 220, cuisine: 'Fusion' },
          { name: 'African Chicken Naanza', price: 220, cuisine: 'Fusion' },
          { name: 'Loaded Chicken Naanza', price: 240, cuisine: 'Fusion' },
          { name: 'Butter Chicken Naanza', price: 240, cuisine: 'Fusion' },
          { name: 'Chicken Keema Naanza', price: 230, cuisine: 'Fusion' },
          { name: 'Malai Chicken Naanza', price: 230, cuisine: 'Fusion' },
        ],
        Wraps: [
          { name: 'Aloo Tikki Wrap', price: 80, cuisine: 'Fusion' },
          { name: 'Egg Wrap', price: 70, cuisine: 'Fusion' },
          { name: 'Veggie Wrap', price: 80, cuisine: 'Fusion' },
          { name: 'Mexican Patty Wrap', price: 80, cuisine: 'Fusion' },
          { name: 'Aloo Achari Wrap', price: 80, cuisine: 'Fusion' },
          { name: 'Peri Peri Egg Wrap', price: 90, cuisine: 'Fusion' },
          { name: 'Falafel Wrap', price: 90, cuisine: 'Fusion' },
          { name: 'Laccha Egg Wrap', price: 90, cuisine: 'Fusion' },
          { name: 'Paneer Tikka Wrap', price: 100, cuisine: 'Fusion' },
          { name: 'Chicken Tikka Wrap', price: 100, cuisine: 'Fusion' },
          {
            name: 'Chili Garlic Paneer/Chicken Wrap',
            price: 100,
            cuisine: 'Fusion',
          },
        ],
        Sandwiches: [
          { name: 'Veg Cheese', price: 60, cuisine: 'Fusion' },
          { name: 'Veg Bombay SW', price: 80, cuisine: 'Fusion' },
          { name: 'Falafel SW', price: 80, cuisine: 'Fusion' },
          { name: 'Paneer Tikka/Chicken Tikka', price: 100, cuisine: 'Fusion' },
          { name: 'Shawarma Paneer/Chicken', price: 100, cuisine: 'Fusion' },
          { name: 'Veg Kabab SW', price: 80, cuisine: 'Fusion' },
          { name: 'Aloo Tikki SW', price: 80, cuisine: 'Fusion' },
        ],
        Pasta: [
          {
            name: 'Pasta Bolognese Sauce (Veg)',
            price: 160,
            cuisine: 'Fusion',
          },
          {
            name: 'Pasta Bolognese Sauce (Chicken)',
            price: 190,
            cuisine: 'Fusion',
          },
          { name: 'Pasta Pesto Sauce (Veg)', price: 160, cuisine: 'Fusion' },
          {
            name: 'Pasta Pesto Sauce (Chicken)',
            price: 190,
            cuisine: 'Fusion',
          },
          { name: 'Peri Peri Pasta (Veg)', price: 160, cuisine: 'Fusion' },
          { name: 'Peri Peri Pasta (Chicken)', price: 190, cuisine: 'Fusion' },
          { name: 'Cheesy Corn Pasta (Veg)', price: 160, cuisine: 'Fusion' },
          {
            name: 'Cheesy Corn Pasta (Chicken)',
            price: 190,
            cuisine: 'Fusion',
          },
          { name: 'Baked Pasta (Veg)', price: 160, cuisine: 'Fusion' },
          { name: 'Baked Pasta (Chicken)', price: 190, cuisine: 'Fusion' },
          { name: 'Mushroom Sauce Pasta (Veg)', price: 160, cuisine: 'Fusion' },
          {
            name: 'Mushroom Sauce Pasta (Chicken)',
            price: 190,
            cuisine: 'Fusion',
          },
          {
            name: 'Spaghetti Aglio E Olio (Veg)',
            price: 160,
            cuisine: 'Fusion',
          },
          {
            name: 'Spaghetti Aglio E Olio (Chicken)',
            price: 190,
            cuisine: 'Fusion',
          },
          { name: 'Ravioli (Veg)', price: 160, cuisine: 'Fusion' },
          { name: 'Ravioli (Chicken)', price: 190, cuisine: 'Fusion' },
          {
            name: 'Cheesy Jalapeno Pasta (Veg)',
            price: 180,
            cuisine: 'Fusion',
          },
          {
            name: 'Cheesy Jalapeno Pasta (Chicken)',
            price: 200,
            cuisine: 'Fusion',
          },
          { name: 'Mac N Cheese (Veg)', price: 180, cuisine: 'Fusion' },
          { name: 'Mac N Cheese (Chicken)', price: 200, cuisine: 'Fusion' },
        ],
        Snacks: [
          { name: 'French Fries Salted', price: 70, cuisine: 'Fusion' },
          { name: 'French Fries Peri Peri', price: 80, cuisine: 'Fusion' },
          { name: 'Cheesy Fries', price: 110, cuisine: 'Fusion' },
          { name: 'Chili Garlic Poppers', price: 90, cuisine: 'Fusion' },
          { name: 'Pizza Pockets', price: 100, cuisine: 'Fusion' },
          { name: 'Chicken Popcorn', price: 100, cuisine: 'Fusion' },
          { name: 'Chicken Cheese Balls', price: 150, cuisine: 'Fusion' },
        ],
        Momos: [
          { name: 'Veg Momos (Steamed)', price: 80, cuisine: 'Fusion' },
          { name: 'Veg Momos (Fried)', price: 100, cuisine: 'Fusion' },
          { name: 'Paneer Momos', price: 100, cuisine: 'Fusion' },
          { name: 'Chicken Momos (Steamed)', price: 100, cuisine: 'Fusion' },
          { name: 'Chicken Momos (Fried)', price: 120, cuisine: 'Fusion' },
          { name: 'Tandoori Momos (Veg)', price: 100, cuisine: 'Fusion' },
          { name: 'Tandoori Momos (Chicken)', price: 120, cuisine: 'Fusion' },
          { name: 'Chili Garlic Momos (Veg)', price: 110, cuisine: 'Fusion' },
          {
            name: 'Chili Garlic Momos (Chicken)',
            price: 130,
            cuisine: 'Fusion',
          },
          { name: 'BBQ Momos (Veg)', price: 110, cuisine: 'Fusion' },
          { name: 'BBQ Momos (Chicken)', price: 130, cuisine: 'Fusion' },
          { name: 'Peri Peri Momos (Veg)', price: 110, cuisine: 'Fusion' },
          { name: 'Peri Peri Momos (Chicken)', price: 130, cuisine: 'Fusion' },
        ],
        'Brownies & Pancakes': [
          {
            name: 'Single Vanilla (Ice Cream, Pancake/Brownie)',
            price: 20,
            cuisine: 'Fusion',
          },
          {
            name: 'Scoop Chocolate (Ice Cream, Pancake/Brownie)',
            price: 30,
            cuisine: 'Fusion',
          },
          { name: 'Hot Chocolate Brownie', price: 80, cuisine: 'Fusion' },
          { name: 'Vanilla Pancake', price: 110, cuisine: 'Fusion' },
          { name: 'Chocolate Pancake', price: 130, cuisine: 'Fusion' },
          { name: 'Choco Chip Pancake', price: 140, cuisine: 'Fusion' },
          {
            name: 'Nutella Hot Chocolate Brownie',
            price: 120,
            cuisine: 'Fusion',
          },
          { name: 'Nutella Pancake', price: 160, cuisine: 'Fusion' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
  {
    name: 'Divine Snacks',
    menu: [
      ...Object.entries({
        Snacks: [
          { name: 'Samosa', price: 20, cuisine: 'Snacks' },
          { name: 'Samosa Chaat', price: 40, cuisine: 'Snacks' },
          { name: 'Pyaaz Kachori', price: 30, cuisine: 'Snacks' },
          { name: 'Pyaaz Kachori Chaat', price: 50, cuisine: 'Snacks' },
          { name: 'Dahi Papdi Chaat', price: 50, cuisine: 'Snacks' },
          { name: 'Bhel Puri', price: 50, cuisine: 'Snacks' },
        ],
        Burgers: [
          { name: 'Plain Burger', price: 50, cuisine: 'Snacks' },
          { name: 'Cheese Burger', price: 75, cuisine: 'Snacks' },
          { name: 'Paneer Burger', price: 95, cuisine: 'Snacks' },
          { name: 'Double-Cheese Burger', price: 110, cuisine: 'Snacks' },
        ],
        Sandwiches: [
          { name: 'Veg Sandwich', price: 50, cuisine: 'Snacks' },
          { name: 'Paneer-Tikka Sandwich', price: 90, cuisine: 'Snacks' },
          { name: 'Club Sandwich', price: 100, cuisine: 'Snacks' },
        ],
        'Fries and Potatoes': [
          { name: 'French Fries', price: 60, cuisine: 'Snacks' },
          { name: 'Peri-Peri Fries', price: 90, cuisine: 'Snacks' },
          { name: 'Honey-Chilli Potatoes', price: 80, cuisine: 'Snacks' },
        ],
        Chinese: [
          { name: 'Veg Chowmein', price: 70, cuisine: 'Chinese' },
          { name: 'Paneer Chowmein', price: 90, cuisine: 'Chinese' },
          { name: 'Chilli Paneer', price: 120, cuisine: 'Chinese' },
        ],
        'Wraps and Rolls': [
          { name: 'Veg Roll', price: 60, cuisine: 'Snacks' },
          { name: 'Paneer Roll', price: 90, cuisine: 'Snacks' },
        ],
        Maggi: [
          { name: 'Plain Maggi', price: 40, cuisine: 'Snacks' },
          { name: 'Paneer Maggi', price: 100, cuisine: 'Snacks' },
        ],
        Refreshments: [
          { name: 'Ice Tea', price: 40, cuisine: 'Snacks' },
          { name: 'Nimbu Soda', price: 60, cuisine: 'Snacks' },
        ],
        Shakes: [
          { name: 'Oreo Shake', price: 70, cuisine: 'Snacks' },
          { name: 'Mango Shake', price: 70, cuisine: 'Snacks' },
          { name: 'Brownie Shake', price: 80, cuisine: 'Snacks' },
        ],
        'Tadka and Curries': [
          { name: 'Pav Bhaji', price: 80, cuisine: 'Indian' },
          { name: 'Chole Kulche', price: 99, cuisine: 'Indian' },
        ],
      }).flatMap(([category, items]) =>
        items.map((item) => ({
          ...item,
          category,
          available: true,
        }))
      ),
    ],
  },
];
