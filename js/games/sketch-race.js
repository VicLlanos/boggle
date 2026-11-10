/* ===== SKETCH RACE – drawable word bank ===== */
const DRAW_WORDS_EASY = [
  "APPLE","HOUSE","CAT","DOG","CAR","TREE","SUN","MOON","STAR","FISH",
  "BIRD","BOOK","PHONE","CAKE","HAT","SHOE","BALL","KEY","DOOR","CHAIR",
  "TABLE","CLOCK","FLOWER","CLOUD","RAIN","SNOW","BOAT","PLANE","TRAIN","BIKE",
  "ROBOT","GHOST","CROWN","SWORD","HEART","SMILE","EYE","HAND","FOOT","NOSE",
  "EAR","MOUTH","GUITAR","PIANO","DRUM","CAMERA","UMBRELLA","BALLOON","CANDLE","LADDER",
  "BRIDGE","MOUNTAIN","RIVER","ISLAND","RAINBOW","BUTTERFLY","SPIDER","SNAKE","ELEPHANT","GIRAFFE",
  "PENGUIN","DOLPHIN","SHARK","OCTOPUS","WHALE","PIZZA","BURGER","COOKIE","BANANA","ORANGE",
  "GRAPE","CARROT","TOMATO","CORN","SOCCER BALL","BASKETBALL","PENCIL","ERASER","SCISSORS","GLUE",
  "PAINTBRUSH","MIRROR","LAMP","BED","CUP","FORK","SPOON","KNIFE","BAG","BOX",
  "BUS","COW","DUCK","FROG","GOAT","HORSE","LION","MOUSE","OWL","PIG",
  "RING","SOCK","TENT","VASE","WOLF","ANT","BEE","EGG","KITE","LEAF",
  "MAP","PEN","BOWL","PLATE","BONE","TAIL","CUPCAKE","DONUT","ICE CREAM","HOT DOG"
];
const DRAW_WORDS_MED = [
  "CASTLE","DRAGON","VOLCANO","SKATEBOARD","TELESCOPE","SUBMARINE","HELICOPTER","TRACTOR","WINDMILL","LIGHTHOUSE",
  "SCARECROW","SNOWMAN","MERMAID","UNICORN","PIRATE","NINJA","WIZARD","VAMPIRE","ZOMBIE","SUPERHERO",
  "ROCKET","ASTRONAUT","DINOSAUR","KANGAROO","KOALA","LLAMA","PANDA","RHINO","HIPPO","CHEETAH",
  "PEACOCK","FLAMINGO","SCORPION","LOBSTER","JELLYFISH","SEAHORSE","STARFISH","MUSHROOM","PINEAPPLE","WATERMELON",
  "POPCORN","SANDWICH","SPAGHETTI","SUSHI","TACO","WAFFLE","BACKPACK","SUITCASE","COMPASS","BINOCULARS",
  "FLASHLIGHT","HAMMOCK","CAMPFIRE","CANOE","SURFBOARD","TROPHY","MEDAL","WHISTLE","HELMET","GLOVES",
  "SCARF","SUNGLASSES","FOUNTAIN","STATUE","PYRAMID","TEMPLE","PALACE","TRAFFIC LIGHT","FIRE HYDRANT","MAILBOX",
  "NEWSPAPER","CALENDAR","ALARM CLOCK","TOOTHBRUSH","TOOTHPASTE","SHAMPOO","SOAP","TOWEL","PILLOW","BLANKET",
  "CURTAIN","CARPET","SOFA","BOOKSHELF","REFRIGERATOR","MICROWAVE","TOASTER","BLENDER","VACUUM","BROOM",
  "HAMMER","SCREWDRIVER","WRENCH","NAIL","ROPE","PADLOCK","WALLET","COIN","PIGGY BANK","DIAMOND",
  "FRENCH FRIES","MILKSHAKE","PRETZEL","CHEESE","BREAD","TOAST","PANCAKE","OMELET","SALAD","LOLLIPOP",
  "CANDY CANE","GIFT BOX","BIRTHDAY CAKE","TENNIS RACKET","BASEBALL BAT","FOOTBALL","VOLLEYBALL","HOCKEY STICK","GOLF CLUB","BOWLING BALL"
];
// Harder prompts, but still familiar things most people know and can sketch
const DRAW_WORDS_HARD = [
  "CHAMELEON","SLOTH","ARMADILLO","PORCUPINE","HEDGEHOG","MEERKAT","WALRUS","ANTEATER","WOMBAT","PELICAN",
  "TOUCAN","PUFFIN","OSTRICH","MANTIS","DRAGONFLY","CATERPILLAR","FIREFLY","TARANTULA","STINGRAY","CLOWNFISH",
  "LIGHTHOUSE","SHIPWRECK","ANCHOR","PIRATE SHIP","TREASURE CHEST","CANNON","SUIT OF ARMOR","SAMURAI","ARCHERY TARGET","CROSSBOW",
  "XYLOPHONE","ACCORDION","BAGPIPES","HARMONICA","TROMBONE","CELLO","HARP","BANJO","UKULELE","TYPEWRITER",
  "HOURGLASS","STETHOSCOPE","THERMOMETER","BANDAGE","CRUTCH","WHEELCHAIR","AMBULANCE","FIRE TRUCK","POLICE CAR","TOW TRUCK",
  "BULLDOZER","EXCAVATOR","CRANE","FORKLIFT","DUMP TRUCK","STEAMROLLER","COMBINE HARVESTER","HOT AIR BALLOON","PARACHUTE","ROLLER COASTER",
  "FERRIS WHEEL","CAROUSEL","BUMPER CARS","WATER SLIDE","TRAMPOLINE","IGLOO","SANDCASTLE","TREEHOUSE","BIRDHOUSE","DOGHOUSE",
  "EASEL","PALETTE","CHALKBOARD","GLOBE","MICROSCOPE","BINOCULARS","MAGNIFYING GLASS","POCKET WATCH","GRANDFATHER CLOCK","CHANDELIER",
  "ESCALATOR","ELEVATOR","VENDING MACHINE","PARKING METER","STREET LAMP","PICNIC BASKET","THERMOS","GRILL","LANTERN","SLEEPING BAG",
  "SNOW GLOBE","MUSIC BOX","RUBIKS CUBE","YO YO","SLINKY","WATER GUN","FRISBEE","BOOMERANG","HORSESHOE","STOPWATCH",
  "SCOREBOARD","POGO STICK","UNICYCLE","SCOOTER","ROLLER SKATES","ICE SKATES","SNOWBOARD","PUPPET","PAPER AIRPLANE","SNOWFLAKE",
  "STAINED GLASS","CACTUS","PALM TREE","TOTEM POLE","WINDMILL","WATER TOWER","DRAWBRIDGE","MOAT","CANNONBALL","SPYGLASS",
  "LIFE PRESERVER","LIFE JACKET","SNORKEL","FLIPPERS","BEACH UMBRELLA","SAND BUCKET","SEASHELL","CORAL","ICEBERG","AVALANCHE",
  "TORNADO","LIGHTNING","RAINBOW","ECLIPSE","SHOOTING STAR","CAMPING TENT","BACKPACK","CANTEEN","HIKING BOOT","MOUNTAIN PEAK",
  "VOLCANO","GEYSER","WATERFALL","CANYON","CAVE","STALACTITE","BAT CAVE","TREASURE MAP","X MARKS THE SPOT","PARROT"
];
const DRAW_WORDS = (() => {
  const seen = new Set();
  const out = [];
  [...DRAW_WORDS_EASY, ...DRAW_WORDS_MED, ...DRAW_WORDS_HARD].forEach(w => {
    const u = String(w).toUpperCase().trim();
    if(u && !seen.has(u)){ seen.add(u); out.push(u); }
  });
  return out;
})();

/* ===== SKETCH RACE – CATEGORY WORD BANK =====
   When a Sketch Race game starts, a random category is picked (with an animated cycle) and EVERY word of that
   game comes from that category. Words are remembered (per room and per device) so they don't keep coming back.
   (The older DRAW_WORDS_* lists above are still used by Spy Word.) Words use only A-Z and spaces. */
const DRAW_SPIN_MS = 4800;
const DRAW_CATS = [
  {id:'animals',emoji:'🐾',name:'Animals',
   easy:'cat,dog,cow,pig,horse,sheep,goat,duck,chicken,rabbit,mouse,fish,bird,frog,snake,turtle,lion,tiger,bear,monkey,elephant,giraffe,zebra,hippo,penguin,owl,fox,wolf,deer,squirrel,kangaroo,panda,dolphin,shark,whale,crab,snail,bee,ant,butterfly,spider,parrot,camel,crocodile,gorilla,koala,eagle,swan,rooster,donkey,hedgehog,flamingo,peacock,octopus',
   hard:'sloth,armadillo,porcupine,meerkat,walrus,anteater,pelican,toucan,ostrich,chameleon,scorpion,seahorse,jellyfish,starfish,lobster,rhino,cheetah,leopard,otter,beaver,bat,hamster,lizard,caterpillar,dragonfly,ladybug,platypus,llama,moose,raccoon,skunk,vulture,seal,stingray,hyena,antelope,bison,praying mantis,firefly'},
  {id:'food',emoji:'🍔',name:'Food & Drinks',
   easy:'pizza,burger,hot dog,french fries,sandwich,spaghetti,taco,sushi,pancake,waffle,egg,bread,cheese,cake,cupcake,donut,cookie,ice cream,popcorn,pretzel,soup,salad,rice,noodles,fried chicken,steak,bacon,sausage,toast,cereal,pie,candy,chocolate,lollipop,milkshake,juice,coffee,tea,milk,burrito,dumplings,nachos,omelet,croissant,bagel,cotton candy,candy cane',
   hard:'lasagna,ramen,paella,kebab,curry,dim sum,churros,cannoli,macaron,fondue,hummus,falafel,gyoza,tempura,ceviche,quesadilla,meatball,sundae,cheesecake,pudding,brownie,smoothie,hamburger,french toast,garlic bread,apple pie,birthday cake,pasta,lemonade,hot chocolate,baguette,caramel apple,fortune cookie,banana split,chicken nuggets'},
  {id:'fruitveg',emoji:'🍎',name:'Fruits & Vegetables',
   easy:'apple,banana,orange,grapes,strawberry,watermelon,pineapple,cherry,lemon,peach,pear,mango,coconut,kiwi,blueberry,carrot,tomato,potato,corn,broccoli,onion,pumpkin,cucumber,lettuce,pepper,mushroom,garlic,peas,eggplant,cabbage,banana bunch,avocado',
   hard:'pomegranate,papaya,dragon fruit,artichoke,asparagus,cauliflower,celery,radish,turnip,beetroot,zucchini,cranberry,raspberry,blackberry,plum,fig,lime,grapefruit,tangerine,apricot,cantaloupe,olive,leek,spinach,sweet potato,jackfruit,lychee,durian,star fruit,pea pod,ear of corn,bell pepper'},
  {id:'home',emoji:'🏠',name:'Around the House',
   easy:'bed,chair,table,sofa,lamp,door,window,clock,mirror,pillow,blanket,curtain,carpet,fridge,stove,oven,sink,toilet,bathtub,shower,toothbrush,towel,soap,broom,bucket,key,television,computer,telephone,fan,candle,vase,shelf,stairs,roof,chimney,fence,mailbox,doorbell,ladder,bookshelf',
   hard:'chandelier,fireplace,bunk bed,rocking chair,washing machine,vacuum cleaner,microwave,toaster,blender,iron,ironing board,hanger,doormat,coat rack,umbrella stand,light bulb,remote control,wardrobe,dishwasher,piggy bank,smoke alarm,thermostat,hammock,cuckoo clock,drawer,basket,kettle,teapot,rolling pin,cutting board,welcome mat,night light'},
  {id:'school',emoji:'🎒',name:'School & Office',
   easy:'pencil,pen,eraser,ruler,scissors,glue,notebook,book,backpack,desk,chalk,blackboard,whiteboard,globe,map,calculator,stapler,tape,paper,crayon,marker,paintbrush,bell,locker,lunchbox,printer,folder,paper clip,pencil sharpener,school bus,envelope,computer',
   hard:'microscope,protractor,easel,projector,trophy,diploma,graduation cap,flag,lab coat,test tube,telescope,abacus,highlighter,thumbtack,binder,rubber stamp,filing cabinet,calendar,megaphone,clipboard,hole puncher,bulletin board,pencil case,compass,desk lamp,swivel chair,water cooler,photocopier'},
  {id:'sports',emoji:'⚽',name:'Sports & Games',
   easy:'soccer ball,basketball,baseball,tennis racket,golf club,bowling ball,football,hockey stick,volleyball,boxing gloves,skateboard,bicycle,swimming,surfing,skiing,ice skating,archery,fishing,running,jump rope,trophy,medal,whistle,helmet,goal,dumbbell,yoga,karate,gymnastics,diving,table tennis,badminton,rugby ball,chess,dice,playing cards',
   hard:'fencing,javelin,pole vault,high jump,hurdles,snowboard,sled,curling,trampoline,weightlifting,wrestling,horse riding,rock climbing,sailing,kayak,scoreboard,referee,mascot,stopwatch,podium,pommel horse,balance beam,discus,shot put,ping pong,bobsled,marathon,cheerleader,pool table,dartboard,boxing ring,golf cart'},
  {id:'vehicles',emoji:'🚗',name:'Vehicles & Transport',
   easy:'car,bus,truck,train,plane,helicopter,boat,ship,bicycle,motorcycle,scooter,taxi,ambulance,fire truck,police car,tractor,submarine,rocket,sailboat,canoe,skateboard,van,jeep,tricycle,wagon,hot air balloon,school bus,race car,tow truck',
   hard:'bulldozer,excavator,crane,forklift,dump truck,steamroller,cable car,monorail,ferry,yacht,jet ski,snowmobile,segway,unicycle,limousine,garbage truck,cement mixer,go kart,blimp,glider,parachute,gondola,rickshaw,sled,rowboat,hovercraft,space shuttle,tank,ice cream truck,pirate ship,steam train,tuk tuk'},
  {id:'nature',emoji:'🌳',name:'Nature & Weather',
   easy:'sun,moon,star,cloud,rain,snow,wind,rainbow,lightning,tornado,tree,flower,leaf,grass,mountain,river,lake,waterfall,volcano,island,beach,desert,cave,forest,rock,mushroom,cactus,palm tree,sunflower,fire,ice,iceberg,thunderstorm,sunrise,sunset,waves,pond,hill',
   hard:'avalanche,geyser,canyon,glacier,swamp,oasis,coral reef,eclipse,shooting star,aurora,earthquake,tsunami,hurricane,blizzard,meteor,stalactite,boulder,cliff,meadow,rainforest,sand dune,sandstorm,tulip,acorn,pinecone,seashell,snowflake,dewdrop,fog,hail,puddle,tide pool'},
  {id:'music',emoji:'🎸',name:'Music & Instruments',
   easy:'guitar,piano,drum,violin,trumpet,flute,microphone,headphones,radio,speaker,saxophone,harp,cello,tambourine,xylophone,maracas,bell,whistle,music note,record player,keyboard,ukulele,banjo,trombone,clarinet,harmonica,accordion,concert,stage,singer,dancer,band,orchestra,conductor,piano keys,jukebox',
   hard:'bagpipes,tuba,oboe,bassoon,triangle,gong,cymbals,sheet music,metronome,tuning fork,music box,drum set,electric guitar,french horn,piccolo,didgeridoo,mandolin,sitar,castanets,cowbell,bongos,kazoo,grand piano,karaoke,boombox,vinyl record,megaphone,music stand,treble clef,choir,dj turntable'},
  {id:'fantasy',emoji:'🧙',name:'Fantasy & Fairy Tales',
   easy:'dragon,unicorn,mermaid,fairy,wizard,witch,ghost,vampire,zombie,castle,crown,sword,shield,knight,princess,prince,king,queen,magic wand,genie,robot,alien,pirate,treasure chest,monster,giant,dinosaur,snowman,elf,troll,santa claus,angel,superhero,ninja,cape,potion,broomstick,magic carpet,crystal ball',
   hard:'phoenix,centaur,minotaur,griffin,cyclops,werewolf,mummy,frankenstein,pegasus,kraken,goblin,ogre,fairy wings,magic lamp,enchanted forest,dungeon,drawbridge,moat,catapult,suit of armor,pot of gold,leprechaun,sorcerer,hydra,yeti,bigfoot,scarecrow,jack o lantern,gingerbread house,spell book,wishing well,fairy godmother'},
  {id:'space',emoji:'🚀',name:'Space & Science',
   easy:'rocket,astronaut,planet,moon,sun,star,comet,galaxy,telescope,satellite,space station,alien,saturn,earth,mars,meteor,robot,microscope,test tube,magnet,battery,light bulb,atom,skeleton,brain,thermometer,magnifying glass,globe,compass,volcano,fossil,flying saucer',
   hard:'black hole,asteroid,space shuttle,lunar rover,constellation,solar system,eclipse,rocket launch,orbit,radar,satellite dish,antenna,gears,lever,pulley,prism,periscope,stethoscope,syringe,petri dish,circuit,bunsen burner,beaker,lab coat,x ray,dna helix,spacesuit,launch pad,mission control,moon crater,telescope lens,planet rings'},
  {id:'jobs',emoji:'👷',name:'Jobs & Occupations',
   easy:'doctor,nurse,teacher,chef,farmer,pilot,firefighter,police officer,astronaut,dentist,mailman,builder,painter,singer,dancer,clown,magician,cowboy,pirate,scientist,mechanic,plumber,electrician,cashier,waiter,baker,barber,gardener,fisherman,sailor,soldier,lifeguard,photographer,artist,judge,librarian,detective',
   hard:'surgeon,veterinarian,archaeologist,carpenter,blacksmith,butcher,florist,tailor,lumberjack,miner,beekeeper,bus driver,taxi driver,construction worker,window washer,street sweeper,referee,coach,conductor,juggler,acrobat,fortune teller,pharmacist,meteorologist,mountain climber,deep sea diver,zookeeper,snake charmer,chimney sweep,shepherd,sculptor,puppeteer'},
  {id:'clothes',emoji:'👕',name:'Clothes & Accessories',
   easy:'hat,shoe,sock,shirt,pants,dress,skirt,jacket,coat,scarf,gloves,mittens,belt,tie,glasses,sunglasses,watch,ring,necklace,bracelet,earrings,crown,backpack,umbrella,boots,sandals,sneakers,slippers,pajamas,sweater,hoodie,shorts,swimsuit,cap,helmet,apron,mask,bow tie,purse,wallet',
   hard:'top hat,cowboy hat,high heels,flip flops,suspenders,raincoat,tuxedo,wedding dress,kimono,cape,poncho,overalls,tutu,lab coat,bandana,beanie,tiara,pocket watch,cufflinks,handbag,briefcase,fanny pack,snow boots,swim goggles,bathrobe,hair clip,headband,ballet shoes,roller skates,life jacket,graduation gown'},
  {id:'places',emoji:'🏰',name:'Places & Buildings',
   easy:'house,castle,school,hospital,church,library,bank,hotel,airport,train station,bridge,tower,lighthouse,windmill,barn,tent,igloo,treehouse,skyscraper,museum,zoo,farm,park,playground,pyramid,statue,fountain,gas station,fire station,police station,supermarket,restaurant,cinema,stadium,mall,factory,city,village,beach',
   hard:'eiffel tower,leaning tower,great wall,statue of liberty,big ben,taj mahal,colosseum,sphinx,stonehenge,drawbridge,fortress,cathedral,mosque,pagoda,observatory,aquarium,amusement park,carnival,circus tent,drive in,farmhouse,log cabin,cottage,palace,monastery,water tower,sydney opera house,space needle,tipi,bus stop,telephone booth,haunted house'},
  {id:'toys',emoji:'🧸',name:'Toys & Fun',
   easy:'ball,doll,teddy bear,kite,balloon,blocks,puzzle,robot,yo yo,spinning top,train set,toy car,rocking horse,swing,slide,seesaw,sandbox,bubbles,jump rope,frisbee,marbles,dice,playing cards,chess,dominoes,crayons,play dough,dollhouse,puppet,drum,rattle,trampoline,bouncy castle,water gun,pinwheel,party hat,birthday cake,gift box',
   hard:'jack in the box,carousel,ferris wheel,roller coaster,bumper cars,merry go round,rubiks cube,slinky,kaleidoscope,tic tac toe,hopscotch,tug of war,hula hoop,pogo stick,pinata,confetti,water slide,jigsaw puzzle,snow globe,music box,toy soldier,building blocks,remote control car,paper airplane,paper boat,slingshot,monkey bars,go kart,bouncy ball,cat cradle'},
  {id:'tools',emoji:'🔧',name:'Tools & Technology',
   easy:'hammer,screwdriver,wrench,saw,drill,pliers,ladder,nail,screw,axe,shovel,rake,paintbrush,tape measure,flashlight,scissors,computer,laptop,phone,tablet,camera,television,radio,headphones,keyboard,mouse,printer,battery,plug,light bulb,clock,calculator,robot,drone,microwave,remote control',
   hard:'video game controller,smart watch,webcam,usb stick,wifi router,satellite dish,antenna,power drill,chainsaw,welding mask,toolbox,wheelbarrow,paint roller,sandpaper,magnifying glass,joystick,floppy disk,typewriter,camcorder,walkie talkie,hard hat,garden hose,lawn mower,gas pump,power outlet,extension cord,circuit board,robot arm,vr headset,security camera'},
  {id:'body',emoji:'🦷',name:'Body & Health',
   easy:'eye,nose,mouth,ear,hand,foot,finger,thumb,toe,tooth,tongue,heart,brain,bone,skeleton,muscle,hair,knee,elbow,shoulder,smile,tears,fingerprint,bandage,thermometer,toothbrush,glasses,ambulance,first aid kit,pill,medicine bottle,band aid',
   hard:'stethoscope,syringe,crutches,wheelchair,hearing aid,x ray,hospital bed,belly button,eyebrow,eyelash,nostril,wrist,ankle,spine,rib cage,lungs,stomach,tooth fairy,dental floss,eye chart,blood pressure,sling,cast,reading glasses,contact lens,hot water bottle,sunscreen,mouthguard,inhaler,microscope'},
  {id:'party',emoji:'🎉',name:'Parties & Holidays',
   easy:'balloon,cake,candle,gift,confetti,party hat,fireworks,christmas tree,santa claus,snowman,reindeer,easter egg,bunny,pumpkin,ghost,witch,heart,turkey,candy cane,stocking,wreath,ornament,sleigh,present,streamers,party popper,birthday cake,cupcake,gingerbread man,jack o lantern,mistletoe,trick or treat',
   hard:'pinata,pinwheel,advent calendar,lantern,fortune cookie,menorah,paper lantern,dreidel,party horn,disco ball,photo booth,confetti cannon,sparkler,bouquet,wedding cake,valentine card,love letter,haunted house,scarecrow,cornucopia,easter basket,chocolate egg,gift bow,champagne tower,balloon arch,red envelope,piggy bank,new year clock,dragon dance'},
  {id:'camping',emoji:'⛺',name:'Camping & Outdoors',
   easy:'tent,campfire,sleeping bag,backpack,compass,flashlight,lantern,binoculars,map,canoe,fishing rod,hammock,marshmallow,smores,hiking boots,trail,mountain,tree,log cabin,cooler,picnic basket,thermos,rope,bonfire,kayak,life jacket,paddle,bug spray,sunscreen,matches',
   hard:'swiss army knife,camp stove,hatchet,fishing net,walking stick,trail sign,hot dog on a stick,campsite,telescope,rain poncho,water bottle,first aid kit,bear,tree stump,fire pit,tent stakes,ranger hat,hiking trail,mosquito,rock climbing,zip line,rope bridge,compass rose,sleeping mat,headlamp,fishing hook,rowboat,lake'},
  {id:'ocean',emoji:'🌊',name:'Ocean & Beach',
   easy:'sandcastle,beach ball,surfboard,seashell,starfish,crab,sailboat,lighthouse,pirate ship,treasure chest,anchor,life jacket,beach umbrella,flip flops,sunglasses,sunscreen,snorkel,scuba diver,dolphin,whale,shark,octopus,jellyfish,seahorse,turtle,fish,wave,island,palm tree,coconut,seagull,submarine,mermaid,seaweed',
   hard:'hammock,lifeguard tower,coral reef,pier,fishing boat,swim ring,diving board,kite,pelican,lobster,stingray,clownfish,seal,iceberg,penguin,bucket and spade,fishing net,message in a bottle,shipwreck,diving mask,snow cone,boardwalk,sand dune,rowboat,surfer,beach towel,sea turtle,narwhal,swordfish,manta ray,oyster'},
  {id:'movies',emoji:'🎬',name:'Movies',
   easy:'frozen,shrek,titanic,jaws,moana,coco,cars,up,bambi,dumbo,aladdin,mulan,tarzan,pinocchio,cinderella,finding nemo,toy story,lion king,the incredibles,ratatouille,wall e,madagascar,kung fu panda,minions,despicable me,spiderman,batman,superman,ghostbusters,home alone',
   hard:'inception,gladiator,avatar,jurassic park,the matrix,star wars,harry potter,the godfather,forrest gump,back to the future,pirates of the caribbean,lord of the rings,the hunger games,black panther,iron man,the avengers,top gun,mad max,free willy,beauty and the beast,the little mermaid,sleeping beauty,snow white,monsters inc,ice age,how to train your dragon,encanto,interstellar,the jungle book,mary poppins,wonka'},
  {id:'songs',emoji:'🎵',name:'Song Titles',
   easy:'happy birthday,baby shark,let it go,yellow submarine,twinkle twinkle little star,jingle bells,silent night,old macdonald,row row row your boat,itsy bitsy spider,hakuna matata,under the sea,heart of glass,umbrella,firework,shake it off,sunflower,thunder,riptide,photograph,halo,yellow,roar,royals,happy,believer,perfect,havana,stay,levitating',
   hard:'bohemian rhapsody,billie jean,thriller,hotel california,imagine,hey jude,smells like teen spirit,rolling in the deep,someone like you,shape of you,blinding lights,bad guy,dynamite,despacito,uptown funk,single ladies,poker face,bad romance,call me maybe,counting stars,viva la vida,fix you,wonderwall,stairway to heaven,dancing queen,africa,take me home country roads,we will rock you,sweet caroline,i will survive,lose yourself,drivers license,as it was,anti hero,flowers,golden hour,blank space'},
  {id:'tvshows',emoji:'📺',name:'TV Shows',
   easy:'friends,spongebob,peppa pig,bluey,paw patrol,the simpsons,tom and jerry,scooby doo,pokemon,dora the explorer,sesame street,teletubbies,barney,thomas the tank engine,mickey mouse clubhouse,looney tunes,power rangers,adventure time,rugrats,arthur,wild kratts,masha and the bear,cocomelon,the flintstones,the muppets',
   hard:'stranger things,game of thrones,breaking bad,the office,squid game,money heist,the crown,the mandalorian,wednesday,the big bang theory,how i met your mother,modern family,grays anatomy,the walking dead,black mirror,the witcher,lucifer,riverdale,sherlock,doctor who,the last of us,house of the dragon,avatar the last airbender,gravity falls,phineas and ferb,rick and morty,family guy,south park,peaky blinders,narcos'},
  {id:'actors',emoji:'🎭',name:'Actors & Actresses',
   easy:'tom holland,zendaya,will smith,dwayne johnson,tom cruise,jackie chan,johnny depp,robert downey jr,chris hemsworth,chris evans,scarlett johansson,emma watson,daniel radcliffe,rupert grint,ryan reynolds,jennifer lawrence,brad pitt,leonardo dicaprio,keanu reeves,angelina jolie,margot robbie,timothee chalamet,jim carrey,adam sandler,mr bean',
   hard:'meryl streep,morgan freeman,denzel washington,anne hathaway,natalie portman,harrison ford,samuel l jackson,robert de niro,al pacino,tom hanks,sandra bullock,julia roberts,nicole kidman,cate blanchett,hugh jackman,christian bale,joaquin phoenix,anthony hopkins,jennifer aniston,emma stone,ryan gosling,gal gadot,jason momoa,pedro pascal,millie bobby brown,florence pugh,benedict cumberbatch,tom hiddleston,idris elba,chadwick boseman'},
  {id:'singers',emoji:'🎤',name:'Singers & Bands',
   easy:'taylor swift,justin bieber,ariana grande,billie eilish,ed sheeran,bruno mars,katy perry,lady gaga,beyonce,rihanna,adele,shakira,coldplay,maroon five,one direction,bts,blackpink,the beatles,queen,abba,michael jackson,elvis presley,eminem,drake,selena gomez',
   hard:'dua lipa,the weeknd,harry styles,olivia rodrigo,post malone,sam smith,shawn mendes,imagine dragons,twenty one pilots,linkin park,green day,nirvana,metallica,ac dc,pink floyd,the rolling stones,bob marley,elton john,madonna,whitney houston,celine dion,mariah carey,sabrina carpenter,doja cat,bad bunny,twice,stray kids,nct,exo,red velvet'},
  {id:'videogames',emoji:'🎮',name:'Video Games',
   easy:'minecraft,mario,sonic,pacman,tetris,pokemon,roblox,fortnite,among us,angry birds,zelda,donkey kong,kirby,fruit ninja,candy crush,subway surfers,temple run,flappy bird,pong,space invaders,animal crossing,just dance,mario kart,pikachu,crossy road',
   hard:'the sims,grand theft auto,call of duty,league of legends,genshin impact,fall guys,overwatch,apex legends,valorant,god of war,the last of us,red dead redemption,assassins creed,street fighter,mortal kombat,super smash bros,splatoon,stardew valley,terraria,hollow knight,cuphead,undertale,portal,half life,doom,halo,resident evil,fifa,mobile legends,clash of clans'},
  {id:'cartoons',emoji:'🦸',name:'Cartoon & Anime Characters',
   easy:'mickey mouse,donald duck,goofy,bugs bunny,tom,jerry,spongebob,patrick star,pikachu,doraemon,winnie the pooh,tweety,woody,buzz lightyear,olaf,elsa,simba,nemo,dory,minion,shrek,homer simpson,bart simpson,hello kitty,garfield',
   hard:'naruto,goku,luffy,sailor moon,totoro,spirited away,astro boy,sakura,eren yeager,tanjiro,gojo,deku,ash ketchum,charizard,mewtwo,scooby doo,popeye,betty boop,pink panther,road runner,wile e coyote,woodstock,snoopy,charlie brown,tintin,asterix,rapunzel,mulan,stitch,baymax'},
  {id:'books',emoji:'📚',name:'Books & Authors',
   easy:'harry potter,the hobbit,matilda,charlie and the chocolate factory,the cat in the hat,green eggs and ham,winnie the pooh,peter pan,alice in wonderland,the very hungry caterpillar,where the wild things are,goodnight moon,charlottes web,pinocchio,cinderella,little red riding hood,hansel and gretel,the lion the witch and the wardrobe,diary of a wimpy kid,percy jackson',
   hard:'the hunger games,twilight,the great gatsby,to kill a mockingbird,pride and prejudice,romeo and juliet,hamlet,moby dick,dracula,frankenstein,the alchemist,the little prince,les miserables,don quixote,the odyssey,animal farm,lord of the flies,the catcher in the rye,wuthering heights,jane eyre,sherlock holmes,dune,the lord of the rings,game of thrones,the fault in our stars,little women,the secret garden,treasure island,gulliver travels,robinson crusoe'}
].map(c => {
  const clean = s => Array.from(new Set(String(s).split(',').map(w => w.trim().toUpperCase().replace(/[^A-Z ]/g,'').replace(/\s+/g,' ').trim()).filter(w => w.length >= 2)));
  return {id:c.id, emoji:c.emoji, name:c.name, easy:clean(c.easy), hard:clean(c.hard)};
});
function drawCatById(id){ return DRAW_CATS.find(c => c.id === id) || null; }

// Words / categories this device has already seen (also recorded when you only GUESS), so they don't keep coming back
const DRAW_SEEN_KEY = 'drawSeenWordsV3', DRAW_CATSEEN_KEY = 'drawSeenCatsV3';
let DRAW_SEEN = [], DRAW_CATSEEN = [];
try{ DRAW_SEEN = JSON.parse(localStorage.getItem(DRAW_SEEN_KEY) || '[]') || []; }catch(e){ DRAW_SEEN = []; }
try{ DRAW_CATSEEN = JSON.parse(localStorage.getItem(DRAW_CATSEEN_KEY) || '[]') || []; }catch(e){ DRAW_CATSEEN = []; }
function drawRememberWord(w){
  w = String(w||'').toUpperCase().trim(); if(!w) return;
  DRAW_SEEN = DRAW_SEEN.filter(x => x !== w); DRAW_SEEN.push(w);
  if(DRAW_SEEN.length > 900) DRAW_SEEN = DRAW_SEEN.slice(-900);
  try{ localStorage.setItem(DRAW_SEEN_KEY, JSON.stringify(DRAW_SEEN)); }catch(e){}
}
function drawRememberCat(id){
  DRAW_CATSEEN = DRAW_CATSEEN.filter(x => x !== id); DRAW_CATSEEN.push(id);
  if(DRAW_CATSEEN.length > 40) DRAW_CATSEEN = DRAW_CATSEEN.slice(-40);
  try{ localStorage.setItem(DRAW_CATSEEN_KEY, JSON.stringify(DRAW_CATSEEN)); }catch(e){}
}
function drawRandInt(n){
  try{ const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] % n; }catch(e){ return Math.floor(Math.random()*n); }
}
// New game -> random category, skipping the last few that were played (here or on the previous game of this room)
function pickDrawCategory(){
  const recent = new Set(DRAW_CATSEEN.slice(-Math.min(6, DRAW_CATS.length - 4)));
  if(roomData && roomData.drawCategory && roomData.drawCategory.id) recent.add(roomData.drawCategory.id);
  let pool = DRAW_CATS.filter(c => !recent.has(c.id));
  if(!pool.length) pool = DRAW_CATS.slice();
  const cat = pool[drawRandInt(pool.length)];
  drawRememberCat(cat.id);
  return cat;
}
// Pick a word from the game's category. Levels 1-4 lean easy, 8-10 lean hard, in between mixes both.
// Never repeats a word seen in this room, in earlier games of this room, or recently on this device.
function pickDrawWordCat(level, cat){
  const lvl = level || 1;
  const seen = new Set(DRAW_SEEN);
  if(roomData){
    (roomData.drawHistory || []).forEach(h => { if(h && h.word) seen.add(String(h.word).toUpperCase()); });
    (roomData.drawUsedWords || []).forEach(w => seen.add(String(w).toUpperCase()));
    (roomData.drawSeenWords || []).forEach(w => seen.add(String(w).toUpperCase()));
    if(roomData.drawWord) seen.add(String(roomData.drawWord).toUpperCase());
  }
  const order = lvl <= 4 ? [cat.easy, cat.hard] : lvl <= 7 ? (drawRandInt(2) ? [cat.hard, cat.easy] : [cat.easy, cat.hard]) : [cat.hard, cat.easy];
  for(const list of order){
    const pool = list.filter(w => !seen.has(w));
    if(pool.length) return pool[drawRandInt(pool.length)];
  }
  // Whole category exhausted: take one of the least recently seen words of this category
  const all = [...cat.easy, ...cat.hard];
  all.sort((a, b) => DRAW_SEEN.indexOf(a) - DRAW_SEEN.indexOf(b));
  const oldest = all.slice(0, Math.max(3, Math.floor(all.length / 4)));
  return oldest[drawRandInt(oldest.length)] || 'APPLE';
}

function pickDrawWord(seed, level){
  const used = new Set();
  if(roomData){
    (roomData.drawHistory || []).forEach(h => { if(h && h.word) used.add(String(h.word).toUpperCase()); });
    (roomData.drawUsedWords || []).forEach(w => used.add(String(w).toUpperCase()));
    if(roomData.drawWord) used.add(String(roomData.drawWord).toUpperCase());
  }
  const lvl = level || (roomData && roomData.drawLevel) || 1;
  let preferred;
  if(lvl <= 3) preferred = DRAW_WORDS_EASY;
  else if(lvl <= 6) preferred = [...DRAW_WORDS_MED, ...DRAW_WORDS_EASY];
  else preferred = [...DRAW_WORDS_HARD, ...DRAW_WORDS_MED];

  const pickFrom = (arr) => arr.map(w => String(w).toUpperCase()).filter(w => !used.has(w));
  let pool = pickFrom(preferred);
  if(pool.length < 5) pool = pickFrom(DRAW_WORDS);
  if(!pool.length) pool = DRAW_WORDS.slice();

  let s = 0;
  const src = String(seed || '') + '|' + srvNow() + '|' + Math.random() + '|' + pool.length + '|' + lvl;
  for(let i=0;i<src.length;i++) s = (Math.imul(s, 16777619) ^ src.charCodeAt(i)) >>> 0;
  try{
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    s ^= buf[0];
  }catch(e){ s ^= (Math.random()*0xFFFFFFFF)>>>0; }
  // `s ^= buf[0]` yields a SIGNED int; a negative index returned undefined (Firebase rejects undefined)
  const word = pool[(s >>> 0) % pool.length];
  return word || pool[Math.floor(Math.random()*pool.length)] || 'APPLE';
}

/* ===== SKETCH RACE – animated category cycle (shown once at the start of every new game) ===== */
let _drawSpinKey = '';
let _spySpinKey = '';
function maybeShowSpyCatSpin(){
  if(!roomData || roomData.gameType !== 'spy' || !roomData.spySpinAt || !roomData.spyCategory) return;
  const key = roomId + '|' + roomData.spySpinAt;
  if(_spySpinKey === key) return;
  _spySpinKey = key;
  const total = roomData.spySpinMs || DRAW_SPIN_MS;
  const left = total - (srvNow() - roomData.spySpinAt);
  if(left < 700) return;
  runDrawCatSpin(roomData.spyCategory, left);
}
function maybeShowDrawCatSpin(){
  if(!roomData || roomData.gameType !== 'draw' || !roomData.drawSpinAt || !roomData.drawCategory) return;
  const key = roomId + '|' + roomData.drawSpinAt;
  if(_drawSpinKey === key) return;
  _drawSpinKey = key;
  const total = roomData.drawSpinMs || DRAW_SPIN_MS;
  const left = total - (srvNow() - roomData.drawSpinAt);
  if(left < 700) return;                    // joined/reloaded after the cycle finished
  runDrawCatSpin(roomData.drawCategory, left);
}
function runDrawCatSpin(cat, ms){
  const old = document.getElementById('drawCatOverlay'); if(old) old.remove();
  const ov = document.createElement('div');
  ov.id = 'drawCatOverlay'; ov.className = 'dcat-ov';
  ov.innerHTML = '<div class="dcat-card"><div class="dcat-title">🎨 Choosing your category…</div>'
    + '<div class="dcat-reel"><div class="dcat-emoji" id="dcatEmoji">🎲</div><div class="dcat-name" id="dcatName">Get ready!</div></div>'
    + '<div class="dcat-sub" id="dcatSub">Every word this game comes from the category that lands</div></div>';
  document.body.appendChild(ov);
  const emojiEl = ov.querySelector('#dcatEmoji'), nameEl = ov.querySelector('#dcatName'), subEl = ov.querySelector('#dcatSub'), reel = ov.querySelector('.dcat-reel');
  const t0 = Date.now(), revealAt = Math.max(900, ms - 1500);
  let delay = 70, lastId = '', done = false;
  const step = () => {
    if(done || !document.body.contains(ov)) return;
    const el = Date.now() - t0;
    if(el >= revealAt){
      done = true;
      emojiEl.textContent = cat.emoji; nameEl.textContent = cat.name;
      reel.classList.remove('spin'); reel.classList.add('land');
      ov.querySelector('.dcat-title').textContent = '✨ Your category is…';
      subEl.textContent = 'All words this game are from ' + cat.name + '. Good luck!';
      try{ snd('big'); }catch(e){}
      setTimeout(() => { ov.classList.add('out'); setTimeout(() => ov.remove(), 400); }, Math.max(700, ms - (Date.now() - t0)));
      return;
    }
    let c; let guard = 0;
    do{ c = DRAW_CATS[Math.floor(Math.random() * DRAW_CATS.length)]; guard++; }while((c.id === lastId || c.id === cat.id) && guard < 12);
    lastId = c.id;
    emojiEl.textContent = c.emoji; nameEl.textContent = c.name;
    reel.classList.add('spin');
    try{ snd('tick'); }catch(e){}
    delay = Math.min(360, delay * 1.1 + 4);
    setTimeout(step, delay);
  };
  step();
}

/* ===== SKETCH RACE UI & REAL-TIME DRAWING ===== */
let drawCtx = null;
let drawIsDrawing = false;
let drawTool = 'pen'; // pen | eraser
let drawColor='#2D3436',drawSize=4;
(function(){const p=$('drawPal');if(!p)return;
  const C=['#2D3436','#95A5A6','#E74C3C','#F39C12','#F1C40F','#2ECC71','#1E8449','#1ABC9C','#3498DB','#1F3A93','#9B59B6','#FD79A8','#8D5A2B','#F5CBA7'],S=[2,4,9];
  p.innerHTML=C.map(c=>'<button type="button" class="dc'+(c===drawColor?' on':'')+'" data-col="'+c+'" style="background:'+c+'" aria-label="Color '+c+'"></button>').join('')+'<span class="dsep"></span>'+S.map(n=>'<button type="button" class="ds'+(n===drawSize?' on':'')+'" data-sz="'+n+'" aria-label="Brush size '+n+'"><i style="width:'+(n+4)+'px;height:'+(n+4)+'px"></i></button>').join('');
  p.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.col){drawColor=b.dataset.col;p.querySelectorAll('.dc').forEach(x=>x.classList.toggle('on',x===b))}
    else if(b.dataset.sz){drawSize=+b.dataset.sz;p.querySelectorAll('.ds').forEach(x=>x.classList.toggle('on',x===b))}
    drawTool='pen';const a=$('btnDrawPen'),r=$('btnDrawEraser');if(a)a.classList.add('on');if(r)r.classList.remove('on')});
})();
let drawStrokeBuf = [];
let drawLastPush = 0;
let drawLastPt = null;
let drawLocalSolved = false;
let drawStrokeUnsub = null;

function getDrawCanvas(){
  const c = $('drawCanvas');
  if(!c) return null;
  const wrap = c.parentElement;
  if(wrap){
    const w = Math.max(280, Math.floor(wrap.clientWidth || 320));
    const h = Math.max(220, Math.floor(wrap.clientHeight || 240));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const tw = Math.floor(w * dpr), th = Math.floor(h * dpr);
    if(c.width !== tw || c.height !== th){
      // Preserve drawing on resize only if not intentionally clearing
      let bak = null;
      if(!window._drawSkipRestore){
        try{ if(drawCtx && c.width) bak = c.toDataURL(); }catch(e){}
      }
      c.width = tw; c.height = th;
      drawCtx = c.getContext('2d');
      drawCtx.lineCap = 'round';
      drawCtx.lineJoin = 'round';
      drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if(bak && !window._drawSkipRestore){
        const img = new Image();
        img.onload = () => { try{ drawCtx.drawImage(img, 0, 0, w, h); }catch(e){} };
        img.src = bak;
      } else {
        drawCtx.fillStyle = '#fff';
        drawCtx.fillRect(0, 0, w, h);
      }
    }
  }
  if(!drawCtx){
    drawCtx = c.getContext('2d');
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
  }
  return c;
}

function clearDrawCanvas(){
  const c = $('drawCanvas');
  if(!c) return;
  // Force a clean slate — do not restore any previous bitmap
  window._drawSkipRestore = true;
  getDrawCanvas(); // ensure sized
  if(!drawCtx) return;
  drawCtx.setTransform(1,0,0,1,0,0);
  drawCtx.clearRect(0,0,c.width,c.height);
  drawCtx.fillStyle = '#fff';
  drawCtx.fillRect(0,0,c.width,c.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  window._drawSkipRestore = false;
  drawStrokeBuf = [];
}

let _drawRect = null;
function canvasPos(e){
  const c = $('drawCanvas');
  if(!c) return null;
  // measure the canvas once per stroke (not on every pointer event -> no layout thrashing)
  const r = (drawIsDrawing && _drawRect) ? _drawRect : (_drawRect = c.getBoundingClientRect());
  // Coordinates in CSS pixels (matches ctx after setTransform(dpr))
  let clientX, clientY;
  if(e.touches && e.touches[0]){
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: Math.round(clientX - r.left),
    y: Math.round(clientY - r.top)
  };
}

function applyStrokePoint(pt, tool){
  if(!drawCtx) return;
  if(pt.type === 'start'){
    drawCtx.beginPath();
    drawCtx.moveTo(pt.x, pt.y);
    drawCtx.strokeStyle = tool === 'eraser' ? '#ffffff' : (pt.col || '#2D3436');
    drawCtx.lineWidth = tool === 'eraser' ? 18 : (pt.w || 4);
  } else if(pt.type === 'move'){
    drawCtx.lineTo(pt.x, pt.y);
    drawCtx.stroke();
    drawCtx.beginPath();
    drawCtx.moveTo(pt.x, pt.y);
  }
}

/* ---- compact, append-only stroke sync ----
   Each flush from the drawer is ONE short string added as a new child of rooms/<id>/drawStrokes.
   Points are joined by ';' :   start -> s,x,y,p|e,width,RRGGBB     move -> m,x,y            */
function drawEncodePts(buf){
  const out = [];
  for(const pt of buf){
    if(pt.type === 'start'){
      let col = String(pt.col || '#2D3436').replace('#','');
      if(!/^[0-9a-fA-F]{3,8}$/.test(col)) col = '2D3436';
      out.push('s,'+pt.x+','+pt.y+','+(pt.tool === 'eraser' ? 'e' : 'p')+','+(pt.w || 4)+','+col);
    } else {
      out.push('m,'+pt.x+','+pt.y);
    }
  }
  return out.join(';');
}
function drawApplyChunk(str){
  if(typeof str !== 'string' || !str) return;
  const parts = str.split(';');
  for(let i = 0; i < parts.length; i++){
    const f = parts[i].split(',');
    if(f[0] === 's'){
      applyStrokePoint({type:'start', x:+f[1], y:+f[2], col:'#'+f[5], w:+f[4] || 4}, f[3] === 'e' ? 'eraser' : 'pen');
    } else if(f[0] === 'm'){
      applyStrokePoint({type:'move', x:+f[1], y:+f[2]}, 'pen');
    }
  }
}
let drawGuessRef = null, drawGuessCb = null;
let drawStrokeRef = null, drawStrokeAdded = null, drawStrokeRemoved = null;
function drawDetachListeners(){
  try{ if(drawGuessRef && drawGuessCb) drawGuessRef.off('value', drawGuessCb); }catch(e){}
  try{
    if(drawStrokeRef){
      if(drawStrokeAdded) drawStrokeRef.off('child_added', drawStrokeAdded);
      if(drawStrokeRemoved) drawStrokeRef.off('child_removed', drawStrokeRemoved);
    }
  }catch(e){}
  drawGuessRef = drawGuessCb = null;
  drawStrokeRef = drawStrokeAdded = drawStrokeRemoved = null;
}
function drawAttachGuessListener(){
  if(!roomId) return;
  const ref = db.ref('rooms/'+roomId+'/drawGuesses');
  drawGuessRef = ref;
  drawGuessCb = snap => {
    const data = snap.val() || {};
    renderDrawGuesses(data);
    // If someone else got it right, tell the non-winners
    if(!roundEnded){
      const hit = Object.values(data).find(g => g && g.correct);
      if(hit){
        const wuid = hit.uid;
        if(wuid && wuid !== (user && user.uid)){
          if(!isDrawer() && !drawLocalSolved){
            $('drawStatus').textContent = (hit.name||'Someone') + ' got it!';
            $('drawStatus').style.color = '#00B894';
          }
        }
      }
    }
  };
  ref.on('value', drawGuessCb);
}
function drawAttachStrokeListener(){
  if(!roomId) return;
  const ref = db.ref('rooms/'+roomId+'/drawStrokes');
  drawStrokeRef = ref;
  let clearQueued = false;
  // Existing strokes replay automatically (late join / refresh), then new ones arrive one chunk at a time
  drawStrokeAdded = ref.on('child_added', snap => {
    if(isDrawer()) return;            // the drawer draws locally
    drawApplyChunk(snap.val());
  });
  // The drawer cleared the board (or a new level began): wipe once, however many chunks were removed
  drawStrokeRemoved = ref.on('child_removed', () => {
    if(clearQueued) return;
    clearQueued = true;
    Promise.resolve().then(() => {
      clearQueued = false;
      if(!isDrawer() || !drawIsDrawing) clearDrawCanvas();
    });
  });
}

async function pushStrokeBatch(){
  if(!roomId || !drawStrokeBuf.length || !isDrawer()) return;
  const batch = drawStrokeBuf.splice(0, drawStrokeBuf.length);
  try{
    // ONE small append-only write per flush. (It used to download the whole stroke array, concatenate and
    // re-upload everything on every flush -> O(n^2) traffic that made long games freeze.)
    await db.ref('rooms/'+roomId+'/drawStrokes').push(drawEncodePts(batch));
  }catch(e){}
}

function isDrawer(){
  return !!(roomData && user && roomData.drawDrawerUid === user.uid);
}

function enterDraw(force){
  if(!force && $('screen-draw').classList.contains('active') && !roundEnded){
    renderDrawScores();
    updateDrawLevelBar();
    return;
  }
  resetRoundState();
  roundEnded = false;
  drawLocalSolved = false;
  drawStrokeBuf = [];
  const sb = $('btnSoundDraw');
  if(sb){ sb.textContent = soundOn ? '🔊' : '🔇'; sb.onclick = toggleSound; }
  show('screen-draw');
  // Always start each level on a blank canvas (ignore any leftover strokes)
  window._drawSkipRestore = true;
  drawStrokeBuf = [];
  clearDrawCanvas();
  // Detach old stroke listener before replaying anything
  drawDetachListeners();
  updateDrawLevelBar();
  renderDrawScores();

  const amDrawer = isDrawer();
  const word = roomData.drawWord || '???';
  const drawer = (roomData.players || {})[roomData.drawDrawerUid];
  const drawerName = drawer ? drawer.name : 'Someone';

  $('drawRole').textContent = amDrawer
    ? '🎨 You are drawing!'
    : '👀 ' + drawerName + ' is drawing — guess fast!';

  const wordBox = $('drawWordBox');
  const tools = $('drawTools');
  const guessArea = $('drawGuessArea');

  // SECRET WORD: only the assigned drawer ever sees it in the UI
  if(amDrawer){
    wordBox.style.display = 'block';
    $('drawSecretWord').textContent = word;
    tools.style.display = 'flex';
    guessArea.style.display = 'none';  // drawer doesn't type guesses
    $('drawStatus').textContent = 'Draw the word clearly — others are guessing!';
    $('drawStatus').style.color = '#636E72';
    bindDrawCanvas();
  } else {
    // Guessers must NEVER see the secret word until the round ends
    wordBox.style.display = 'none';
    $('drawSecretWord').textContent = '';
    tools.style.display = 'none';
    guessArea.style.display = 'block';
    const gi = $('drawGuessInput');
    if(gi){ gi.value = ''; gi.disabled = false; }
    const bg = $('btnDrawGuess'); if(bg) bg.disabled = false;
    $('drawStatus').textContent = 'Watch the canvas and type your guess';
    $('drawStatus').style.color = '#636E72';
    unbindDrawCanvas();
  }
  // Live guesses visible to EVERYONE (drawer + guessers)
  const gw = $('drawGuessesWrap'); if(gw) gw.style.display = 'block';
  renderDrawGuesses(roomData.drawGuesses || {});
  // Live listener for new guesses
  drawAttachGuessListener();
  // Hide next button until level ends
  const btnN = $('btnDrawNext'); if(btnN) btnN.style.display = 'none';

  // Live stroke listener (also replays whatever has already been drawn this level)
  drawAttachStrokeListener();

  startDrawTimer();
  boardReady = true;
  snd('go');
  try{ maybeShowDrawCatSpin(); }catch(e){}
}

function updateDrawLevelBar(){
  const lvl = roomData.drawLevel || 1;
  const max = roomData.drawMaxLevels || DRAW_MAX_LEVELS;
  if($('drawLevelLabel')) $('drawLevelLabel').textContent = 'Level '+lvl+' / '+max;
  if($('drawCatChip')){ const dc = roomData.drawCategory; $('drawCatChip').textContent = dc ? (dc.emoji+' '+dc.name) : ''; }
  const me = roomData.players?.[user.uid];
  const wins = me?.drawWins || 0;
  if($('drawSeriesScore')) $('drawSeriesScore').textContent = 'Your wins: '+wins;
}

function renderDrawScores(){
  const host = $('drawScoreBoard');
  if(!host || !roomData) return;
  const players = Object.values(roomData.players || {});
  host.innerHTML = players.map(p => {
    const solved = p.drawSolved;
    const isDr = p.uid === roomData.drawDrawerUid;
    return `<div class="sc${p.uid===user.uid?' me':''}"><div class="n">${esc(p.avatar||'')} ${esc(p.name)}${isDr?' 🎨':''}</div><div class="s">${solved?'✓':(p.drawWins||0)}</div></div>`;
  }).join('');
}

function bindDrawCanvas(){
  const c = getDrawCanvas();
  if(!c) return;
  unbindDrawCanvas();
  const start = e => {
    if(!isDrawer() || roundEnded) return;
    e.preventDefault();
    _drawRect = null;
    getDrawCanvas();               // make sure the canvas is sized (once per stroke)
    drawIsDrawing = true;
    const p = canvasPos(e);
    if(!p) return;
    drawLastPt = p;
    const pt = {type:'start', x:p.x, y:p.y, tool: drawTool, col: drawColor, w: drawSize, t: srvNow()};
    applyStrokePoint(pt, drawTool);
    drawStrokeBuf.push(pt);
  };
  const move = e => {
    if(!drawIsDrawing || !isDrawer() || roundEnded) return;
    e.preventDefault();
    const p = canvasPos(e);
    if(!p) return;
    if(drawLastPt && p.x === drawLastPt.x && p.y === drawLastPt.y) return;   // ignore duplicate points
    drawLastPt = p;
    const pt = {type:'move', x:p.x, y:p.y, tool: drawTool, t: srvNow()};
    applyStrokePoint(pt, drawTool);
    drawStrokeBuf.push(pt);
    // throttle pushes
    if(srvNow() - drawLastPush > 100){
      drawLastPush = srvNow();
      pushStrokeBatch();
    }
  };
  const end = e => {
    if(!drawIsDrawing) return;
    drawIsDrawing = false;
    _drawRect = null;
    pushStrokeBatch();
  };
  c.onmousedown = start;
  c.onmousemove = move;
  window.addEventListener('mouseup', end);
  c.ontouchstart = start;
  c.ontouchmove = move;
  c.ontouchend = end;
  c._drawEnd = end;
}

function unbindDrawCanvas(){
  const c = getDrawCanvas();
  if(!c) return;
  c.onmousedown = c.onmousemove = c.ontouchstart = c.ontouchmove = c.ontouchend = null;
  if(c._drawEnd) window.removeEventListener('mouseup', c._drawEnd);
}

function replayDrawStrokes(strokes){
  clearDrawCanvas();
  (strokes || []).forEach(pt => applyStrokePoint(pt, pt.tool || 'pen'));
}

function startDrawTimer(){
  clearInterval(timerInterval);
  const tick = () => {
    if(!roomData || !roomData.endsAt) return;
    const left = Math.max(0, Math.ceil((roomData.endsAt - srvNow())/1000));
    const shown = Math.min(left, DRAW_SECONDS);          // the category cycle at the start of a game is not counted
    const el = $('drawTimerText'); if(el) el.textContent = shown;
    const ring = $('drawTimerRing');
    if(ring){
      const pct = Math.max(0, shown / DRAW_SECONDS * 100);
      ring.style.setProperty('--pct', pct + '%');
      ring.classList.toggle('low', shown <= 15);
    }
    if(left <= 0 && !roundEnded) finishDrawRound(null);
  };
  tick();
  timerInterval = setInterval(tick, 250);
}

function renderDrawGuesses(guessMap){
  const list = $('drawGuessList');
  if(!list) return;
  const entries = [];
  if(guessMap){
    // Support both array-style (push keys) and uid-map
    Object.keys(guessMap).forEach(k => {
      const g = guessMap[k];
      if(!g || !g.guess) return;
      entries.push({
        key: k,
        guess: g.guess,
        correct: !!g.correct,
        name: g.name || 'Player',
        avatar: g.avatar || '🎮',
        uid: g.uid || k,
        at: g.at || 0
      });
    });
  }
  entries.sort((a,b) => (b.at||0) - (a.at||0));
  if(!entries.length){
    list.innerHTML = '<div class="none-words" style="font-size:.8rem">No guesses yet…</div>';
    return;
  }
  list.innerHTML = entries.map(e => {
    const mine = e.uid === (user && user.uid);
    const label = e.correct ? ('✓ ' + esc(e.guess)) : esc(e.guess);
    return '<div class="draw-guess-item'+(e.correct?' correct':'')+'">'
      +'<span class="who">'+esc(e.avatar)+' '+(mine?'You':esc(e.name))+'</span>'
      +label
      +'</div>';
  }).join('');
}

async function submitDrawGuess(){
  if(roundEnded || isDrawer() || drawLocalSolved) return;
  const input = $('drawGuessInput');
  const guess = (input.value || '').trim().toUpperCase().replace(/[^A-Z ]/g,'');
  if(!guess || guess.length < 2) return;
  const answer = (roomData.drawWord || '').toUpperCase().replace(/[^A-Z ]/g,'');
  const correct = guess === answer || guess.replace(/\s+/g,'') === answer.replace(/\s+/g,'');
  const payload = {
    guess,
    correct,
    uid: user.uid,
    name: (profile && profile.name) || 'Player',
    avatar: (profile && profile.avatar) || '🎮',
    at: srvNow()
  };
  try{
    // Shared log — every client listens and renders
    await db.ref('rooms/'+roomId+'/drawGuesses').push(payload);
  }catch(e){ toast('Could not send guess'); return; }

  if(correct){
    drawLocalSolved = true;
    $('drawStatus').textContent = 'Correct! You got it!';
    $('drawStatus').style.color = '#00B894';
    snd('win');
    if(input) input.disabled = true;
    const bg = $('btnDrawGuess'); if(bg) bg.disabled = true;
    try{
      await db.ref('rooms/'+roomId+'/players/'+user.uid).update({drawSolved: true, score: 1});
    }catch(e){}
    finishDrawRound(user.uid);
  } else {
    $('drawStatus').textContent = 'Not quite — keep trying!';
    $('drawStatus').style.color = '#E17055';
    snd('bad');
    if(input){ input.value = ''; input.focus(); }
  }
}

async function finishDrawRound(winnerUid){
  if(roundEnded) return;
  roundEnded = true;
  clearInterval(timerInterval);
  unbindDrawCanvas();
  pushStrokeBatch();

  const players = Object.values(roomData.players || {});
  const winner = winnerUid
    ? players.find(p => p.uid === winnerUid)
    : players.find(p => p.drawSolved);
  const answer = (roomData.drawWord || '').toUpperCase();
  const lvl = roomData.drawLevel || 1;
  const maxL = roomData.drawMaxLevels || DRAW_MAX_LEVELS;
  const me = roomData.players?.[user.uid];

  if(winner){
    const name = winner.uid === user.uid ? 'You' : (winner.name || 'Someone');
    $('drawStatus').innerHTML = name + ' guessed it! Answer: <b>' + esc(answer) + '</b>';
    $('drawStatus').style.color = '#00B894';
  } else {
    $('drawStatus').innerHTML = 'Time\'s up! Answer was: <b>' + esc(answer) + '</b>';
    $('drawStatus').style.color = '#E74C3C';
  }

  try{ drawRememberWord(answer); }catch(e){}
  // Reveal word to everyone
  const wordBox = $('drawWordBox');
  if(wordBox){
    wordBox.style.display = 'block';
    $('drawSecretWord').textContent = answer;
  }
  $('drawGuessArea').style.display = 'none';
  $('drawTools').style.display = 'none';
  // Keep shared guess log visible so everyone sees who got it
  renderDrawGuesses(roomData.drawGuesses || {});


  // History + score (host writes)
  if(isHost && answer){
    const entry = {
      level: lvl,
      word: answer,
      drawerUid: roomData.drawDrawerUid,
      winnerUid: winner ? winner.uid : null,
      winnerName: winner ? winner.name : null
    };
    try{
      const hist = Array.isArray(roomData.drawHistory) ? roomData.drawHistory.slice() : [];
      if(!hist.some(h => h.level === lvl && h.word === answer)){
        hist.push(entry);
        await db.ref('rooms/'+roomId+'/drawHistory').set(hist);
      }
    }catch(e){}
  }

  let myWins = me?.drawWins || 0;
  if(winner && winner.uid === user.uid){
    myWins = Math.min(lvl, (me.drawWins || 0) + 1);
    try{ await db.ref('rooms/'+roomId+'/players/'+user.uid).update({drawWins: myWins, score: myWins}); }catch(e){}
  }

  const seriesDone = lvl >= maxL;
  const btnNext = $('btnDrawNext');
  if(btnNext){
    if(seriesDone){
      btnNext.textContent = 'SEE FINAL RESULTS';
      btnNext.dataset.mode = 'results';
    } else {
      btnNext.textContent = 'NEXT LEVEL →';
      btnNext.dataset.mode = 'next';
    }
    btnNext.style.display = 'flex';
  }
  updateDrawLevelBar();
  renderDrawScores();
}

function checkDrawRaceWinner(){
  if(roundEnded || !roomData || roomData.gameType !== 'draw') return;
  if(roomData.status !== 'playing') return;
  const winner = Object.values(roomData.players||{}).find(p => p.drawSolved);
  if(winner) finishDrawRound(winner.uid);
}

// Tool buttons & guess
document.addEventListener('click', e => {
  if(e.target?.id === 'btnDrawPen'){
    drawTool = 'pen';
    $('btnDrawPen')?.classList.add('on');
    $('btnDrawEraser')?.classList.remove('on');
  }
  if(e.target?.id === 'btnDrawEraser'){
    drawTool = 'eraser';
    $('btnDrawEraser')?.classList.add('on');
    $('btnDrawPen')?.classList.remove('on');
  }
  if(e.target?.id === 'btnDrawClear'){
    if(!isDrawer() || roundEnded) return;
    clearDrawCanvas();
    drawStrokeBuf = [];
    db.ref('rooms/'+roomId+'/drawStrokes').remove().catch(()=>{});
  }
  if(e.target?.id === 'btnDrawGuess'){
    submitDrawGuess();
  }
  if(e.target?.id === 'btnDrawNext'){
    const mode = e.target.dataset.mode || 'next';
    e.target.disabled = true;
    if(mode === 'results'){
      if(isHost){
        db.ref('rooms/'+roomId).update({status:'results', endedAt: srvNow()}).catch(()=>{});
      }
      showResults();
      e.target.disabled = false;
      return;
    }
    if(isHost){
      resetRoundState();
      clearDrawCanvas();
      Promise.resolve(db.ref('rooms/'+roomId+'/drawStrokes').remove())
        .catch(()=>{})
        .then(() => beginRound())
        .catch(()=>toast('Could not start next level'))
        .finally(() => { e.target.disabled = false; });
      return;
    } else {
      toast('Waiting for host to start the next level…');
    }
    e.target.disabled = false;
  }
});

document.addEventListener('keydown', e => {
  if(e.target?.id === 'drawGuessInput' && e.key === 'Enter'){
    e.preventDefault();
    submitDrawGuess();
  }
});

function computeDrawResults(){
  const players = Object.values((roomData&&roomData.players)||{});
  const hist = Array.isArray(roomData.drawHistory) ? roomData.drawHistory : [];
  const maxL = roomData.drawMaxLevels || DRAW_MAX_LEVELS;
  const rows = players.map(p => {
    const wins = p.drawWins || 0;
    const items = hist.map(h => {
      const mine = h.winnerUid === p.uid;
      const drew = h.drawerUid === p.uid;
      return {
        w: 'L'+h.level+': '+(h.word||'?')+(mine?' ✓':'')+(drew?' 🎨':''),
        pts: mine ? 1 : 0,
        dupe: !mine,
        cat: h.word || ''
      };
    });
    if(!items.length){
      items.push({w: wins ? (wins+' win'+(wins>1?'s':'')) : 'No wins yet', pts: wins, dupe: wins===0});
    }
    return {p, items, raw: items.length, final: wins, lost: Math.max(0, hist.length - wins), uniqueN: wins, sharedN:0, level: roomData.drawLevel||1, maxL};
  });
  rows.sort((a,b)=>(b.final-a.final)||String(a.p.name).localeCompare(String(b.p.name)));
  return rows;
}
