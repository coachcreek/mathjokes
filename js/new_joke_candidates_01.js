/**
 * new_jokes_verified.js — Additional Joke data for the Math Jokes Worksheet Generator
 *
 * This file contains new jokes in the same format as the original jokes.js
 * Each joke has been carefully verified to ensure:
 *   - The answer contains 8-15 alphabetic characters (excluding spaces and punctuation)
 *   - The question is concise and appropriate for children
 *   - The answer makes logical sense as a response to the question
 *
 *   id       {number} — A unique numeric identifier for the joke.
 *   filename {string} — A "slug" (URL-friendly name) used to name the PDF file.
 *   joke_q   {string} — The joke QUESTION (shown on the worksheet).
 *   joke_a   {string} — The joke ANSWER (8-15 letters, used for the letter grid).
 */
const newJokes = [
    // 10 letters: Abulldozer
    { id: 2000001, filename: 'sleeping_bull_2',       joke_q: 'What do you call a sleeping bull?',                                            joke_a: 'A bull-dozer' },
    
    // 9 letters: Ameowtain
    { id: 2000002, filename: 'kitten_pile',           joke_q: 'What do you call a pile of kittens?',                                          joke_a: 'A meowtain' },
    
    // 9 letters: Apalmtree
    { id: 2000003, filename: 'palm_tree_hand',        joke_q: 'What kind of tree fits in your hand?',                                         joke_a: 'A palm tree' },
    
    // 8 letters: Porkchop
    { id: 2000004, filename: 'pig_karate_2',          joke_q: 'What do you call a pig that does karate?',                                     joke_a: 'Pork chop' },
    
    // 10 letters: Themoovies
    { id: 2000005, filename: 'cow_movies',            joke_q: 'Where do cows go for fun?',                                                    joke_a: 'The moo-vies' },
    
    // 14 letters: Notpeelingwell
    { id: 2000006, filename: 'banana_doctor',         joke_q: 'Why did the banana go to the doctor?',                                         joke_a: 'Not peeling well' },
    
    // 8 letters: Alibrary
    { id: 2000007, filename: 'most_stories',          joke_q: 'What building has the most stories?',                                          joke_a: 'A library' },
    
    // 10 letters: Acornfield
    { id: 2000008, filename: 'ears_no_hear',          joke_q: 'What has ears but cannot hear?',                                               joke_a: 'A cornfield' },
    
    // 12 letters: Sevenatenine
    { id: 2000009, filename: 'six_afraid',            joke_q: 'Why was 6 afraid of 7?',                                                       joke_a: 'Seven ate nine' },
    
    // 13 letters: Sofishticated
    { id: 2000010, filename: 'fish_bowtie',           joke_q: 'What do you call a fish wearing a bowtie?',                                    joke_a: 'So-fish-ticated' },
    
    // 11 letters: Lunchisonme
    { id: 2000011, filename: 'plate_joke',            joke_q: 'What did one plate say to the other?',                                         joke_a: 'Lunch is on me' },
    
    // 10 letters: Feltcrumby
    { id: 2000012, filename: 'cookie_hospital',       joke_q: 'Why did the cookie go to the hospital?',                                       joke_a: 'Felt crumby' },
    
    // 8 letters: Spelling
    { id: 2000013, filename: 'witch_subject',         joke_q: "What is a witch's favorite subject?",                                          joke_a: 'Spelling' },
    
    // 11 letters: Theycrackup
    { id: 2000014, filename: 'egg_jokes',             joke_q: "Why don't eggs tell jokes?",                                                   joke_a: 'They crack up' },
    
    // 10 letters: Theelfabet
    { id: 2000015, filename: 'elf_school',            joke_q: 'What do elves learn in school?',                                               joke_a: 'The elf-abet' },
    
    // 11 letters: Outstanding
    { id: 2000016, filename: 'scarecrow_award',       joke_q: 'Why did the scarecrow win an award?',                                          joke_a: 'Out-standing' },
    
    // 12 letters: Adrizzlybear
    { id: 2000017, filename: 'bear_rain_2',           joke_q: 'What do you call a bear in the rain?',                                         joke_a: 'A drizzly bear' },
    
    // 9 letters: Amushroom
    { id: 2000018, filename: 'room_no_walls',         joke_q: 'What room has no walls?',                                                      joke_a: 'A mushroom' },
    
    // 15 letters: Toomanyproblems
    { id: 2000019, filename: 'math_book_sad',         joke_q: 'Why was the math book sad?',                                                   joke_a: 'Too many problems' },
    
    // 11 letters: Thunderwear
    { id: 2000020, filename: 'clouds_wear',           joke_q: 'What do clouds wear?',                                                         joke_a: 'Thunderwear' },
    
    // 8 letters: Apiethon
    { id: 2000021, filename: 'snake_bakes',           joke_q: 'What do you call a snake that bakes?',                                         joke_a: 'A pie-thon' },
    
    // 8 letters: Baygulls
    { id: 2000022, filename: 'seagulls_sea',          joke_q: 'Why do seagulls fly over the sea?',                                            joke_a: 'Bay-gulls' },
    
    // 15 letters: Atubatoothpaste
    { id: 2000023, filename: 'bathroom_instrument',   joke_q: 'What musical instrument is in the bathroom?',                                  joke_a: 'A tuba toothpaste' },
    
    // 10 letters: Honeycombs
    { id: 2000024, filename: 'bee_hair',              joke_q: 'Why do bees have sticky hair?',                                                joke_a: 'Honeycombs' },
    
    // 12 letters: Awisequacker
    { id: 2000025, filename: 'smart_duck',            joke_q: 'What do you call a duck that gets good grades?',                               joke_a: 'A wise quacker' },
    
    // 11 letters: Spoiledmilk
    { id: 2000026, filename: 'pampered_cow_2',        joke_q: 'What do you get from a pampered cow?',                                         joke_a: 'Spoiled milk' },
    
    // 14 letters: Putaboogieinit
    { id: 2000027, filename: 'tissue_dance',          joke_q: 'How do you make a tissue dance?',                                              joke_a: 'Put a boogie in it' },
    
    // 12 letters: Apouchpotato
    { id: 2000028, filename: 'lazy_kangaroo',         joke_q: 'What do you call a lazy kangaroo?',                                            joke_a: 'A pouch potato' },
    
    // 13 letters: Parentsinajam
    { id: 2000029, filename: 'strawberry_cry',        joke_q: 'Why was the baby strawberry crying?',                                          joke_a: 'Parents in a jam' },
    
    // 9 letters: BugsBunny
    { id: 2000030, filename: 'rabbit_fleas',          joke_q: 'What do you call a rabbit with fleas?',                                        joke_a: 'Bugs Bunny' },
    
    // 11 letters: Anecktarine
    { id: 2000031, filename: 'vampire_fruit',         joke_q: "What is a vampire's favorite fruit?",                                          joke_a: 'A neck-tarine' },
    
    // 9 letters: Shellfish
    { id: 2000032, filename: 'oyster_share',          joke_q: "Why don't oysters share?",                                                     joke_a: 'Shellfish' },
    
    // 9 letters: Holeinone
    { id: 2000033, filename: 'golfer_pants',          joke_q: 'Why did the golfer bring two pairs of pants?',                                 joke_a: 'Hole in one' },
    
    // 9 letters: Ashamrock
    { id: 2000034, filename: 'fake_stone',            joke_q: 'What do you call a fake stone?',                                               joke_a: 'A sham-rock' },
    
    // 8 letters: Sneakers
    { id: 2000035, filename: 'ninja_shoes',           joke_q: 'What kind of shoes do ninjas wear?',                                           joke_a: 'Sneakers' },
    
    // 8 letters: Twotired
    { id: 2000036, filename: 'bicycle_tired',         joke_q: 'Why did the bicycle fall over?',                                               joke_a: 'Two tired' },
    
    // 10 letters: Hillarious
    { id: 2000037, filename: 'funny_mountain',        joke_q: 'What do you call a funny mountain?',                                           joke_a: 'Hill-arious' },
    
    // 8 letters: Nicebelt
    { id: 2000038, filename: 'zero_eight',            joke_q: 'What did the zero say to the eight?',                                          joke_a: 'Nice belt' },
    
    // 11 letters: Wasteoftime
    { id: 2000039, filename: 'belt_watch',            joke_q: 'What do you call a belt with a watch on it?',                                  joke_a: 'Waist of time' },
    
    // 10 letters: Adandylion
    { id: 2000040, filename: 'dressed_lion',          joke_q: 'What do you call a well-dressed lion?',                                        joke_a: 'A dandy-lion' },
    
    // 14 letters: Seethroughthem
    { id: 2000041, filename: 'ghost_liars',           joke_q: 'Why are ghosts bad liars?',                                                    joke_a: 'See through them' },
    
    // 11 letters: Itwasframed
    { id: 2000042, filename: 'picture_jail',          joke_q: 'Why did the picture go to jail?',                                              joke_a: 'It was framed' },
    
    // 12 letters: Garbagetruck
    { id: 2000043, filename: 'wheels_flies',          joke_q: 'What has four wheels and flies?',                                              joke_a: 'Garbage truck' },
    
    // 10 letters: Abaldeagle
    { id: 2000044, filename: 'animal_wig',            joke_q: 'What animal needs to wear a wig?',                                             joke_a: 'A bald eagle' },
    
    // 11 letters: Arocketchip
    { id: 2000045, filename: 'fast_loud',             joke_q: 'What is fast, loud and crunchy?',                                              joke_a: 'A rocket chip' },
    
    // 12 letters: Fightknights
    { id: 2000046, filename: 'dragon_sleep',          joke_q: 'Why do dragons sleep during the day?',                                         joke_a: 'Fight knights' },
    
    // 8 letters: Rootbeer
    { id: 2000047, filename: 'tree_drink',            joke_q: "What is a tree's favorite drink?",                                             joke_a: 'Root beer' },
    
    // 9 letters: Adepresso
    { id: 2000048, filename: 'sad_coffee',            joke_q: 'What do you call a sad cup of coffee?',                                        joke_a: 'A depresso' },
    
    // 8 letters: Yourlegs
    { id: 2000049, filename: 'bottom_top',            joke_q: 'What has a bottom at the top?',                                                joke_a: 'Your legs' },
    
    // 11 letters: Alittlebear
    { id: 2000050, filename: 'shower_animal',         joke_q: 'What animal do you look like in the shower?',                                  joke_a: 'A little bear' },
    
    // 14 letters: Fullofproblems
    { id: 2000051, filename: 'math_worried',          joke_q: 'Why did the math book look worried?',                                          joke_a: 'Full of problems' },
    
    // 8 letters: Barefoot
    { id: 2000052, filename: 'bear_socks',            joke_q: 'What do you call a bear with no socks on?',                                    joke_a: 'Bare-foot' },
    
    // 11 letters: Atennisball
    { id: 2000053, filename: 'serve_eat',             joke_q: 'What can you serve but never eat?',                                            joke_a: 'A tennis ball' },
    
    // 14 letters: Afraidtounwind
    { id: 2000054, filename: 'mummy_vacation',        joke_q: "Why don't mummies take vacations?",                                            joke_a: 'Afraid to unwind' },
    
    // 9 letters: Amushroom (duplicate removed - using different question)
    { id: 2000055, filename: 'room_enter',            joke_q: 'What room can no one enter?',                                                  joke_a: 'A mushroom' },
    
    // 14 letters: Catchupsonsleep
    { id: 2000056, filename: 'run_bed',               joke_q: 'Why did the man run around his bed?',                                          joke_a: 'Catch up on sleep' },
    
    // 8 letters: Arainbow
    { id: 2000057, filename: 'bow_tied',              joke_q: "What bow can't be tied?",                                                      joke_a: 'A rainbow' },
    
    // 9 letters: Apupsicle
    { id: 2000058, filename: 'frozen_dog',            joke_q: 'What do you call a frozen dog?',                                               joke_a: 'A pupsicle' },
    
    // 12 letters: Theyjustarrr
    { id: 2000059, filename: 'pirates_name',          joke_q: 'Why are pirates called pirates?',                                              joke_a: 'They just arrr' },
    
    // 14 letters: Forgotthewords
    { id: 2000060, filename: 'bees_hum',              joke_q: 'Why do bees hum?',                                                             joke_a: 'Forgot the words' },
    
    // 8 letters: Acatfish
    { id: 2000061, filename: 'fish_mouse',            joke_q: 'What kind of fish chases a mouse?',                                            joke_a: 'A catfish' },
    
    // 13 letters: Awoollyjumper
    { id: 2000062, filename: 'sheep_roo',             joke_q: 'What do you get when you cross a sheep and a kangaroo?',                       joke_a: 'A woolly jumper' },
    
    // 11 letters: Helduppants
    { id: 2000063, filename: 'belt_arrest',           joke_q: 'Why was the belt arrested?',                                                   joke_a: 'Held up pants' },
    
    // 14 letters: Achewchewtrain
    { id: 2000064, filename: 'train_toffee',          joke_q: 'What do you call a train loaded with toffee?',                                 joke_a: 'A chew chew train' },
    
    // 10 letters: Anorcastra
    { id: 2000065, filename: 'whale_music',           joke_q: 'What do you call a group of musical whales?',                                  joke_a: 'An orca-stra' },
    
    // 11 letters: Nachocheese
    { id: 2000066, filename: 'not_your_cheese',       joke_q: "What do you call cheese that isn't yours?",                                    joke_a: 'Nacho cheese' },
];
