-- ============================================================
-- 00033 — E12: GLOBAL DATE IDEAS (owner ask 2026-07-26)
-- ============================================================
-- The 00019 library of 350 quietly assumes a car, disposable income and
-- Western infrastructure (kayak rental, balloon festivals, dog parks, fall
-- foliage). This seeds 60 ideas rooted in West/East Africa, Latin America,
-- South & Southeast Asia and MENA — plus ideas that work literally anywhere.
--
-- Rules held throughout: cheap (free or $ almost everywhere), faith-centred
-- or wholesome, never carnal, no alcohol (consistent with the Substances
-- boundary category), and no assumption of a car.
--
-- Deliberately NOT a separate "international" section: these sit in the same
-- pool as everything else. "Sobremesa" and "Last Stop and Back" land as well
-- in Toronto as in Lagos — that's the point.
--
-- Country tags + per-country rankings + the context-note tooltip are a
-- SEPARATE step scheduled after F2 (see PROGRESS Phase 4B). Titles here are
-- written so those tags drop on later without rewriting content.
--
-- Owner applies in Studio. Depends on 00031 (is_virtual).

INSERT INTO public.date_ideas
  (title, description, category, estimated_cost, estimated_duration, location_type, accessibility_tags, season, stage_fit, is_virtual)
VALUES

-- ═══ WEST AFRICA ═══
('Market Run, One Dish', 'Set a small budget, walk the market together, and cook whatever it buys. Haggling counts as teamwork.', 'food', '$', '2-3 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Last Stop and Back', 'Take the local bus to the end of its route, then walk back. Pray quietly for each neighbourhood you pass.', 'adventure', '$', '2-3 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Light-Out Worship', 'When the power cuts, light a candle and sing two hymns you both know by heart. No screens to compete with.', 'spiritual', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Street-Food Stand Crawl', 'Three roadside stands, one shared plate at each. Rank them honestly at the end.', 'food', '$', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Sunday Best Photo Walk', 'After the service, take portraits of each other while you are both still dressed up.', 'creative', 'free', '1 hour', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Carry Someone''s Load', 'Help an older member of your church with market bags, water, or chores. Go together, say little.', 'service', 'free', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Harmattan Morning Walk', 'Out early while the air is still cool and hazy. Two jackets, one flask, no hurry.', 'simple', 'free', '1 hour', 'outdoor', '{no-car-needed}', 'winter', '{dating,engaged,married}', false),
('Jollof Debate Cook-Off', 'Each cook your version, argue your case, then admit the other one was good too.', 'food', '$$', '3-4 hours', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Choir Practice Together', 'Sit in on a midweek choir or worship rehearsal, even if only one of you sings.', 'spiritual', 'free', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Sweep a Neighbour''s Compound', 'Pick a neighbour who would struggle to do it alone. Bring your own brooms, leave before the thanks.', 'service', 'free', '1-2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),

-- ═══ EAST AFRICA ═══
('Ride to the Edge of Town', 'Board whatever goes furthest for the smallest fare. Get out where the buildings stop and walk.', 'adventure', '$', '3-4 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Chai and Chapati Morning', 'The corner place, the early hour, and one honest question each while it is still quiet.', 'food', '$', '1 hour', 'in_town', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Sunrise on the Hill', 'Whatever high ground is nearest. Leave in the dark, arrive for the light, read one psalm.', 'spiritual', 'free', '2-3 hours', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Church Garden Workday', 'Two pairs of hands on the church grounds for a morning. Dirt under the nails, nothing to prove.', 'service', 'free', '3 hours', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),

-- ═══ LATIN AMERICA ═══
('Sobremesa', 'Stay at the table a full hour after the food is gone. No phones, no clearing up. That is the whole date.', 'simple', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Plaza at Dusk', 'The main square as the light goes. Share one snack and quietly pray for three strangers you see.', 'simple', '$', '1-2 hours', 'in_town', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Hymn Exchange', 'Each teach the other a worship song in your own language. Sing both badly, on purpose.', 'spiritual', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('One Flower from the Market', 'Buy each other a single stem. The point is the walk there, not the bouquet.', 'simple', '$', '1 hour', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Rooftop Guitar Worship', 'Any borrowed instrument, any flat roof, three songs as the neighbourhood settles.', 'spiritual', 'free', '1 hour', 'home', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Walk the Waterfront', 'Follow the water as far as it goes and turn back when one of you says so.', 'simple', 'free', '2 hours', 'outdoor', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),

-- ═══ SOUTH ASIA ═══
('Chai Stall Theology', 'Two cups at a roadside stall and one honest question about faith each. Refills allowed.', 'spiritual', '$', '1 hour', 'in_town', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Rooftop Sunset Psalm', 'The terrace, the sun going down, and one psalm read aloud between you.', 'spiritual', 'free', '1 hour', 'home', '{no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Monsoon Doorway Tea', 'Watch the rain from the doorway with hot tea and name what you are grateful for this season.', 'simple', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'summer', '{dating,engaged,married}', false),
('Old Market Wander', 'Walk the oldest part of the market and buy nothing. Look at everything, ask the sellers their stories.', 'adventure', 'free', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Kite Flying Afternoon', 'One cheap kite, one open space, and however long it takes to get it up.', 'adventure', '$', '2 hours', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),

-- ═══ SOUTHEAST ASIA ═══
('Night Market Shared Plate', 'One plate between you at each stall you like. Cheaper, slower, and you taste twice as much.', 'food', '$', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Early Mass, Then Breakfast', 'Go to the earliest service together, then eat somewhere small while the streets are still waking up.', 'spiritual', '$', '2-3 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Beach or Riverbank Clean-Up', 'Two bags, one stretch of shore. Fill them, then sit down and watch what you cleaned.', 'service', 'free', '2-3 hours', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Sari-Sari Store Run', 'Walk to the nearest corner shop at night for one shared snack. The walk is the date.', 'simple', '$', '30 minutes', 'in_town', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),

-- ═══ MIDDLE EAST & NORTH AFRICA ═══
('Mint Tea and a Long Talk', 'Order the tea, put the phones away, and do not leave until the pot is finished.', 'simple', '$', '2 hours', 'in_town', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Rooftop Star Psalm', 'Up on the roof after dark. Read Psalm 19 out loud and then say nothing for a while.', 'spiritual', 'free', '1 hour', 'home', '{no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Bread from the Corner Bakery', 'Walk out for bread while it is still warm and eat some of it on the way home.', 'food', '$', '1 hour', 'in_town', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),

-- ═══ COLDER CLIMATES ═══
('Winter Walk, Warm Hands', 'Out into the cold for twenty minutes, back for something hot. Short, cheap, and it always works.', 'simple', 'free', '1 hour', 'outdoor', '{no-car-needed}', 'winter', '{dating,engaged,married}', false),

-- ═══ WORKS ANYWHERE ═══
('Prayer Walk Around the Block', 'Walk your own street and pray quietly for each house you pass. You will never see it the same way.', 'spiritual', 'free', '30 minutes', 'outdoor', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('One Verse, One Walk', 'Pick a short verse and memorise it together while you walk. Test each other on the way back.', 'spiritual', 'free', '1 hour', 'outdoor', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Bus Window Gratitude', 'Ride anywhere at all and name one thing you are thankful for at every stop.', 'simple', '$', '1 hour', 'in_town', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Cook Your Grandmother''s Dish', 'Call an elder in your family for the recipe, then make it together and tell her how it went.', 'food', '$$', '2-3 hours', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Visit Someone Who Is Alone', 'Ask your church who has not had a visitor lately. Bring food, stay an hour, listen more than you speak.', 'service', '$', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Borrowed Instrument Night', 'Borrow whatever instrument you can find and worship badly together for an hour.', 'spiritual', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Night Sky Psalm', 'Get away from the lights as far as you can walk. Read Psalm 8 and feel appropriately small.', 'spiritual', 'free', '1-2 hours', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Church Clean-Up Together', 'Show up for the working party as a pair. Unglamorous, and the people there will remember it.', 'service', 'free', '3 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Two Chairs, No Phones', 'Put two chairs facing each other, set both phones in another room, and talk until someone gets hungry.', 'simple', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Letters to Your Future Selves', 'Each write a letter to the two of you five years from now. Seal them. Set a date to open them.', 'creative', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Wash the Dishes Slowly', 'One washes, one dries, nobody rushes. The best conversations happen facing the same direction.', 'simple', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Teach Me Your Mother Tongue', 'Ten words each in the language you grew up hearing, including one you cannot translate properly.', 'creative', 'free', '1 hour', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Testimony Night', 'Each tell the story of how you came to faith, properly, from the beginning. No interrupting.', 'spiritual', 'free', '2 hours', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Take the Long Way Home', 'Whatever route you normally take, take a different one together and see what is on it.', 'simple', 'free', '1 hour', 'outdoor', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Up Before the City', 'Set an alarm neither of you wants to set. Watch the sun come up. Go to work like normal people.', 'adventure', 'free', '1 hour', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Share One Plate', 'Order one meal instead of two and split it. Costs half, takes twice as long, feels different.', 'food', '$', '1-2 hours', 'in_town', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('Fix Something Together', 'Find the thing in the house that has been broken for months and fix it. Celebrate disproportionately.', 'at-home', '$', '2 hours', 'home', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Go Back to Where You Met', 'Return to the exact place and retell it to each other. You will remember it differently.', 'simple', 'free', '2 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Ten Neighbours by Name', 'Between you, name ten neighbours and pray for each one. Then find out the names you did not know.', 'spiritual', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('A Psalm at the Bus Stop', 'While you wait for anything at all, read one psalm out loud quietly. Waiting becomes worship.', 'spiritual', 'free', '30 minutes', 'in_town', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Barefoot on the Grass', 'Shoes off, whatever grass you can find, twenty minutes of doing nothing at all.', 'simple', 'free', '30 minutes', 'outdoor', '{mobility-friendly,no-car-needed,low-energy}', 'summer', '{dating,engaged,married}', false),
('Photograph Ordinary Beauty', 'One walk, ten photos each, only of things nobody would normally photograph. Compare at the end.', 'creative', 'free', '1-2 hours', 'outdoor', '{no-car-needed}', 'any', '{dating,engaged,married}', false),
('Give Something Away Together', 'Each pick one thing you own and still like, and give both away this week to someone who needs them.', 'service', 'free', '1-2 hours', 'home', '{mobility-friendly,no-car-needed}', 'any', '{dating,engaged,married}', false),
('The Gratitude Alphabet', 'A to Z, taking turns, one thing you are grateful for per letter. Getting to Q is the fun part.', 'simple', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', true),
('Two Hymns, Lights Off', 'Turn everything off, sit in the dark, and sing two hymns. Nobody is watching and nobody is judging.', 'spiritual', 'free', '30 minutes', 'home', '{mobility-friendly,no-car-needed,low-energy}', 'any', '{dating,engaged,married}', false),
('Ask the Elders', 'Visit a couple who have been married thirty years and ask them what nobody told them. Bring food.', 'spiritual', '$', '2-3 hours', 'in_town', '{no-car-needed}', 'any', '{dating,engaged,married}', false);
