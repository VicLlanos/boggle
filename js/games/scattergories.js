/* ===== DYNAMIC SCATTERGORIES CATEGORY GENERATOR ===== */
// Broad, everyday categories that almost anyone can answer for most letters.
// Overly narrow ideas (pizza topping, excuse for being late, something with buttons, etc.) were removed.
const BASE_CATEGORIES = [
  // People & names
  "A boy's name",
  "A girl's name",
  "A famous person",
  "An actor or actress",
  "A singer or band",
  "An athlete",
  "A job or occupation",
  "A cartoon character",

  // Animals & nature
  "An animal",
  "A wild animal",
  "A pet",
  "A bird",
  "A sea creature",
  "An insect or bug",
  "Something at the zoo",
  "Something on a farm",
  "A fruit or vegetable",
  "A plant or flower",
  "A type of weather",

  // Places
  "A country",
  "A city",
  "A type of building",
  "A type of store",
  "A place to visit on vacation",
  "Something you find in a house",
  "Something you find in a kitchen",
  "Something you find at school",
  "Something you find at the beach",
  "Something you find in a park",
  "Something in a bathroom",
  "Something in a bedroom",
  "Something in a garden",
  "Something in the sky",
  "Something in the ocean",
  "Something in a forest",

  // Food & drink
  "A food",
  "A drink",
  "A dessert or sweet",
  "A snack",
  "Something you eat for breakfast",

  // Things
  "Something you wear",
  "A piece of furniture",
  "Something with wheels",
  "A type of transport",
  "A tool",
  "A toy",
  "A musical instrument",
  "Something you can hold in your hand",
  "Something you take on a trip",

  // Describing words
  "Something soft",
  "Something hard",
  "Something cold",
  "Something hot",
  "Something round",
  "Something sweet",
  "Something that makes a sound",
  "Something that flies",

  // Culture & everyday life
  "A movie or TV show",
  "A song title",
  "A video game",
  "A book or novel",
  "A sport or game",
  "A hobby",
  "A school subject",
  "A holiday or celebration",
  "A color",
  "A body part",
  "A brand or company",
  "Something you do every day",
  "Things at a party",
  "Something that makes you happy",
  "Something scary",
  "Something funny",
  "A feeling or emotion"
];

// Categories that overlap each other (e.g. "An animal" and "Something at the zoo") are grouped into
// families, and a single round only takes up to `cap` categories from the same family.
// This keeps the 12 categories varied and avoids confusing near-duplicates on the same sheet.
const CATEGORY_FAMILY = {
  "An animal":"animal","A wild animal":"animal","A pet":"animal","A bird":"animal","A sea creature":"animal",
  "An insect or bug":"animal","Something at the zoo":"animal","Something on a farm":"animal","Something in the ocean":"animal",
  "A fruit or vegetable":"food","A food":"food","A drink":"food","A dessert or sweet":"food","A snack":"food",
  "Something you eat for breakfast":"food","Something sweet":"food",
  "Something with wheels":"wheels","A type of transport":"wheels",
  "A country":"place","A city":"place","A place to visit on vacation":"place","A type of building":"place","A type of store":"place",
  "Something you find in a house":"scene","Something you find in a kitchen":"scene","Something you find at school":"scene",
  "Something you find at the beach":"scene","Something you find in a park":"scene","Something in a bathroom":"scene",
  "Something in a bedroom":"scene","Something in a garden":"scene","Something in the sky":"scene","Something in a forest":"scene",
  "Something soft":"prop","Something hard":"prop","Something cold":"prop","Something hot":"prop","Something round":"prop",
  "Something that makes a sound":"prop","Something that flies":"prop",
  "Something that makes you happy":"mood","Something scary":"mood","Something funny":"mood","A feeling or emotion":"mood",
  "A famous person":"person","An actor or actress":"person","A singer or band":"person","An athlete":"person","A cartoon character":"person",
  "A movie or TV show":"media","A song title":"media","A video game":"media","A book or novel":"media"
};
const CATEGORY_FAMILY_CAP = { media:2, animal:1, food:2, wheels:1, place:2, scene:2, prop:2, mood:1, person:2 };

function seededRandom(seed){
  let s = seed % 2147483647;
  if(s<=0)s+=2147483646;
  return function(){s = s*16807 % 2147483647; return (s-1)/2147483646};
}

function generateCategories(seedStr, count=12){
  // Pick unique categories from the broad list, shuffled with a seeded random,
  // while limiting how many overlapping (same-family) categories can appear in one round.
  let seed = 0;
  for(let i=0;i<seedStr.length;i++) seed = (seed*31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = seededRandom(seed || srvNow());

  const pool = [...BASE_CATEGORIES];
  // Fisher-Yates shuffle with seeded random
  for(let i=pool.length-1;i>0;i--){
    const j = Math.floor(rand()*(i+1));
    [pool[i],pool[j]] = [pool[j],pool[i]];
  }
  const picked = [], used = {};
  const want = Math.min(count, pool.length);
  for(const c of pool){
    if(picked.length >= want) break;
    const fam = CATEGORY_FAMILY[c];
    if(fam){
      const cap = CATEGORY_FAMILY_CAP[fam] || 1;
      if((used[fam]||0) >= cap) continue;
      used[fam] = (used[fam]||0) + 1;
    }
    picked.push(c);
  }
  // Safety net: should never be needed, but guarantees `count` categories
  for(const c of pool){ if(picked.length >= want) break; if(!picked.includes(c)) picked.push(c); }
  return picked;
}

function randomLetter(hard=false){
  const easy = "ABCDEFGHIJKLMNOPRSTW";
  const all = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const pool = hard ? all : easy;
  return pool[Math.floor(Math.random()*pool.length)];
}

function updateScatProgress(){
  const total = (roomData.categories || []).length || 12;
  const filled = Object.values(scatAnswers).filter(v => v && v.trim()).length;
  const pct = Math.round((filled / total) * 100);
  const fill = $('scatProgressFill');
  const txt = $('scatProgressText');
  if(fill) fill.style.width = pct + '%';
  if(txt) txt.textContent = filled + '/' + total;

  const status = $('scatStatus');
  if(!status) return;
  if(filled === 0){
    status.textContent = 'Tap a category and start typing…';
    status.className = 'scat-status';
  } else if(filled < total){
    status.textContent = filled + ' of ' + total + ' answered — keep going!';
    status.className = 'scat-status good';
  } else {
    status.textContent = 'All filled! Sit tight or tweak answers.';
    status.className = 'scat-status good';
  }
}

function scatSparkAt(el){
  if(!el) return;
  const r = el.getBoundingClientRect();
  const s = document.createElement('div');
  s.className = 'scat-spark';
  s.textContent = '✨';
  s.style.left = (r.left + r.width/2) + 'px';
  s.style.top = (r.top + r.height/2) + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
}

function enterScatter(){
  if($('screen-scatter').classList.contains('active') && !roundEnded){
    renderScatScores();
    return;
  }
  resetRoundState();
  scatAnswers = {}; scatVerdicts = {};
  const sb = $('btnSoundScat');
  if(sb){ sb.textContent = soundOn ? '🔊' : '🔇'; sb.onclick = toggleSound; }
  show('screen-scatter');

  // Dramatic letter reveal
  const letterEl = $('scatLetter');
  letterEl.classList.remove('pulse-letter');
  letterEl.textContent = roomData.letter || '?';
  // Restart pop animation
  letterEl.style.animation = 'none';
  void letterEl.offsetWidth;
  letterEl.style.animation = '';
  setTimeout(() => letterEl.classList.add('pulse-letter'), 800);

  renderScatCategories();
  renderScatScores();
  updateScatProgress();
  startScatTimer();
  boardReady = true;
  snd('go');
}

/* ===== SCATTERGORIES CATEGORY VERIFIER (first layer of validation) =====
   Layer 1: built-in word lists for closed sets (instant, works offline).
   Layer 2: category inheritance. A kangaroo is an animal, so it also fits "Something at the zoo",
            "A wild animal", "A pet" (softly) etc. Related categories no longer disagree with each other.
   Layer 3: word-association data (Datamuse) for "something you find in / at ..." and descriptive categories.
   Layer 4: Wikidata. The answer is looked up and its "is a / subclass of / parent taxon / occupation" chain is
            tested against the category's classes, so "Tiger" is confirmed as an animal and "Table" is not.
   Verdicts: ok = confirmed in category · maybe = real but unconfirmed (counts, players may challenge)
             no = not a real word/name, or clearly something else (auto-rejected, can be restored). */
const ScatVerify=(()=>{
  const LEX={
    country:'afghanistan albania algeria andorra angola argentina armenia australia austria azerbaijan bahamas bahrain bangladesh barbados belarus belgium belize benin bhutan bolivia bosnia botswana brazil brunei bulgaria burundi cambodia cameroon canada chad chile china colombia comoros congo croatia cuba cyprus czechia denmark djibouti dominica ecuador egypt eritrea estonia eswatini ethiopia fiji finland france gabon gambia georgia germany ghana greece grenada guatemala guinea guyana haiti honduras hungary iceland india indonesia iran iraq ireland israel italy jamaica japan jordan kazakhstan kenya kiribati kosovo kuwait kyrgyzstan laos latvia lebanon lesotho liberia libya liechtenstein lithuania luxembourg madagascar malawi malaysia maldives mali malta mauritania mauritius mexico micronesia moldova monaco mongolia montenegro morocco mozambique myanmar namibia nauru nepal netherlands nicaragua niger nigeria norway oman pakistan palau panama paraguay peru philippines poland portugal qatar romania russia rwanda samoa senegal serbia seychelles singapore slovakia slovenia somalia spain sudan suriname sweden switzerland syria taiwan tajikistan tanzania thailand togo tonga trinidad tunisia turkey turkmenistan tuvalu uganda ukraine uruguay uzbekistan vanuatu venezuela vietnam yemen zambia zimbabwe',
    color:'red orange yellow green blue purple violet indigo pink brown black white gray grey gold silver teal cyan magenta maroon navy beige turquoise lavender lime olive peach coral crimson scarlet amber ivory khaki mint salmon tan aqua azure bronze burgundy cream fuchsia lilac mauve ochre plum rose ruby sapphire emerald',
    part:'gum gums tonsil tonsils uvula scalp temple nostril eyelid pupil iris retina cornea earlobe armpit groin navel knuckle fist sole instep bicep biceps tricep triceps abdomen pelvis skull jawbone collarbone sternum hamstring quadricep pancreas bladder intestine colon esophagus artery vein nerve tendon ligament cartilage joint ribcage diaphragm appendix gallbladder spleen windpipe larynx molar canine incisor arm leg hand foot head neck back chest hip knee ankle elbow wrist finger thumb toe nail eye ear nose mouth lip tongue tooth teeth chin cheek face hair skin brain heart lung liver kidney stomach spine rib shoulder thigh calf shin heel palm belly waist forehead eyebrow eyelash jaw throat bone muscle',
    inst:'piano guitar violin cello viola harp flute oboe clarinet bassoon trumpet trombone tuba horn drum cymbal xylophone harmonica accordion banjo ukulele saxophone organ piccolo bagpipe tambourine triangle marimba sitar mandolin harpsichord recorder kazoo bongo synthesizer',
    animal:'alpaca anteater antelope armadillo badger bison beaver bobcat camel caterpillar chameleon chimpanzee cougar coyote crane cricket dingo eel emu ferret gecko gibbon hare heron hornet kiwi ladybug lynx mole mosquito moth mule newt ocelot orca panther pony porcupine puma quail reindeer rooster scorpion skunk sloth stork tapir termite tortoise trout wasp weasel wombat ant ape bat bear bee bird boar buffalo butterfly camel cat cheetah chicken cobra cow crab crocodile crow deer dog dolphin donkey dove dragonfly duck eagle eel elephant falcon fish flamingo fox frog gazelle giraffe goat goose gorilla hamster hawk hedgehog hippo horse hyena iguana jaguar kangaroo koala lemur leopard lion lizard llama lobster monkey moose mouse octopus ostrich otter owl panda parrot peacock pelican penguin pig pigeon rabbit raccoon rat raven rhino salmon seal shark sheep snail snake sparrow spider squid squirrel swan tiger toad turkey turtle vulture walrus whale wolf worm yak zebra',
    produce:'artichoke asparagus bean beetroot blackberry cantaloupe celery clementine cranberry currant dragonfruit durian jackfruit leek mandarin mulberry nut papaya parsnip persimmon pomelo quince rhubarb shallot squash tangerine apple apricot avocado banana beet blueberry broccoli cabbage carrot cauliflower celery cherry coconut corn cucumber date eggplant fig garlic grape grapefruit guava kale kiwi lemon lettuce lime lychee mango melon mushroom nectarine okra olive onion orange papaya peach pear pea pepper pineapple plum pomegranate potato pumpkin radish raspberry spinach strawberry tomato turnip watermelon yam zucchini',
    travel:'bag backpack suitcase luggage passport ticket wallet phone charger camera map guidebook sunglasses hat sunscreen towel swimsuit toothbrush toothpaste soap shampoo deodorant medicine firstaid snacks water bottle umbrella raincoat jacket shoes boots sandals flipflops sneakers headphones book magazine pillow blanket tent sleepingbag flashlight lantern compass binoculars keys card cash money creditcard id boardingpass earplugs neckpillow eye mask adapter converter',
    house:'sofa couch chair table bed desk lamp mirror clock vase rug carpet curtain blinds pillow blanket sheet towel soap shampoo toothbrush toothpaste plate bowl cup glass fork knife spoon pan pot kettle microwave oven fridge refrigerator stove sink faucet toilet shower bathtub soap dish sponge broom mop vacuum dustpan trash bin garbage can broomstick iron ironingboard hanger wardrobe closet shelf drawer cabinet counter refrigerator freezer dishwasher washer dryer',
    kitchen:'spoon fork knife plate bowl cup glass pan pot kettle spatula ladle colander cuttingboard oven mitt apron microwave fridge stove sink dishwasher toaster blender mixer whisk peeler grater measuringcup measuring spoon',
    clothing:'shirt pants jeans shorts skirt dress jacket coat sweater hoodie sweatshirt socks shoes boots sandals sneakers hat cap scarf gloves belt tie underwear bra swimsuit raincoat umbrella',
    soft:'pillow blanket cushion towel cotton wool silk velvet fleece plush teddy sponge foam mattress cloud',
    hard:'rock stone brick metal steel iron wood table desk chair wall floor concrete glass diamond bone',
    school:'pencil pen eraser rubber ruler notebook book textbook workbook backpack bag schoolbag desk chair teacher student pupil principal headmaster classroom blackboard chalkboard whiteboard chalk marker board bell locker library librarian cafeteria canteen gym gymnasium playground homework test exam quiz grade report card calculator scissors glue crayon paper folder binder stapler tape sharpener globe map clock lunchbox lunch uniform bus janitor counselor nurse coach classmate class lesson lecture projector computer laptop tablet flag auditorium hallway corridor dictionary atlas encyclopedia compass protractor paint paintbrush easel microscope bookshelf cubby detention recess assembly diploma schedule timetable sticker highlighter ink pencilcase professor tutor scholar graduate worksheet essay syllabus curriculum subject math science history art music friend friends bully field trip mascot trophy cap gown yearbook playground swing slide hoop basketball court field track gymnast whistle teacher desk tray chalkdust blackboard duster tissue sink',
    beach:'sand sun sunscreen sunblock suntan towel umbrella shell seashell wave ocean sea water surf surfboard bodyboard swimsuit bikini trunk sunglasses hat cap flipflop sandal bucket shovel spade sandcastle castle crab starfish seagull gull lifeguard tower boat ship sailboat yacht kayak canoe jetski cooler chair lounger deckchair hammock ball volleyball frisbee kite snorkel mask fin flipper goggle tide shore coast coastline dune driftwood seaweed kelp coral reef pebble rock stone sunbed bonfire campfire picnic blanket mat cabana hut palm coconut tree dolphin whale jellyfish turtle shark fish sunset sunrise seashore horizon pier boardwalk lighthouse buoy anchor net bait rod tan sunburn swimmer surfer tourist vendor icecream popsicle lotion oil sunhat sarong raft floatie inflatable tube cooler basket crabs clam oyster lobster pelican sandpiper heat breeze foam salt',
    park:'bench tree grass flower path trail playground swing slide seesaw sandbox fountain pond lake duck goose squirrel bird pigeon dog jogger runner picnic table basketball court field gazebo statue monument garden bush hedge fence gate lamp lamppost trash bin bicycle bike scooter skateboard skater kite frisbee ball soccer baseball diamond tennis track stroller carousel monkeybar hill rock bridge stream creek bandstand tent vendor cart icecream hotdog balloon puppy leaf acorn chipmunk rabbit butterfly bee ladybug beetle ant sprinkler walkway sidewalk pavilion shelter restroom ranger campsite campground barbecue grill hammock zipline rope net climbing wall cyclist walker family child kid toddler skatepark',
    party:'balloon cake cupcake candle confetti streamer music dj speaker dance game gift present pizza snack chip soda juice punch drink cup plate napkin decoration banner hat mask costume pinata invitation guest host friend birthday song karaoke light disco photobooth camera icecream cookie candy chocolate sprinkle noise laughter fun food table tablecloth cooler microphone mic floor entertainer clown magician bouncehouse goodiebag favor firework sparkler toast champagne wine beer cocktail whistle horn crown sash glowstick lantern flower garland piata cheese fruit sandwich dessert pie punchbowl',
    round:'ball sphere circle wheel coin globe moon sun earth planet orange apple tomato pizza plate clock button bubble balloon ring donut doughnut bagel cookie pancake marble pea grape cherry orb disc disk dish bowl cup pot pan lid tire tyre hoop frisbee eye eyeball cd dvd record compass barrel egg melon watermelon pumpkin peach plum lemon lime meatball bead pearl pebble coconut basketball football soccerball volleyball tennisball golfball bowlingball drum cymbal face manhole wreath halo saturn jupiter mars venus mercury neptune uranus onion radish cherrytomato meatball pill tablet bun muffin cupcake globe yoyo',
    hand:'pen pencil phone remote key coin cup spoon fork knife brush book card stone rock ball apple toothbrush mouse watch lighter marker comb mirror wallet ticket cellphone smartphone mug glass bottle can fan flashlight torch camera toy cube dice marble pebble feather leaf flower sandwich cookie spatula whisk screwdriver hammer wrench pliers scissors ruler eraser stapler sponge cloth tissue napkin cigarette candle lantern umbrella racket racquet bat baseball tennisball golfball shell egg sticker paper map letter envelope stamp badge ring bracelet necklace glasses sunglasses calculator controller joystick gamepad tablet kindle ipod earphone headphone battery bulb cd usb',
    sound:'bell horn whistle drum guitar piano siren alarm phone radio speaker trumpet thunder voice buzzer clap clapper violin flute saxophone trombone cymbal gong tambourine maraca rattle squeak creak crash bang boom explosion firework engine motor car truck train plane helicopter airplane dog cat bird rooster cow pig lion tiger owl cricket frog bee thunderstorm wind rain wave waterfall stream microphone mic television tv stereo headphone doorbell buzzer timer clock kettle whistle kettle laugh scream shout yell cry sob song music echo knock footstep fireworks gunshot cannon jackhammer lawnmower blender vacuum dishwasher washing',
    cold:'ice snow freezer fridge refrigerator winter popsicle icecream glacier iceberg frost breeze wind rain water arctic antarctica snowman snowflake icicle blizzard sleet hail fog night shadow metal steel penguin polarbear walrus seal cooler icebox icecube slush sorbet gelato milkshake smoothie soda lemonade iced tea beer soup gazpacho cucumber lettuce mountain north pole sky moon sidewalk tile marble stone floor air conditioner aircon fan',
    hot:'fire sun stove oven lava coffee tea soup fireplace desert flame volcano summer sauna steam iron grill barbecue toaster kettle microwave heater radiator candle torch lighter match spark ember coal sand pepper chili curry spice wasabi mustard sunlight lamp bulb engine exhaust asphalt pavement beach tropics equator tropical jungle cocoa chocolate oatmeal pizza bread fryingpan pan pot skillet furnace boiler lightbulb blowtorch welder star mars venus',
    scary:'ghost monster vampire zombie spider snake clown dark darkness skeleton witch dragon shark nightmare storm thunder werewolf demon devil dracula frankenstein mummy skull graveyard cemetery haunted house bat rat cockroach scorpion tarantula bear wolf lion tiger crocodile alligator gorilla shadow bogeyman boogeyman killer murderer predator tornado hurricane earthquake volcano fire fall heights needle dentist doctor injection surgery blood horror movie scream scarecrow pumpkin jackolantern grim reaper alien predator jaws spiders snakes',
    funny:'clown joke comedy comedian monkey meme cartoon prank pun pie tickle laugh silly goofy banana peel whoopee cushion fart burp hiccup tickle parody sitcom stand-up improv mime jester fool buffoon puppet impression impersonation blooper bloopers outtake wig mask clownshoe pillow fight custard tripping falling prat slapstick riddle limerick punchline gag mustache funnyface face duckface bubble sneeze tongue dance animals cat dog baby',
    happy:'puppy kitten friend family music food pizza icecream gift holiday vacation sunshine smile laugh hug love money chocolate dance birthday game games party sunset rainbow flower beach travel weekend payday christmas summer snow pet dog cat baby cake candy cookie coffee movie song concert festival adventure reunion wedding graduation victory win success freedom nature walk swim sleep nap bath massage surprise compliment kindness joy fun toys toy playground friends kiss cuddle',
    daily:'eat sleep brush shower bathe walk work study read drink cook clean dress commute run exercise pray text call wake nap shop wash drive ride cycle stretch meditate journal write breathe think talk laugh smile play watch listen scroll browse email chat feed water cleaning laundry dishes shave comb groom floss moisturize jog yoga gym school class lunch dinner breakfast snack coffee tea',
    late:'traffic overslept oversleep sleep alarm bus train flat tire tyre car breakdown rain storm snow accident sick illness emergency lost phone keys key battery gas fuel jam delay clock traffic strike construction roadwork detour parking elevator lift stuck dog cat baby kid child homework forgot wallet bike bicycle ferry flight plane subway metro mrt jeepney tricycle flood typhoon blackout brownout wifi internet meeting call appointment doctor dentist hospital funeral wedding line queue crowd closed road bridge rush hour weather headache fever stomach cramps hangover nap procrastination'
  };
  // ---- additional lexicons (compact form: "ice cream" is written icecream) ----
  Object.assign(LEX,{
    boyname:'aaron adam adrian aiden alan albert alex alexander alfred andrew andres andy anthony arthur ben benjamin bill billy blake bob bobby brandon brian bruce bryan caleb carl carlos charles charlie chris christian christopher colin connor craig dan daniel dave david dennis derek diego dominic donald douglas dylan ed eddie edward eli elijah emmanuel eric ethan evan felix francis frank fred gabriel gary george gerald gilbert glen gordon grant greg harry henry howard hugo ian isaac isaiah ivan jack jacob jake james jason jay jeff jeremy jerry jesse jim jimmy joe joel john johnny jonathan jordan jose joseph joshua juan julian justin keith ken kenneth kevin kyle larry lawrence lee leo leon leonard liam logan louis lucas luke marco marcus mark martin mason matt matthew max michael miguel mike nathan neil nicholas nick noah oliver oscar owen patrick paul pedro peter philip phil randy ray raymond richard rick rico robert roger ron ronald ryan sam samuel scott sean sebastian simon stephen steve steven ted terry theodore thomas tim timothy tom tommy tony travis tyler victor vincent walter wayne william xavier zach zachary',
    girlname:'abby abigail ada adriana alexandra alice alicia alina alison amanda amber amelia amy ana andrea angela angelica anna anne annie ariana ashley audrey ava barbara beatrice becky bella beth bianca brenda bridget brittany caitlin camila carla carmen caroline catherine cecilia charlotte chloe christina cindy claire clara claudia cora courtney daisy dana daniela debbie diana donna dora eileen elena eleanor elizabeth ella ellie emily emma erica erin eva eve evelyn faith fiona florence frances gabriela gemma georgia gina grace gwen hailey hannah heather heidi helen holly irene iris isabel isabella ivy jackie jade jane janet jasmine jean jenna jennifer jenny jessica jill joan joanna josephine joy judy julia juliet june karen kate katherine kathy katie kayla kelly kim kimberly laura lauren leah lena lily linda lisa liz lola lucy luna lydia mabel madison maggie maria marie marina martha mary maya megan melanie melissa mia michelle mila molly monica nadia naomi natalie natasha nicole nina nora olivia paige pamela patricia paula penny phoebe priscilla rachel rebecca renee rita rosa rose ruby ruth sabrina sally samantha sandra sara sarah scarlett sharon sheila sophia sophie stella stephanie susan sylvia tanya tara teresa tiffany tina valerie vanessa veronica victoria violet virginia vivian wendy yvonne zoe',
    job:'accountant actor actress analyst architect artist astronaut athlete attorney auditor author baker banker barber bartender biologist boxer broker builder butcher carpenter cashier chef chemist clerk clown coach comedian cook counselor courier dancer dentist designer detective dietitian director diver doctor driver economist editor electrician engineer farmer firefighter fisherman florist gardener guard guide hairdresser handyman illustrator inspector instructor interpreter inventor janitor jeweler jockey journalist judge lawyer lecturer librarian lifeguard locksmith magician mailman manager mason mechanic miner minister model monk musician nanny navigator nurse officer optician painter paramedic pastor pharmacist photographer pianist pilot pirate plumber poet police policeman policewoman politician porter postman potter priest principal producer professor programmer psychologist publisher receptionist referee reporter sailor scientist sculptor secretary senator sheriff shopkeeper singer soldier stylist surgeon surveyor tailor teacher technician therapist translator tutor typist umpire usher vendor vet veterinarian waiter waitress warden weaver welder wrestler writer zookeeper cowboy lumberjack beekeeper blacksmith shepherd',
    bird:'albatross blackbird bluebird bluejay budgie bunting buzzard canary cardinal cassowary chickadee chicken cockatiel cockatoo condor cormorant crane crow cuckoo dove duck eagle egret emu falcon finch flamingo goose grouse gull harrier hawk hen heron hornbill hummingbird ibis jay kestrel kingfisher kiwi kookaburra lark lovebird loon macaw magpie mockingbird nightingale oriole osprey ostrich owl parakeet parrot partridge peacock pelican penguin pheasant pigeon puffin quail raven rhea roadrunner robin rooster seagull shrike sparrow starling stork swallow swan swift tern thrush toucan turkey vulture warbler woodpecker wren bird',
    sea:'shark whale dolphin orca octopus squid jellyfish starfish seahorse crab lobster shrimp prawn clam oyster mussel scallop eel stingray manta turtle seal sealion walrus otter seaotter manatee dugong narwhal beluga coral anemone urchin seaurchin barnacle krill plankton swordfish tuna salmon cod trout bass marlin clownfish angelfish pufferfish piranha goldfish catfish mackerel sardine anchovy herring flounder halibut snapper grouper barracuda lionfish hammerhead nautilus cuttlefish conch sponge seaweed kelp penguin blobfish anglerfish tilapia carp perch pike guppy fish seagull pelican',
    insect:'ant bee wasp hornet fly mosquito gnat moth butterfly beetle ladybug ladybird cricket grasshopper locust cicada dragonfly damselfly mantis cockroach termite flea louse tick spider scorpion centipede millipede caterpillar firefly lightningbug weevil aphid earwig bedbug maggot mite tarantula stinkbug bumblebee honeybee larva grub worm snail slug katydid mayfly bug insect',
    pet:'dog cat puppy kitten hamster gerbil guineapig rabbit bunny fish goldfish betta parrot parakeet budgie canary cockatiel turtle tortoise lizard gecko iguana snake ferret chinchilla mouse rat hedgehog horse pony tarantula frog pigeon cockatoo lovebird bird',
    domestic:'dog cat cow pig sheep goat chicken hen rooster duck goose turkey horse pony donkey hamster rabbit puppy kitten guineapig goldfish canary parakeet budgie bull ox calf lamb piglet',
    zoo:'cage enclosure keeper zookeeper aquarium aviary reptilehouse ticket tickets giftshop cafe tram safari exhibit habitat feeding pen fence bars moat sign map stroller balloon popcorn icecream souvenir tour guide',
    farm:'cow pig horse sheep goat chicken hen rooster duck goose turkey donkey llama alpaca bull ox lamb calf piglet foal chick cat dog barn silo tractor hay haystack straw plow plough fence field crop corn wheat rice barley oats soybean farmer scarecrow trough stable coop pen pasture windmill orchard harvest manure mud well bucket pitchfork shovel wagon cart combine irrigation sprinkler egg milk wool meadow carabao kalabaw',
    plant:'rose tulip daisy lily orchid sunflower daffodil lavender jasmine violet poppy marigold carnation peony iris lilac hyacinth dandelion buttercup petunia pansy hibiscus lotus magnolia azalea begonia camellia chrysanthemum cactus fern moss ivy bamboo palm oak maple pine birch willow elm cedar cypress redwood sequoia banyan mango acacia bonsai bush shrub hedge grass clover weed vine sage thyme mint basil parsley rosemary oregano cilantro dill chive tree flower plant herb seed sprout fungus mushroom sampaguita gumamela aloe algae seaweed',
    snack:'chips crisps popcorn pretzel crackers cracker cookies cookie nuts peanuts almonds cashews trailmix granola candy chocolate gummy gummies fries nachos pizza sandwich fruit apple banana grapes yogurt cheese jerky biscuit biscuits cake muffin cupcake donut doughnut icecream pudding raisins ricecake popsicle chicharron kropek turon fishball lumpia siomai wafer bar pie',
    dessert:'cake cupcake pie tart brownie cookie cookies icecream sundae gelato sorbet pudding custard flan mousse tiramisu cheesecake donut doughnut cobbler crumble macaron eclair profiterole trifle parfait fudge candy chocolate caramel toffee lollipop gummy marshmallow jelly jello waffle pancake crepe baklava cannoli churro halohalo leche bibingka sorbetes biko turon candyfloss cottoncandy froyo popsicle',
    drink:'water juice milk tea coffee soda cola lemonade smoothie milkshake shake cocoa punch cider espresso latte cappuccino mocha frappe tonic sprite fanta pepsi coke gatorade slush kefir yogurt coconutwater gulaman taho sago icedtea hotchocolate mineralwater sparklingwater',
    breakfast:'eggs egg bacon sausage toast bread butter jam cereal oatmeal porridge pancakes pancake waffles waffle muffin bagel croissant yogurt fruit banana apple orange juice milk coffee tea granola omelet omelette hashbrowns ham cheese pastry donut danish biscuit grits tapsilog silog longganisa tocino tapa rice garlicrice pandesal champorado',
    food:'pizza burger hamburger sandwich pasta noodles rice bread soup salad steak chicken fish pork beef lamb sausage bacon ham egg eggs cheese butter yogurt cereal pancake waffle fries chips taco burrito sushi curry stew lasagna spaghetti ramen dumpling nugget hotdog adobo sinigang lechon pancit pie cake cookie icecream popcorn pretzel bagel donut muffin toast omelet tofu beans lentils oatmeal porridge noodle meatball meatloaf casserole kebab falafel hummus paella risotto pho gyoza tempura tamale quesadilla nachos enchilada shawarma dimsum',
    furniture:'chair table desk bed sofa couch bench stool shelf bookshelf bookcase cabinet dresser wardrobe closet drawer nightstand ottoman armchair recliner rocker hammock futon bunk crib cradle highchair cot daybed headboard hutch sideboard buffet console vanity counter bar throne beanbag',
    wheels:'car bus truck van bike bicycle motorcycle scooter skateboard rollerskates rollerblades wagon cart wheelbarrow stroller wheelchair tricycle trike train tram tractor taxi jeep jeepney tuktuk trolley pram skates lorry limo limousine ambulance firetruck bulldozer forklift golfcart gokart segway unicycle caravan camper rv suitcase luggage shoppingcart dolly cab',
    transport:'car bus train plane airplane aeroplane boat ship ferry yacht canoe kayak raft submarine helicopter jet rocket subway metro tram trolley taxi cab bike bicycle motorcycle scooter skateboard tricycle jeepney tuktuk rickshaw cablecar gondola balloon hotairballoon sled sleigh horse camel donkey carriage cart van truck lorry limousine monorail hoverboard segway parachute zipline escalator elevator walking',
    tool:'hammer screwdriver wrench spanner pliers saw drill axe hatchet chisel file plane level ruler tapemeasure shovel spade rake hoe trowel pickaxe crowbar sledgehammer mallet wirecutters scissors knife vise clamp sander grinder ladder toolbox nail screw bolt nut tweezers shears jackhammer chainsaw blowtorch soldering',
    toy:'ball doll teddy teddybear bear lego blocks puzzle kite yoyo robot car truck train dollhouse actionfigure figure frisbee marbles jumprope top spinner slinky rattle drum xylophone puppet playdoh clay crayon balloon bubbles swing seesaw slide trampoline scooter bike skates tricycle sandbox bucket watergun boomerang cards jigsaw checkers chess dominoes dice rubikscube barbie hotwheels plush stuffed hulahoop pogostick tops',
    bath:'toilet sink shower bathtub tub towel soap shampoo conditioner toothbrush toothpaste mirror razor comb brush loofah sponge mat rug plunger toiletpaper tissue faucet drain curtain cabinet scale hairdryer dryer floss mouthwash deodorant lotion cream cottonswab bathrobe robe slippers bidet tap bucket dipper tabo',
    bed:'bed pillow blanket sheet sheets mattress duvet comforter quilt lamp nightstand closet wardrobe dresser alarmclock clock mirror curtain rug carpet poster teddy teddybear slippers pajamas pyjamas hanger shelf desk chair fan aircon diary book headboard bunk crib window',
    garden:'flower flowers rose tulip daisy grass lawn tree bush hedge shrub fence gate path pond fountain statue bench swing hose sprinkler wateringcan shovel spade rake hoe trowel pot planter vase soil dirt mud compost seed seeds bulb weed weeds worm worms snail slug bee butterfly ladybug bird birdhouse birdbath scarecrow greenhouse shed trellis vine ivy fern moss pebble rock stone gnome mower lawnmower wheelbarrow gloves',
    sky:'cloud clouds sun moon star stars planet comet meteor rainbow lightning thunder bird birds plane airplane helicopter kite balloon rocket satellite drone jet aurora sunrise sunset storm rain snow hail wind fog mist haze eclipse galaxy constellation venus mars jupiter saturn mercury parachute firework fireworks smoke cirrus cumulus ufo blimp zeppelin skydiver bat butterfly eagle hawk',
    ocean:'water wave waves tide current salt sand shell shells coral reef seaweed kelp fish shark whale dolphin octopus squid jellyfish starfish crab lobster shrimp turtle seal walrus eel ship boat sailboat submarine ferry buoy anchor island iceberg diver scuba snorkel surfer surfboard trench plankton krill lighthouse pearl treasure shipwreck mermaid',
    forest:'tree trees bush leaf leaves branch trunk bark log stump moss fern mushroom acorn pinecone pine oak maple birch cedar vine ivy path trail stream creek river pond squirrel deer bear wolf fox owl rabbit hare bird woodpecker raccoon skunk badger boar moose elk lynx hedgehog beaver chipmunk bat snake frog toad spider ant bee butterfly firefly cabin camp tent campfire hiker ranger berries berry flower grass mud rock rocks cave',
    weather:'rain snow sleet hail wind storm thunder lightning fog mist cloud clouds sun sunny cloudy rainy windy foggy stormy snowy humid dry hot cold cool warm freezing frost ice tornado hurricane typhoon cyclone monsoon blizzard drizzle shower downpour flood drought heatwave breeze gust gale tempest haze smog rainbow dew thunderstorm hailstorm sandstorm squall overcast bagyo',
    emotion:'happy sad angry mad joy joyful love hate fear scared afraid anxious nervous worried excited calm relaxed bored tired sleepy lonely jealous proud shy embarrassed ashamed guilty grateful hopeful hope surprised shocked confused curious cheerful content delighted disgusted eager envious frustrated glad grumpy gloomy irritated annoyed upset stressed depressed amazed awe panic rage sorrow grief bliss ecstatic enthusiastic optimistic pessimistic miserable terrified thrilled',
    building:'house home apartment condo mansion cottage cabin hut shack tent igloo castle palace tower skyscraper temple church mosque cathedral chapel synagogue school college university library museum hospital clinic bank hotel inn motel hostel airport station terminal mall market store shop supermarket restaurant cafe bakery factory warehouse barn garage shed office stadium arena theater theatre cinema gym pool prison jail fortress lighthouse windmill pyramid monument barracks dormitory dorm bungalow villa townhouse penthouse hall pavilion greenhouse',
    store:'supermarket grocery market mall boutique bakery butcher pharmacy drugstore bookstore bookshop shoestore florist hardware toystore deli cafe convenience sarisari department outlet gasstation petshop jewelry electronics furniture clothing pawnshop thrift stationery sportinggoods kiosk mart shop store',
    vacation:'beach island resort hotel cruise safari camp camping mountain mountains lake river waterfall forest park museum zoo themepark disneyland paris london rome tokyo hawaii bali boracay palawan cebu cancun maldives thailand italy spain greece egypt japan mexico dubai venice swiss alps',
    sweet:'candy sugar honey cake chocolate cookie icecream syrup jam jelly caramel fudge pie donut pastry cupcake pudding lollipop gum gummy marshmallow molasses nectar mango pineapple strawberry banana grape watermelon cherry dates fruit soda juice maple frosting icing sherbet',
    flies:'bird plane airplane helicopter jet kite balloon rocket drone butterfly bee fly mosquito wasp hornet bat eagle owl hawk dragonfly moth superman angel fairy ufo glider parachute frisbee paperairplane arrow bullet insect parrot sparrow pigeon',
    hobby:'reading drawing painting singing dancing cooking baking gardening fishing hiking camping cycling swimming running jogging knitting sewing crocheting photography writing blogging gaming collecting stamps coins traveling surfing skating skiing climbing yoga chess puzzles origami pottery sculpting woodworking birdwatching bowling archery fencing karaoke acting magic juggling skateboarding scrapbooking embroidery calligraphy',
    sport:'soccer football basketball baseball softball tennis golf rugby cricket hockey volleyball badminton boxing wrestling karate judo taekwondo swimming diving gymnastics athletics running track marathon cycling skiing snowboarding surfing skating archery fencing rowing sailing bowling billiards pool darts chess checkers monopoly scrabble sepaktakraw arnis pickleball squash polo lacrosse handball netball weightlifting climbing triathlon tag hideandseek hopscotch jackstones patintero uno poker bingo cards',
    subject:'math mathematics science english history geography art music pe physicaleducation biology chemistry physics algebra geometry calculus literature language spanish french filipino drama computer technology economics civics reading writing spelling grammar health socialstudies psychology sociology philosophy statistics trigonometry',
    holiday:'christmas easter halloween thanksgiving newyear newyears valentines valentine independenceday birthday wedding anniversary graduation eid diwali hanukkah ramadan lent carnival fiesta festival mothersday fathersday laborday memorialday patriotday holiday party reunion'
  });
  // category text -> how it is verified.
  //   t = Wikidata classes · lex = built-in word list(s) · via = ANY answer that is OK for these categories is OK here too
  //   viaSoft = answers OK for those categories are only "maybe" here · viaStrict = reject if the answer is clearly not any via-category
  //   assoc / adj = Datamuse word-association / "adjective + noun" sets · strict = a confident mismatch is auto-rejected
  //   maybeLex = real answer but not a great fit (shown yellow) · head/any = match on last word / any word
  const R={
    "A boy's name":{t:['Q12308941','Q3409032'],lex:'boyname'},
    "A girl's name":{t:['Q11879590','Q3409032'],lex:'girlname'},
    "A famous person":{t:['Q5']},
    "An actor or actress":{t:['Q33999']},
    "A singer or band":{t:['Q177220','Q215380','Q639669']},
    "An athlete":{t:['Q2066131']},
    "A job or occupation":{t:['Q12737077','Q28640'],lex:'job'},
    "A cartoon character":{t:['Q95074','Q1114461','Q188784']},

    "An animal":{t:['Q729','Q7377','Q5113','Q10811','Q10908','Q1390','Q1358','Q127282','Q10915'],lex:'animal',strict:1},
    "A wild animal":{via:['An animal'],viaStrict:1,maybeLex:'domestic',maybeNote:'is a real animal, but it is usually a domestic one rather than a wild animal'},
    "A pet":{lex:'pet',viaSoft:['An animal'],viaStrict:1},
    "A bird":{lex:'bird',t:['Q5113'],strict:1},
    "A sea creature":{lex:'sea',assoc:['sea','ocean'],viaSoft:['An animal'],where:'in the sea'},
    "An insect or bug":{lex:'insect',t:['Q1390','Q1358']},
    "Something at the zoo":{lex:'zoo',via:['An animal'],assoc:['zoo'],where:'at a zoo'},
    "Something on a farm":{lex:'farm',via:['A fruit or vegetable'],viaSoft:['An animal'],assoc:['farm'],where:'on a farm'},
    "A fruit or vegetable":{t:['Q3314483','Q11004'],lex:'produce',strict:1},
    "A plant or flower":{t:['Q756','Q506','Q10884'],lex:'plant'},
    "A type of weather":{lex:'weather',assoc:['weather'],where:'in the weather'},

    "A country":{t:['Q6256'],lex:'country',strict:1},
    "A city":{t:['Q515','Q1549591'],strict:1},
    "A type of building":{lex:'building',t:['Q41176']},
    "A type of store":{lex:'store',t:['Q213441'],assoc:['shop','store']},
    "A place to visit on vacation":{lex:'vacation',via:['A country','A city'],t:['Q570116','Q23442','Q40080']},
    "Something you find in a house":{lex:'house',assoc:['house','home'],where:'in a house'},
    "Something you find in a kitchen":{lex:'kitchen',assoc:['kitchen','cooking'],where:'in a kitchen'},
    "Something you find at school":{lex:'school',head:1,assoc:['school','classroom'],where:'at school'},
    "Something you find at the beach":{lex:'beach',head:1,assoc:['beach','seaside'],where:'at the beach'},
    "Something you find in a park":{lex:'park',head:1,assoc:['park','playground'],where:'in a park'},
    "Something in a bathroom":{lex:'bath',assoc:['bathroom'],where:'in a bathroom'},
    "Something in a bedroom":{lex:'bed',assoc:['bedroom','sleep'],where:'in a bedroom'},
    "Something in a garden":{lex:'garden',via:['A plant or flower'],assoc:['garden'],where:'in a garden'},
    "Something in the sky":{lex:'sky',via:['A bird'],assoc:['sky'],where:'in the sky'},
    "Something in the ocean":{lex:'ocean',via:['A sea creature'],assoc:['ocean','sea'],where:'in the ocean'},
    "Something in a forest":{lex:'forest',via:['A plant or flower'],assoc:['forest','woods'],viaSoft:['An animal'],where:'in a forest'},

    "A food":{t:['Q2095','Q746549'],lex:'food',via:['A fruit or vegetable']},
    "A drink":{t:['Q40050'],lex:'drink'},
    "A dessert or sweet":{t:['Q182413'],lex:'dessert'},
    "A snack":{lex:'snack',via:['A dessert or sweet'],viaSoft:['A food']},
    "Something you eat for breakfast":{lex:'breakfast',via:['A fruit or vegetable'],viaSoft:['A food'],where:'for breakfast'},

    "Something you wear":{lex:'clothing',t:['Q11460','Q11457']},
    "A piece of furniture":{lex:'furniture',t:['Q14745']},
    "Something with wheels":{lex:'wheels',t:['Q42889']},
    "A type of transport":{lex:'transport',t:['Q42889']},
    "A tool":{lex:'tool',t:['Q39546']},
    "A toy":{lex:'toy',t:['Q11422']},
    "A musical instrument":{t:['Q34379'],lex:'inst',strict:1},
    "Something you can hold in your hand":{lex:'hand',head:1},
    "Something you take on a trip":{lex:'travel',assoc:['travel','trip','vacation'],where:'on a trip'},

    "Something soft":{lex:'soft',adj:['soft']},
    "Something hard":{lex:'hard',adj:['hard']},
    "Something cold":{lex:'cold',head:1,adj:['cold']},
    "Something hot":{lex:'hot',head:1,adj:['hot']},
    "Something round":{lex:'round',head:1,adj:['round']},
    "Something sweet":{lex:'sweet',via:['A dessert or sweet'],adj:['sweet']},
    "Something that makes a sound":{lex:'sound',head:1,assoc:['sound','noise']},
    "Something that flies":{lex:'flies',via:['A bird'],assoc:['fly','flying']},

    "A movie or TV show":{t:['Q11424','Q5398426','Q15416']},
    "A song title":{t:['Q7366','Q134556','Q482994']},
    "A video game":{t:['Q7889']},
    "A book or novel":{t:['Q571','Q7725634','Q8261']},
    "A sport or game":{lex:'sport',t:['Q349','Q11410']},
    "A hobby":{lex:'hobby',t:['Q47728']},
    "A school subject":{lex:'subject',t:['Q11862829','Q2465832']},
    "A holiday or celebration":{lex:'holiday',t:['Q1445650','Q132241']},
    "A color":{t:['Q1075'],lex:'color'},
    "A body part":{t:['Q4936952'],lex:'part'},
    "A brand or company":{t:['Q431289','Q4830453','Q783794']},
    "Something you do every day":{lex:'daily',any:1},
    "Things at a party":{lex:'party',head:1,assoc:['party','celebration'],where:'at a party'},
    "Something that makes you happy":{lex:'happy',head:1},
    "Something scary":{lex:'scary',head:1},
    "Something funny":{lex:'funny',head:1},
    "A feeling or emotion":{lex:'emotion',t:['Q9415']}
  };
  const SETS={};
  const has=(k,w)=>{if(!w||!LEX[k])return false;(SETS[k]=SETS[k]||new Set(LEX[k].split(' ')));return SETS[k].has(w)||SETS[k].has(w.replace(/(es|s)$/,''))||SETS[k].has(w.replace(/ies$/,'y'))};
  const keysOf=k=>k?[].concat(k):[];
  // Lexicon match: whole answer, joined form (sand castle -> sandcastle), head noun (beach TOWEL), or any word for verb-ish categories
  const lexHitKeys=(keys,rule,norm)=>{
    const compact=norm.replace(/[\s\-']+/g,''),toks=norm.split(/[\s\-']+/).filter(Boolean);
    return keysOf(keys).some(k=>{
      if(has(k,norm)||has(k,compact))return true;
      if(rule&&rule.head&&toks.length>1&&has(k,toks[toks.length-1]))return true;
      if(rule&&rule.any&&toks.some(t=>t.length>=3&&has(k,t)))return true;
      return false;
    });
  };
  const lexHit=(rule,norm)=>!!(rule&&rule.lex&&lexHitKeys(rule.lex,rule,norm));
  // Word-association sets from Datamuse: "triggers" of a seed word (rel_trg) and nouns usually described by an adjective (rel_jja), cached 30 days.
  const AS_TTL=30*864e5, ASC={};
  function assocSet(kind,seed){
    const key=kind+'_'+seed;
    if(ASC[key])return ASC[key];
    try{const o=JSON.parse(localStorage.getItem('wa_as2_'+key)||'null');if(o&&srvNow()-o.t<AS_TTL){return ASC[key]=Promise.resolve(new Set(o.w))}}catch(e){}
    const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),4000);
    return ASC[key]=fetch('https://api.datamuse.com/words?'+(kind==='a'?'rel_jja=':'rel_trg=')+encodeURIComponent(seed)+'&max=1000',{signal:ctl.signal})
      .then(r=>r.ok?r.json():[]).then(a=>{
        const w=(a||[]).map(x=>String(x.word||'').toLowerCase());
        if(w.length){try{localStorage.setItem('wa_as2_'+key,JSON.stringify({t:srvNow(),w}))}catch(e){}}
        else delete ASC[key];
        return new Set(w);
      }).catch(()=>{delete ASC[key];return new Set()}).finally(()=>clearTimeout(tm));
  }
  async function assocCheck(rule,norm){
    const toks=norm.split(/[\s\-']+/).filter(Boolean);
    const cand=new Set([norm,norm.replace(/(es|s)$/,''),norm.replace(/ies$/,'y'),norm.replace(/[\s\-']+/g,'')]);
    if(toks.length>1){const l=toks[toks.length-1];cand.add(l);cand.add(l.replace(/(es|s)$/,''));cand.add(l.replace(/ies$/,'y'))}
    const ps=[];(rule.assoc||[]).forEach(s=>ps.push(assocSet('t',s)));(rule.adj||[]).forEach(s=>ps.push(assocSet('a',s)));
    const sets=await Promise.all(ps);
    return sets.some(S=>[...cand].some(c=>c&&S.has(c)));
  }
  // Pre-load association data for this round's categories so answers are confirmed instantly
  function warm(cats){(cats||[]).forEach(c=>{const r=R[c];if(!r)return;(r.assoc||[]).forEach(s=>assocSet('t',s));(r.adj||[]).forEach(s=>assocSet('a',s))})}
  const dictHas=w=>{const t=w.split(/[\s\-']+/).filter(x=>x.length>=3);return dictReady&&DICT.size>50000&&t.length>0&&t.every(x=>DICT.has(x)||DICT.has(x.replace(/(es|s)$/,'')))};
  const cache={};
  const lbl=h=>h.label+(h.description?' ('+h.description+')':'');
  // Faster failure on a hung request (was 8s x2): 4.5s, one retry
  async function jget(url,n=2){for(let k=0;k<n;k++){const c=new AbortController(),t=setTimeout(()=>c.abort(),4500);try{const r=await fetch(url,{signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}catch(e){if(k===n-1){console.warn('Fact-check request failed:',e);throw e}}finally{clearTimeout(t)}}}
  // ---- caches: in-memory + localStorage (14-day TTL) so repeat answers/ancestors cost zero requests ----
  const TTL=14*864e5, LS_P='wa_wd_parents_v2', LS_S='wa_wd_search_v1';
  const loadLS=k=>{try{const o=JSON.parse(localStorage.getItem(k)||'{}'),now=srvNow(),out={};for(const id in o){if(o[id]&&now-o[id][0]<TTL)out[id]=o[id]}return out}catch(e){return{}}};
  const PC=loadLS(LS_P), SC=loadLS(LS_S);           // id -> [ts, parents[]] · term -> [ts, hits[]]
  let saveT=null;
  const trim=(o,max)=>{const ks=Object.keys(o);if(ks.length>max){ks.sort((x,y)=>o[x][0]-o[y][0]).slice(0,ks.length-max).forEach(k=>delete o[k])}};
  const persist=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{trim(PC,6000);trim(SC,400);localStorage.setItem(LS_P,JSON.stringify(PC));localStorage.setItem(LS_S,JSON.stringify(SC))}catch(e){}},1500)};
  const inflightS={};
  const search=term=>{
    const k=term.toLowerCase().trim();
    if(SC[k]) return Promise.resolve(SC[k][1]);
    if(inflightS[k]) return inflightS[k];
    return inflightS[k]=jget('https://www.wikidata.org/w/api.php?'+new URLSearchParams({action:'wbsearchentities',search:term,language:'en',uselang:'en',type:'item',limit:'7',format:'json',origin:'*'}))
      .then(d=>{const h=d.search||[];SC[k]=[srvNow(),h.map(x=>({id:x.id,label:x.label,description:x.description}))];persist();return SC[k][1]})
      .finally(()=>{delete inflightS[k]});
  };
  // Walk "instance of / subclass of / parent taxon / occupation" upwards. Only uncached ids hit the network, in parallel batches of 50.
  async function parents(ids){
    const need=ids.filter(i=>!PC[i]);
    const chunks=[];for(let k=0;k<need.length;k+=50)chunks.push(need.slice(k,k+50));
    await Promise.all(chunks.map(async ch=>{
      const d=await jget('https://www.wikidata.org/w/api.php?'+new URLSearchParams({action:'wbgetentities',ids:ch.join('|'),props:'claims',format:'json',origin:'*'}));
      const now=srvNow();
      ch.forEach(id=>{const e=(d.entities||{})[id];if(!e)return;const par=[];['P31','P279','P171','P106'].forEach(pr=>((e.claims||{})[pr]||[]).forEach(c=>{const v=c.mainsnak&&c.mainsnak.datavalue&&c.mainsnak.datavalue.value;if(v&&v.id)par.push(v.id)}));PC[id]=[now,par]});
    }));
    persist();
    const out={};ids.forEach(i=>{out[i]=PC[i]?PC[i][1]:[]});return out;
  }
  // returns {id: matched hit id | null, complete: true when the whole ancestry was explored}
  async function match(ids,targets){
    const T=new Set(targets),seen=new Set(ids),from={};ids.forEach(i=>from[i]=i);
    let level=ids.slice();
    for(let depth=0;depth<9;depth++){
      if(!level.length)return{id:null,complete:true};
      const next=[];
      const pm=await parents(level);               // cached + parallel batches
      for(const id in pm)for(const par of pm[id]){
        if(T.has(par))return{id:from[id],complete:true};
        if(!seen.has(par)){seen.add(par);from[par]=from[id];next.push(par)}
      }
      level=next.slice(0,80);
    }
    return{id:null,complete:false};
  }
  const inflight={};
  function check(cat,val){
    const k=cat+'|'+val.toLowerCase().trim();
    if(inflight[k]) return inflight[k];
    return inflight[k]=checkImpl(cat,val).finally(()=>{delete inflight[k]});
  }
  const lcFirst=s=>s.charAt(0).toLowerCase()+s.slice(1);
  const OFFLINE_NOTE='The online fact-checker isn’t reachable right now, so this is unverified. Others can challenge it.';
  async function checkImpl(cat,val){
    const norm=val.toLowerCase().replace(/[^a-z' \-]/g,'').trim(),rule=R[cat]||null,short=cat.replace(/^(An?|The) /,'').toLowerCase(),art=lcFirst(cat);
    // 1) Fast path: built-in lexicon match (common-sense lists, plural/singular handled inside has())
    if(lexHit(rule,norm))return{v:'ok',note:'Confirmed: '+val+' fits “'+short+'”'};
    // Real answer, but not a great fit (e.g. a dog is not really a "wild animal")
    if(rule&&rule.maybeLex&&lexHitKeys(rule.maybeLex,rule,norm))return{v:'maybe',note:'“'+val+'” '+(rule.maybeNote||'is real, but may not fit')+'. Others may challenge.'};
    const ck=cat+'|'+norm;if(cache[ck])return cache[ck];
    let offline=false,softNote='';
    try{
      // 2) Category inheritance: if the answer is good for a parent category, it is good here too
      //    (kangaroo -> animal -> "something at the zoo"). All parent checks run in parallel.
      if(rule&&(rule.via||rule.viaSoft)){
        const names=[...(rule.via||[]),...(rule.viaSoft||[])];
        const res=await Promise.all(names.map(n=>checkImpl(n,val).catch(()=>({v:'maybe',offline:1}))));
        const byName={};names.forEach((n,i)=>byName[n]=res[i]);
        res.forEach(r=>{if(r&&r.offline)offline=true});
        const hard=(rule.via||[]).find(n=>byName[n].v==='ok');
        if(hard)return cache[ck]={v:'ok',note:'Confirmed: “'+val+'” is '+lcFirst(hard)+', so it fits “'+short+'”'};
        const soft=(rule.viaSoft||[]).find(n=>byName[n].v==='ok');
        if(soft){
          softNote='“'+val+'” is '+lcFirst(soft)+', but we couldn’t confirm it fits “'+short+'”. Others may challenge.';
          if(!(rule.assoc||rule.adj||(rule.t&&rule.t.length)))return cache[ck]={v:'maybe',note:softNote};
        }
        // Clearly none of the parent categories (e.g. "table" is not an animal) -> reject for strict inheritance categories
        if(rule.viaStrict&&!offline&&names.every(n=>byName[n].v==='no'))return cache[ck]={v:'no',note:'“'+val+'” isn’t '+art+'.'};
      }
      // 3) Word association / "adjective + noun" data (Datamuse)
      if(rule&&(rule.assoc||rule.adj)){
        let okA=false;try{okA=await assocCheck(rule,norm)}catch(e){}
        if(okA)return cache[ck]={v:'ok',note:rule.where?'Confirmed: “'+val+'” is commonly found '+rule.where:'Confirmed: '+val+' fits “'+short+'”'};
      }
      // 4) Wikidata classes
      let hits=null;
      if(rule&&rule.t&&rule.t.length){
        hits=await search(val);
        if(!hits.length){
          if(rule.strict&&!dictHas(norm))return cache[ck]={v:'no',note:'Not recognised as a real word or name.'};
        }else{
          const mr=await match(hits.map(h=>h.id),rule.t),id=mr.id,h0=hits.find(h=>h.id===id);
          if(id)return cache[ck]={v:'ok',note:'Confirmed: '+lbl(h0)};
          if(rule.strict&&mr.complete)return cache[ck]={v:'no',note:'“'+lbl(hits[0])+'” isn’t '+art+'.'};
          return cache[ck]={v:'maybe',note:'Found “'+lbl(hits[0])+'” but couldn’t confirm it’s '+art+'. Others may challenge.'};
        }
      }
      // 5) Leftovers: a real word we just cannot place is a judgement call (yellow, counts, can be challenged)
      if(softNote)return cache[ck]={v:'maybe',note:softNote};
      if(dictHas(norm))return cache[ck]={v:'maybe',note:'Real word, but we couldn’t confirm it fits “'+short+'”. Others may challenge it.'};
      if(hits===null){try{hits=await search(val)}catch(e){offline=true;hits=[]}}
      if(hits&&hits.length)return cache[ck]={v:'maybe',note:'Found “'+lbl(hits[0])+'”. Judgement-call category, others may challenge.'};
      if(offline)return{v:'maybe',note:OFFLINE_NOTE,offline:1};
      return cache[ck]={v:'no',note:'Not recognised as a real word or name.'};
    }catch(e){return{v:'maybe',note:(dictHas(norm)?'Real word, but the':'The')+' online fact-checker isn’t reachable right now, so this is unverified. Others can challenge it.',offline:1}}
  }
  return{check,warm};
})();

function validateScatAnswer(val, letter){
  // Returns: 'empty' | 'invalid' | 'valid'
  // Names, multi-word answers, and proper nouns are allowed.
  // Semantic fit is handled by the challenge system after the round.
  if(!val || !val.trim()) return 'empty';
  const cleaned = val.trim();
  if(cleaned.length < 2) return 'invalid';
  // Must start with the round letter (case-insensitive)
  if(letter && !scatCore(cleaned).startsWith(letter.toLowerCase())) return 'invalid';
  const flat=scatCore(cleaned).replace(/[^a-z]/g,'');
  if(isRude(cleaned)) return 'invalid';
  if(/(.)\1{3,}/.test(flat)) return 'invalid';
  if(/^(asdf|qwer|zxcv|sdfg|dfgh|hjkl|qaz|wsx)/.test(flat)) return 'invalid';
  if(scatCore(cleaned).split(/[\s\-]+/).some(t=>t.replace(/[^a-z]/g,'').length>=3&&!/[aeiouy]/.test(t))) return 'invalid';
  // Allow letters, spaces, hyphens, apostrophes (names & 2-word answers OK)
  // Reject pure numbers / symbols / gibberish
  if(!/^[a-zA-Z][a-zA-Z\s\-'.]*$/.test(cleaned)) return 'invalid';
  // Block answers that are only the letter itself
  if(cleaned.replace(/[\s\-'.]/g,'').length < 2) return 'invalid';
  return 'valid';
}

function applyScatRowState(row, state){
  row.classList.remove('filled','valid','dubious','invalid','checking');
  const check = row.querySelector('.check');
  if(state === 'checking'){
    row.classList.add('checking');
    if(check) check.textContent = '◌';
  } else if(state === 'valid' || state === 'filled'){
    row.classList.add('valid','filled');
    if(check) check.textContent = '✓';
  } else if(state === 'dubious'){
    row.classList.add('dubious');
    if(check) check.textContent = '?';
  } else if(state === 'invalid'){
    row.classList.add('invalid');
    if(check) check.textContent = '!';
  } else {
    if(check) check.textContent = '';
  }
}

function renderScatCategories(){
  const cats = roomData.categories || [];
  try{ ScatVerify.warm(cats); }catch(e){}
  const letter = (roomData.letter || '?').toUpperCase();
  const host = $('scatCats');
  host.innerHTML = '';

  cats.forEach((cat, i) => {
    const row = document.createElement('div');
    row.className = 'scat-row';
    row.style.setProperty('--i', i);
    row.innerHTML = `
      <label><span class="cat-num">${i+1}</span>${esc(cat)}</label>
      <input type="text" data-idx="${i}" placeholder="Starts with ${letter}…" maxlength="32" autocomplete="off" autocapitalize="off" spellcheck="false">
      <span class="check"></span>
      <div class="scat-note" aria-live="polite"></div>`;
    const inp = row.querySelector('input');
    const noteEl = row.querySelector('.scat-note');
    let vTimer = null;
    const runVerify = async () => {
      const val = inp.value.trim();
      if(validateScatAnswer(val, letter) !== 'valid') return;
      applyScatRowState(row, 'checking'); noteEl.textContent = 'Checking “' + val + '”…';
      const res = await ScatVerify.check(cat, val);
      if(inp.value.trim() !== val) return;                        // typed something else meanwhile
      const before = scatVerdicts[i];
      scatVerdicts[i] = res.v;
      applyScatRowState(row, res.v === 'ok' ? 'valid' : res.v === 'no' ? 'invalid' : 'dubious');
      noteEl.textContent = res.note;
      if(!roundEnded){
        if(res.v === 'ok' && before !== 'ok'){ snd('ok'); scatSparkAt(inp); try{ navigator.vibrate && navigator.vibrate(12) }catch(e){} }
        else if(res.v === 'no' && before !== 'no') snd('bad');
      }
      // A verdict that lands right after the buzzer is still saved so it counts in the results
      clearTimeout(scatSaveTimer); scatSaveTimer = setTimeout(()=>saveScatAnswers(roundEnded), roundEnded?0:200);
    };
    inp.addEventListener('blur', () => { clearTimeout(vTimer); if(scatVerdicts[i] === undefined) runVerify(); });

    // Restore previous answer + re-validate
    const prev = (roomData.players?.[user.uid]?.answers || {})[i];
    if(prev){
      inp.value = prev;
      scatAnswers[i] = prev;
      const pv = (roomData.players?.[user.uid]?.verdicts || {})[i];
      if(pv){ scatVerdicts[i] = pv; applyScatRowState(row, pv === 'ok' ? 'valid' : pv === 'no' ? 'invalid' : 'dubious'); }
      else { applyScatRowState(row, validateScatAnswer(prev, letter)); setTimeout(runVerify, 150 + i * 80); }
    }

    inp.addEventListener('input', () => {
      const val = inp.value.trim();
      const wasEmpty = !scatAnswers[i];
      scatAnswers[i] = val;
      delete scatVerdicts[i];
      clearTimeout(vTimer);

      const state = validateScatAnswer(val, letter);
      if(state === 'valid'){ applyScatRowState(row, 'checking'); noteEl.textContent = ''; vTimer = setTimeout(runVerify, 150); }
      else { applyScatRowState(row, state); noteEl.textContent = state === 'invalid' && val ? 'Must start with ' + letter + ' and use letters only.' : ''; }

      updateScatProgress();
      clearTimeout(scatSaveTimer);
      scatSaveTimer = setTimeout(() => saveScatAnswers(), 500);
    });

    // Enter advances to next incomplete field
    inp.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        e.preventDefault();
        const next = host.querySelector(`.scat-row:not(.valid) input`) ||
                     host.querySelector(`input[data-idx="${(i+1)%cats.length}"]`);
        if(next) next.focus();
      }
    });

    host.appendChild(row);
  });

  updateScatProgress();
}

async function saveScatAnswers(force){
  if(!roomId || !user || (roundEnded && !force)) return;
  const answers = {}, verdicts = {};
  Object.keys(scatAnswers).forEach(k => {
    if(scatAnswers[k] && scatAnswers[k].trim()){ answers[k] = scatAnswers[k].trim(); if(scatVerdicts[k]) verdicts[k] = scatVerdicts[k]; }
  });
  try{
    await db.ref('rooms/' + roomId + '/players/' + user.uid).update({ answers, verdicts });
  }catch(e){}
}

function renderScatScores(){
  const players=Object.values(roomData.players||{});
  const boardEl=$('scatScoreBoard');
  boardEl.innerHTML=players.map(p=>{
    const isMe=p.uid===user.uid;
    const score=p.score||0;
    const prev=prevScores[p.uid]||0;
    const pulse=score>prev?' pulse':'';
    if(score!==prev)prevScores[p.uid]=score;
    return `<div class="sc ${isMe?'me':''}${pulse}" data-uid="${p.uid}"><div class="n">${p.name}${isMe?' · you':''}</div><div class="s">${score}</div></div>`;
  }).join('');
}

function startScatTimer(){
  clearInterval(timerInterval);
  let lastShown=-1;
  const tick=()=>{
    if(!roomData||!roomData.endsAt)return;
    const left=Math.max(0,Math.ceil((roomData.endsAt-srvNow())/1000));
    const shown=Math.min(left,ROUND_SECONDS);
    $('scatTimerText').textContent=shown;
    $('scatTimerRing').style.setProperty('--pct',(shown/ROUND_SECONDS*100)+'%');
    $('scatTimerRing').classList.toggle('low',left<=30&&left>0);
    if(left<=10&&left>0&&shown!==lastShown)snd('tick');
    lastShown=shown;
    if(left<=0&&!roundEnded)endRound()
  };
  tick();
  timerInterval=setInterval(tick,250);
}

function computeScatterResults(){

  const players = Object.values((roomData&&roomData.players)||{});
  const cats = roomData.categories || [];
  const letter = (roomData.letter||'').toLowerCase();
  // rejected answers stored as { "uid_catIndex": true }
  const rejected = roomData.rejected || {};
  const forgiven = roomData.forgiven || {};
  // rejected by agreement, or auto-rejected by the category check (unless restored)
  const isRej = (pp,i) => !!rejected[pp.uid+'_'+i] || ((pp.verdicts||{})[i]==='no' && !forgiven[pp.uid+'_'+i]);

  // Collect answers per category
  const byCat = {};
  cats.forEach((_,i)=>byCat[i]={});

  players.forEach(p=>{
    const ans = p.answers || {};
    Object.keys(ans).forEach(idx=>{
      const raw = (ans[idx]||'').trim();
      if(!raw)return;
      const norm = scatNorm(raw);
      // Must start with the letter (a leading 'the/a/an' is ignored)
      if(letter && !scatCore(raw).startsWith(String(letter).toLowerCase())) return;
      if(isRude(raw)) return;
      if(norm.length < 2) return;
      byCat[idx][p.uid] = {raw, norm, p};
    });
  });

  // Score: unique + not rejected
  const rows = players.map(p=>{
    let final = 0;
    const items = [];
    cats.forEach((cat,i)=>{
      const entry = byCat[i][p.uid];
      if(!entry) return;
      const key = p.uid + '_' + i;
      const isRejected = isRej(p, i);
      // Count how many players have the same normalized answer (and not rejected)
      const same = Object.values(byCat[i]).filter(e=>{
        const k = e.p.uid + '_' + i;
        return e.norm===entry.norm && !isRej(e.p, i);
      }).length;
      const dupe = same > 1;
      const pts = (dupe || isRejected) ? 0 : 1;
      if(pts) final += 1;
      items.push({
        w: entry.raw,
        pts,
        dupe,
        rejected: isRejected,
        cat,
        catIndex: i,
        with: Object.values(byCat[i]).filter(e=>e.norm===entry.norm && e.p.uid!==p.uid).map(e=>e.p.name)
      });
    });
    return {p, items, raw: items.length, final, lost: items.filter(i=>i.dupe||i.rejected).length, uniqueN: items.filter(i=>!i.dupe&&!i.rejected).length, sharedN: items.filter(i=>i.dupe).length};
  });

  // Write scores back
  rows.forEach(r=>{
    if(r.p.uid === user.uid){
      db.ref('rooms/'+roomId+'/players/'+user.uid).update({score: r.final}).catch(()=>{});
    }
  });

  rows.sort((a,b)=>(b.final-a.final)||(b.uniqueN-a.uniqueN)||String(a.p.name).localeCompare(String(b.p.name)));
  return rows;
}
