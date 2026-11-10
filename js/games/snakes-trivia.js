/* ===== SNAKES & TRIVIA (board game) ===== */
const BG_N=56,BG_C=8,BG_R=7,BG_TIME=20;
const BG_SNAKES={17:6,27:12,34:19,41:24,48:31,54:37},BG_LAD={3:15,8:23,20:32,28:43,36:49},BG_BACK=[0,2,3,4,5];
const BG_COL=['#9d253b','#71328b','#247267','#a24b2c','#445d82','#90732a'],BG_RING=['#FF6BB5','#00D2A0','#FFD166','#7C5CFF','#FF6B6B'];
const BG_CATS={sci:['🔬','Science'],geo:['🌍','Geography'],his:['🏛️','History'],ani:['🐾','Animals'],food:['🍕','Food'],spt:['⚽','Sports'],pop:['🎬','Pop Culture'],wrd:['📖','Words'],gen:['🧠','General'],math:['🔢','Math']};
const BG_DN=['','Easy','Medium','Hard','Expert'];
const BG_RAW=`sci|1|Which planet is known as the Red Planet?|Mars|Venus|Jupiter|Mercury
sci|1|Water that freezes becomes what?|Ice|Steam|Smoke|Sand
sci|2|How many planets are in our solar system?|8|7|9|10
sci|2|What is the chemical symbol for water?|H2O|CO2|O2|HO
sci|2|Which gas do plants absorb from the air?|Carbon dioxide|Oxygen|Helium|Hydrogen
sci|2|What is the hardest natural substance?|Diamond|Gold|Iron|Quartz
sci|2|What is the powerhouse of the cell?|Mitochondria|Nucleus|Ribosome|Membrane
sci|3|About how fast does light travel?|300,000 km/s|30,000 km/s|3,000 km/s|3 million km/s
geo|1|Which continent is Egypt in?|Africa|Asia|Europe|Australia
geo|1|What is the largest ocean?|Pacific|Atlantic|Indian|Arctic
geo|2|What is the capital of France?|Paris|Rome|Madrid|Berlin
geo|2|In which country is the city of Tokyo?|Japan|China|Korea|Thailand
geo|3|Which river is the longest in South America?|Amazon|Nile|Orinoco|Danube
geo|3|What is the capital of Australia?|Canberra|Sydney|Melbourne|Perth
geo|4|Which country has the most time zones?|France|Russia|USA|China
geo|2|What is the smallest country in the world?|Vatican City|Monaco|Malta|San Marino
his|1|Which ancient people built the pyramids of Giza?|Egyptians|Romans|Vikings|Aztecs
his|1|Who sailed to the Americas in 1492?|Christopher Columbus|Marco Polo|Magellan|Captain Cook
his|2|In which year did World War II end?|1945|1918|1939|1950
his|2|Which city was the center of the Roman Empire?|Rome|Athens|Paris|Cairo
his|2|Which empire was ruled by Genghis Khan?|Mongol Empire|Ottoman Empire|Persian Empire|Byzantine Empire
his|3|In which year did the Berlin Wall fall?|1989|1979|1991|1969
his|3|Which treaty ended World War I with Germany?|Treaty of Versailles|Treaty of Paris|Treaty of Rome|Treaty of Tordesillas
his|3|Who was the first woman to win a Nobel Prize?|Marie Curie|Rosalind Franklin|Mother Teresa|Florence Nightingale
ani|1|What sound does a cow make?|Moo|Meow|Woof|Quack
ani|1|Which animal is called the King of the Jungle?|Lion|Tiger|Bear|Wolf
ani|2|What is a baby kangaroo called?|Joey|Cub|Kit|Pup
ani|2|Which of these birds cannot fly?|Penguin|Eagle|Parrot|Owl
ani|2|What is the fastest land animal?|Cheetah|Lion|Horse|Leopard
ani|3|How many hearts does an octopus have?|3|1|2|8
ani|3|What is a group of crows called?|A murder|A flock|A pack|A herd
ani|3|Which mammal lays eggs?|Platypus|Dolphin|Bat|Kangaroo
food|1|Which fruit is long and yellow?|Banana|Apple|Grape|Cherry
food|1|Which treat is frozen, sweet and creamy?|Ice cream|Soup|Bread|Rice
food|2|Which country did pizza come from?|Italy|France|Mexico|Greece
food|2|What is sushi traditionally wrapped in?|Seaweed|Lettuce|Paper|Cheese
food|3|Which spice is usually the most expensive by weight?|Saffron|Cinnamon|Pepper|Paprika
food|2|What is tofu made from?|Soybeans|Rice|Wheat|Corn
food|4|Which pastry is used to make baklava?|Phyllo|Puff|Choux|Shortcrust
food|4|Which rice is traditionally used for risotto?|Arborio|Basmati|Jasmine|Brown rice
spt|1|How many players does one soccer team have on the field?|11|9|10|12
spt|1|In which sport do you slam dunk?|Basketball|Tennis|Golf|Rugby
spt|2|How many rings are on the Olympic flag?|5|4|6|7
spt|2|Which sport uses a shuttlecock?|Badminton|Squash|Tennis|Cricket
spt|2|Which country has won the most FIFA World Cups?|Brazil|Germany|Italy|France
spt|2|In tennis, what is a score of zero called?|Love|Nil|Duck|Zero
spt|2|How long is a marathon?|42.2 km|40 km|35 km|45 km
spt|3|Which city hosted the 2016 Summer Olympics?|Rio de Janeiro|London|Beijing|Tokyo
pop|1|Which animated film has a snowman named Olaf?|Frozen|Moana|Cars|Shrek
pop|1|What animal is Simba in The Lion King?|Lion|Tiger|Bear|Cheetah
pop|2|Who wrote the Harry Potter books?|J.K. Rowling|Roald Dahl|C.S. Lewis|Stan Lee
pop|2|How many strings does a standard guitar have?|6|4|5|8
pop|2|Which band sang "Hey Jude"?|The Beatles|Queen|ABBA|The Rolling Stones
pop|2|Who painted "The Starry Night"?|Van Gogh|Picasso|Monet|Da Vinci
pop|3|Who composed the "Moonlight Sonata"?|Beethoven|Mozart|Bach|Chopin
pop|3|Who directed the movie Jurassic Park?|Steven Spielberg|James Cameron|George Lucas|Tim Burton
wrd|1|What is the opposite of "hot"?|Cold|Warm|Big|Fast
wrd|1|Which letter comes right after C?|D|B|E|F
wrd|2|Which word means the same as "big"?|Large|Tiny|Quick|Soft
wrd|2|How many letters are in the English alphabet?|26|24|25|28
wrd|3|Words that sound the same but are spelled differently are called...|Homophones|Synonyms|Antonyms|Acronyms
wrd|3|Which spelling is correct?|Necessary|Neccessary|Necesary|Neccesary
wrd|4|What is the fear of heights called?|Acrophobia|Claustrophobia|Arachnophobia|Agoraphobia
wrd|4|Which word means "to make less severe"?|Mitigate|Exacerbate|Aggravate|Escalate
gen|1|Which animal is known for its black-and-white stripes?|Zebra|Giraffe|Leopard|Hippo
gen|1|What do bees make from nectar?|Honey|Butter|Cheese|Syrup
gen|1|Which musical instrument has black and white keys?|Piano|Violin|Trumpet|Drum
gen|1|Which planet do we live on?|Earth|Mars|Venus|Jupiter
gen|1|What is the largest land animal?|African elephant|Giraffe|Hippopotamus|Rhinoceros
gen|1|Which season comes after spring?|Summer|Autumn|Winter|Monsoon
gen|1|How many colors are traditionally named in a rainbow?|7|5|6|8
gen|1|What is the name for a shape with three sides?|Triangle|Square|Circle|Pentagon
gen|2|Which language is primarily spoken in Brazil?|Portuguese|Spanish|French|Italian
gen|2|What is the currency of Japan?|Yen|Won|Rupee|Peso
gen|2|Which country gifted the Statue of Liberty to the United States?|France|Canada|Spain|Italy
gen|2|What is the tallest mountain above sea level?|Mount Everest|K2|Kilimanjaro|Denali
gen|2|Which metal is liquid at ordinary room temperature?|Mercury|Iron|Copper|Aluminium
gen|2|What is the main ingredient in guacamole?|Avocado|Cucumber|Peas|Spinach
gen|2|What is a young goat called?|Kid|Foal|Calf|Lamb
gen|2|Which ocean lies between Africa and Australia?|Indian Ocean|Atlantic Ocean|Arctic Ocean|Southern Ocean
gen|3|Which element has the chemical symbol Fe?|Iron|Fluorine|Francium|Fermium
gen|3|What is the study of earthquakes called?|Seismology|Meteorology|Ecology|Astronomy
gen|3|What is the longest bone in the human body?|Femur|Tibia|Humerus|Fibula
gen|2|Which planet has the most prominent ring system?|Saturn|Mars|Mercury|Venus
gen|1|In which direction does the Sun rise?|East|West|North|South
gen|2|What do botanists study?|Plants|Rocks|Weather|Stars
gen|2|Which continent has the largest population?|Asia|Africa|Europe|South America
gen|2|What is the capital of Iceland?|Reykjavik|Oslo|Helsinki|Nuuk
gen|3|What is the SI unit of electric current?|Ampere|Volt|Watt|Ohm
gen|4|Which language family does Finnish belong to?|Uralic|Germanic|Romance|Slavic
gen|4|What is the smallest bone in the human body?|Stapes|Femur|Patella|Ulna
gen|4|What is the process by which plants release water vapor called?|Transpiration|Photosynthesis|Germination|Fermentation
gen|4|Which strait separates Asia and North America?|Bering Strait|Gibraltar Strait|Malacca Strait|Bosporus
gen|3|What is the only even prime number?|2|0|4|6
gen|1|Which animal is famous for carrying its home on its back?|Turtle|Rabbit|Fox|Horse
gen|3|Which planet rotates so slowly that its day is longer than its year?|Venus|Mercury|Mars|Neptune
gen|1|Which tool shows directions using a magnetic needle?|Compass|Thermometer|Telescope|Ruler
gen|1|What is a baby dog called?|Puppy|Kitten|Calf|Chick
gen|1|Which farm animal is known for producing wool?|Sheep|Pig|Duck|Goat
gen|1|What do you call water in its gaseous state?|Water vapor|Ice|Dew|Snow
gen|1|Which shape has four equal sides and four right angles?|Square|Triangle|Oval|Pentagon
gen|1|Which bird is often a symbol of peace?|Dove|Crow|Eagle|Ostrich
gen|1|What is the closest star to Earth?|The Sun|Sirius|Proxima Centauri|Vega
gen|1|Which part of a plant usually absorbs water from soil?|Roots|Petals|Fruit|Leaves
gen|1|Which food is made by bees and stored in a honeycomb?|Honey|Jam|Yogurt|Maple syrup
gen|1|Which animal is known for changing its color to blend in?|Chameleon|Penguin|Kangaroo|Dolphin
gen|1|How many days are there in a leap year?|366|364|365|367
gen|1|Which object is used to tell time on a wall?|Clock|Scale|Globe|Microscope
gen|1|Which sense do you use with your ears?|Hearing|Taste|Touch|Smell
gen|1|Which of these animals is a marsupial?|Koala|Panda|Wolf|Seal
gen|1|What is the frozen form of rain called?|Hail|Fog|Steam|Dew
gen|1|Which sport is played at Wimbledon?|Tennis|Cricket|Golf|Rugby
gen|1|What do caterpillars turn into?|Butterflies|Frogs|Beetles|Spiders
gen|2|Which country is home to the ancient city of Petra?|Jordan|Greece|India|Peru
gen|2|What is the largest internal organ in the human body?|Liver|Heart|Lung|Kidney
gen|2|Which gas makes up most of Earth's atmosphere?|Nitrogen|Oxygen|Carbon dioxide|Hydrogen
gen|2|What is the name of the line at zero degrees latitude?|Equator|Prime Meridian|Tropic of Cancer|Arctic Circle
gen|2|Which instrument measures air pressure?|Barometer|Hygrometer|Seismograph|Altimeter
gen|2|Which country is shaped like a boot on a map?|Italy|Greece|Portugal|Croatia
gen|2|What is the largest species of big cat?|Tiger|Lion|Jaguar|Cheetah
gen|2|Which vitamin can the body make when skin is exposed to sunlight?|Vitamin D|Vitamin A|Vitamin C|Vitamin K
gen|2|What is the hardest substance in the human body?|Tooth enamel|Bone|Cartilage|Fingernail
gen|2|Which hypersaline lake on the Jordan-Israel border is famous for its exceptionally high salinity?|Dead Sea|Baltic Sea|Black Sea|North Sea
gen|2|Which country is home to the ancient city of Machu Picchu?|Peru|Chile|Mexico|Bolivia
gen|2|Which natural material is formed from the hardened resin of ancient trees?|Amber|Granite|Pumice|Slate
gen|2|What is the longest river in Europe?|Volga|Danube|Rhine|Seine
gen|2|Which animal is the largest living reptile?|Saltwater crocodile|Komodo dragon|Green anaconda|Nile monitor
gen|2|What is the name for molten rock beneath Earth's surface?|Magma|Lava|Ash|Basalt
gen|2|Which organ pumps blood around the human body?|Heart|Liver|Stomach|Pancreas
gen|2|Which country is famous for the historic Angkor Wat temple complex?|Cambodia|Thailand|Nepal|Myanmar
gen|2|Which part of the eye controls how much light enters?|Iris|Retina|Cornea|Lens
gen|2|What is the largest island in the world, excluding continents?|Greenland|Borneo|Madagascar|New Guinea
gen|3|Which blood type is known as the universal red-cell donor?|O negative|AB positive|A positive|B negative
gen|3|Which planet rotates on its side relative to most planets?|Uranus|Mars|Mercury|Jupiter
gen|3|What is the scientific study of fungi called?|Mycology|Ornithology|Herpetology|Entomology
gen|3|Which ancient writing system used wedge-shaped marks on clay tablets?|Cuneiform|Hieroglyphics|Linear B|Runes
gen|3|What is the name for animals that are most active at dawn and dusk?|Crepuscular|Nocturnal|Diurnal|Aquatic
gen|3|Which layer of Earth's atmosphere contains most of the ozone layer?|Stratosphere|Troposphere|Mesosphere|Thermosphere
gen|3|What is the name of the first artificial satellite launched into space?|Sputnik 1|Explorer 1|Vostok 1|Luna 2
gen|3|Which scientist is associated with the laws of planetary motion?|Johannes Kepler|Louis Pasteur|Gregor Mendel|Dmitri Mendeleev
gen|3|Which is the smallest of the world's major oceans?|Arctic Ocean|Indian Ocean|Atlantic Ocean|Southern Ocean
gen|2|What is the main function of red blood cells?|Carry oxygen|Fight infection|Form antibodies|Digest fats
gen|3|Which ancient civilization developed democracy in Athens?|Ancient Greeks|Phoenicians|Sumerians|Etruscans
gen|3|Which type of rock forms when existing rock is changed by heat and pressure?|Metamorphic|Igneous|Sedimentary|Volcanic ash
gen|3|Which scientist proposed the three laws of motion?|Isaac Newton|James Clerk Maxwell|Charles Darwin|Antoine Lavoisier
gen|3|What is the process called when a solid changes directly into a gas?|Sublimation|Condensation|Deposition|Evaporation
gen|3|Which moon is the largest in the solar system?|Ganymede|Titan|Europa|Earth's Moon
gen|3|Which country contains the region of Transylvania?|Romania|Hungary|Bulgaria|Serbia
gen|4|What is the name of the point in an orbit closest to the Sun?|Perihelion|Aphelion|Perigee|Zenith
gen|4|Which scientist first described the circulation of blood through the body?|William Harvey|Andreas Vesalius|Edward Jenner|Robert Hooke
gen|4|What is the name of the supercontinent that existed before today's continents drifted apart?|Pangaea|Gondwana|Laurasia|Rodinia
gen|4|Which element is named after the Swedish village where it was discovered?|Ytterbium|Germanium|Polonium|Americium
gen|3|What is the branch of mathematics that studies rates of change?|Calculus|Topology|Number theory|Combinatorics
gen|4|Which treaty formally established the European Union in 1993?|Maastricht Treaty|Treaty of Versailles|Treaty of Utrecht|Treaty of Lisbon
gen|4|What is the name of the boundary around a black hole beyond which light cannot escape?|Event horizon|Accretion disk|Singularity|Photon sphere
gen|4|Which enzyme in saliva begins the digestion of starch?|Amylase|Pepsin|Lipase|Lactase
gen|4|What is the term for the number of cycles a wave completes per second?|Frequency|Amplitude|Wavelength|Phase
gen|4|Which layer of the Sun is visible as its apparent surface?|Photosphere|Corona|Chromosphere|Core
gen|4|What is the name for a word or phrase that reads the same backward and forward?|Palindrome|Anagram|Oxymoron|Homonym
gen|4|Which branch of biology focuses on the classification of organisms?|Taxonomy|Cytology|Embryology|Ethology
gen|4|What is the name of the ancient trade route linking China with the Mediterranean?|Silk Road|Amber Road|Royal Road|Incense Route
gen|3|Which number is represented by the Roman numeral XL?|40|60|90|15
gen|4|What is the term for the point in an orbit farthest from Earth?|Apogee|Perigee|Aphelion|Perihelion
gen|4|Which fundamental force holds protons and neutrons together in an atomic nucleus?|Strong nuclear force|Electromagnetic force|Gravity|Weak nuclear force
gen|4|What is the study of the origin and history of words called?|Etymology|Phonetics|Syntax|Lexicography
gen|1|How many days are in a week?|7|5|6|8
gen|1|What color do you get by mixing blue and yellow?|Green|Purple|Orange|Brown
gen|1|Which animal says "moo"?|Cow|Sheep|Horse|Duck
gen|1|How many legs does a spider have?|8|6|4|10
gen|1|Which fruit is famous for keeping the doctor away?|Apple|Banana|Orange|Grape
gen|1|Which shape has four equal sides?|Square|Triangle|Circle|Oval
gen|1|How many months are in a year?|12|10|11|13
gen|1|Which bird cannot fly and lives in Antarctica?|Penguin|Eagle|Parrot|Owl
gen|1|What do we call a baby dog?|Puppy|Kitten|Cub|Calf
sci|1|What do plants need to grow besides water and soil?|Sunlight|Moonlight|Sugar|Wind
sci|1|Which body part do you use to see?|Eyes|Ears|Nose|Hands
sci|1|What is the star at the center of our solar system?|The Sun|The Moon|Mars|Polaris
sci|1|What do bees collect from flowers?|Nectar|Sand|Water|Seeds
sci|1|Which of these is a mammal?|Dolphin|Shark|Trout|Octopus
geo|1|On which continent is Brazil?|South America|Africa|Europe|Asia
geo|1|What is the capital city of the Philippines?|Manila|Cebu|Davao|Quezon City
geo|1|Which is the largest continent?|Asia|Africa|Europe|Antarctica
geo|1|What is the frozen continent at the South Pole called?|Antarctica|Greenland|Iceland|Siberia
his|1|Who was the first person to walk on the Moon?|Neil Armstrong|Buzz Aldrin|Yuri Gagarin|John Glenn
his|1|What did the ancient Egyptians write on?|Papyrus|Plastic|Newspaper|Rubber
gen|2|How many sides does a hexagon have?|6|5|7|8
gen|2|Which instrument has 88 keys?|Piano|Guitar|Harp|Flute
gen|2|What is the main language spoken in Mexico?|Spanish|Portuguese|Mexican|English
gen|2|Which grain is the base of sushi?|Rice|Wheat|Oats|Barley
gen|2|Which company created the iPhone?|Apple|Samsung|Nokia|Google
gen|2|Which board game has a king, queen and pawns?|Chess|Checkers|Monopoly|Scrabble
gen|2|What is the Japanese art of paper folding called?|Origami|Ikebana|Kabuki|Bonsai
gen|2|Which fairy-tale character left behind a glass slipper?|Cinderella|Snow White|Rapunzel|Belle
gen|2|Which vitamin do we get from sunlight?|Vitamin D|Vitamin C|Vitamin A|Vitamin B12
gen|2|Which animal is the tallest in the world?|Giraffe|Elephant|Ostrich|Camel
sci|2|What force pulls objects toward the Earth?|Gravity|Magnetism|Friction|Inertia
sci|2|Which organ pumps blood around the body?|Heart|Lungs|Liver|Kidney
sci|2|Which gas do humans need to breathe in to live?|Oxygen|Nitrogen|Helium|Argon
sci|2|Which planet is closest to the Sun?|Mercury|Venus|Earth|Mars
sci|2|At what temperature does water boil at sea level?|100°C|90°C|120°C|80°C
sci|2|What are baby frogs called?|Tadpoles|Pups|Calves|Chicks
sci|2|How many bones does an adult human have?|206|106|306|412
geo|2|Which country is shaped like a boot?|Italy|Greece|Spain|Portugal
geo|2|What is the capital of Canada?|Ottawa|Toronto|Vancouver|Montreal
geo|2|Which is the largest hot desert in the world?|Sahara|Gobi|Kalahari|Mojave
geo|2|Which river flows through Egypt?|Nile|Amazon|Congo|Tigris
geo|2|What is the capital of Thailand?|Bangkok|Hanoi|Jakarta|Manila
geo|2|Which is the largest island in the Philippines?|Luzon|Mindanao|Cebu|Palawan
his|2|Who painted the Mona Lisa?|Leonardo da Vinci|Michelangelo|Raphael|Van Gogh
his|2|Which ship sank in 1912 after hitting an iceberg?|Titanic|Lusitania|Britannic|Bismarck
his|2|Who was the first President of the United States?|George Washington|Abraham Lincoln|Thomas Jefferson|John Adams
his|2|Who is widely regarded as the national hero of the Philippines?|José Rizal|Andrés Bonifacio|Emilio Aguinaldo|Apolinario Mabini
gen|2|Which painter famously cut off part of his own ear?|Vincent van Gogh|Pablo Picasso|Claude Monet|Salvador Dalí
gen|3|Which composer wrote "The Four Seasons"?|Vivaldi|Mozart|Bach|Beethoven
gen|2|In chess, which piece moves only diagonally?|Bishop|Rook|Knight|Pawn
gen|2|What is the Spanish word for "thank you"?|Gracias|Merci|Danke|Grazie
gen|2|Which tennis tournament is played on grass in London?|Wimbledon|US Open|Roland Garros|Australian Open
gen|3|How many strings does a standard violin have?|4|5|6|3
gen|2|What does CPU stand for?|Central Processing Unit|Computer Personal Unit|Central Program Utility|Core Power Unit
gen|3|Which language has the most native speakers?|Mandarin Chinese|English|Spanish|Hindi
sci|2|What is the chemical symbol for gold?|Au|Ag|Gd|Go
sci|2|Which planet has the Great Red Spot?|Jupiter|Mars|Saturn|Neptune
sci|2|What is the largest organ of the human body?|Skin|Liver|Brain|Lungs
sci|2|What type of animal is a Komodo dragon?|Lizard|Snake|Crocodile|Turtle
sci|2|What process do plants use to make their food?|Photosynthesis|Respiration|Digestion|Fermentation
sci|2|Which blood cells carry oxygen?|Red blood cells|White blood cells|Platelets|Plasma
sci|3|Which star is closest to Earth after the Sun?|Proxima Centauri|Sirius|Betelgeuse|Vega
geo|3|Which is the longest river in Asia?|Yangtze|Mekong|Ganges|Indus
geo|3|What is the capital of Turkey?|Ankara|Istanbul|Izmir|Bursa
geo|3|Which strait separates Spain from Morocco?|Strait of Gibraltar|Bosphorus|Strait of Hormuz|Strait of Malacca
geo|3|In which country is Mount Kilimanjaro?|Tanzania|Kenya|Uganda|Ethiopia
geo|2|Which is the deepest ocean trench?|Mariana Trench|Tonga Trench|Java Trench|Puerto Rico Trench
geo|3|What is the capital of Brazil?|Brasília|Rio de Janeiro|São Paulo|Salvador
geo|3|Lake Titicaca lies on the border of Peru and which country?|Bolivia|Chile|Ecuador|Colombia
his|2|Which civilization built Machu Picchu?|Inca|Aztec|Maya|Olmec
his|3|Who discovered penicillin?|Alexander Fleming|Louis Pasteur|Marie Curie|Joseph Lister
his|3|Which explorer led the Spanish expedition that reached the Philippines in 1521?|Ferdinand Magellan|Christopher Columbus|Vasco da Gama|Miguel López de Legazpi
his|2|Who led India's nonviolent independence movement?|Mahatma Gandhi|Jawaharlal Nehru|Subhas Chandra Bose|Bhagat Singh
his|3|Which queen ruled Britain for 63 years until 1901?|Queen Victoria|Elizabeth I|Queen Anne|Mary I
his|3|The Renaissance began in which country?|Italy|France|England|Spain
gen|3|Which Russian author wrote "War and Peace"?|Leo Tolstoy|Fyodor Dostoevsky|Anton Chekhov|Nikolai Gogol
gen|2|Which Greek mathematician is linked to the a²+b²=c² theorem?|Pythagoras|Euclid|Archimedes|Fibonacci
gen|3|Which artist painted "The Persistence of Memory"?|Salvador Dalí|Pablo Picasso|René Magritte|Joan Miró
gen|3|Which Japanese poem form has three lines of 5-7-5 syllables?|Haiku|Tanka|Sonnet|Limerick
gen|2|Which programming language is named after a snake?|Python|Java|Swift|Rust
gen|3|Which city hosted the first modern Olympic Games in 1896?|Athens|Paris|London|Rome
gen|3|Who composed the Ninth Symphony with "Ode to Joy"?|Beethoven|Mozart|Brahms|Schubert
sci|4|Which subatomic particle carries a negative charge?|Electron|Proton|Neutron|Quark
sci|3|What is the pH of pure water at 25°C?|7|0|14|5
sci|3|What is the SI unit of force?|Newton|Joule|Watt|Pascal
sci|2|Who proposed the theory of general relativity?|Albert Einstein|Isaac Newton|Niels Bohr|Max Planck
sci|2|What is the most abundant gas in Earth's atmosphere?|Nitrogen|Oxygen|Carbon dioxide|Argon
sci|2|Which element has atomic number 1?|Hydrogen|Helium|Lithium|Carbon
sci|1|What is the name of the galaxy we live in?|Milky Way|Andromeda|Triangulum|Whirlpool
sci|2|In human cells, where is most DNA found?|Nucleus|Cytoplasm|Vacuole|Lysosome
geo|4|Which country has the longest coastline in the world?|Canada|Russia|Australia|Indonesia
geo|4|What is the capital of Kazakhstan?|Astana|Almaty|Tashkent|Bishkek
geo|4|Which African country was formerly known as Abyssinia?|Ethiopia|Eritrea|Somalia|Sudan
geo|3|What is the tallest waterfall in the world?|Angel Falls|Niagara Falls|Victoria Falls|Iguazu Falls
geo|3|Which lake is the deepest in the world?|Lake Baikal|Lake Superior|Lake Tanganyika|Lake Victoria
his|3|Which battle ended Napoleon's rule in 1815?|Waterloo|Austerlitz|Trafalgar|Borodino
his|3|Who was the first woman to fly solo across the Atlantic?|Amelia Earhart|Bessie Coleman|Harriet Quimby|Jacqueline Cochran
his|4|Which dynasty built most of the surviving Great Wall?|Ming|Qin|Han|Tang
his|4|In what year did the Philippines declare independence from Spain?|1898|1946|1872|1521
his|3|Which charter signed in 1215 limited King John's power?|Magna Carta|Bill of Rights|Domesday Book|Declaration of Arbroath
his|4|Who co-wrote The Communist Manifesto with Karl Marx?|Friedrich Engels|Vladimir Lenin|Leon Trotsky|Mikhail Bakunin
sci|3|What is the chemical symbol for sodium?|Na|So|Sd|Sn
sci|3|Which organ produces insulin?|Pancreas|Liver|Kidney|Spleen
sci|3|What is the process by which a cell divides into two identical cells?|Mitosis|Meiosis|Osmosis|Diffusion
sci|3|Which scientist is credited with discovering the electron?|J.J. Thomson|Ernest Rutherford|Niels Bohr|James Chadwick
sci|3|Which type of chemical bond involves sharing pairs of electrons?|Covalent bond|Ionic bond|Hydrogen bond|Metallic bond
sci|3|Roughly how fast does sound travel through air at sea level?|343 m/s|34 m/s|3,430 m/s|300,000 m/s
sci|3|A lack of which vitamin causes scurvy?|Vitamin C|Vitamin D|Vitamin A|Vitamin K
sci|3|What is the most abundant element in the universe?|Hydrogen|Helium|Oxygen|Carbon
sci|3|Which cell structure contains chlorophyll?|Chloroplast|Mitochondrion|Nucleus|Golgi apparatus
sci|3|What is the atomic number of carbon?|6|12|8|4
sci|3|Which planet has the shortest year?|Mercury|Venus|Mars|Earth
sci|3|What does a seismograph measure?|Earthquake waves|Wind speed|Air pressure|Rainfall
sci|3|Which organelle is the site of protein synthesis in a cell?|Ribosome|Lysosome|Golgi apparatus|Vacuole
sci|3|Which hormone is mainly responsible for regulating sleep cycles?|Melatonin|Cortisol|Insulin|Adrenaline
sci|3|Which metal is the best conductor of electricity?|Silver|Copper|Gold|Aluminium
sci|4|Which scientist discovered the neutron in 1932?|James Chadwick|Ernest Rutherford|J.J. Thomson|Niels Bohr
sci|4|Which metal has the highest melting point?|Tungsten|Titanium|Platinum|Iron
sci|4|The Chandrasekhar limit describes the maximum mass of what?|A white dwarf star|A neutron star|A black hole|A planet
sci|4|Which law states that the pressure and volume of a gas are inversely proportional at constant temperature?|Boyle's law|Charles's law|Avogadro's law|Ohm's law
sci|4|What type of galaxy is the Milky Way?|Barred spiral|Elliptical|Irregular|Lenticular
sci|4|Which element is the most electronegative?|Fluorine|Oxygen|Chlorine|Nitrogen
sci|4|Which particle carries the electromagnetic force?|Photon|Gluon|W boson|Graviton
sci|4|What is the approximate age of the universe?|13.8 billion years|4.5 billion years|1 trillion years|6 billion years
sci|4|Which planet has the large moon Triton?|Neptune|Uranus|Saturn|Jupiter
sci|4|Which scientist formulated the uncertainty principle?|Werner Heisenberg|Erwin Schrödinger|Max Born|Paul Dirac
sci|4|Which gas is the main component of the atmosphere of Mars?|Carbon dioxide|Nitrogen|Oxygen|Methane
geo|3|Which country is the city of Timbuktu in?|Mali|Niger|Mauritania|Senegal
geo|3|What is the capital of New Zealand?|Wellington|Auckland|Christchurch|Hamilton
geo|3|Which river flows through Baghdad?|Tigris|Euphrates|Nile|Jordan
geo|3|Which is the largest country in Africa by area?|Algeria|Sudan|Democratic Republic of the Congo|Libya
geo|3|Which is the world's largest inland body of water?|Caspian Sea|Black Sea|Dead Sea|Aral Sea
geo|3|Which country has the most natural lakes?|Canada|Russia|United States|Finland
geo|3|Which is the longest mountain range above water?|Andes|Rockies|Himalayas|Alps
geo|3|Which desert covers much of Botswana?|Kalahari|Namib|Gobi|Sahara
geo|4|Which country has the most islands in the world?|Sweden|Indonesia|Philippines|Canada
geo|4|What is the capital of Bhutan?|Thimphu|Kathmandu|Dhaka|Paro
geo|4|Which two countries share the longest international land border?|Canada and the United States|Russia and China|Argentina and Chile|India and Bangladesh
geo|4|What is the highest mountain in South America?|Aconcagua|Chimborazo|Huascarán|Illimani
geo|4|Which is the largest lake in Africa by area?|Lake Victoria|Lake Tanganyika|Lake Malawi|Lake Chad
his|3|Which pharaoh's nearly intact tomb was discovered in 1922?|Tutankhamun|Ramses II|Khufu|Akhenaten
his|3|Who was the first emperor of Rome?|Augustus|Julius Caesar|Nero|Caligula
his|3|Which conflict was fought between the houses of Lancaster and York?|Wars of the Roses|Hundred Years' War|English Civil War|Crimean War
his|3|Which empire was ruled by Montezuma II?|Aztec Empire|Inca Empire|Maya civilization|Olmec civilization
his|3|Which ancient wonder stood on the island of Pharos near Alexandria?|The Lighthouse|The Hanging Gardens|The Colossus|The Temple of Artemis
his|3|In which year did the French Revolution begin?|1789|1776|1804|1815
his|3|Who nailed the 95 Theses to a church door in 1517?|Martin Luther|John Calvin|Erasmus|Thomas More
his|3|At which 1805 naval battle did Admiral Nelson die?|Trafalgar|Waterloo|Jutland|Copenhagen
his|4|Which Roman general crossed the Rubicon in 49 BC?|Julius Caesar|Pompey|Mark Antony|Scipio
his|4|Which dynasty ruled China immediately before the Qing?|Ming|Han|Tang|Song
his|4|In which year was the Battle of Hastings fought?|1066|1166|1086|1006
his|4|Which 1648 treaty ended the Thirty Years' War?|Peace of Westphalia|Treaty of Utrecht|Treaty of Trianon|Congress of Vienna
his|4|Who was crowned Emperor of the Romans by the Pope in 800?|Charlemagne|Otto I|Frederick Barbarossa|Constantine
his|4|Which Mughal emperor commissioned the Taj Mahal?|Shah Jahan|Akbar|Babur|Aurangzeb
his|4|In which year did the Ottomans capture Constantinople?|1453|1492|1389|1204
his|4|In which year did the Chernobyl disaster happen?|1986|1979|1991|1983
ani|3|What is the largest species of penguin?|Emperor penguin|King penguin|Adélie penguin|Gentoo penguin
ani|3|Which land animal has the longest pregnancy?|Elephant|Giraffe|Rhinoceros|Hippopotamus
ani|3|What is a group of lions called?|A pride|A pack|A herd|A troop
ani|3|Which living bird lays the largest egg?|Ostrich|Emu|Albatross|Eagle
ani|3|Which is the only mammal capable of true flight?|Bat|Flying squirrel|Sugar glider|Colugo
ani|4|What is a group of flamingos called?|A flamboyance|A pride|A parliament|A murder
ani|4|Which land animal has the highest blood pressure?|Giraffe|Elephant|Blue whale|Ostrich
ani|4|Which is the largest living species of shark?|Whale shark|Great white shark|Basking shark|Tiger shark
ani|4|Which animal is known for having fingerprints very similar to humans'?|Koala|Chimpanzee|Gorilla|Raccoon
food|3|What is the main ingredient of hummus?|Chickpeas|Lentils|Black beans|Soybeans
food|3|Which cheese is traditionally used in a Greek salad?|Feta|Gouda|Cheddar|Brie
food|3|What is the Japanese dish of thinly sliced raw fish served without rice called?|Sashimi|Sushi|Tempura|Teriyaki
food|3|What is the main ingredient in traditional Italian pesto?|Basil|Parsley|Spinach|Mint
food|3|Which nut is used to make marzipan?|Almond|Cashew|Walnut|Pistachio
food|3|What does the Scoville scale measure?|Spiciness of peppers|Sweetness|Saltiness|Acidity
food|4|Which classic French sauce is made from butter, egg yolks and lemon juice?|Hollandaise|Béchamel|Velouté|Espagnole
food|4|Which grain is used to make the Ethiopian flatbread injera?|Teff|Barley|Maize|Sorghum
spt|3|Which country hosted the 2018 FIFA World Cup?|Russia|Brazil|Qatar|Germany
spt|3|In golf, what is one stroke under par called?|Birdie|Eagle|Bogey|Albatross
spt|3|How many points is a touchdown worth in American football?|6|7|3|5
spt|3|Who won a record 23 Olympic gold medals in swimming?|Michael Phelps|Ian Thorpe|Mark Spitz|Ryan Lochte
spt|3|What is the highest possible score in a single game of ten-pin bowling?|300|200|250|400
spt|4|Which country won the first FIFA World Cup in 1930?|Uruguay|Brazil|Argentina|Italy
spt|4|Which country has won the most Summer Olympic gold medals overall?|United States|Soviet Union|China|Great Britain
pop|3|Which artist painted "Girl with a Pearl Earring"?|Johannes Vermeer|Rembrandt|Frans Hals|Jan van Eyck
pop|3|Who is the author of "The Lord of the Rings"?|J.R.R. Tolkien|C.S. Lewis|George R.R. Martin|Roald Dahl
pop|3|In Romeo and Juliet, which family is the rival of the Montagues?|The Capulets|The Lancasters|The Medicis|The Borgias
pop|4|Who directed the film "Pulp Fiction"?|Quentin Tarantino|Martin Scorsese|David Fincher|Steven Soderbergh
pop|4|Which author created the detective Hercule Poirot?|Agatha Christie|Arthur Conan Doyle|Dorothy L. Sayers|Raymond Chandler
pop|4|Which composer wrote the opera "The Magic Flute"?|Mozart|Verdi|Wagner|Puccini
pop|4|Who painted "Guernica"?|Pablo Picasso|Salvador Dalí|Joan Miró|Diego Rivera
pop|4|Which novel opens with the line "Call me Ishmael"?|Moby-Dick|Treasure Island|Robinson Crusoe|Great Expectations
pop|4|In which Shakespeare play does the villain Iago appear?|Othello|Hamlet|Macbeth|King Lear
pop|4|Who wrote the dystopian novel "1984"?|George Orwell|Aldous Huxley|Ray Bradbury|H.G. Wells
wrd|3|Which word is a synonym of "benevolent"?|Kind|Hostile|Lazy|Clumsy
wrd|3|What is the plural of "phenomenon"?|Phenomena|Phenomenons|Phenomenae|Phenomenas
wrd|4|Which phrase is an example of an oxymoron?|Deafening silence|Loud noise|Quick run|Bright light
wrd|4|What is a word formed from the initial letters of a name and pronounced as a word, like NASA?|Acronym|Initialism|Abbreviation|Portmanteau
wrd|4|What does "ubiquitous" mean?|Present everywhere|Very rare|Extremely old|Easily broken
wrd|4|Which word is closest in meaning to "ephemeral"?|Short-lived|Eternal|Powerful|Ancient
math|3|What is the next number in the sequence 2, 3, 5, 7, 11?|13|12|15|14
math|3|What is the area of a circle with a radius of 3?|9π|6π|3π|12π
math|3|What is 15% of 240?|36|24|30|40
math|4|What is the sum of the interior angles of a hexagon?|720°|540°|900°|360°
math|4|What is 7 factorial (7!)?|5040|720|40320|2520
math|4|What is the next prime number after 89?|97|91|93|101
math|4|What is the derivative of sin(x)?|cos(x)|-sin(x)|-cos(x)|tan(x)
math|4|What is the approximate value of Euler's number e?|2.718|3.142|1.618|1.414
gen|3|In which year did the first iPhone launch?|2007|2005|2009|2010
gen|3|Who is credited with inventing the World Wide Web?|Tim Berners-Lee|Bill Gates|Steve Jobs|Vint Cerf
gen|3|What is the currency of Switzerland?|Swiss franc|Euro|Krona|Pound
gen|3|What is the largest desert in the world, counting polar deserts?|Antarctic Desert|Sahara|Arctic Desert|Gobi
gen|3|Which Greek philosopher tutored Alexander the Great?|Aristotle|Plato|Socrates|Pythagoras
gen|3|Which philosopher wrote "The Republic"?|Plato|Aristotle|Socrates|Epicurus
gen|4|What is the smallest country in Africa by area?|Seychelles|Gambia|Eswatini|Djibouti
gen|4|Which Austrian physicist is known for a thought experiment involving a cat in a box?|Erwin Schrödinger|Werner Heisenberg|Max Planck|Wolfgang Pauli
gen|4|Which mathematician is known for his last theorem, proved in 1994 by Andrew Wiles?|Pierre de Fermat|Carl Friedrich Gauss|Leonhard Euler|Blaise Pascal
gen|4|Which Renaissance polymath designed flying machines and painted "The Last Supper"?|Leonardo da Vinci|Michelangelo|Galileo Galilei|Raphael`;
const BG_QS=BG_RAW.trim().split('\n').map(l=>{const p=l.split('|');return{c:p[0],d:+p[1],q:p[2],a:p.slice(3)}});
/* ===== Endless question engine: live trivia API + generators + curated, with no-repeat tracking ===== */
let bgCurQ=null;
const bgRnd=n=>Math.floor(Math.random()*n),bgShuf=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
function bgHash(s){s=String(s).toLowerCase().replace(/[^a-z0-9]/g,'');let h=5381;for(let i=0;i<s.length;i++)h=((h*33)^s.charCodeAt(i))>>>0;return h.toString(36)}
let bgSeenS=null;
function bgSeenSet(){if(!bgSeenS){try{bgSeenS=new Set(JSON.parse(localStorage.getItem('bgSeenV1')||'[]'))}catch(e){bgSeenS=new Set()}}return bgSeenS}
function bgMarkSeen(h){const s=bgSeenSet();s.add(h);try{localStorage.setItem('bgSeenV1',JSON.stringify([...s].slice(-4000)))}catch(e){}}
const BG_FW=FALLBACK_WORDS.split(' ').filter(w=>/^[a-z]+$/.test(w));
const BG_CAP={1:'France:Paris,Japan:Tokyo,Italy:Rome,Spain:Madrid,Germany:Berlin,Egypt:Cairo,China:Beijing,India:New Delhi,Brazil:Brasília,Canada:Ottawa,Mexico:Mexico City,Russia:Moscow,Australia:Canberra,United Kingdom:London,Greece:Athens',
2:'Argentina:Buenos Aires,Portugal:Lisbon,Turkey:Ankara,Thailand:Bangkok,Kenya:Nairobi,Peru:Lima,Norway:Oslo,Sweden:Stockholm,Poland:Warsaw,Ireland:Dublin,Austria:Vienna,Cuba:Havana,Chile:Santiago,Vietnam:Hanoi,South Korea:Seoul,Philippines:Manila,Indonesia:Jakarta,Saudi Arabia:Riyadh,Colombia:Bogotá',
3:'Nigeria:Abuja,Morocco:Rabat,Ethiopia:Addis Ababa,Pakistan:Islamabad,Bangladesh:Dhaka,Kazakhstan:Astana,Ukraine:Kyiv,Switzerland:Bern,Finland:Helsinki,Denmark:Copenhagen,Hungary:Budapest,Czech Republic:Prague,New Zealand:Wellington,Ghana:Accra,Tanzania:Dodoma,Myanmar:Naypyidaw,Ecuador:Quito,Mongolia:Ulaanbaatar,Nepal:Kathmandu,Malaysia:Kuala Lumpur,Iceland:Reykjavik,Cambodia:Phnom Penh,Uganda:Kampala,Laos:Vientiane,Jordan:Amman',
4:'Bhutan:Thimphu,Burkina Faso:Ouagadougou,Eritrea:Asmara,Uzbekistan:Tashkent,Turkmenistan:Ashgabat,Tajikistan:Dushanbe,Azerbaijan:Baku,Georgia:Tbilisi,Armenia:Yerevan,Belarus:Minsk,Latvia:Riga,Lithuania:Vilnius,Estonia:Tallinn,Slovakia:Bratislava,Slovenia:Ljubljana,Croatia:Zagreb,Serbia:Belgrade,Albania:Tirana,North Macedonia:Skopje,Mozambique:Maputo,Zambia:Lusaka,Zimbabwe:Harare,Madagascar:Antananarivo,Senegal:Dakar,Cameroon:Yaoundé,Botswana:Gaborone,Namibia:Windhoek,Brunei:Bandar Seri Begawan,Suriname:Paramaribo,Paraguay:Asunción,Kyrgyzstan:Bishkek,Sri Lanka:Sri Jayawardenepura Kotte,Libya:Tripoli,Sudan:Khartoum,Oman:Muscat,Qatar:Doha,Yemen:Sanaa'};
const BG_PAIRS=Object.values(BG_CAP).join(',').split(',').map(x=>x.split(':'));
function bgNumOpts(a){const c=bgShuf([a+1,a-1,a+2,a-2,a+10,a-10,a+3,a-3,a*2,Math.round(a/2)]).filter(x=>x!==a&&x>=0);return[...new Set(c)].slice(0,3).map(String)}
function genMath(d){const r=bgRnd,t=r(d<3?2:3);let q,a;
  if(d===1){const x=2+r(18),y=2+r(18);if(t){q=Math.max(x,y)+' − '+Math.min(x,y);a=Math.abs(x-y)}else{q=x+' + '+y;a=x+y}q='What is '+q+'?'}
  else if(d===2){const x=2+r(11),y=2+r(11);if(t){q='What is '+x*y+' ÷ '+x+'?';a=y}else{q='What is '+x+' × '+y+'?';a=x*y}}
  else if(d===3){if(t===0){const x=3+r(10),y=3+r(10),z=5+r(30);q='What is ('+x+' × '+y+') + '+z+'?';a=x*y+z}else if(t===1){const p=[10,20,25,50][r(4)],n=(2+r(18))*20;q='What is '+p+'% of '+n+'?';a=p*n/100}else{const s=2+r(6),k=2+r(3);q='What comes next? '+[0,1,2,3].map(i=>s*Math.pow(k,i)).join(', ')+', ?';a=s*Math.pow(k,4)}}
  else{if(t===0){const x=11+r(15);q='What is '+x+'²?';a=x*x}else if(t===1){const x=6+r(20);q='What is the square root of '+x*x+'?';a=x}else{const x=3+r(10);q='What is '+x+' cubed?';a=x*x*x}}
  return{c:'math',q,a:[String(a),...bgNumOpts(a)]}}
function genCap(d){const tier=d===1?1:d===2?2:d===3?3:3+bgRnd(2),p=BG_CAP[tier].split(',').map(x=>x.split(':')),[c,cap]=p[bgRnd(p.length)];
  if(d>1&&bgRnd(2)){return{c:'geo',q:cap+' is the capital of which country?',a:[c,...bgShuf(BG_PAIRS.filter(x=>x[0]!==c)).slice(0,3).map(x=>x[0])]}}
  return{c:'geo',q:'What is the capital of '+c+'?',a:[cap,...bgShuf(BG_PAIRS.filter(x=>x[1]!==cap)).slice(0,3).map(x=>x[1])]}}
function genUnsc(d){const [lo,hi]=[[3,4],[5,5],[6,7],[8,9]][d-1],ws=BG_FW.filter(w=>w.length>=lo&&w.length<=hi);if(!ws.length)return null;
  const w=ws[bgRnd(ws.length)],srt=x=>x.split('').sort().join('');let sc=w;for(let i=0;i<12&&sc===w;i++)sc=bgShuf(w.split('')).join('');if(sc===w)return null;
  let pool=ws.filter(x=>x.length===w.length&&srt(x)!==srt(w));if(pool.length<3)pool=ws.filter(x=>srt(x)!==srt(w));const o=bgShuf(pool).slice(0,3);if(o.length<3)return null;
  return{c:'wrd',q:'Unscramble these letters: '+sc.toUpperCase(),a:[w,...o].map(x=>x.toUpperCase())}}
function genSpell(d){const ws=BG_FW.filter(w=>w.length>=4+d);if(!ws.length)return null;const w=ws[bgRnd(ws.length)],bad=new Set();
  for(let i=0;i<30&&bad.size<3;i++){const k=1+bgRnd(w.length-2),m=bgRnd(3);let v;
    if(m===0)v=w.slice(0,k)+w[k+1]+w[k]+w.slice(k+2);else if(m===1)v=w.slice(0,k)+w[k]+w.slice(k);else v=w.slice(0,k)+w.slice(k+1);
    if(v!==w&&!DICT.has(v))bad.add(v)}
  return bad.size<3?null:{c:'wrd',q:'Which word is spelled correctly?',a:[w,...bad]}}
function genGen(d){const SH={triangle:3,square:4,pentagon:5,hexagon:6,heptagon:7,octagon:8,nonagon:9,decagon:10},MO='January February March April May June July August September October November December'.split(' ');
  if(bgRnd(2)){const k=Object.keys(SH).slice(0,d<3?4:8),s=k[bgRnd(k.length)],a=SH[s];return{c:'gen',q:'How many sides does a '+s+' have?',a:[String(a),...bgNumOpts(a).filter(x=>+x>=3)]}}
  const i=bgRnd(12),k=d<3?1:2+bgRnd(4),ans=MO[(i+k)%12];return{c:'gen',q:k===1?'Which month comes right after '+MO[i]+'?':'Which month is '+k+' months after '+MO[i]+'?',a:[ans,...bgShuf(MO.filter(m=>m!==ans)).slice(0,3)]}}
/* Harder generators (Hard / Expert tiles only). The simple shape/month generator is limited to Easy / Medium tiles. */
function toRoman(n){const m=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let s='';m.forEach(([v,r])=>{while(n>=v){s+=r;n-=v}});return s}
function genRoman(d){const a=d<=3?14+bgRnd(86):140+bgRnd(1860);
  if(bgRnd(2))return{c:'math',q:'Which number does the Roman numeral '+toRoman(a)+' stand for?',a:[String(a),...bgNumOpts(a)]};
  return{c:'math',q:'How is the number '+a+' written in Roman numerals?',a:[toRoman(a),...bgNumOpts(a).map(x=>toRoman(+x)).filter(x=>x)]}}
const BG_EL=[['Hydrogen','H',1],['Helium','He',2],['Lithium','Li',3],['Carbon','C',6],['Nitrogen','N',7],['Oxygen','O',8],['Neon','Ne',10],['Sodium','Na',11],['Magnesium','Mg',12],['Aluminium','Al',13],['Silicon','Si',14],['Sulfur','S',16],['Chlorine','Cl',17],['Potassium','K',19],['Calcium','Ca',20],['Iron','Fe',26],['Copper','Cu',29],['Zinc','Zn',30],['Silver','Ag',47],['Tin','Sn',50],['Tungsten','W',74],['Gold','Au',79],['Mercury','Hg',80],['Lead','Pb',82],['Uranium','U',92]];
function genElem(d){const tricky=BG_EL.filter(e=>e[0][0]!==e[1][0]),t=bgRnd(2);
  if(d===3||t){const e=tricky[bgRnd(tricky.length)];
    if(d===3||bgRnd(2))return{c:'sci',q:'What is the chemical symbol for '+e[0].toLowerCase()+'?',a:[e[1],...bgShuf(BG_EL.filter(x=>x[1]!==e[1])).slice(0,3).map(x=>x[1])]};
    return{c:'sci',q:'Which element has the chemical symbol '+e[1]+'?',a:[e[0],...bgShuf(BG_EL.filter(x=>x[0]!==e[0])).slice(0,3).map(x=>x[0])]}}
  const e=BG_EL.filter(x=>x[2]>=10)[bgRnd(BG_EL.filter(x=>x[2]>=10).length)];
  return{c:'sci',q:'What is the atomic number of '+e[0].toLowerCase()+'?',a:[String(e[2]),...bgNumOpts(e[2])]}}
function genPrime(d){const isP=n=>{if(n<2)return false;for(let i=2;i*i<=n;i++)if(n%i===0)return false;return true},lo=d===3?20:100,hi=d===3?100:300;
  let p;for(let i=0;i<500;i++){p=lo+bgRnd(hi-lo);if(isP(p))break}if(!isP(p))return null;
  const bad=[];for(let i=0;i<600&&bad.length<3;i++){const n=lo+bgRnd(hi-lo);if(!isP(n)&&n%2&&n%3&&(d===3||n%5)&&!bad.includes(n))bad.push(n)}
  return bad.length<3?null:{c:'math',q:'Which of these numbers is prime?',a:[String(p),...bad.map(String)]}}
function genBase(d){const a=d<=3?5+bgRnd(11):20+bgRnd(44);return{c:'math',q:'What is the binary number '+a.toString(2)+' in decimal?',a:[String(a),...bgNumOpts(a)]}}
function bgGen(d){
  const set=d<=2?[genMath,genMath,genCap,genGen,genUnsc,genSpell]:[genMath,genCap,genRoman,genElem,genPrime,genBase,genUnsc,genSpell];
  for(const f of bgShuf(set)){const Q=f(d);if(Q&&Q.a.length===4&&new Set(Q.a).size===4)return Q}return genMath(d)}
/* Live pool from Open Trivia DB (thousands of questions, family-filtered). Falls back silently when offline. */
const BGX={tok:null,pool:{easy:[],medium:[],hard:[]},busy:false,last:0};
const BGX_MAP={9:'gen',17:'sci',22:'geo',23:'his',27:'ani',21:'spt',11:'pop',12:'pop',10:'pop',25:'pop',20:'his',19:'math',18:'sci'},BGX_IDS=Object.keys(BGX_MAP).map(Number);
const BGX_BAD=/\b(sex\w*|porn\w*|nude|naked|rape\w*|kill\w*|murder\w*|suicid\w*|drugs?|cocaine|heroin|marijuana|cannabis|alcohol\w*|beer|wine|vodka|whisk(?:e)?y|cigarette\w*|tobacco|nazi\w*|hitler|holocaust|genocide|terror\w*|massacre|slave\w*|prostitut\w*|gambl\w*|bomb\w*|guns?|shoot\w*|erotic|fetish|pictured|shown below)\b|(all|none) of the above/i;
function bgxNorm(x,cid){try{const dc=decodeURIComponent,q=dc(x.question),all=[dc(x.correct_answer),...x.incorrect_answers.map(dc)];
  if(q.length>170||all.some(s=>s.length>42)||BGX_BAD.test(q+' | '+all.join(' | '))||isRude(q+' '+all.join(' ')))return null;
  if(new Set(all.map(s=>s.toLowerCase())).size<4)return null;return{c:BGX_MAP[cid]||'gen',q,a:all}}catch(e){return null}}
async function bgxFill(){if(BGX.busy)return;BGX.busy=true;
  try{for(let n=0;n<3;n++){const df=['easy','medium','hard'].sort((a,b)=>BGX.pool[a].length-BGX.pool[b].length)[0];if(BGX.pool[df].length>=14)break;
    const w=5400-(Date.now()-BGX.last);if(w>0)await bgSleep(w);BGX.last=Date.now();
    if(!BGX.tok){const t=await fetch('https://opentdb.com/api_token.php?command=request').then(r=>r.json());BGX.tok=t.token||null;await bgSleep(5400);BGX.last=Date.now()}
    const cid=BGX_IDS[bgRnd(BGX_IDS.length)],j=await fetch('https://opentdb.com/api.php?amount=10&type=multiple&encode=url3986&difficulty='+df+'&category='+cid+(BGX.tok?'&token='+BGX.tok:'')).then(r=>r.json());
    if(j.response_code===4)await fetch('https://opentdb.com/api_token.php?command=reset&token='+BGX.tok).catch(()=>{});
    (j.results||[]).forEach(x=>{const Q=bgxNorm(x,cid);if(Q)BGX.pool[df].push(Q)})}}
  catch(e){}finally{BGX.busy=false}}
/* ===== Adaptive difficulty =====
   The tile sets the difficulty band (Easy → Expert) and questions are always drawn from that band. Inside the band, how this
   player has been doing recently (kept on this device) decides how hard the question is: a player on a roll gets the harder
   questions of the band (and sometimes a step up), a struggling player gets the gentler ones. Hard / Expert tiles never fall
   back to easy questions. */
let bgSkill=.5;
try{const s=parseFloat(localStorage.getItem('bgSkillV1'));if(s>=0&&s<=1)bgSkill=s}catch(e){}
function bgNoteResult(d,ok){const w=.12+.04*d;bgSkill=Math.max(0,Math.min(1,bgSkill*(1-w)+(ok?1:0)*w));try{localStorage.setItem('bgSkillV1',String(bgSkill))}catch(e){}}
function bgTier(d){const r=Math.random(),s=bgSkill;
  if(d<=1)return'easy';
  if(d===2)return r<(s>=.65?.1:s<=.35?.5:.25)?'easy':'medium';
  if(d===3)return r<(s>=.65?.85:s<=.35?.4:.65)?'hard':'medium';
  return'hard'}
function bgNewQ(d){
  const used=(roomData.bg&&roomData.bg.used)||{},seen=bgSeenSet(),ok=Q=>{const h=bgHash(Q.q);return !used[h]&&!seen.has(h)};
  const pref=bgTier(d),tiers=d<=1?['easy']:d===2?(pref==='easy'?['easy','medium']:['medium','easy']):d===3?(pref==='hard'?['hard','medium']:['medium','hard']):['hard'];
  const live=()=>{for(const t of tiers){const p=BGX.pool[t];while(p.length){const Q=p.shift();if(ok(Q))return Q}}return null};
  const gen=()=>{for(let i=0;i<200;i++){const Q=bgGen(d);if(Q&&ok(Q))return Q}return null};
  const cur=()=>{const lv=[d];if(d>=2&&d<4&&bgSkill>=.7&&Math.random()<.3)lv.unshift(d+1);
    for(const L of lv){const p=BG_QS.filter(q=>q.d===L&&ok(q));if(p.length)return p[bgRnd(p.length)]}return null};
  const r=Math.random(),order=d<=2?(r<.55?[live,gen,cur]:r<.9?[gen,live,cur]:[cur,live,gen]):(r<.5?[live,cur,gen]:r<.9?[cur,live,gen]:[gen,live,cur]);
  for(const f of order){const Q=f();if(Q)return{c:Q.c,q:Q.q,a:Q.a}}
  return null;
}
const bgZone=n=>n<=14?1:n<=28?2:n<=42?3:4;
const bgSleep=ms=>new Promise(r=>setTimeout(r,ms));
const bgXY=n=>{if(n<=0)return[400,745];const i=n-1,r=Math.floor(i/BG_C),c=r%2?BG_C-1-i%BG_C:i%BG_C;return[c*100+50,(BG_R-1-r)*100+50]};
let bgRun=null,bgSeen=0,bgChain=Promise.resolve(),bgPending=0,bgBusy=false,bgAns=null,bgTO=null,bgPos={},bgTurnUid=null,bgWatch=null;
const bgOrder=()=>(roomData&&roomData.bg&&roomData.bg.order)||[];
const bgIdx=u=>Math.max(0,bgOrder().indexOf(u));
const bgPl=u=>(roomData.players||{})[u]||{name:'Player',avatar:'🎮'};
function bgSnakePath(h,t){const[x1,y1]=bgXY(h),[x2,y2]=bgXY(t),dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L,ny=dx/L;let d='';for(let i=0;i<=40;i++){const u=i/40,w=Math.sin(u*Math.PI*3.2)*26*Math.sqrt(Math.sin(Math.PI*u));d+=(i?'L':'M')+(x1+dx*u+nx*w).toFixed(1)+' '+(y1+dy*u+ny*w).toFixed(1)}return d}
function bgBuild(){
  let g='';
  for(let r=BG_R-1;r>=0;r--)for(let c=0;c<BG_C;c++){const n=r*BG_C+(r%2?BG_C-1-c:c)+1;g+='<div class="bgc z'+bgZone(n)+'"><b>'+n+'</b>'+(n===BG_N?'<span>🏆</span>':'')+'</div>'}
  $('bgGrid').innerHTML=g;
  let s='';
  Object.entries(BG_LAD).forEach(([a,b])=>{const[x1,y1]=bgXY(+a),[x2,y2]=bgXY(b),dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy),nx=-dy/L*9,ny=dx/L*9;s+='<g class="lad"><line x1="'+(x1+nx)+'" y1="'+(y1+ny)+'" x2="'+(x2+nx)+'" y2="'+(y2+ny)+'"/><line x1="'+(x1-nx)+'" y1="'+(y1-ny)+'" x2="'+(x2-nx)+'" y2="'+(y2-ny)+'"/>';for(let i=1;i<L/26;i++){const u=i*26/L;s+='<line x1="'+(x1+dx*u+nx)+'" y1="'+(y1+dy*u+ny)+'" x2="'+(x1+dx*u-nx)+'" y2="'+(y1+dy*u-ny)+'"/>'}s+='</g>'});
  Object.entries(BG_SNAKES).forEach(([h,t],i)=>{const col=BG_COL[i%6],d=bgSnakePath(+h,t),[hx,hy]=bgXY(+h),[tx,ty]=bgXY(t);
    s+='<g><path id="snp'+h+'" class="sn-body" d="'+d+'" stroke="'+col+'"/><path class="sn-glint" d="'+d+'"/><circle cx="'+tx+'" cy="'+ty+'" r="7" fill="'+col+'"/><g transform="translate('+hx+' '+hy+')"><g class="sn-head" id="snh'+h+'"><path class="sn-hood" d="M-18 2Q-27-12-17-24L-7-17Q0-21 7-17L17-24Q27-11 18 2L13 13H-13Z" style="color:'+col+'"/><ellipse cx="0" cy="0" rx="18" ry="17" fill="'+col+'" stroke="#35151b" stroke-width="1.5"/><ellipse class="sn-mouth" cx="0" cy="11" rx="9" ry="2"/><path class="sn-teeth" d="M-8 6L-5 12L-2 6M2 6L5 12L8 6"/><path class="sn-jaw" d="M-9 11Q0 16 9 11"/><ellipse class="sn-eye" cx="-7" cy="-5" rx="5.2" ry="6"/><ellipse class="sn-eye" cx="7" cy="-5" rx="5.2" ry="6"/><ellipse class="sn-pupil" cx="-6" cy="-5" rx="1.4" ry="4"/><ellipse class="sn-pupil" cx="8" cy="-5" rx="1.4" ry="4"/><path d="M-12-12Q-7-16-2-12M2-12Q7-16 12-12" fill="none" stroke="#35151b" stroke-width="2.5" stroke-linecap="round"/><circle class="sn-nostril" cx="-3" cy="3" r="1.1"/><circle class="sn-nostril" cx="3" cy="3" r="1.1"/><path class="tongue" d="M0 15V25M0 25L-5 30M0 25L5 30"/></g></g></g>'});
  $('bgSvg').innerHTML=s;
  $('bgToks').innerHTML=bgOrder().map(u=>'<div class="bgtok" id="tok_'+u+'" style="--ring:'+BG_RING[bgIdx(u)%5]+'"><span class="av">'+esc(bgPl(u).avatar||'🎮')+'</span></div>').join('');
  bgxFill();bgPos=Object.assign({},roomData.bg.pos||{});bgTurnUid=roomData.bg.turn;bgSyncPos();bgUI();bgDieSet(1);
}
function bgPut(u,n){const e=$('tok_'+u);if(!e)return;const[x,y]=bgXY(n),o=[[-18,-14],[18,-14],[-18,14],[18,14],[0,0]][bgIdx(u)%5];e.style.left=((x+o[0])/8)+'%';e.style.top=((y+o[1])/7.8)+'%';bgPos[u]=n}
function bgSyncPos(){const p=(roomData.bg&&roomData.bg.pos)||{};bgOrder().forEach(u=>bgPut(u,p[u]||0))}
function bgHop(u){const e=$('tok_'+u);if(!e)return;const s=e.firstChild;s.classList.remove('hop');void s.offsetWidth;s.classList.add('hop')}
async function bgWalk(u,from,to){bgPut(u,from);await bgSleep(80);const dir=to>=from?1:-1;let n=from;while(n!==to){n+=dir;bgPut(u,n);bgHop(u);snd('tap');await bgSleep(240)}}
function bgGlide(u,pt,ms){return new Promise(res=>{const e=$('tok_'+u);e.classList.add('nt');const t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/ms),z=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,p=pt(z);e.style.left=(p[0]/8)+'%';e.style.top=(p[1]/7.8)+'%';if(k<1)requestAnimationFrame(f);else{e.classList.remove('nt');res()}})(t0)})}
async function bgLadder(u,a,b){const[x1,y1]=bgXY(a),[x2,y2]=bgXY(b);snd('go');bgPut(u,a);await bgSleep(200);for(let i=0;i<4;i++)setTimeout(()=>snd('tap'),i*250);await bgGlide(u,k=>[x1+(x2-x1)*k,y1+(y2-y1)*k],1100);bgPut(u,b);snd('big');bgHop(u)}
async function bgEat(u,h,t){
  const hd=$('snh'+h),el=$('tok_'+u),path=$('snp'+h);bgPut(u,h);
  hd.classList.add('strike');snd('bad');if(navigator.vibrate)try{navigator.vibrate([40,40,80])}catch(e){}
  await bgSleep(600);el.classList.add('eaten');await bgSleep(420);
  path.classList.add('full');el.classList.remove('eaten');el.classList.add('inside');
  const L=path.getTotalLength();await bgGlide(u,k=>{const p=path.getPointAtLength(k*L);return[p.x,p.y]},1800);
  hd.classList.remove('strike');el.classList.remove('inside');path.classList.remove('full');bgPut(u,t);el.classList.add('pop');snd('ok');await bgSleep(650);el.classList.remove('pop');
}
function bgDieSet(v){const f=$('bgDieFace'),pips=[[4],[0,8],[0,4,8],[0,2,6,8],[0,2,4,6,8],[0,2,3,5,6,8]][v-1];if(!f)return;if(!f.childElementCount)f.innerHTML='<i class="die-pip"></i>'.repeat(9);[...f.children].forEach((p,i)=>p.classList.toggle('on',pips.includes(i)));$('bgDice').setAttribute('aria-label','Die showing '+v);$('bgDice').dataset.value=v}
async function bgDice(r){const d=$('bgDice');d.classList.remove('land');d.classList.add('roll');snd('shake');for(let i=0;i<13;i++){bgDieSet(1+bgRnd(6));await bgSleep(80)}bgDieSet(r);d.classList.remove('roll');d.classList.add('land');snd('ok');await bgSleep(350);d.classList.remove('land')}
function bgConfetti(){const E=['🎉','⭐','✨','🏆','🎊'];for(let i=0;i<36;i++){const s=document.createElement('span');s.textContent=E[i%5];s.className='bgconf';s.style.cssText='left:'+Math.random()*100+'vw;animation-delay:'+Math.random()*.8+'s;font-size:'+(18+Math.random()*20)+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),3600)}}
function bgShowQ(ev){
  const q=ev.Q,m=$('bgModal'),c=BG_CATS[q.c]||BG_CATS.gen,mine=ev.u===user.uid;bgCurQ=q;
  m.className='bg-modal on'+(ev.snake?' snake':'')+(mine?'':' spec');
  $('bgQHead').innerHTML=(ev.snake?'🐍 <b>Escape the snake!</b> ':'')+esc(bgPl(ev.u).avatar||'')+' <b>'+esc(bgPl(ev.u).name)+'</b>'+(mine?'':' is answering…');
  $('bgQMeta').innerHTML=c[0]+' '+c[1]+' · '+'⭐'.repeat(ev.d)+' '+BG_DN[ev.d]+(ev.snake?'':' · wrong = back '+BG_BACK[ev.d]);
  $('bgQText').textContent=q.q;$('bgQFb').textContent='';
  $('bgQOpts').innerHTML=ev.sh.map((j,i)=>'<button type="button" data-j="'+j+'">'+'ABCD'[i]+'. '+esc(q.a[j])+'</button>').join('');
  const tb=$('bgQBar');tb.style.animation='none';void tb.offsetWidth;tb.style.animation='bgBar '+BG_TIME+'s linear forwards';tb.style.animationDelay='-'+Math.max(0,(srvNow()-ev.t0)/1000)+'s';
  snd('go');
}
async function bgReveal(ev){
  $('bgQBar').style.animationPlayState='paused';
  document.querySelectorAll('#bgQOpts button').forEach(b=>{b.disabled=true;if(b.dataset.j==='0')b.classList.add('right');else if(+b.dataset.j===ev.pick)b.classList.add('wrong')});
  $('bgQFb').textContent=ev.ok?'✅ Correct!':(ev.pick<0?'⏰ Time’s up! ':'❌ Not quite! ')+'Answer: '+ev.ans;
  snd(ev.ok?'big':'bad');await bgSleep(2000);$('bgModal').classList.remove('on');
}
async function bgPlay(ev){
  const u=ev.u,k=ev.k;
  if(k==='roll'){bgTurnUid=u;bgUI();await bgDice(ev.r);await bgWalk(u,ev.from,ev.to);if(ev.to>=BG_N)bgPut(u,BG_N)}
  else if(k==='lad')await bgLadder(u,ev.from,ev.to);
  else if(k==='q')bgShowQ(ev);
  else if(k==='ans')await bgReveal(ev);
  else if(k==='eat')await bgEat(u,ev.h,ev.t);
  else if(k==='back'){snd('bad');await bgWalk(u,ev.from,ev.to)}
  else if(k==='turn'){bgTurnUid=u;bgSyncPos()}
  else if(k==='win'){bgConfetti();snd('win');await bgSleep(3200)}
}
function bgQueue(ev){bgPending++;bgChain=bgChain.then(()=>bgPlay(ev)).catch(()=>{}).then(()=>{bgPending--;bgUI()});return bgChain}
async function bgEmit(ev,patch){
  const bg=roomData.bg;ev.n=(bg.n||0)+1;ev.t=srvNow();bgSeen=ev.n;bg.n=ev.n;
  const up={'bg/ev':ev,'bg/n':ev.n,'bg/t':ev.t};Object.keys(patch||{}).forEach(k=>{up['bg/'+k]=patch[k]});
  await db.ref('rooms/'+roomId).update(up);
  return bgQueue(ev);
}
function bgNext(u){const o=bgOrder().filter(x=>(roomData.players||{})[x]),i=o.indexOf(u);return o[(i+1)%o.length]}
function bgPick(d){const used=roomData.bg.used||{};let p=BG_QS.map((q,i)=>i).filter(i=>BG_QS[i].d===d&&!used[i]);if(!p.length)p=BG_QS.map((q,i)=>i).filter(i=>BG_QS[i].d===d);return p[Math.floor(Math.random()*p.length)]}
async function bgDoTurn(){
  if(bgBusy||bgPending||bgTurnUid!==user.uid||!roomData||roomData.status!=='playing')return;
  bgBusy=true;bgUI();ensureAudio();
  try{
    const u=user.uid,from=bgPos[u]||0,r=1+Math.floor(Math.random()*6),to=Math.min(BG_N,from+r);
    await bgEmit({k:'roll',u,r,from,to},{['pos/'+u]:to});
    if(to>=BG_N){await bgEmit({k:'win',u},{winner:u});await db.ref('rooms/'+roomId).update({status:'results',endedAt:srvNow()});return}
    if(BG_LAD[to]){await bgEmit({k:'lad',u,from:to,to:BG_LAD[to]},{['pos/'+u]:BG_LAD[to]})}
    else{
      const snake=BG_SNAKES[to]!=null,d=snake?Math.max(2,bgZone(to)):bgZone(to),Q=bgNewQ(d);
      if(!Q){toast('No fresh trivia questions are available. Skipping this tile.');await bgEmit({k:'turn',u:bgNext(u)},{turn:bgNext(u)});return}
      const h=bgHash(Q.q),sh=[0,1,2,3].sort(()=>Math.random()-.5);
      const wait=new Promise(res=>{bgAns=res;bgTO=setTimeout(()=>{if(bgAns){bgAns=null;res(-1)}},BG_TIME*1000+300)});
      bgMarkSeen(h);bgxFill();await bgEmit({k:'q',u,Q,d,snake,tile:to,sh,t0:srvNow()},{['used/'+h]:true});
      const pick=await wait,ok=pick===0;bgNoteResult(d,ok);
      await bgEmit({k:'ans',u,pick,ok,ans:Q.a[0]},{});
      if(!ok&&snake)await bgEmit({k:'eat',u,h:to,t:BG_SNAKES[to]},{['pos/'+u]:BG_SNAKES[to]});
      else if(!ok){const np=Math.max(0,to-BG_BACK[d]);await bgEmit({k:'back',u,from:to,to:np},{['pos/'+u]:np})}
    }
    await bgEmit({k:'turn',u:bgNext(u)},{turn:bgNext(u)});
  }catch(e){console.warn(e);toast('Could not sync your turn. Check your connection and try again.')}finally{bgBusy=false;bgUI()}
}
function bgUI(){
  if(!roomData||!roomData.bg)return;
  const u=bgTurnUid,me=u===user.uid,idle=!bgPending&&!bgBusy;
  $('bgTurn').innerHTML=esc(bgPl(u).avatar||'🎮')+' <b>'+(me?'Your turn!':esc(bgPl(u).name)+'’s turn')+'</b>';
  const b=$('bgRoll');b.style.display=(me&&idle)?'flex':'none';
  $('bgInfo').textContent=me?(idle?'Roll the dice! Wrong answers send you back — snakes bite 🐍':''):'Watching '+bgPl(u).name+'…';
  $('bgChips').innerHTML=bgOrder().filter(x=>(roomData.players||{})[x]).map(x=>'<span class="bgchip'+(x===u?' on':'')+'" style="--ring:'+BG_RING[bgIdx(x)%5]+'">'+esc(bgPl(x).avatar||'')+' '+(bgPos[x]||0)+'</span>').join('');
}
function bgEnter(){
  const bg=roomData.bg;if(!bg)return;
  if(bgRun!==roomData.startedAt||!$('screen-board').classList.contains('active')){
    if(bgRun!==roomData.startedAt){bgRun=roomData.startedAt;bgChain=Promise.resolve();bgPending=0;bgBusy=false}
    show('screen-board');bgBuild();bgSeen=bg.n||0;
  }
  if((bg.n||0)>bgSeen&&bg.ev){bgSeen=bg.n;bgQueue(bg.ev)}
  if(!bgWatch)bgWatch=setInterval(()=>{ // host skips an inactive player
    if(!roomData||roomData.gameType!=='board'||roomData.status!=='playing'||!isHost||bgPending||bgBusy)return;
    if(Object.keys(roomData.players||{}).length>1&&srvNow()-(roomData.bg.t||0)>45000&&roomData.bg.turn){const n=bgNext(roomData.bg.turn);toast('Skipping an inactive player…');bgEmit({k:'turn',u:n},{turn:n}).catch(e=>{console.warn(e);toast('Could not sync the game. Check your connection and try again.')})}
  },5000);
}
function computeBoardResults(){
  const bg=roomData.bg||{},pos=bg.pos||{},w=bg.winner;
  const rows=Object.values(roomData.players||{}).map(p=>{const n=p.uid===w?BG_N:Math.min(BG_N-1,pos[p.uid]||0);return{p,items:[{w:p.uid===w?'🏆 Reached the finish!':'Reached tile '+n,pts:0,dupe:false}],raw:1,final:n,lost:0,uniqueN:n,sharedN:0}});
  rows.sort((a,b)=>b.final-a.final);return rows;
}
document.addEventListener('click',e=>{
  if(e.target.closest('#bgRoll')){bgDoTurn();return}
  const b=e.target.closest('#bgQOpts button');
  if(b&&bgAns&&!b.disabled){b.classList.add('pick');const f=bgAns;bgAns=null;clearTimeout(bgTO);f(+b.dataset.j)}
});
