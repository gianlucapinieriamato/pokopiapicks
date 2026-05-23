import { Pokemon } from "./consts";

import type { HabitatEntry } from "../types";

export const HABITATS: Record<string, HabitatEntry> = {
  absoluteluxury: {
    slug: "absoluteluxury",
    name: "Absolute luxury",
    description:
      "Every single piece of this furniture set is top-notch, creating the ultimate air of luxury",
    pokemon: [Pokemon.Gholdengo],
  },
  alarmclocksleepzone: {
    slug: "alarmclocksleepzone",
    name: "Alarm clock sleep zone",
    description:
      "Setting the bedside alarm clock makes waking up in the morning a breeze",
    pokemon: [Pokemon.Happiny],
  },
  allpackedup: {
    slug: "allpackedup",
    name: "All packed up",
    description:
      "Let's pack some cardboard boxes full of stuff and stack them on top of a cart!",
    pokemon: [Pokemon.Makuhita, Pokemon.Hariyama],
  },
  ampedrockstage: {
    slug: "ampedrockstage",
    name: "Amped rock stage",
    description:
      "The wail of the guitar marks the start of this amped-up performance",
    pokemon: [Pokemon.ToxtricityAmpedForm],
  },
  armorfossildisplay: {
    slug: "armorfossildisplay",
    name: "Armor Fossil display",
    description:
      "A display of an ancient Pokemon fossil. It features a hard neck frill that looks like a shield.",
    pokemon: [Pokemon.Shieldon],
  },
  beachset: {
    slug: "beachset",
    name: "Beach Set",
    description:
      "Lounge under this parasol, and bask in the tropical vibes. Pokemon might enjoy relaxing here.",
    pokemon: [
      Pokemon.TatsugiriCurlyForm,
      Pokemon.TatsugiriDroopyForm,
      Pokemon.TatsugiriStretchyForm,
    ],
  },
  bedwithaplush: {
    slug: "bedwithaplush",
    name: "Bed with a plush",
    description:
      "A bed with a cute doll. Small Pokemon would probably feel safe sleeping here",
    pokemon: [Pokemon.Drifloon, Pokemon.Slowbro, Pokemon.Munchlax, Pokemon.Slowking],
  },
  benchwithgreenery: {
    slug: "benchwithgreenery",
    name: "Bench with greenery",
    description:
      "A bench near some hedges. Pokemon can rest here and bask in nature",
    pokemon: [Pokemon.Bulbasaur, Pokemon.Ivysaur, Pokemon.Tangrowth],
  },
  "berry-feastcampsite": {
    slug: "berry-feastcampsite",
    name: "Berry-feast Campsite",
    description:
      "A cozy campfire underneat a clear sky. Prepare a big feast and have a good time!",
    pokemon: [Pokemon.Charizard],
  },
  bestbreadbakery: {
    slug: "bestbreadbakery",
    name: "Best bread bakery",
    description:
      "Prepare some side dishes while you wait for bread to finish baking.",
    pokemon: [Pokemon.Fidough, Pokemon.Dachsbun],
  },
  birdsonggarden: {
    slug: "birdsonggarden",
    name: "Birdsong garden",
    description:
      "A comfy birdhouse with a neatly trimmed hedge. You can almost hear chirping",
    pokemon: [Pokemon.Altaria],
  },
  "boulder-shadedtallgrass": {
    slug: "boulder-shadedtallgrass",
    name: "Boulder-shaded Tall Grass",
    description: "tall grass near a large boulder. Perfect for hide-and-seek",
    pokemon: [Pokemon.Timburr, Pokemon.Machop, Pokemon.Gurdurr],
  },
  boundlessbluebeverage: {
    slug: "boundlessbluebeverage",
    name: "Boundless blue beverage",
    description:
      "A clear-blue ice-cream float. It's like looking deep into the ocean",
    pokemon: [Pokemon.Vaporeon],
  },
  boxtotherhythm: {
    slug: "boxtotherhythm",
    name: "Box to the rhythm",
    description:
      "Pokemon can feel the rhythm here and get pumped for a training session",
    pokemon: [Pokemon.Machoke, Pokemon.Riolu, Pokemon.Lucario],
  },
  breezyflowerbed: {
    slug: "breezyflowerbed",
    name: "Breezy flower bed",
    description:
      "A bed of refreshing seashore flowers. Pokemon are drawn in by its gentle scent",
    pokemon: [Pokemon.Pawmi, Pokemon.Zorua, Pokemon.Zoroark],
  },
  bronzelandmark: {
    slug: "bronzelandmark",
    name: "Bronze landmark",
    description:
      "A photoworthy bronze statue of three Pokemon. Their combined cuteness is sure to attract a crowd!",
    pokemon: [Pokemon.Clefairy, Pokemon.Clefable],
  },
  "burning-hotspice": {
    slug: "burning-hotspice",
    name: "Burning-hot spice",
    description:
      "Putting hot sauce on this round pizza will make it so spicy that you'll feel like you're breathing fire.",
    pokemon: [Pokemon.Flareon],
  },
  cafespace: {
    slug: "cafespace",
    name: "Cafe space",
    description:
      "Enjoy teatime while admiring the potted tree. Pokemon can feel refreshed here",
    pokemon: [Pokemon.Pawmo, Pokemon.Pawmot],
  },
  campsite: {
    slug: "campsite",
    name: "Campsite",
    description:
      "A campsite that celebrates elements of nature. Pokemon warm themselves in front of the campfire",
    pokemon: [Pokemon.Charmeleon],
  },
  changingarea: {
    slug: "changingarea",
    name: "Changing area",
    description:
      "Give your look a once-over in the mirror after you change clothes. A place to become your ideal self!",
    pokemon: [Pokemon.Minccino],
  },
  chanseyrestingarea: {
    slug: "chanseyrestingarea",
    name: "Chansey Resting area",
    description:
      "A peaceful, refreshing spot to take a break while Chansey watches over you",
    pokemon: [Pokemon.Vileplume, Pokemon.Bellossom],
  },
  chillyshavedice: {
    slug: "chillyshavedice",
    name: "Chilly shaved ice",
    description:
      "Shaved ice served with frozen toppings. Eating this could make you feel teeth-chatteringly chilly",
    pokemon: [Pokemon.Glaceon],
  },
  "chirp-chirpmeal": {
    slug: "chirp-chirpmeal",
    name: "Chirp-chirp meal",
    description:
      "Bird Pokemon are sure to come and enjoy feasting on the plated food.",
    pokemon: [Pokemon.Torchic, Pokemon.Blaziken],
  },
  chirpingrecital: {
    slug: "chirpingrecital",
    name: "Chirping recital",
    description:
      "Bird Pokemon may swoop in and use the microphone to show off their singing skills",
    pokemon: [Pokemon.Chatot, Pokemon.Honchkrow],
  },
  "clink-clangironconstruction": {
    slug: "clink-clangironconstruction",
    name: "Clink-clang iron construction",
    description:
      "It looks like construction is underway. Some strong Pokemon might show up to help",
    pokemon: [Pokemon.Steelix, Pokemon.Machamp],
  },
  concretepipesecretbase: {
    slug: "concretepipesecretbase",
    name: "Concrete pipe secret base",
    description:
      "A concrete pipe that hasn't been used in al ong time. The hollow interior is perfect for a secret base.",
    pokemon: [Pokemon.Cyndaquil, Pokemon.Quilava],
  },
  "construction-sitegenerator": {
    slug: "construction-sitegenerator",
    name: "Construction-site generator",
    description:
      "Construction needs a lot of electricity! You can use any leftover lumber as fuel",
    pokemon: [Pokemon.Conkeldurr],
  },
  containersnacking: {
    slug: "containersnacking",
    name: "Container snacking",
    description:
      "Looks like someone snuck a snack by some storage containers. Pokemon might like a spot like this",
    pokemon: [Pokemon.Diglett, Pokemon.Glimmet, Pokemon.Glimmora],
  },
  cozyloghandicrafts: {
    slug: "cozyloghandicrafts",
    name: "Cozy log handicrafts",
    description:
      "This space is packed with wooden furniture. It feels almost like you're in a mountain cabin",
    pokemon: [Pokemon.Axew, Pokemon.Fraxure, Pokemon.Haxorus],
  },
  creepygraveoffering: {
    slug: "creepygraveoffering",
    name: "Creepy grave offering",
    description:
      "Light the candles by the gravestone to add some swaying blue flames for double the eeriness",
    pokemon: [Pokemon.Litwick, Pokemon.Lampent, Pokemon.Chandelure],
  },
  creepywhiterocks: {
    slug: "creepywhiterocks",
    name: "Creepy white rocks",
    description:
      "The thick moss near the stalagmites and the long glowing lantern create a slightly creepy vibe.",
    pokemon: [Pokemon.Glimmet, Pokemon.Glimmora],
  },
  cutenessoverload: {
    slug: "cutenessoverload",
    name: "Cuteness overload",
    description:
      "Being surrounded by all this cute furniture will make you feel perfectly pampered",
    pokemon: [Pokemon.Blissey],
  },
  cyclingreststop: {
    slug: "cyclingreststop",
    name: "Cycling rest stop",
    description:
      "Stop your bicycle here for a quick break. Pokemon sometimes hide behind the vending machine.",
    pokemon: [Pokemon.Beldum],
  },
  dandelionlunchtime: {
    slug: "dandelionlunchtime",
    name: "Dandelion lunchtime",
    description:
      "Lunch box? Check. Tableware? Check. Time for a picnic lunch break!",
    pokemon: [Pokemon.Jumpluff],
  },
  "dark-chocolatecookies": {
    slug: "dark-chocolatecookies",
    name: "Dark-chocolate cookies",
    description:
      "Cookies made from dark chocolate. They have a subtle, comforting taste without being overly sweet",
    pokemon: [Pokemon.Umbreon],
  },
  despotfossildisplay: {
    slug: "despotfossildisplay",
    name: "Despot fossil display",
    description:
      "A display of ancient Pokemon fossils. This fine skeletal specimen was once the ruler of the land.",
    pokemon: [Pokemon.Tyrantrum],
  },
  diggingandburning: {
    slug: "diggingandburning",
    name: "Digging and burning",
    description:
      "A big furnace with equipment next to it. Someone might come to light the flame",
    pokemon: [Pokemon.Magmar],
  },
  dinnertablesurprise: {
    slug: "dinnertablesurprise",
    name: "Dinner table surprise",
    description:
      "There's no better thrill than lifting the lid off a dish to reveal today's meal",
    pokemon: [Pokemon.Swalot],
  },
  dock: {
    slug: "dock",
    name: "Dock",
    description:
      "A cozy little dock on the beach. Swimming Pokemon might stop by now and then.",
    pokemon: [Pokemon.Marill, Pokemon.Azumarill],
  },
  dojotraining: {
    slug: "dojotraining",
    name: "Dojo training",
    description:
      "Once you emply the spirit of the warrior, you will be able to move even the heaviest of boulders",
    pokemon: [Pokemon.Poliwrath, Pokemon.Gallade],
  },
  electrifyingpotatoes: {
    slug: "electrifyingpotatoes",
    name: "Electrifying potatoes",
    description:
      "A basket of crispy potato stars. They're shockingly delicious!",
    pokemon: [Pokemon.Jolteon],
  },
  elegantdaytimetreats: {
    slug: "elegantdaytimetreats",
    name: "Elegant daytime treats",
    description:
      "Teatime is always midday. Take a seat, have a snack, and bask in the elegance of it all.",
    pokemon: [Pokemon.Espeon],
  },
  elevatedflowerbed: {
    slug: "elevatedflowerbed",
    name: "Elevated flower bed",
    description:
      "A bed of flowers blooming at high elevation. The wind carries their sweet aroma all around",
    pokemon: [Pokemon.Paras, Pokemon.Parasect],
  },
  elevatedpinktallgrass: {
    slug: "elevatedpinktallgrass",
    name: "Elevated pink tall grass",
    description:
      "Tall pink grass from way above the clouds. Even strong winds can't stop it from growing",
    pokemon: [Pokemon.Corvisquire, Pokemon.Kilowattrel, Pokemon.Wattrel, Pokemon.Corviknight],
  },
  elevatedredtallgrass: {
    slug: "elevatedredtallgrass",
    name: "Elevated red tall grass",
    description:
      "Red tall grass flourishes even in high-altitude areas like mountaintops",
    pokemon: [Pokemon.Murkrow, Pokemon.Chatot, Pokemon.Honchkrow],
  },
  elevatedtallgrass: {
    slug: "elevatedtallgrass",
    name: "Elevated tall grass",
    description:
      "Such a high elevation means this area is quite cool. The wind blows all the way through the tall grass",
    pokemon: [Pokemon.Pidgey, Pokemon.Pidgeotto, Pokemon.Hoothoot, Pokemon.Noctowl],
  },
  elevatedyellowtallgrass: {
    slug: "elevatedyellowtallgrass",
    name: "Elevated yellow tall grass",
    description:
      "Yellow tall grass growing at high elevation. It sways back and forth in the sea breeze",
    pokemon: [Pokemon.Wingull, Pokemon.Pelipper, Pokemon.Crobat],
  },
  evilorganizationhq: {
    slug: "evilorganizationhq",
    name: "Evil organization HQ",
    description:
      "A comfy couch in front of an organization's emblem. Sitting here makes you feel like a boss.",
    pokemon: [Pokemon.Persian],
  },
  exerciserestingspot: {
    slug: "exerciserestingspot",
    name: "Exercise resting spot",
    description:
      "After a fierce training session, Pokemon can rest their tired bodies on this bench",
    pokemon: [Pokemon.Hitmonchan],
  },
  experimentspace: {
    slug: "experimentspace",
    name: "Experiment Space",
    description:
      "A space for conducting experiments. Someone may have left their research notes behind.",
    pokemon: [Pokemon.Alakazam],
  },
  factorystorage: {
    slug: "factorystorage",
    name: "Factory Storage",
    description:
      "The large machine doesn't seem to work, even if you plug in the cords and hit the buttons",
    pokemon: [Pokemon.Magnemite],
  },
  fieldofflowers: {
    slug: "fieldofflowers",
    name: "Field of Flowers",
    description:
      "A large field of flowers. Every petal emanates an ambrosial aroma",
    pokemon: [Pokemon.Vespiquen, Pokemon.Ivysaur, Pokemon.Venusaur],
  },
  "field-tripfriends": {
    slug: "field-tripfriends",
    name: "Field-trip friends",
    description:
      "Pack a lunch box and canteen inside your backpack, and you're all set for a field trip",
    pokemon: [Pokemon.Skiploom],
  },
  fireplacenapspot: {
    slug: "fireplacenapspot",
    name: "Fireplace nap spot",
    description:
      "If you're feeling chilly, you can sit by this fireplace and it will gently warm you.",
    pokemon: [Pokemon.Quilava, Pokemon.Typhlosion],
  },
  fishingpond: {
    slug: "fishingpond",
    name: "Fishing pond",
    description:
      "Cast a line and wait patiently. Perhaps a Water-type Pokemon will appear!",
    pokemon: [Pokemon.Slowking],
  },
  floatingintheshade: {
    slug: "floatingintheshade",
    name: "Floating in the shade",
    description:
      "Have fun on the inflatable boat! If you get tired, you can take a break under the umbrella",
    pokemon: [Pokemon.Blastoise],
  },
  flowergarden: {
    slug: "flowergarden",
    name: "Flower garden",
    description:
      "Plant some hedges near blooming flowers, and you'll have a decent garden in no time flat",
    pokemon: [Pokemon.Paras, Pokemon.Parasect],
  },
  flowergardenstumpstage: {
    slug: "flowergardenstumpstage",
    name: "Flower garden stump stage",
    description:
      "A stage set up in a field of flowers. Hop on the stump to bathe in the spotlight and feel just like a star",
    pokemon: [Pokemon.Igglybuff, Pokemon.Jigglypuff, Pokemon.Politoed],
  },
  flowerytable: {
    slug: "flowerytable",
    name: "Flowery table",
    description:
      "A flower vase placed on top of a table. Pokemon might sit on the chair to look at the flower.",
    pokemon: [Pokemon.Weepinbell, Pokemon.Victreebel],
  },
  fluffyflowerbed: {
    slug: "fluffyflowerbed",
    name: "Fluffy flower bed",
    description: "A cute field full of lots of puffy skyland flowers",
    pokemon: [Pokemon.Vulpix, Pokemon.Rookidee, Pokemon.Mismagius, Pokemon.Misdreavus, Pokemon.Ninetales],
  },
  freshveggiefield: {
    slug: "freshveggiefield",
    name: "Fresh Veggie Field",
    description:
      "Vegetables growing in a nice, wild field. Seems likely to attact Pokemon who enjoy farming",
    pokemon: [Pokemon.Drilbur, Pokemon.Rowlet, Pokemon.Excadrill],
  },
  fullrecovery: {
    slug: "fullrecovery",
    name: "Full recovery",
    description:
      "Nothing like a good nap when you're feeling sick. A caring Pokemon might even come to check in!",
    pokemon: [Pokemon.Chansey, Pokemon.Peakychu],
  },
  furnacespot: {
    slug: "furnacespot",
    name: "Furnace Spot",
    description:
      "When you fuel this amazing contraption, it generates electricity with the power of fire",
    pokemon: [Pokemon.Combusken, Pokemon.Blaziken],
  },
  gamecornerbattlezone: {
    slug: "gamecornerbattlezone",
    name: "Game Corner battle zone",
    description:
      "Players site side by side here to game against each other!P okemon might come here to play.",
    pokemon: [Pokemon.PorygonZ],
  },
  gardenterrace: {
    slug: "gardenterrace",
    name: "Garden Terrace",
    description:
      "Take a breather in a garden chair while looking at softly lit flowers",
    pokemon: [Pokemon.Venusaur],
  },
  gentlylitbed: {
    slug: "gentlylitbed",
    name: "Gently lit bed",
    description:
      "A bed bathed in gentle light. Pokemon could probably sleep peacefully here",
    pokemon: [Pokemon.Hoothoot, Pokemon.Noctowl],
  },
  "goodold-fashionedantiques": {
    slug: "goodold-fashionedantiques",
    name: "Good old-fashioned antiques",
    description:
      "Enjoy the retro vibe of this collection of wonderful antique furniture!",
    pokemon: [Pokemon.Weezing, Pokemon.Snorlax],
  },
  gracefulflowerbed: {
    slug: "gracefulflowerbed",
    name: "Graceful flower bed",
    description:
      "Numerous mountain flowers bloom to form an elegant and beautiful flower bed.",
    pokemon: [Pokemon.Cleffa, Pokemon.Fidough, Pokemon.Clefable, Pokemon.Clefairy, Pokemon.Dachsbun],
  },
  grassytrainingfield: {
    slug: "grassytrainingfield",
    name: "Grassy training field",
    description:
      "The bags of dirt can be used as dumbbells. Perfect for Pokemon who love to train",
    pokemon: [Pokemon.Machoke, Pokemon.Machamp],
  },
  graveoffering: {
    slug: "graveoffering",
    name: "Grave offering",
    description:
      "Candles and plated food placed silently before a gravestone. Pretty creepy…",
    pokemon: [Pokemon.Litwick, Pokemon.Lampent],
  },
  gravewithflowers: {
    slug: "gravewithflowers",
    name: "Grave with flowers",
    description:
      "A habitat that exudes a gentle elegance. Pokemon could rest in joyful peace here",
    pokemon: [Pokemon.Cubone, Pokemon.Marowak],
  },
  gymfirstaid: {
    slug: "gymfirstaid",
    name: "Gym first aid",
    description:
      "A first-aid kit is on hand in case any Pokemon injure themselves exercising",
    pokemon: [Pokemon.Hitmontop],
  },
  harmonioushotspring: {
    slug: "harmonioushotspring",
    name: "Harmonious hot spring",
    description:
      "Some Pokemon enjoy moving between the hot spring and the cold bath to feel light and refreshed",
    pokemon: [Pokemon.Politoed],
  },
  headbuttfossildisplay: {
    slug: "headbuttfossildisplay",
    name: "Headbutt Fossil display",
    description:
      "A display of ancient Pokemon fossils. This speciment's skull was harder than steel",
    pokemon: [Pokemon.Rampardos],
  },
  "heart-poundingsurprisebox": {
    slug: "heart-poundingsurprisebox",
    name: "Heart-pounding surprise box",
    description:
      "The rhythm of the big drum, the spotlights on the boo-in-the-box… The suspense is palpable!",
    pokemon: [Pokemon.Meowscarada],
  },
  heavyiron: {
    slug: "heavyiron",
    name: "Heavy iron",
    description:
      "A monochromatic space with weighty furniture. Light the lantern to add another layer of calm",
    pokemon: [Pokemon.Coalossal],
  },
  hometheater: {
    slug: "hometheater",
    name: "Home theater",
    description:
      "Some big speakers and a TV make this space feel just likea movie theater",
    pokemon: [Pokemon.Mismagius],
  },
  "hot-springfishingspot": {
    slug: "hot-springfishingspot",
    name: "Hot-spring Fishing Spot",
    description:
      "Pokemon enjoying a nice dip in the hot spring might be lure in with some bait.",
    pokemon: [Pokemon.Lotad, Pokemon.Lombre],
  },
  "hot-springshower": {
    slug: "hot-springshower",
    name: "Hot-spring shower",
    description:
      "You can't jump in the hot spring without rinsing off at a shower first! Pokemon might enjoy soaking here",
    pokemon: [Pokemon.Psyduck, Pokemon.Golduck],
  },
  houseparty: {
    slug: "houseparty",
    name: "House party",
    description:
      "Help yourself to food and drinks, and have a total blast with all your friends",
    pokemon: [Pokemon.Dugtrio, Pokemon.Sudowoodo],
  },
  hydratedflowerbed: {
    slug: "hydratedflowerbed",
    name: "Hydrated flower bed",
    description:
      "A field of blooming waterside flowers. Pokemon may be attracted by the aroma and clear water.",
    pokemon: [Pokemon.Volbeat, Pokemon.Illumise],
  },
  hydratedfluffyflowerbed: {
    slug: "hydratedfluffyflowerbed",
    name: "Hydrated fluffy flower bed",
    description:
      "Water can't diminish the gentle aroma wafting from these skyland flowers.",
    pokemon: [Pokemon.Dratini, Pokemon.Poliwhirl, Pokemon.Dragonair],
  },
  hydratedgracefulflowerbed: {
    slug: "hydratedgracefulflowerbed",
    name: "Hydrated graceful flower bed",
    description:
      "These elegant mountain flowers bloom beautifully, even right beside thew ater.",
    pokemon: [Pokemon.Ekans, Pokemon.Arbok, Pokemon.Politoed],
  },
  hydratedpinktallgrass: {
    slug: "hydratedpinktallgrass",
    name: "Hydrated pink tall grass",
    description:
      "The pink of the tall grass contrasts beautifully with the blue hues of the water.",
    pokemon: [Pokemon.Froakie, Pokemon.Frogadier, Pokemon.Greninja],
  },
  hydratedredtallgrass: {
    slug: "hydratedredtallgrass",
    name: "Hydrated red tall grass",
    description:
      "While red tall grass often grows in valleys, it also thrives just fine on the waterside",
    pokemon: [Pokemon.Lotad, Pokemon.Lombre],
  },
  hydratedtallgrass: {
    slug: "hydratedtallgrass",
    name: "Hydrated tall grass",
    description:
      "Tall grass along the water's edge. A habitat thriving with energy thanks to an abundance of water",
    pokemon: [Pokemon.Squirtle, Pokemon.Sliggoo, Pokemon.Blastoise, Pokemon.Cramorant, Pokemon.Wartortle],
  },
  hydratedyellowtallgrass: {
    slug: "hydratedyellowtallgrass",
    name: "Hydrated yellow tall grass",
    description:
      "Yellow tall grass by the water. A nice resting spot for Pokemon after they're done swimmign",
    pokemon: [Pokemon.Azurill, Pokemon.Marill, Pokemon.Piplup, Pokemon.Prinplup],
  },
  illuminatedbench: {
    slug: "illuminatedbench",
    name: "Illuminated bench",
    description:
      "A bench illuminated by gentle light. Pokemon entranced by the light might stop by",
    pokemon: [Pokemon.Venonat, Pokemon.Venomoth],
  },
  illuminatedtallgrass: {
    slug: "illuminatedtallgrass",
    name: "Illuminated tall grass",
    description:
      "A gently lit plot of tall grass. Pokemon are drawn to the inviting light",
    pokemon: [Pokemon.Venonat, Pokemon.Venomoth],
  },
  illuminatedwaterfall: {
    slug: "illuminatedwaterfall",
    name: "Illuminated waterfall",
    description:
      "Use the torches to light a path to the waterfall. Pokemon might stop by to check it out",
    pokemon: [Pokemon.Gyarados],
  },
  interrogationdesk: {
    slug: "interrogationdesk",
    name: "Interrogation desk",
    description:
      "You and Arcanine, interrogating perps side by side… The tension in the air is palpable",
    pokemon: [Pokemon.Sprigatito, Pokemon.Floragato],
  },
  irresistiblescentandglow: {
    slug: "irresistiblescentandglow",
    name: "Irresistible scent and glow",
    description:
      "Pokemon may be lured here by the glow of the mushroom and the scent of the plant-shaped pot",
    pokemon: [Pokemon.Weepinbell, Pokemon.Victreebel],
  },
  jawfossildisplay: {
    slug: "jawfossildisplay",
    name: "Jaw Fossil display",
    description:
      "A display of an ancient Pokemon fossil. It features a piece of a jawbone that could crush anything,",
    pokemon: [Pokemon.Tyrunt],
  },
  knittingstation: {
    slug: "knittingstation",
    name: "Knitting station",
    description:
      "Pokemon will be fascinated by the fluffy yarn and the adorable crafts that can be made from it",
    pokemon: [Pokemon.Mareep, Pokemon.Flaaffy],
  },
  largeluggagecarrier: {
    slug: "largeluggagecarrier",
    name: "Large luggage carrier",
    description: "This long, wide cart can fit two large crates",
    pokemon: [Pokemon.Tinkatink, Pokemon.Gurdurr, Pokemon.Tinkatuff],
  },
  "lazy-photoalbumscrolling": {
    slug: "lazy-photoalbumscrolling",
    name: "Lazy-photo album scrolling",
    description:
      "Kick back with a drink in your hand and use the tablet to reminisce over some photos",
    pokemon: [Pokemon.Toxel],
  },
  leafygreenssandwich: {
    slug: "leafygreenssandwich",
    name: "Leafy greens sandwich",
    description:
      "A sandwich packed with greens and veggies would really hit the spot right now",
    pokemon: [Pokemon.Leafeon],
  },
  "light-upstage": {
    slug: "light-upstage",
    name: "Light-up stage",
    description:
      "A stage bathed in dazzling light. It seems likely to attract attention-seeking Pokemon",
    pokemon: [Pokemon.Electabuzz, Pokemon.Electivire],
  },
  lovelyribboncake: {
    slug: "lovelyribboncake",
    name: "Lovely ribbon cake",
    description:
      "The large ribbon and heart decorations make this cake look quite lovely. It tastes incredibly sweet.",
    pokemon: [Pokemon.Sylveon],
  },
  "low-keyrockstage": {
    slug: "low-keyrockstage",
    name: "Low-key rock stage",
    description:
      "The hum of the bass guitar marks the start of al ow-key musical performance",
    pokemon: [Pokemon.ToxtricityLowKeyForm],
  },
  "luxurychirp-chirpmeal": {
    slug: "luxurychirp-chirpmeal",
    name: "Luxury chirp-chirp meal",
    description:
      "Bird Pokemon can lounge in the birdhouse after enjoying a meal of various berries",
    pokemon: [Pokemon.Pidgeot],
  },
  magmafishingspot: {
    slug: "magmafishingspot",
    name: "Magma fishing spot",
    description:
      "Catch Pokemon by fishing in magma. Wait, how do you do that without the line melting?!",
    pokemon: [Pokemon.Arcanine],
  },
  marshfishingspot: {
    slug: "marshfishingspot",
    name: "Marsh fishing spot",
    description:
      "Pokemon live in marshlands too! Try casting your lin into some swampy water sometime",
    pokemon: [Pokemon.Grimer, Pokemon.Muk, Pokemon.Clodsire],
  },
  marshytallgrass: {
    slug: "marshytallgrass",
    name: "Marshy tall grass",
    description:
      "Tall grass growing in a marsh. Pokemon use this to wipe mud off themselves",
    pokemon: [Pokemon.PaldeanWooper, Pokemon.Clodsire],
  },
  minigamecorner: {
    slug: "minigamecorner",
    name: "Mini Game Corner",
    description:
      "When you're done playing arcade games, you can hit up the punching game to get your body moving!",
    pokemon: [Pokemon.Magneton, Pokemon.Magnezone],
  },
  minikitchen: {
    slug: "minikitchen",
    name: "Mini kitchen",
    description:
      "Wash your dishes and ingredients, then cook away on the stove. What's on the menu for today?",
    pokemon: [Pokemon.Magmortar],
  },
  minilibrary: {
    slug: "minilibrary",
    name: "Mini library",
    description:
      "Light the lamp to peruse the books at your leisure, even in the dark ofnight",
    pokemon: [Pokemon.Gardevoir],
  },
  minimuseum: {
    slug: "minimuseum",
    name: "Mini museum",
    description:
      "Anything can look like a masterpiece if you pop it on an exhibition stand!",
    pokemon: [Pokemon.Gimmighoul, Pokemon.Arcanine],
  },
  modernliving: {
    slug: "modernliving",
    name: "Modern living",
    description:
      "Stylishly simple. The modern design gives off a sense of classiness",
    pokemon: [Pokemon.Decidueye],
  },
  moisturizingmakeupstand: {
    slug: "moisturizingmakeupstand",
    name: "Moisturizing makeup stand",
    description:
      "Making sure your skin is moisturized will ensure your makeup comes out even more perfectly than usual!",
    pokemon: [Pokemon.Kirlia, Pokemon.Gardevoir],
  },
  mossyboulder: {
    slug: "mossyboulder",
    name: "Mossy boulder",
    description:
      "A quiet, peaceful atmosphere. It looks like Pokemon could really unwind here",
    pokemon: [Pokemon.Graveler, Pokemon.Golem],
  },
  mossyhotspring: {
    slug: "mossyhotspring",
    name: "Mossy hot spring",
    description:
      "A hot spring surrounded by green moss. Soak up the calming atmosphere as you soak in warm water.",
    pokemon: [Pokemon.Torkoal],
  },
  mossyrestspot: {
    slug: "mossyrestspot",
    name: "Mossy rest spot",
    description:
      "All that nice, damp moss makes this a great location for Pokemon who love humid places",
    pokemon: [Pokemon.Larvitar, Pokemon.Tyranitar],
  },
  musicandmagazines: {
    slug: "musicandmagazines",
    name: "Music and magazines",
    description:
      "Reading feels even more relaxing when you throw on some background music",
    pokemon: [Pokemon.Kricketot, Pokemon.Kricketune, Pokemon.StereoRotom],
  },
  nightfestivalvenue: {
    slug: "nightfestivalvenue",
    name: "Night festival venue",
    description:
      "The colorful neon lights of this festival entrance glow brilliantly, especially at night",
    pokemon: [Pokemon.Flaaffy],
  },
  nineflames: {
    slug: "nineflames",
    name: "Nine flames",
    description:
      "The gentle sway of these nine blazing flames gives their surroundings a subtly mystical ambeience",
    pokemon: [Pokemon.Ninetales],
  },
  oceanfishingspot: {
    slug: "oceanfishingspot",
    name: "Ocean fishing spot",
    description:
      "Ocean fishing can be fun! You may meet different species of Pokemon than you would in fresh water.",
    pokemon: [Pokemon.Magikarp, Pokemon.Gastrodon, Pokemon.GastrodonEastSea],
  },
  officestoreroom: {
    slug: "officestoreroom",
    name: "Office storeroom",
    description:
      "Packed with old documents and unused equipment. Lost Pokemon sometimes wander inside.",
    pokemon: [Pokemon.Misdreavus, Pokemon.Mismagius, Pokemon.Drakloak, Pokemon.Dragapult],
  },
  "open-airbath": {
    slug: "open-airbath",
    name: "Open-air bath",
    description:
      "Pokemon can also soak in a nice hot spring while enjoying beautiful scenery",
    pokemon: [Pokemon.Raboot],
  },
  overgrowthvendingmachine: {
    slug: "overgrowthvendingmachine",
    name: "Overgrowth vending machine",
    description:
      "A lone vending machine amid yellow tall grass. Gotta stay hydrated-even out in nature",
    pokemon: [Pokemon.Mareep],
  },
  oversizeddumpingground: {
    slug: "oversizeddumpingground",
    name: "Oversized dumping ground",
    description:
      "A dumping ground where you can even throw away large items. Unwanted appliances can go here!",
    pokemon: [Pokemon.Tinkatink, Pokemon.Tinkaton],
  },
  parkbench: {
    slug: "parkbench",
    name: "Park bench",
    description:
      "After eating a snack, put your trash in the trash can. …Think Pokemon can remember to do that?",
    pokemon: [Pokemon.Zubat, Pokemon.Voltorb, Pokemon.Electrode],
  },
  perpetualmess: {
    slug: "perpetualmess",
    name: "Perpetual mess",
    description:
      "Scattered toys and cardboard. Just when you think you're done tidying up, the mess somehow returns.",
    pokemon: [Pokemon.Growlithe, Pokemon.Azurill],
  },
  picnicset: {
    slug: "picnicset",
    name: "Picnic Set",
    description:
      "A basked placed atop a table is all it takes to feel a little picnicky",
    pokemon: [Pokemon.Pichu, Pokemon.Pikachu],
  },
  picturesquephotocutoutboard: {
    slug: "picturesquephotocutoutboard",
    name: "Picturesque photo cutout board",
    description:
      "Say cheese! Stick your face in the cutoutboard and snap a photo to commemorate your hoke.",
    pokemon: [Pokemon.Plusle, Pokemon.Minun],
  },
  pikachuspace: {
    slug: "pikachuspace",
    name: "Pikachu space",
    description:
      "The sofa and doll are both Pikachu! Some Pokemon might mistake them for the real Pikachu and stop by",
    pokemon: [Pokemon.Mimikyu],
  },
  pinktallgrass: {
    slug: "pinktallgrass",
    name: "Pink tall grass",
    description:
      "A small plot made up of four tufts of pink tall grass. Spots like this are often found in the skylands",
    pokemon: [Pokemon.Trapinch, Pokemon.Duskull, Pokemon.Vibrava, Pokemon.Swablu, Pokemon.Flygon],
  },
  "piping-hotlava": {
    slug: "piping-hotlava",
    name: "Piping-hot lava",
    description:
      "Nothin' but piping-hot lava here! Fire-type Pokemon simply can't resist visiting",
    pokemon: [Pokemon.Charcadet, Pokemon.Volcarona],
  },
  plainlife: {
    slug: "plainlife",
    name: "Plain life",
    description:
      "A simple yet calming space. Pokemon are sure to be comfortable here.",
    pokemon: [Pokemon.Ampharos],
  },
  playingpirate: {
    slug: "playingpirate",
    name: "Playing pirate",
    description:
      "Stand in front of the wheel or ight by the cannons, and you'll feel like you're sailing the open seas!",
    pokemon: [Pokemon.Voltorb, Pokemon.Electrode],
  },
  playland: {
    slug: "playland",
    name: "Playland",
    description:
      "To play on the big slide or with the toys… Now that's a hard choice",
    pokemon: [Pokemon.Snivy],
  },
  plushcentral: {
    slug: "plushcentral",
    name: "Plush central",
    description:
      "Some Pokemon might mistake all these dolls for the real things",
    pokemon: [Pokemon.Drifloon, Pokemon.Drifblim],
  },
  "pointytree-shadedrockytallgrass": {
    slug: "pointytree-shadedrockytallgrass",
    name: "Pointy tree-shaded rocky tall grass",
    description: "Pointy tree-shaded rocky tall grass",
    pokemon: [Pokemon.Dartrix, Pokemon.Decidueye],
  },
  prankbutton: {
    slug: "prankbutton",
    name: "Prank button",
    description:
      "A conspicuous button next to a boo-in-the-box. To press, or not to press, that is the questino.",
    pokemon: [Pokemon.Frogadier, Pokemon.Greninja],
  },
  prettyflowerbed: {
    slug: "prettyflowerbed",
    name: "Pretty flower bed",
    description:
      "A beautiful bed of wildflowers. A faint, sweet aroma wafts about it.",
    pokemon: [Pokemon.Pidgey, Pokemon.Combee, Pokemon.Eevee, Pokemon.Hoothoot, Pokemon.Magby, Pokemon.Pidgeotto],
  },
  privatemakeupstand: {
    slug: "privatemakeupstand",
    name: "Private makeup stand",
    description:
      "The partition helps keep prying eyes away before you're ready for the public",
    pokemon: [Pokemon.Minccino, Pokemon.Cinccino],
  },
  publicreadingmaterial: {
    slug: "publicreadingmaterial",
    name: "Public reading material",
    description:
      "Anyone can freely pick up and enjoy the newspapers and magazines found here",
    pokemon: [Pokemon.Serperior],
  },
  railroadcrossing: {
    slug: "railroadcrossing",
    name: "Railroad crossing",
    description:
      "Absolutely no crossing while the bar is lowered! But…will Pokemon actually sotp and wait?",
    pokemon: [Pokemon.Carkol, Pokemon.Rolycoly, Pokemon.Coalossal],
  },
  raindancesite: {
    slug: "raindancesite",
    name: "Rain Dance site",
    description:
      "Reminders of rain and a plate for offering food. The perfect spot to call for rainy weather",
    pokemon: [Pokemon.Goomy],
  },
  recitalstage: {
    slug: "recitalstage",
    name: "Recital stage",
    description:
      "This stage was made for just one thing-now get up there and SING!",
    pokemon: [Pokemon.Jigglypuff, Pokemon.Wigglytuff],
  },
  redtallgrass: {
    slug: "redtallgrass",
    name: "Red tall grass",
    description:
      "A small plot made up of four tufts of red tall grass. Spots like this are often found in valleys",
    pokemon: [Pokemon.Scorbunny, Pokemon.Riolu, Pokemon.Cinderace, Pokemon.Kricketot, Pokemon.Kricketune],
  },
  refreshinglockerroom: {
    slug: "refreshinglockerroom",
    name: "Refreshing locker room",
    description:
      "Even a simple locker room can have a refreshing atmosphere with the addition of a houseplant or two.",
    pokemon: [Pokemon.Raboot, Pokemon.Cinderace],
  },
  resortmealprep: {
    slug: "resortmealprep",
    name: "Resort meal prep",
    description:
      "Sitting by a campfire underneat a palm tree…Let's kick back and cook some food",
    pokemon: [Pokemon.Growlithe, Pokemon.Torchic, Pokemon.Combusken],
  },
  restingspot: {
    slug: "restingspot",
    name: "Resting spot",
    description:
      "Empty cardboard boxes and a fluffy straw bed. Opinions are divided on which provides better sleep.",
    pokemon: [Pokemon.Meowth],
  },
  rhythmiclivingroom: {
    slug: "rhythmiclivingroom",
    name: "Rhythmic Living room",
    description:
      "A large TV with a rhythm game hooked up to it. Step on the mats in time with the beat!",
    pokemon: [Pokemon.Noibat, Pokemon.Noivern],
  },
  ridingwarmupdrafts: {
    slug: "ridingwarmupdrafts",
    name: "Riding warm updrafts",
    description: "The warm air from three campfires rises high into the sky!",
    pokemon: [Pokemon.Drifloon],
  },
  roadsign: {
    slug: "roadsign",
    name: "Road Sign",
    description:
      "A solitary sign by the middle of the road. Pokemon might head in the arrow's direction",
    pokemon: [Pokemon.Shellos, Pokemon.ShellosEastSea],
  },
  sailfossildisplay: {
    slug: "sailfossildisplay",
    name: "Sail Fossil display",
    description:
      "A display of an ancient Pokemon fossil. This piece of neck sail was once frozen in ice.",
    pokemon: [Pokemon.Amaura],
  },
  seasidetallgrass: {
    slug: "seasidetallgrass",
    name: "Seaside Tall Grass",
    description:
      "Tall grass that stands firm against the spray of saltwater. Good for escaping the seaside heat",
    pokemon: [Pokemon.Slowpoke, Pokemon.Slowbro, Pokemon.Slowking],
  },
  sewerholeinspection: {
    slug: "sewerholeinspection",
    name: "Sewer hole inspection",
    description:
      "Looks like repairs are being carried out here. Only workers are allowed in-no exceptions!",
    pokemon: [Pokemon.Tinkatuff, Pokemon.Corviknight, Pokemon.Poliwrath],
  },
  shadedbeach: {
    slug: "shadedbeach",
    name: "Shaded beach",
    description:
      "The leaves of a palm tree serve as a parasol to Pokemon resting in the beach chair.",
    pokemon: [Pokemon.Exeggcute, Pokemon.Exeggutor],
  },
  shieldfossildisplay: {
    slug: "shieldfossildisplay",
    name: "Shield Fossil display",
    description:
      "A display of ancient Pokemon fossils. This speciment's large neck frill was as sturdy as a fortress wall.",
    pokemon: [Pokemon.Bastiodon],
  },
  simplebathroom: {
    slug: "simplebathroom",
    name: "Simple bathroom",
    description:
      "An ordinary bathroom. Pokemon might stop by to wash themselves.",
    pokemon: [Pokemon.Dratini, Pokemon.Dragonair],
  },
  skullfossildisplay: {
    slug: "skullfossildisplay",
    name: "Skull Fossil display",
    description:
      "A display of an ancient Pokemon fossil. This fossilized skull is as hard as iron",
    pokemon: [Pokemon.Cranidos],
  },
  smoothtallgrass: {
    slug: "smoothtallgrass",
    name: "Smooth tall grass",
    description:
      "A strange smooth rock has drained the vitality from this tall grass",
    pokemon: [Pokemon.Onix],
  },
  spookystudy: {
    slug: "spookystudy",
    name: "Spooky study",
    description:
      "Light thre candle to read by firelight! This place feels spooky when night falls",
    pokemon: [Pokemon.Gastly, Pokemon.Haunter],
  },
  spotlesswashingstation: {
    slug: "spotlesswashingstation",
    name: "Spotless Washing station",
    description:
      "Washing your face and drying it off with a towel feels refreshing. Check out how you look in the mirror!",
    pokemon: [],
  },
  squeakyclean: {
    slug: "squeakyclean",
    name: "Squeaky clean",
    description:
      "Put lots of cleaner on the Mareep spone and make that bathroom shine",
    pokemon: [Pokemon.Poliwag],
  },
  studyarea: {
    slug: "studyarea",
    name: "Study Area",
    description:
      "Just sitting at this desk with a pencil in hand is enough to make you feel a little smarter",
    pokemon: [Pokemon.Ralts, Pokemon.Kirlia],
  },
  sunnydaysite: {
    slug: "sunnydaysite",
    name: "Sunny Day site",
    description:
      "Reminders of sunshine and a plate for offering food. This is the perfect spot to call for fair weather",
    pokemon: [Pokemon.Cacnea],
  },
  surgingpsychicpower: {
    slug: "surgingpsychicpower",
    name: "Surging psychic power",
    description:
      "Sit in front of the crystal ball and focus to gain mastery over your psychic powers…maybe.",
    pokemon: [Pokemon.Abra, Pokemon.Alakazam],
  },
  surpriseinstore: {
    slug: "surpriseinstore",
    name: "Surprise in store",
    description:
      "A pop-art box surrounded by balloons. What's in the box? Open it and find out!",
    pokemon: [Pokemon.Haunter, Pokemon.Zoroark, Pokemon.Gengar],
  },
  tablesidedeliverycart: {
    slug: "tablesidedeliverycart",
    name: "Tableside delivery cart",
    description:
      "Wheel out the dishes nice and slow, because once they reach the table, it's chow time",
    pokemon: [Pokemon.Empoleon],
  },
  tallgrass: {
    slug: "tallgrass",
    name: "Tall Grass",
    description:
      "Four tufts of tall grass bunched together in a plot. The perfect hiding place for small Pokemon",
    pokemon: [
      Pokemon.Bulbasaur,
      Pokemon.Charmander,
      Pokemon.Squirtle,
      Pokemon.Geodude,
      Pokemon.Oddish,
      Pokemon.Charizard,
    ],
  },
  tantalizingdiningset: {
    slug: "tantalizingdiningset",
    name: "Tantalizing dining set",
    description:
      "A table set with dishes-and a chair for sitting. Hungry Pokemon might swing by here..",
    pokemon: [Pokemon.Gulpin],
  },
  tantalizingrestaurant: {
    slug: "tantalizingrestaurant",
    name: "Tantalizing restaurant",
    description:
      "Dishes on a table. There's even a menu, so it's just like being in a restaurant.",
    pokemon: [Pokemon.Pawmo, Pokemon.Pawmi],
  },
  tinyatelier: {
    slug: "tinyatelier",
    name: "Tiny Atelier",
    description:
      "Take a seat in front of the canvas and let your imagination run wild. Inspiration is waiting to strike!",
    pokemon: [Pokemon.Smeargle],
  },
  tirepark: {
    slug: "tirepark",
    name: "Tire Park",
    description:
      "For some reason, the tires are more enticing than the big slide… Yeah! Let's play with all the different tires!",
    pokemon: [Pokemon.Dedenne],
  },
  toilinthesoil: {
    slug: "toilinthesoil",
    name: "Toil in the soil",
    description:
      "A thriving vegetable field. Replacing the soil every so often provides fresh nutrients",
    pokemon: [Pokemon.Tyranitar],
  },
  toppop: {
    slug: "toppop",
    name: "Top pop",
    description:
      "The colorful pop-art furniture gives off a cheerful atmosphere that'll lift your spirits in no time!",
    pokemon: [Pokemon.Typhlosion],
  },
  trainingwaterfall: {
    slug: "trainingwaterfall",
    name: "Training waterfall",
    description:
      "Pokemon who like to train may come here to sit under the waterfall and tone their bodies",
    pokemon: [Pokemon.Tyrogue],
  },
  trashcancentral: {
    slug: "trashcancentral",
    name: "Trash can central",
    description:
      "Trash cans put in place to prevent littering. You can sometimes find Pokemon inside them",
    pokemon: [Pokemon.Magneton, Pokemon.Electabuzz, Pokemon.Magnezone],
  },
  trashcollectionsite: {
    slug: "trashcollectionsite",
    name: "Trash collection site",
    description:
      "A place to dump everyone's garbage. You might even spot some trash-hunting Pokemon here!",
    pokemon: [Pokemon.Trubbish, Pokemon.Koffing, Pokemon.Weezing, Pokemon.Garbodor],
  },
  trashdisposalsite: {
    slug: "trashdisposalsite",
    name: "Trash disposal site",
    description:
      "Some trash left by a power pole. Its surroundings smell a little stinky",
    pokemon: [Pokemon.Crobat],
  },
  trashsitetv: {
    slug: "trashsitetv",
    name: "Trash site TV",
    description:
      "A lone TV left out with the garbage. It looks like it can still be turned on.",
    pokemon: [Pokemon.Dusclops, Pokemon.Dusknoir],
  },
  "treasure-huntingset": {
    slug: "treasure-huntingset",
    name: "Treasure-hunting set",
    description:
      "A map and compass are essential treasure-hunting tools. Time to set off in search of jewels",
    pokemon: [Pokemon.Sableye],
  },
  "tree-shadedflowerbed": {
    slug: "tree-shadedflowerbed",
    name: "Tree-shaded flower bed",
    description:
      "Beautifully blooming flowers beneath the shade ofa tree. Pokemon are attracted by the damp scent",
    pokemon: [Pokemon.Goomy, Pokemon.Cacturne, Pokemon.Vikavolt],
  },
  "tree-shadedfluffyflowerbed": {
    slug: "tree-shadedfluffyflowerbed",
    name: "Tree-shaded fluffy flower bed",
    description:
      "Poofy skyland flowers bloom cutely-even in the cool shade of a tree",
    pokemon: [Pokemon.Girafarig, Pokemon.Servine, Pokemon.Farigiraf, Pokemon.Serperior],
  },
  "tree-shadedgracefulflowerbed": {
    slug: "tree-shadedgracefulflowerbed",
    name: "Tree-shaded graceful flower bed",
    description: "Tree-shaded graceful flower bed",
    pokemon: [Pokemon.Murkrow, Pokemon.Larvesta, Pokemon.Volcarona],
  },
  "tree-shadedpinktallgrass": {
    slug: "tree-shadedpinktallgrass",
    name: "Tree-shaded pink tall grass",
    description:
      "Growing in the shade of a tree, this pink grass is just the tiniest bit damp",
    pokemon: [Pokemon.Sprigatito, Pokemon.Dreepy, Pokemon.Pupitar, Pokemon.Drakloak],
  },
  "tree-shadedredtallgrass": {
    slug: "tree-shadedredtallgrass",
    name: "Tree-shaded red tall grass",
    description:
      "Pokmon are drawn to this place, invited by the damp aroma of the red tall grass.",
    pokemon: [Pokemon.Diglett, Pokemon.Dugtrio, Pokemon.Bonsly, Pokemon.Sudowoodo],
  },
  "tree-shadedsnoozingsnorlax": {
    slug: "tree-shadedsnoozingsnorlax",
    name: "Tree-shaded snoozing Snorlax",
    description:
      "Pokemon might come here mistakenly thinking that this is an actual sleeping Snorlax!",
    pokemon: [Pokemon.Munchlax, Pokemon.Snorlax],
  },
  "tree-shadedtallgrass": {
    slug: "tree-shadedtallgrass",
    name: "Tree-shaded tall grass",
    description:
      "Shaded tall grass that stays cool, even in the midday sun. Pokemon might stop by to relax",
    pokemon: [
      Pokemon.Scyther,
      Pokemon.Scizor,
      Pokemon.Pinsir,
      Pokemon.Bellsprout,
      Pokemon.Skwovet,
      Pokemon.Heracross,
    ],
  },
  "tree-shadedyellowtallgrass": {
    slug: "tree-shadedyellowtallgrass",
    name: "Tree-shaded Yellow tall grass",
    description:
      "Yellow tall grass in the shade of a tree. The habitat has a melancholy feel to it.",
    pokemon: [Pokemon.Zubat, Pokemon.Golbat, Pokemon.Makuhita, Pokemon.Hariyama],
  },
  tropicalseaside: {
    slug: "tropicalseaside",
    name: "Tropical seaside",
    description:
      "Kick back by a palm tree and feel the ocean breeze for the full tropical experience",
    pokemon: [Pokemon.Lapras],
  },
  tropicalvibes: {
    slug: "tropicalvibes",
    name: "Tropical vibes",
    description:
      "Seashore flowers rest beneath the leaves of a palm tree. Their tropical aroma drifts around the area",
    pokemon: [Pokemon.Gloom, Pokemon.Exeggcute, Pokemon.Exeggutor],
  },
  tundrafossildisplay: {
    slug: "tundrafossildisplay",
    name: "Tundra fossil display",
    description:
      "A display of ancient Pokemon fossils. The specimen's beautiful neck sail resembles an aurora.",
    pokemon: [Pokemon.Aurorus],
  },
  upliftingduckweed: {
    slug: "upliftingduckweed",
    name: "Uplifting duckweed",
    description:
      "You can walk on top of the duckweed or jump into the water and float next to them",
    pokemon: [Pokemon.Lotad, Pokemon.Ludicolo],
  },
  urgentcare: {
    slug: "urgentcare",
    name: "Urgent Care",
    description:
      "When injured, seek first aid immediately! Pokemon skilled at healing may come to this habitat.",
    pokemon: [Pokemon.Hitmonlee],
  },
  vendingmachinebreakarea: {
    slug: "vendingmachinebreakarea",
    name: "Vending machine break area",
    description:
      "A long bench beside a vending machine. Pokemon might swing by to take a breather.",
    pokemon: [Pokemon.Grubbin, Pokemon.Charjabug],
  },
  vendingmachineset: {
    slug: "vendingmachineset",
    name: "Vending machine set",
    description:
      "A trash can beside a vending machine. Doesn't look like there are any empty cans inside",
    pokemon: [Pokemon.Elekid, Pokemon.Electivire],
  },
  "very-berryspace": {
    slug: "very-berryspace",
    name: "Very-berry space",
    description:
      "A berry table, a berry bed…Everything's a berry! Just looking at them makes you hungry",
    pokemon: [Pokemon.Goodra],
  },
  watersidedinghy: {
    slug: "watersidedinghy",
    name: "Waterside dinghy",
    description:
      "Board the canoe, or just enjoy some tranquil time relaxing by the waterside",
    pokemon: [Pokemon.Dragonite],
  },
  waterwheelspot: {
    slug: "waterwheelspot",
    name: "Waterwheel Spot",
    description:
      "This amazing facility generaes electriciy through the power of a waterfall",
    pokemon: [Pokemon.Prinplup, Pokemon.Empoleon],
  },
  welcomingresort: {
    slug: "welcomingresort",
    name: "Welcoming resort",
    description:
      "Relax on the sofa or lie down on the hammock, and you'll feel like you're in the lap of luxury.",
    pokemon: [Pokemon.Absol],
  },
  windyflowerbed: {
    slug: "windyflowerbed",
    name: "Windy Flower Bed",
    description:
      "A breeze whooshes over this cool flower bed. As the windmill turns, a floral aroma spreads far and wide.",
    pokemon: [Pokemon.Wingull, Pokemon.Pelipper],
  },
  wingfossildisplay: {
    slug: "wingfossildisplay",
    name: "Wing Fossil Display",
    description:
      "A display of ancient Pokemon fossils. This fine skeletal specimen was once ruler of the skies",
    pokemon: [Pokemon.Aerodactyl],
  },
  workdesk: {
    slug: "workdesk",
    name: "Work desk",
    description:
      "Sit on the office chair and type away at the computer. If you feel tired, grab a beverage and take a break!",
    pokemon: [Pokemon.Porygon2],
  },
  workingtheregister: {
    slug: "workingtheregister",
    name: "Working the register",
    description:
      "Put a register on a table, power it on, and boom! You'll be ready for business in no time",
    pokemon: [Pokemon.Meowth, Pokemon.Audino, Pokemon.Happiny, Pokemon.Mawile],
  },
  yellowcarpet: {
    slug: "yellowcarpet",
    name: "Yellow carpet",
    description:
      "A field of warm, blooming yellow flowers. Just looking at it seems to fill you with energy",
    pokemon: [Pokemon.Hoppip, Pokemon.Skiploom, Pokemon.Jumpluff],
  },
  yellowtallgrass: {
    slug: "yellowtallgrass",
    name: "Yellow tall grass",
    description:
      "A small plot made up of four tufts of yellow tall grass. Spots like this are often found in harbor towns",
    pokemon: [Pokemon.Spinarak, Pokemon.Grubbin, Pokemon.Ariados],
  },
};
