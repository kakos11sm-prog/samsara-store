/* Автозапас, если data/store.json не читается (открытие файла без сервера) */
SamsaraStore.applyData({
  "site": {
    "brand": "Сансара",
    "tagline": "Одежда для нового круга",
    "heroText": "Ботинки, шапки, кофты, куртки и перчатки — вещи, которые остаются с вами в городе и за его пределами.",
    "email": "hello@samsara.store",
    "phone": "+380 00 000 00 00",
    "city": "Киев · онлайн"
  },
  "categories": [
    {
      "id": "boots",
      "name": "Ботинки",
      "blurb": "Надёжная подошва и спокойный силуэт",
      "symbol": "Bt",
      "gradient": "linear-gradient(145deg, #3a3228, #1a1612)",
      "video": "media/boots.mp4"
    },
    {
      "id": "hat",
      "name": "Шапка",
      "blurb": "Тёплый верх для холодных дней",
      "symbol": "Hp",
      "gradient": "linear-gradient(145deg, #2e3828, #141810)",
      "video": "media/hat.mp4"
    },
    {
      "id": "sweater",
      "name": "Кофта",
      "blurb": "Мягкий слой на каждый день",
      "symbol": "Kf",
      "gradient": "linear-gradient(145deg, #2a3038, #12161a)",
      "video": "media/sweater.mp4"
    },
    {
      "id": "jacket",
      "name": "Куртка",
      "blurb": "Защита от ветра и дождя",
      "symbol": "Kt",
      "gradient": "linear-gradient(145deg, #323028, #161410)",
      "video": "media/jacket.mp4"
    },
    {
      "id": "gloves",
      "name": "Перчатки",
      "blurb": "Тепло для рук без лишнего объёма",
      "symbol": "Pr",
      "gradient": "linear-gradient(145deg, #28322c, #121612)",
      "video": "media/gloves.mp4"
    }
  ],
  "products": [
    {
      "id": "boots-trail",
      "category": "boots",
      "name": "Trail Ember",
      "price": 4890,
      "description": "Кожаные ботинки на прорезиненной подошве. Для города и коротких маршрутов вне асфальта.",
      "sizes": ["39", "40", "41", "42", "43", "44"],
      "symbol": "Bt",
      "image": "media/products/boots-trail.jpg",
      "images": []
    },
    {
      "id": "boots-harbor",
      "category": "boots",
      "name": "Harbor Soft",
      "price": 4290,
      "description": "Лёгкие ботинки с мягким воротником. Держат форму и не давят на щиколотку.",
      "sizes": ["38", "39", "40", "41", "42", "43"],
      "symbol": "Bt",
      "image": "media/products/boots-harbor.jpg",
      "images": []
    },
    {
      "id": "boots-north",
      "category": "boots",
      "name": "North Cycle",
      "price": 5490,
      "description": "Утеплённая модель с мембраной. Спокойный силуэт, яркая подошва в тон акценту бренда.",
      "sizes": ["40", "41", "42", "43", "44", "45"],
      "symbol": "Bt",
      "image": "media/products/boots-north.jpg",
      "images": []
    },
    {
      "id": "hat-wool",
      "category": "hat",
      "name": "Wool Orbit",
      "price": 890,
      "description": "Плотная шерстяная шапка с едва заметным швом. Не чешется, хорошо сидит.",
      "sizes": ["S", "M", "L"],
      "symbol": "Hp",
      "image": "media/products/hat-wool.jpg",
      "images": [
        { "src": "media/products/hat-wool.jpg", "label": "Чёрная" },
        { "src": "media/products/hat-wool-green.jpg", "label": "Зелёная" }
      ]
    },
    {
      "id": "hat-bean",
      "category": "hat",
      "name": "Quiet Beanie",
      "price": 790,
      "description": "Классическая шапка с подворотом. Мягкий хлопок с лёгким начёсом внутри.",
      "sizes": ["One size"],
      "symbol": "Hp",
      "image": "media/products/hat-bean.jpg",
      "images": [
        { "src": "media/products/hat-bean.jpg", "label": "Чёрная" },
        { "src": "media/products/hat-bean-green.jpg", "label": "Зелёная" }
      ]
    },
    {
      "id": "sweater-loop",
      "category": "sweater",
      "name": "Loop Knit",
      "price": 2490,
      "description": "Вязаная кофта свободного кроя. Дышит и держит тепло без тяжести.",
      "sizes": ["S", "M", "L", "XL"],
      "symbol": "Kf",
      "image": "media/products/sweater-loop.jpg",
      "images": []
    },
    {
      "id": "sweater-pulse",
      "category": "sweater",
      "name": "Pulse Hoodie",
      "price": 2790,
      "description": "Худи с мягким флисом. Карман-кенгуру и аккуратный капюшон без лишних шнурков.",
      "sizes": ["S", "M", "L", "XL"],
      "symbol": "Kf",
      "image": "media/products/sweater-pulse.jpg",
      "images": []
    },
    {
      "id": "sweater-river",
      "category": "sweater",
      "name": "River Crew",
      "price": 2190,
      "description": "Свитшот с круглым вырезом. Плотный футер, спокойный графитовый тон.",
      "sizes": ["XS", "S", "M", "L", "XL"],
      "symbol": "Kf",
      "image": "media/products/sweater-river.jpg",
      "images": []
    },
    {
      "id": "jacket-mist",
      "category": "jacket",
      "name": "Mist Shell",
      "price": 4590,
      "description": "Лёгкая куртка с водоотталкивающей пропиткой. Складывается компактно в свой карман.",
      "sizes": ["S", "M", "L", "XL"],
      "symbol": "Kt",
      "image": "media/products/jacket-mist.jpg",
      "images": []
    },
    {
      "id": "jacket-stone",
      "category": "jacket",
      "name": "Stone Field",
      "price": 5290,
      "description": "Утеплённая куртка на синтепоне. Длиннее обычной — закрывает поясницу на ветру.",
      "sizes": ["S", "M", "L", "XL", "XXL"],
      "symbol": "Kt",
      "image": "media/products/jacket-stone.jpg",
      "images": []
    },
    {
      "id": "gloves-grip",
      "category": "gloves",
      "name": "Grip Soft",
      "price": 690,
      "description": "Перчатки с тачскрином на указательном пальце. Тонкие, но тёплые для города.",
      "sizes": ["S", "M", "L"],
      "symbol": "Pr",
      "image": "media/products/gloves-grip.jpg",
      "images": []
    },
    {
      "id": "gloves-forge",
      "category": "gloves",
      "name": "Forge Knit",
      "price": 840,
      "description": "Вязаные перчатки с усилием на ладони. Для велосипеда и прохладных прогулок.",
      "sizes": ["M", "L", "XL"],
      "symbol": "Pr",
      "image": "media/products/gloves-forge.jpg",
      "images": []
    }
  ]
}
);

