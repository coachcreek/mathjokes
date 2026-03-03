/**
 * jokes.js — Joke data for the Math Jokes Worksheet Generator
 *
 * This file contains the complete list of jokes as a JavaScript array.
 * Each joke is an object (key-value pairs, similar to a Python dictionary)
 * with the following properties:
 *
 *   id       {number}  — A unique numeric identifier for the joke.
 *   filename {string}  — A "slug" (URL-friendly name) used to name the
 *                        downloaded PDF file.
 *   joke_q   {string}  — The joke QUESTION (shown on the worksheet).
 *   joke_a   {string}  — The joke ANSWER (used to create the letter grid).
 *   is_prod  {boolean} — Whether this joke is approved for production use.
 *                        true  = fully vetted, answer length is good
 *                        false = candidate only, may need review
 *
 * HOW JAVASCRIPT ARRAYS AND OBJECTS WORK:
 *   An array is a list:       [item1, item2, item3]
 *   An object is a record:    { key: value, key2: value2 }
 *   An array of objects:      [ {id:1, name:'A'}, {id:2, name:'B'} ]
 *
 *   You access a property with dot notation:  jokes[0].joke_q
 *   Or bracket notation:                      jokes[0]['joke_q']
 *
 * The "const" keyword declares a variable that cannot be reassigned.
 * (The array's contents can still change, but "jokes" always points
 * to this array.)
 *
 * SORT ORDER: Descending by number of alphabetic characters in joke_a
 * (spaces and punctuation excluded from the count).
 */
const jokes = [
    // 17 alpha chars
    { id: 1000001, filename: 'fish_schools',          joke_q: 'Why are fish so smart?',                                                                 joke_a: 'They Live in Schools', is_prod: false },

    // 15 alpha chars
    { id: 1000002, filename: 'bathroom_instrument',   joke_q: 'What musical instrument is in the bathroom?',                                            joke_a: 'A Tuba Toothpaste', is_prod: true },
    { id: 1000003, filename: 'math_book_sad',          joke_q: 'Why was the math book sad?',                                                             joke_a: 'Too many problems', is_prod: false },

    // 14 alpha chars
    { id: 1000004, filename: 'banana_doctor',          joke_q: 'Why did the banana go to the doctor?',                                                   joke_a: 'Not Peeling Well',  is_prod: true },
    { id: 1000005, filename: 'basketball_wet',         joke_q: 'Why are basketball courts always wet?',                                                  joke_a: 'Players Dribble',   is_prod: true },
    { id: 1000006, filename: 'bees_hum',               joke_q: 'Why do bees hum?',                                                                       joke_a: 'Forgot the words',  is_prod: false },
    { id: 1000007, filename: 'depressed_zebra',        joke_q: "What's black and white and blue?",                                                       joke_a: 'Depressed Zebra',   is_prod: false },
    { id: 1000008, filename: 'ghost_liars',            joke_q: 'Why are ghosts bad liars?',                                                              joke_a: 'See through them',  is_prod: false },
    { id: 1000009, filename: 'math_worried',           joke_q: 'Why did the math book look worried?',                                                    joke_a: 'Full of problems',  is_prod: false },
    { id: 1000010, filename: 'mummy_vacation',         joke_q: "Why don't mummies take vacations?",                                                      joke_a: 'Afraid to unwind',  is_prod: false },
    { id: 1000011, filename: 'run_bed',                joke_q: 'Why did the man run around his bed?',                                                    joke_a: 'Catch up on sleep', is_prod: false },
    { id: 1000012, filename: 'tissue_dance',           joke_q: 'How do you make a tissue dance?',                                                        joke_a: 'Put A Boogie In It',is_prod: true },
    { id: 1000013, filename: 'train_toffee',           joke_q: 'What do you call a train loaded with caramel?',                                           joke_a: 'Chew-Chew Train', is_prod: true },

    // 13 alpha chars
    { id: 1000014, filename: 'ducks_cash',             joke_q: 'Why do ducks always pay with cash?',                                                     joke_a: 'They Have Bills',   is_prod: true },
    { id: 1000015, filename: 'fish_bowtie',            joke_q: 'What do you call a fish wearing a bowtie?',                                              joke_a: 'So-fish-ticated',   is_prod: true },
    { id: 1000016, filename: 'fish_salt_water',        joke_q: 'Why do fish live in salt water?',                                                        joke_a: 'Pepper Sneezes',    is_prod: false },
    { id: 1000017, filename: 'horses_live',            joke_q: 'Where do most horses live?',                                                             joke_a: 'NAAAY-borhoods',    is_prod: true },
    { id: 1000018, filename: 'merry_sheep',            joke_q: 'How does a sheep say Merry Christmas?',                                                  joke_a: 'Fleece Navidad',    is_prod: true },
    { id: 1000019, filename: 'sheep_roo',              joke_q: 'What do you get when you cross a sheep and a kangaroo?',                                 joke_a: 'A woolly jumper',   is_prod: false },
    { id: 1000020, filename: 'sheep_vacation',         joke_q: 'Where did the sheep go on vacation?',                                                    joke_a: 'The Baaa-hamas',    is_prod: true },
    { id: 1000021, filename: 'strawberry_cry',         joke_q: 'Why was the baby strawberry crying?',                                                    joke_a: 'Parents in a jam',  is_prod: false },
    { id: 1000022, filename: 'teddy_bears_hungry',     joke_q: 'Why are teddy bears never hungry?',                                                      joke_a: 'Always Stuffed',    is_prod: false },
    { id: 1000023, filename: 'wheels_flies',           joke_q: 'What has 4 wheels and flies?',                                                           joke_a: 'A Garbage Truck',   is_prod: true },

    // 12 alpha chars
    { id: 1000024, filename: 'alligator_vest',         joke_q: 'What do you call an alligator in a vest?',                                               joke_a: 'Investigator',      is_prod: true },
    { id: 1000025, filename: 'bear_rain',              joke_q: 'What do you call a bear standing in the rain?',                                          joke_a: 'A Drizzly Bear',    is_prod: true },
    { id: 1000026, filename: 'cinderella_football',    joke_q: 'Why is Cinderella so bad at playing football?',                                          joke_a: 'Runs from Ball',    is_prod: false },
    { id: 1000027, filename: 'corners_meet',           joke_q: 'What did one wall say to the other wall?',                                               joke_a: 'Meet at Corner',    is_prod: false },
    { id: 1000028, filename: 'dragon_sleep',           joke_q: 'Why do dragons sleep during the day?',                                                   joke_a: 'Fight knights',     is_prod: false },
    { id: 1000029, filename: 'firequackers',           joke_q: 'What do you get if you cross fireworks with a duck?',                                    joke_a: 'Firequackers',      is_prod: true },
    { id: 1000030, filename: 'lazy_kangaroo',          joke_q: 'What do you call a lazy kangaroo?',                                                      joke_a: 'A pouch potato',    is_prod: true },
    { id: 1000031, filename: 'lion_greet',             joke_q: 'How does a lion greet the other animals in the field?',                                  joke_a: 'Pleased to Eat',    is_prod: false },
    { id: 1000032, filename: 'peter_pan_fly',          joke_q: 'Why does Peter Pan fly around so much?',                                                 joke_a: 'He Neverlands',     is_prod: true },
    { id: 1000033, filename: 'pirates_name',           joke_q: 'Why are pirates called pirates?',                                                        joke_a: 'They just arrr',    is_prod: true },
    { id: 1000034, filename: 'polar_bear_vote',        joke_q: 'Where do polar bears vote?',                                                             joke_a: 'The North Poll',    is_prod: false },
    { id: 1000035, filename: 'pony_throat',            joke_q: 'What do you call a pony with a sore throat?',                                            joke_a: 'A Little Horse',    is_prod: true },
    { id: 1000036, filename: 'roof_joke',              joke_q: 'Did you hear the joke about the roof?',                                                  joke_a: 'Over Your Head',    is_prod: false },
    { id: 1000037, filename: 'six_afraid',             joke_q: 'Why was 6 afraid of 7?',                                                                 joke_a: 'Seven ate nine',    is_prod: true },
    { id: 1000038, filename: 'smart_duck',             joke_q: 'What do you call a duck that gets good grades?',                                         joke_a: 'A wise quacker',    is_prod: false },

    // 11 alpha chars
    { id: 1000039, filename: 'barber_drive',           joke_q: 'How does a barber drive to work?',                                                       joke_a: 'He Takes Cuts',     is_prod: false },
    { id: 1000040, filename: 'belt_arrest',            joke_q: 'Why was the belt arrested?',                                                             joke_a: 'Held up pants',     is_prod: false },
    { id: 1000041, filename: 'brother_grant',          joke_q: 'When Grant was 8, his brother was half his age. Now Grant is 14. How old is his brother?', joke_a: 'Ten Years Old',   is_prod: false },
    { id: 1000042, filename: 'cloud_coat',             joke_q: 'What do clouds wear under their shorts?',                                                joke_a: 'Thunderwear',       is_prod: true },
    { id: 1000043, filename: 'egg_jokes',              joke_q: "Why don't eggs tell jokes?",                                                             joke_a: 'They crack up',     is_prod: true },
    { id: 1000044, filename: 'elephant_charging',      joke_q: 'How do you stop an elephant from charging?',                                             joke_a: 'Take the Card',     is_prod: false },
    { id: 1000045, filename: 'fast_loud',              joke_q: 'What is fast, loud and crunchy?',                                                        joke_a: 'A rocket chip',     is_prod: true },
    { id: 1000046, filename: 'frog_snack',             joke_q: "What is a frog's favorite snack?",                                                       joke_a: 'French flies',      is_prod: true },
    { id: 1000047, filename: 'lion_comedian',          joke_q: 'What happened when the lion ate the comedian?',                                          joke_a: 'He Felt Funny',     is_prod: true },
    { id: 1000048, filename: 'lunch_dinner',           joke_q: 'What 2 things can you never eat for breakfast?',                                         joke_a: 'Lunch & Dinner',    is_prod: false },
    { id: 1000049, filename: 'mice_boats',             joke_q: 'Where do mice park their boats?',                                                        joke_a: 'Hickory Dock',      is_prod: false },
    { id: 1000050, filename: 'pampered_cow',           joke_q: 'What do you get from a pampered cow?',                                                   joke_a: 'Spoiled Milk',      is_prod: true },
    { id: 1000051, filename: 'picture_jail',           joke_q: 'Why did the picture go to jail?',                                                        joke_a: 'It was framed',     is_prod: true },
    { id: 1000052, filename: 'pigs_dirty_laundry',     joke_q: 'Where do pigs put their dirty laundry?',                                                 joke_a: 'In The Ham-per',     is_prod: true },
    { id: 1000053, filename: 'plate_joke',             joke_q: 'What did one plate say to the other?',                                                   joke_a: 'Lunch is on me',    is_prod: false },
    { id: 1000054, filename: 'race_second',            joke_q: "You're running a race and pass the person in 2nd place. What place are you in?",         joke_a: 'Second Place',      is_prod: false },
    { id: 1000055, filename: 'rancher_cattle',         joke_q: 'What does a rancher use to count his cattle?',                                           joke_a: 'A Cow-culator',     is_prod: true },
    { id: 1000056, filename: 'robber_ducky',           joke_q: 'Who stole the soap out of the bathtub?',                                                 joke_a: 'Robber Ducky',      is_prod: true },
    { id: 1000057, filename: 'scarecrow_award',        joke_q: 'Why did the scarecrow win an award?',                                                    joke_a: 'Out-standing',      is_prod: false },
    { id: 1000058, filename: 'serve_eat',              joke_q: 'What can you serve but never eat?',                                                      joke_a: 'A tennis ball',     is_prod: true },
    { id: 1000059, filename: 'shower_animal',          joke_q: 'What animal do you look like in the shower?',                                            joke_a: 'A little bear',     is_prod: false },
    { id: 1000060, filename: 'skunk_court',            joke_q: 'What did the judge say when the skunk walked into court?',                               joke_a: 'Odor in Court',     is_prod: false },
    { id: 1000061, filename: 'smartest_insect',        joke_q: "What's the smartest insect?",                                                            joke_a: 'Spelling Bee',      is_prod: true },
    { id: 1000062, filename: 'snake_jokes',            joke_q: 'What do you call a snake that tells jokes?',                                             joke_a: 'Hiss-terical',      is_prod: true },
    { id: 1000063, filename: 'spelled_incorrectly',    joke_q: 'What word is spelled incorrectly in every dictionary?',                                  joke_a: 'Incorrectly',       is_prod: true },
    { id: 1000064, filename: 'vampire_fruit',          joke_q: "What is a vampire's favorite fruit?",                                                    joke_a: 'A neck-tarine',     is_prod: true },
    { id: 1000065, filename: 'watch_belt',             joke_q: 'What do you call a belt made out of watches?',                                           joke_a: 'Waist of time',     is_prod: true },
    { id: 1000066, filename: 'your_cheese',            joke_q: "What do you call cheese that isn't yours?",                                              joke_a: 'Nacho Cheese',      is_prod: true },

    // 10 alpha chars
    { id: 1000067, filename: 'animal_wig',             joke_q: 'What animal needs to wear a wig?',                                                       joke_a: 'A Bald Eagle',      is_prod: true },
    { id: 1000068, filename: 'bagel_fly',              joke_q: 'What do you call a bagel that can fly?',                                                 joke_a: 'Plane Bagel',       is_prod: true },
    { id: 1000069, filename: 'bee_hair',               joke_q: 'What do bees use to style their hair?',                                                  joke_a: 'Honeycombs',        is_prod: true },
    { id: 1000070, filename: 'bees_school',            joke_q: 'How do bees get to school?',                                                             joke_a: 'School Buzz',       is_prod: true },
    { id: 1000071, filename: 'birthday_end',           joke_q: 'What does every birthday end with?',                                                     joke_a: 'The Letter Y',      is_prod: true },
    { id: 1000072, filename: 'bookkeeper_letters',     joke_q: 'What English word has three consecutive double letters?',                                joke_a: 'Bookkeeper',        is_prod: false },
    { id: 1000073, filename: 'bread_bed',              joke_q: 'What did the slice of bread wear to bed?',                                               joke_a: 'Its Jam-mies',      is_prod: true },
    { id: 1000074, filename: 'call_dentist',           joke_q: 'When is the best time to call your dentist?',                                            joke_a: 'Tooth-hurty',       is_prod: true },
    { id: 1000075, filename: 'computer_snack',         joke_q: 'What do computers eat for a snack?',                                                     joke_a: 'Microchips',        is_prod: true },
    { id: 1000076, filename: 'cookie_hospital',        joke_q: 'Why did the cookie go to the hospital?',                                                 joke_a: 'It Felt Crumby',       is_prod: true },
    { id: 1000077, filename: 'cow_grass',              joke_q: 'What do you call a cow that eats your grass?',                                           joke_a: 'A Lawn Moo-er',     is_prod: true },
    { id: 1000078, filename: 'cow_legs',               joke_q: 'What do you call a cow with no legs?',                                                   joke_a: 'Ground Beef',       is_prod: true },
    { id: 1000079, filename: 'cow_movies',             joke_q: 'Where do cows go for fun?',                                                              joke_a: 'The moo-vies',      is_prod: true },
    { id: 1000080, filename: 'cow_vegetable',          joke_q: "What is a cow's favorite vegetable?",                                                    joke_a: 'Cow-iflower',       is_prod: true },
    { id: 1000081, filename: 'dog_mosquito',           joke_q: 'What do you get if you cross a dog and a mosquito?',                                      joke_a: 'Bloodhound',        is_prod: true },
    { id: 1000082, filename: 'dressed_lion',           joke_q: 'What do you call a well-dressed lion?',                                                  joke_a: 'A Dandy-lion',      is_prod: true },
    { id: 1000083, filename: 'ears_no_hear',           joke_q: 'What has ears but cannot hear?',                                                         joke_a: 'A Cornfield',       is_prod: true },
    { id: 1000084, filename: 'elephant_vader',         joke_q: 'What do you get when you cross an elephant with Darth Vader?',                            joke_a: 'An Ele-vader',      is_prod: true },
    { id: 1000085, filename: 'elf_school',             joke_q: 'What do elves learn in school?',                                                         joke_a: 'The elf-abet',      is_prod: true },
    { id: 1000086, filename: 'end_rainbow',            joke_q: 'What is at the end of every rainbow?',                                                   joke_a: 'The Letter W',      is_prod: true },
    { id: 1000087, filename: 'firefly_lunch',          joke_q: 'What did the firefly have for lunch?',                                                    joke_a: 'A Light Meal',      is_prod: true },
    { id: 1000088, filename: 'funny_mountain',         joke_q: 'What do you call a funny mountain?',                                                     joke_a: 'Hill-arious',       is_prod: true },
    { id: 1000089, filename: 'giant_talk',             joke_q: 'How do you talk to a giant?',                                                            joke_a: 'Use Big Words',      is_prod: true },
    { id: 1000090, filename: 'gravity_center',         joke_q: 'What is the center of gravity?',                                                         joke_a: 'The Letter V',      is_prod: true },
    { id: 1000091, filename: 'moose_name',             joke_q: 'What do you call a moose with no name?',                                                 joke_a: 'Anonymoose',        is_prod: true },
    { id: 1000092, filename: 'most_letters',           joke_q: 'What two words, when combined, hold the most letters?',                                  joke_a: 'Post Office',       is_prod: true },
    { id: 1000093, filename: 'mushroom_fun',           joke_q: 'Why does everyone like to hang out with the mushroom?',                                  joke_a: 'He Is A Real Fungi',       is_prod: true },
    { id: 1000094, filename: 'music_keys',             joke_q: 'Where did the music teacher leave her keys?',                                            joke_a: 'In The Piano',      is_prod: true },
    { id: 1000095, filename: 'one_letter',             joke_q: 'What starts with an E, ends with an E, but only contains one letter?',                   joke_a: 'An Envelope',       is_prod: true },
    { id: 1000096, filename: 'panda_movies',           joke_q: 'Why do pandas like old movies?',                                                         joke_a: 'Black & White',     is_prod: false },
    { id: 1000097, filename: 'platypus_hole',          joke_q: 'What do you call a platypus that falls in a hole?',                                      joke_a: 'A Splatypus',       is_prod: true },
    { id: 1000098, filename: 'potato_glasses',         joke_q: 'What do you call a potato wearing glasses?',                                             joke_a: 'A Spec-Tater',      is_prod: true },
    { id: 1000099, filename: 'sad_strawberry',         joke_q: 'What do you call a sad strawberry?',                                                     joke_a: 'A Blueberry',       is_prod: true },
    { id: 1000100, filename: 'sleeping_bull',          joke_q: 'What do you call a sleeping bull?',                                                      joke_a: 'A Bull-dozer',      is_prod: true },
    { id: 1000101, filename: 'stadium_fans',           joke_q: "Why wasn't the stadium hot after the game?",                                             joke_a: 'So Many Fans',      is_prod: false },
    { id: 1000102, filename: 'staircase_move',         joke_q: 'I go up and down, but never move. What am I?',                                           joke_a: 'A Staircase',       is_prod: true },
    { id: 1000103, filename: 'three_feet',             joke_q: "What has three feet but can't walk?",                                                    joke_a: 'A Yardstick',       is_prod: true },
    { id: 1000104, filename: 'turkey_feathers',        joke_q: 'Which side of the turkey has the most feathers?',                                        joke_a: 'The Outside',       is_prod: true },
    { id: 1000105, filename: 'twice_moment',           joke_q: 'What occurs once in a minute, twice in a moment, and never in one thousand years?',       joke_a: 'The Letter M',      is_prod: true },
    { id: 1000106, filename: 'whale_music',            joke_q: 'What do you call a group of musical whales?',                                            joke_a: 'An orca-stra',      is_prod: true },

    // 9 alpha chars
    { id: 1000107, filename: 'aardvark_feet',          joke_q: 'What do you call an aardvark that is three feet long?',                                  joke_a: 'A Yardvark',        is_prod: true },
    { id: 1000108, filename: 'astronaut_baby',         joke_q: "How do you get an astronaut's baby to stop crying?",                                     joke_a: 'You Rocket',        is_prod: true },
    { id: 1000109, filename: 'bear_teeth',             joke_q: 'What do you call a bear with no teeth?',                                                 joke_a: 'A Gummy Bear',        is_prod: true },
    { id: 1000110, filename: 'bronto_lemon',           joke_q: 'What do you get when you cross a brontosaurus and a lemon?',                              joke_a: 'A Dino-sour',       is_prod: true },
    { id: 1000111, filename: 'bumblebee_candy',        joke_q: 'What candy do bumblebees love the most?',                                                joke_a: 'Bumble Gum',        is_prod: true },
    { id: 1000112, filename: 'cat_pile',               joke_q: 'What do you call a pile of cats?',                                                       joke_a: 'A Meow-tain',        is_prod: true },
    { id: 1000113, filename: 'cat_water',              joke_q: 'What do you call a cat that loves water?',                                               joke_a: 'A Purr-maid',       is_prod: true },
    { id: 1000114, filename: 'chicken_egg_barn',       joke_q: 'What do you get when a chicken lays an egg on top of a barn?',                           joke_a: 'An Eggroll',        is_prod: true },
    { id: 1000115, filename: 'cow_toad',               joke_q: 'What do you get when you cross a cow and a toad?',                                        joke_a: 'A Bullfrog',        is_prod: true },
    { id: 1000116, filename: 'dog_snowman',            joke_q: 'What do you get when you cross a dog and a snowman?',                                     joke_a: 'Frostbite',         is_prod: true },
    { id: 1000117, filename: 'dogs_tell_time',         joke_q: 'What kind of dogs can tell time?',                                                       joke_a: 'Watch Dogs',        is_prod: true },
    { id: 1000118, filename: 'elephant_nothing',       joke_q: 'What is as big as an elephant but weighs absolutely nothing?',                           joke_a: 'Its Shadow',        is_prod: true },
    { id: 1000119, filename: 'fake_spaghetti',         joke_q: 'What do you call fake spaghetti?',                                                       joke_a: 'An Impasta',        is_prod: true },
    { id: 1000120, filename: 'fake_stone',             joke_q: 'What do you call a fake stone?',                                                         joke_a: 'A Sham-rock',       is_prod: true },
    { id: 1000121, filename: 'frozen_dog',             joke_q: 'What do you call a frozen dog?',                                                         joke_a: 'A Pupsicle',        is_prod: true },
    { id: 1000122, filename: 'golfer_pants',           joke_q: 'Why did the golfer bring two pairs of pants?',                                           joke_a: 'Hole in one',       is_prod: false },
    { id: 1000123, filename: 'magic_owl',              joke_q: 'What do you call a magic owl?',                                                          joke_a: 'Whooo-dini',        is_prod: true },
    { id: 1000124, filename: 'meditating_wolf',        joke_q: 'What do you call a meditating wolf?',                                                    joke_a: 'Aware Wolf',        is_prod: true },
    { id: 1000125, filename: 'oyster_share',           joke_q: "What do you call an oyster who refuses to share?",                                       joke_a: 'Shellfish',         is_prod: true },
    { id: 1000126, filename: 'pig_karate',             joke_q: 'What do you get when a pig does karate?',                                                joke_a: 'Pork Chops',        is_prod: true },
    { id: 1000127, filename: 'rabbit_fleas',           joke_q: 'What do you call a rabbit with fleas?',                                                  joke_a: 'Bugs Bunny',        is_prod: true },
    { id: 1000128, filename: 'room_no_walls',          joke_q: 'What room has no walls?',                                                                joke_a: 'A Mushroom',        is_prod: true },
    { id: 1000129, filename: 'sad_coffee',             joke_q: 'What do you call a sad cup of coffee?',                                                  joke_a: 'A depresso',        is_prod: false },
    { id: 1000130, filename: 'skeleton_instrument',    joke_q: 'What instrument does a skeleton play?',                                                  joke_a: 'A Trom-bone',       is_prod: true },
    { id: 1000131, filename: 'space_party',            joke_q: 'How do you organize a space party?',                                                     joke_a: 'You Planet',        is_prod: true },
    { id: 1000132, filename: 'squirrel_breakfast',     joke_q: 'What does a squirrel like to eat for breakfast?',                                        joke_a: 'Dough-Nuts',        is_prod: true },
    { id: 1000133, filename: 'starfish_night',         joke_q: 'What fish only swims at night?',                                                         joke_a: 'A Starfish',        is_prod: true },
    { id: 1000134, filename: 'tree_hand',              joke_q: 'What kind of tree fits in your hand?',                                                   joke_a: 'A Palm Tree',       is_prod: true },
    { id: 1000135, filename: 'triangle_circle',        joke_q: 'What does a triangle call a circle?',                                                    joke_a: 'Pointless',         is_prod: true },

    // 8 alpha chars
    { id: 1000136, filename: 'astronaut_computer',     joke_q: "What is an astronaut's favorite part of a computer?",                                    joke_a: 'The Space Bar',     is_prod: true },
    { id: 1000137, filename: 'bear_socks',             joke_q: 'What do you call a bear with no socks on?',                                              joke_a: 'Bare-foot',         is_prod: true },
    { id: 1000138, filename: 'bicycle_tired',          joke_q: 'Why did the bicycle fall over?',                                                         joke_a: 'Two tired',         is_prod: true },
    { id: 1000139, filename: 'bird_math',              joke_q: "What is a bird's favorite type of math?",                                                joke_a: 'Owl-gebra',         is_prod: true },
    { id: 1000140, filename: 'birds_stick_together',   joke_q: 'What kind of birds like to stick together?',                                             joke_a: 'Vel-Crows',         is_prod: true },
    { id: 1000141, filename: 'bottom_top',             joke_q: 'What has a bottom at the top?',                                                          joke_a: 'Your legs',         is_prod: true },
    { id: 1000142, filename: 'bow_tied',               joke_q: "What bow can't be tied?",                                                                joke_a: 'A rainbow',         is_prod: true },
    { id: 1000143, filename: 'cat_beans',              joke_q: 'What do you call a cat that likes to eat beans?',                                        joke_a: 'A Purr-ito',        is_prod: true },
    { id: 1000144, filename: 'cat_night',              joke_q: 'What does a cat wear at night?',                                                         joke_a: 'Paw-jamas',         is_prod: true },
    { id: 1000145, filename: 'cheerleader_drink',      joke_q: "What's a cheerleader's favorite drink?",                                                 joke_a: 'Root Beer',         is_prod: true },
    { id: 1000146, filename: 'cow_no_milk',            joke_q: "What do you call a cow that won't give milk?",                                           joke_a: 'A Milk Dud',        is_prod: true },
    { id: 1000147, filename: 'fish_mouse',             joke_q: 'What kind of fish chases a mouse?',                                                      joke_a: 'A catfish',         is_prod: true },
    { id: 1000148, filename: 'foot_slippery',          joke_q: "What's a foot long and slippery?",                                                       joke_a: 'A Slipper',         is_prod: true },
    { id: 1000149, filename: 'janitor_closet',         joke_q: 'What did the janitor say when he jumped out of the closet?',                              joke_a: 'Supplies!',         is_prod: true },
    { id: 1000150, filename: 'monkey_behave',          joke_q: "What do you call a monkey who won't behave?",                                            joke_a: 'A Bad-Boon',        is_prod: true },
    { id: 1000151, filename: 'monkey_breakfast',       joke_q: 'What does a monkey drink with its breakfast?',                                           joke_a: 'Ape Juice',         is_prod: true },
    { id: 1000152, filename: 'most_stories',           joke_q: 'What building has the most stories?',                                                    joke_a: 'A library',         is_prod: true },
    { id: 1000153, filename: 'music_planet',           joke_q: 'What type of music do the planets enjoy?',                                               joke_a: 'Neptunes',          is_prod: true },
    { id: 1000154, filename: 'ninja_shoes',            joke_q: 'What kind of shoes do ninjas wear?',                                                     joke_a: 'Sneakers',          is_prod: true },
    { id: 1000155, filename: 'peanut_rocket',          joke_q: 'Why did the peanut get into a rocket?',                                                  joke_a: 'Astro-nut',         is_prod: true },
    { id: 1000156, filename: 'promise_kept',           joke_q: 'What can you break without touching it?',                                                joke_a: 'A Promise',         is_prod: true },
    { id: 1000157, filename: 'red_blue',               joke_q: 'What is red and smells like blue paint?',                                                joke_a: 'Red Paint',         is_prod: true },
    { id: 1000158, filename: 'sandals_frog',           joke_q: 'What kind of sandals do frogs wear?',                                                    joke_a: 'Open-Toad',         is_prod: true },
    { id: 1000159, filename: 'seagulls_sea',           joke_q: 'Why do seagulls fly over the sea?',                                                      joke_a: 'Bay-gulls',         is_prod: true },
    { id: 1000160, filename: 'snails_eat',             joke_q: 'Who eats snails?',                                                                       joke_a: 'Fast Food',         is_prod: true },
    { id: 1000161, filename: 'snake_bakes',            joke_q: 'What do you call a snake that bakes?',                                                   joke_a: 'A pie-thon',        is_prod: true },
    { id: 1000162, filename: 'witch_subject',          joke_q: "What is a witch's favorite subject?",                                                    joke_a: 'Spelling',          is_prod: true },
    { id: 1000163, filename: 'your_name',              joke_q: 'It belongs to you, but your friends use it more. What is it?',                           joke_a: 'Your Name',         is_prod: true },
    { id: 1000164, filename: 'zero_eight',             joke_q: 'What did the zero say to the eight?',                                                    joke_a: 'Nice belt',         is_prod: true },

    // 7 alpha chars
    { id: 1000165, filename: 'bee_mind',               joke_q: "What do you call a bee that can't make up its mind?",                                    joke_a: 'A Maybee',          is_prod: true },
    { id: 1000166, filename: 'fragile_name',           joke_q: 'I am so fragile that if you say my name, you will break me. What am I?',                 joke_a: 'Silence',           is_prod: true },
    { id: 1000167, filename: 'friendly_ocean',         joke_q: 'How do we know that the ocean is friendly?',                                             joke_a: 'It Waves',          is_prod: true },
    { id: 1000168, filename: 'ghost_nose',             joke_q: "What is a ghost's nose full of?",                                                        joke_a: 'Boo-gers',          is_prod: true },
    { id: 1000169, filename: 'girl_tennis',            joke_q: 'What do you call a girl in the middle of a tennis court?',                               joke_a: 'Annette',           is_prod: true },
    { id: 1000170, filename: 'orange_parrot',          joke_q: "What's orange and sounds like a parrot?",                                                joke_a: 'A Carrot',          is_prod: true },
    { id: 1000171, filename: 'rubber_toe',             joke_q: 'What do you call a man with a rubber toe?',                                              joke_a: 'Roberto',           is_prod: true },
    { id: 1000172, filename: 'snowman_july',           joke_q: 'What do you call a snowman in July?',                                                    joke_a: 'A Puddle',          is_prod: true },
    { id: 1000173, filename: 'woodpecker_breakfast',   joke_q: 'What do woodpeckers eat for breakfast?',                                                 joke_a: 'Oakmeal',           is_prod: true },

    // 6 alpha chars
    { id: 1000174, filename: 'boomerang',              joke_q: "What do you call a boomerang that won't come back?",                                     joke_a: 'A Stick',           is_prod: true },
    { id: 1000175, filename: 'deer_eyes',              joke_q: 'What do you call a deer with no eyes?',                                                  joke_a: 'No Idea',           is_prod: false },
    { id: 1000176, filename: 'face_hands',             joke_q: 'What has a face and two hands, but no arms or legs?',                                    joke_a: 'A Clock',           is_prod: true },
    { id: 1000177, filename: 'tricycle_bicycle',       joke_q: 'What is the difference between a poorly dressed man on a tricycle and a well-dressed man on a bicycle?', joke_a: 'Attire', is_prod: true },

    // 5 alpha chars
    { id: 1000178, filename: 'shorter_add',            joke_q: 'What word becomes shorter after you add two letters to it?',                              joke_a: 'Short',             is_prod: true },
];

/**
 * prodJokes — the production-ready subset of the full jokes array.
 *
 * This is a filtered copy of "jokes" that contains ONLY the entries
 * where is_prod is true. The rest of the app uses "prodJokes" so that
 * unfinished/unreviewed jokes (is_prod: false) never appear in the UI
 * or in generated worksheets.
 *
 * HOW Array.filter() WORKS:
 *   array.filter(fn) creates a NEW array containing only the elements
 *   for which fn returns true. The original "jokes" array is unchanged.
 *
 *   Example:
 *     [1, 2, 3, 4].filter(n => n > 2)  →  [3, 4]
 *
 *   Here, the arrow function checks the is_prod property of each joke:
 *     joke => joke.is_prod
 *   is the same as writing:
 *     function(joke) { return joke.is_prod; }
 *
 * To promote a joke from candidate to production:
 *   1. Review the joke object in the "jokes" array above.
 *   2. Change its "is_prod" value from false to true.
 *   3. "prodJokes" will automatically include it on the next page load.
 *
 * To add a new joke in draft/review state:
 *   1. Add it to the "jokes" array with is_prod: false.
 *   2. It will be invisible to the app until you set is_prod: true.
 */
const prodJokes = jokes.filter(joke => joke.is_prod);
