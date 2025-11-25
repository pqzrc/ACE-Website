// Filtre de profanité utilisant leo-profanity
// Support multilingue, leet-speak, variantes
import * as leoProfanity from 'leo-profanity';

// Charger les dictionnaires
leoProfanity.loadDictionary(); // Anglais par défaut
leoProfanity.loadDictionary('fr'); // Français

// Mots réservés système ACE
const ACE_RESERVED_WORDS = [
  'admin', 'administrator', 'root', 'system', 'moderator',
  'mod', 'staff', 'support', 'ace', 'ctf', 'official',
  'sysadmin', 'owner', 'webmaster', 'superuser', 'sudo',
];

// Sous-parties sensibles - DÉSACTIVÉ pour éviter faux positifs (ex: "tigger")
// La modération se fait via l'interface admin CTFd si besoin
// const SENSITIVE_SUBSTRINGS = [
//   'igger', 'nig', 'nigg', 'n1gg', 'n1g',
//   'fag', 'fck', 'fuk', 'fuc',
//   'cunt', 'kunt', 'cnt',
//   'shit', 'sh1t', 'sht',
// ];

// Liste complète de vbw.csv (mots vulgaires/inappropriés multilingues)
// Ajoutée pour une couverture maximale au-delà des dictionnaires de base
const VBW_WORDS = [
  'fick dich', 'fuck', 'jack off', 'kackstelze', 'penis', 'scheiße', 'schlampe', 'schwanz',
  'stück scheiße', 'ahole', 'amcıklar', 'amcıklara', 'amcıklarda', 'amcıklardan', 'amcıkların',
  'amcıkta', 'amcıktan', 'amcığın', 'amı', 'animal fucker', 'anus plug', 'ape shit', 'ape shite',
  'arse gobbler', 'ashole', 'ass bandit', 'ass fecker', 'ass fuck', 'ass fucker', 'ass fucking boiolas',
  'ass fucking nob jokeys', 'ass hole', 'ass kisser', 'ass licking', 'ass muncher', 'ass-fucker',
  'ass-fuckers', 'ass-hat', 'assbanged', 'assbite', 'assblaster', 'assfker', 'asshole fucker',
  'assholz', 'asskisser', 'asslicker', 'assmunch', 'assmuncher', 'asspuppies', 'asswhole',
  'axe wound', 'b*llocks', 'b*lls', 'bagascia', 'baldracca', 'balfasz', 'balfaszokat', 'balfaszt',
  'ballbuster', 'balle', 'balllicker', 'ballsack', 'banger', 'banging', 'bassterd', 'bastard',
  'bastards', 'bastardz', 'basterd', 'basterds', 'basturd', 'bean queen', 'beardedclam', 'beastial',
  'beat my meat', 'beat the meat', 'beat your meat', 'beatch', 'belino', 'bell end', 'bellend',
  'beotch', 'beyoch', 'bich', 'biches', 'bigass', 'bigbastard', 'bigbreasts', 'bigornette', 'bigtits',
  'bimbo', 'bimbos', 'bitch', 'bitchass', 'bitched', 'bitcher', 'bitchers', 'bitches', 'bitchez',
  'bitchfuck', 'bitchhole', 'bitching', 'bitchlike', 'bitchness', 'bitchs', 'bitchslap', 'bitchtit',
  'bitchtits', 'bitchy', 'bitchy ass', 'bitties', 'bl**dy', 'blackcock', 'blacky', 'bloblos', 'bloody',
  'blow a load', 'bluegum', 'bluegums', 'blumpkin', 'blumpkin boy', 'boches', 'bollick', 'bollockchops',
  'bollocks', 'bollok', 'bollox', 'boned', 'boner', 'boners', 'bonk juice', 'bosches', 'branler',
  'bugger', 'bugger off', 'buggered', 'buggery', 'bugren', 'bugri', 'bugru', 'bukake', 'bukszák',
  'bull shit', 'bulldike', 'bulldyke', 'bullshi', 'bullshit', 'bullshite', 'bullshits', 'bullshitted',
  'bullturds', 'bum', 'bum-bandits', 'bumblefuck', 'bumbum', 'bumfuck', 'bumsen', 'bung hole', 'burat',
  'burdelmama', 'butchbabes', 'butchdike', 'butchdyke', 'butt', 'butt fuck', 'butt fucker', 'butt hole',
  'butt pirate', 'butt-fucker', 'butt-fuckers', 'butt-fucking-bandit', 'butt-munchers', 'buttface',
  'buttfuck', 'buttfucka', 'buttfucker', 'buttfuckers', 'butthole', 'butthole boy', 'buttmuch',
  'buttmunch', 'buttmuncher', 'buttplug', 'buttstain', 'buttwipe', 'buzna', 'bylsiä', 'bzitch',
  'bøsserøv', 'c*nts', 'c*nty', 'c0cksucked', 'c0cksucker', 'cameltoe', 'cawk muncher', 'chakke',
  'chcanky', 'chesticle', 'chesticles', 'chupapollas', 'chutia', 'ciota', 'clit', 'clitface', 'clitfuck',
  'clitlickers', 'clito', 'clitoris', 'clits', 'clitty', 'clogwog', 'closet fuckhead', 'cobb knobbler',
  'cock', 'cock droplets', 'cock head', 'cock knocker', 'cock licker', 'cock munch', 'cock smoker',
  'cock snot', 'cock suck', 'cock sucker', 'cock sucking', 'cock sucking boiolas', 'cock sucking nob jokeys',
  'cock-gobbler', 'cock-head', 'cock-sucker', 'cock-suckers', 'cockass', 'cockbite', 'cockblock',
  'cockblocker', 'cockcowboy', 'cockface', 'cockfucker', 'cockgobbler', 'cockhead', 'cockheads', 'cockhed',
  'cockknob', 'cockknocker', 'cockknoker', 'cockless', 'cocklicker', 'cocklover', 'cockmunch', 'cockmuncher',
  'cocknob', 'cocknose', 'cocknugget', 'cockqueen', 'cockshit', 'cockskin', 'cocksmoke', 'cocksmoker',
  'cocksniffer', 'cocksucc', 'cocksuccas', 'cocksucer', 'cocksuck', 'cocksuckas', 'cocksucked', 'cocksucker',
  'cocksuckers', 'cocksucking', 'cocksucking mothafuckers', 'cocksucks', 'cocksukka', 'cocsuck', 'cokmuncher',
  'colhoes', 'corno', 'couillon', 'coño', 'cracker', 'crackpipe', 'crackwhore', 'cramouille', 'creampie',
  'crotch', 'crotch fiddler', 'crotchrot', 'crotchy', 'csöcs', 'csöcsök', 'csöcsöket', 'csöcsöt', 'culattone',
  'culear', 'cunnie', 'cunt', 'cunt ass', 'cunt fart', 'cunt lick', 'cunt licker', 'cunt lips', 'cunteyed',
  'cuntfuck', 'cuntits', 'cuntless', 'cunts', 'cunty', 'cuntz', 'cuunt', 'cuzão', 'cyberfucked', 'd*mbass',
  'd*pshit', 'damm', 'dammit', 'darkass', 'darkey', 'darkeys', 'darkfuck', 'darkie', 'darkies', 'darkshit',
  'darktard', 'darky', 'deepthroat', 'deepthroating', 'degos', 'dick', 'dick breath', 'dick face',
  'dick fucker', 'dick head', 'dick licker', 'dick milker', 'dick nibbler', 'dick smoker', 'dick sucker',
  'dick-gobbler', 'dick-head', 'dickbeater', 'dickdipper', 'dickface', 'dickflipper', 'dickfuck', 'dickhead',
  'dickheads', 'dickhole', 'dickless', 'dicklicker', 'dickmuncher', 'dickpic', 'dickripper', 'dicksipper',
  'dicksucker', 'dickweasel', 'dickweed', 'dickwhipper', 'dike', 'dipshite', 'dirty sanchez', 'ditalino',
  'dog fuck', 'dog fucker', 'dog fucking', 'dog shit', 'dog\'s bollocks', 'dog-fucker', 'dogshit', 'dogshits',
  'dogstyle', 'dolcett', 'donkeypunch', 'donkeyribber', 'doosh', 'dotheads', 'double dick', 'double dicking',
  'double pen', 'douchey', 'dumasses', 'dumb bastard', 'dumb fucker', 'dumbass', 'dumbass fucker',
  'dumbass mofoes', 'dumbass mothafuckers', 'dumbass son-of-a-bitch', 'dumbbitch', 'dumbfuck', 'dumbshit',
  'dune coon', 'dykes', 'eatme', 'emmerdeuse', 'enculer ta mère', 'enculeurs', 'enculé de ta mère',
  'enculé de tes morts', 'face fuck', 'fag asses', 'fag hag', 'fag queen', 'faggitt', 'faggot mothafuckers',
  'faggot nob jokeys', 'faggot nobjockies', 'faggot son-of-a-bitch', 'faggots', 'fagtard', 'fasz', 'faszok',
  'fatasses', 'fck you', 'fcked', 'fckedup', 'fcking', 'fckked', 'fckking', 'fcktard', 'fcuked', 'fcuker',
  'fcukers', 'fcuks', 'felcher', 'fellate', 'feltch', 'feltcher', 'fick', 'ficken', 'fik', 'fikema', 'fiki',
  'fikiĝi', 'fikiĝu', 'fikklaŭno', 'fikota', 'fiku', 'fils de pute', 'fils de ta mère', 'finger fuck',
  'fingerbanged', 'fingerfuck', 'fingerfucked', 'fingerfucker', 'fingerfuckers', 'fingerfucking', 'fingerfucks',
  'finocchio', 'fiotte', 'fisse', 'fistfuckings', 'fitta', 'fitte', 'fiut', 'fker', 'foda', 'foder', 'fondle',
  'fooker', 'fookuh', 'forfikiĝu', 'fottere', 'fottersi', 'foutre', 'foutu', 'foutue', 'fregna', 'frigger',
  'froscio', 'fucca', 'fuccers', 'fuccing', 'fuck', 'fuck arse', 'fuck face', 'fuck faces', 'fuck goblin',
  'fuck head', 'fuck off', 'fuck up', 'fuck you', 'fuck your', 'fuck your mother', 'fucka', 'fuckable',
  'fuckass', 'fuckasses', 'fuckaz', 'fuckbitch', 'fuckboy', 'fuckbrain', 'fuckbubble', 'fuckbucket', 'fuckbuddy',
  'fuckbutt', 'fuckbutter', 'fuckd', 'fucked', 'fucked up', 'fuckedup', 'fuckem', 'fucker off', 'fuckers',
  'fuckface', 'fuckfaces', 'fuckfest', 'fuckfreak', 'fuckfriend', 'fuckhead', 'fuckheaded', 'fuckheads',
  'fuckher', 'fuckhole', 'fuckin', 'fuckina', 'fucking', 'fucking a', 'fucking asshole', 'fucking bastard',
  'fucking hell', 'fucking me', 'fucking retard', 'fucking shit', 'fuckingbitch', 'fuckings', 'fuckit',
  'fuckk', 'fuckknob', 'fuckknuckle', 'fuckless', 'fuckmachine', 'fuckme', 'fuckmeat', 'fuckn', 'fucknuckle',
  'fucknugget', 'fucknut', 'fucknuts', 'fucknutt', 'fucknutz', 'fuckpig', 'fuckr', 'fucks', 'fuckshit',
  'fuckshitface', 'fuckshithead', 'fuckster', 'fucktard', 'fucktards', 'fucktoy', 'fuckup', 'fuckwad',
  'fuckwhistle', 'fuckwhit', 'fuckwhore', 'fuckwit', 'fuckwitt', 'fuckyou', 'fugged', 'fugger', 'fugly',
  'fuken', 'fukin', 'fukked', 'fukken', 'fukkin', 'fukwhit', 'full of shit', 'fuxor', 'fvck you', 'føkk',
  'gaand', 'geil', 'girly bits', 'go fuck yourself', 'go to hell', 'goatse', 'gobshite', 'god dammit',
  'god damn', 'god damn it', 'god damned', 'god damnit', 'god-dam', 'god-damned', 'godam', 'goddamm',
  'goddamn mothafuckers', 'goddamn son of a bitch', 'goddamn son-of-a-bitch', 'godverdomme', 'goldenshower',
  'gotohell', 'grelho', 'greppeldel', 'grogniasse', 'grope', 'groper', 'gstring', 'gueule', 'gówno', 'göt',
  'göte', 'götler', 'götlerde', 'götlerden', 'götleri', 'götlerin', 'götte', 'götten', 'götverende',
  'götverenden', 'götverene', 'götün', 'h*rseh*t', 'hang urself', 'hang yourself', 'hardon', 'harry palms',
  'hebe', 'hebes', 'heebs', 'herpy', 'higgers', 'hiscock', 'holy fuck', 'homo asses', 'honkers', 'honky',
  'hori', 'horis', 'horndawg', 'horndog', 'horney', 'horny', 'humped', 'humpher', 'humpin', 'hure', 'indon',
  'ingoio', 'insest', 'jackhole', 'jebany', 'jebat', 'jebać', 'jerked', 'jiggers', 'jism', 'jiss', 'jizjuice',
  'jizz licker', 'jizzd', 'jizzum', 'jugg', 'juggs', 'jugs', 'jävlar', 'jævla', 'jævlig', 'kacaps', 'kaltak',
  'kaltaklar', 'kaltaklardan', 'kaltakları', 'kaltakların', 'kaltakta', 'kaltaktan', 'kaltağa', 'kaltağın',
  'kanake', 'kibaszott', 'kid diddler', 'kikes', 'kitty puncher', 'kloten', 'kn*b', 'kn*bhead', 'kneegrows',
  'knob', 'knob eater', 'knob gobbler', 'knob-face', 'knob-gobbler', 'knob-head', 'knobd', 'knobe', 'knobead',
  'knobeads', 'knobed', 'knobeds', 'knobend', 'knobender', 'knobends', 'knobendy', 'knober', 'knobes',
  'knobgobbler', 'knobhead', 'knobheads', 'knobjockies', 'knobjokey', 'knobjokeys', 'knobs', 'knockers',
  'knor', 'knt', 'knulla', 'knulle', 'kokot', 'kokotina', 'koňomrd', 'kraut', 'krauts', 'kuker', 'kuksås',
  'kulli', 'kumbullbe', 'kurvák', 'kurvákat', 'kurvát', 'kushi', 'kushis', 'kusipää', 'kwif', 'kyke', 'kykes',
  'kyopo', 'kyrpa', 'kyrpiintynyt', 'kyrpiintyä', 'kyrpiä', 'kyrpä', 'kyrpänaama', 'kúr', 'ladyboy', 'ladyboys',
  'ladyboyz', 'lardass', 'licker', 'licking', 'lickme', 'lilniglet', 'limp dick', 'limpdick', 'limy', 'lipshits',
  'lipshitz', 'loda', 'lodu', 'loin', 'loins', 'lovebone', 'lovegoo', 'lovegun', 'lovejuice', 'm*therf*cker',
  'm*therf*cking', 'maal', 'macizorra', 'makemecome', 'manpaste', 'martillo', 'massterbait', 'maumau',
  'me cago en dios', 'me cago en dios y en la puta mar', 'me cago en dios y en la puta virgen',
  'me cago en la hostia', 'me cago en la hostia puta', 'me cago en la hostia puta virgen',
  'me cago en la leche', 'me cago en la leche de tu puta madre', 'me cago en la leche merengada',
  'me cago en la leche que mamaste', 'me cago en la madre que te parió', 'me cago en la mar',
  'me cago en la puta', 'me cago en la puta hostia', 'me cago en la puta hostia mar', 'me cago en la puta leche',
  'me cago en la puta madre', 'me cago en la puta madre que te parió', 'me cago en la puta mar',
  'me cago en la puta mar salada', 'me cago en la puta vida', 'me cago en la virgen', 'me cago en todo',
  'me cago en tu madre', 'me cago en tu puta madre', 'me cago en tu puta madre en vinagre', 'me cago en tus muertos',
  'meat curtains', 'meat-sword', 'mega fag', 'merd', 'merda', 'merda na cara', 'merde', 'merdeuse', 'merdeux',
  'merdoso', 'minchia', 'minchione', 'mockey', 'mockie', 'mocky', 'molest', 'mona', 'moolie', 'morgenlatte',
  'mothafuck', 'mothafucked', 'mothafucker', 'mothafuckers', 'mothafuckin\'', 'mothafucking', 'mothafucks',
  'motherfuckings', 'mothrfucker', 'mrhands', 'munt', 'möpse', 'möse', 'nad', 'nads', 'narttu', 'nastybitch',
  'nastyho', 'negres', 'negress', 'negro', 'negroes', 'negros', 'nekru', 'neuken', 'nigers', 'nigette', 'nigg',
  'nigga lover', 'niggah', 'niggarded', 'niggas', 'nigger', 'nigger lover', 'niggerhole', 'niggers', 'niggerz',
  'niggir', 'niggor', 'nigguh', 'nigguhs', 'nigguhz', 'niglet', 'nignog', 'nigra', 'nigras', 'niiger', 'niigr',
  'nipple', 'nique ta mère', 'nuckas', 'nutte', 'oetlul', 'opzouten', 'orifiss', 'orina', 'orospu', 'orospuda',
  'orospuların', 'orospunun', 'orospuya', 'orospuyu', 'oslošoust', 'otpizdit', 'otsosi', 'oven dodger', 'padlo',
  'paki', 'pakie', 'pakis', 'pakkis', 'paky', 'palucher', 'paneskella', 'patacca', 'pataka', 'patonza', 'payo',
  'pearlnecklace', 'pedik', 'pedos', 'pedoz', 'peehole', 'peen', 'peenus', 'peepee', 'pelotudo', 'penis',
  'penisbanger', 'penus', 'perkele', 'perra', 'persaukinen', 'perse', 'persereikä', 'perseääliö', 'persläpi',
  'pezón', 'phucchead', 'phuck', 'phucked', 'phucker', 'phuckin', 'phucking', 'phuckings', 'phucks', 'phukhead',
  'phukk', 'phukked', 'phukkeds', 'phukker', 'phukshit', 'picka', 'pickaninnies', 'picsa', 'picsát', 'pieprzyć',
  'pig fucker', 'pillow biter', 'pillow-biter', 'pillu', 'pillut', 'pimp', 'pimped', 'pimpern', 'pimpis',
  'pimpjuic', 'pimpjuice', 'pinnolone', 'pippa', 'pises', 'pisin', 'piss face', 'piss off fuckhead', 'piss shit',
  'pisses', 'pissflaps', 'pizdet', 'pizdets', 'piĉen', 'piĉo', 'piča', 'pole licker', 'poot', 'porch monkey',
  'porra', 'prick-gobbler', 'pudd', 'pull the pud', 'punanny', 'punta', 'puppami', 'puss', 'pussy fucker',
  'pussy lick', 'pussy licker', 'pussy licking', 'pusy', 'puta que pariu', 'putain de merde', 'pute', 'puto',
  'puttana', 'puussy', 'pédé', 'pétasse', 'pöcs', 'pöcsök', 'pöcsöket', 'pöcsöt', 'queers', 'randi', 'raped',
  'raspeezdeyi', 'raspizdatyi', 'recchione', 'redskin', 'redskins', 'retardz', 'reva', 'rosebuds', 'rothoer',
  'rtard', 'rtards', 'rukken', 'runkku', 'rustytrombone', 'rättipää', 'ræva', 'ræven', 'rövknulla', 'røv',
  'røvhul', 'røvspræke', 's*n of a b*tch', 's*n of a wh*re', 's/h/i/t', 'schlampe', 'schnackeln', 'schvartse',
  'schvartsen', 'schwanzlutscher', 'screwed', 'screwyou', 'scrud', 'scumfuck', 'se foder', 'sega', 'semen',
  'sexwhore', 'sh*tfaced', 'sh*thead', 'sh*theel', 'sh*tter', 'sh*tty', 'shagger', 'shaggin', 'shagging',
  'shavedpussy', 'she-male', 'sheeeet', 'sheeney', 'shemale', 'shemales', 'shhit', 'shi+', 'shi+e', 'shi+y',
  'shit', 'shit face', 'shit for brains', 'shit fuck', 'shit fucker', 'shit head', 'shit licker', 'shit-fucker',
  'shit-stuffers', 'shitbird', 'shitcanned', 'shitcock', 'shited', 'shitedick', 'shitefulls', 'shites', 'shitface',
  'shitfaced', 'shitfacefuck', 'shitfck', 'shitfuckhead', 'shitfull', 'shithappens', 'shits', 'shitsdick',
  'shitsful', 'shitspitter', 'shitstain', 'shitt', 'shitte', 'shitter', 'shitterfucker', 'shitters', 'shitty',
  'shitty mofoes', 'shittydick', 'shittydicks', 'shittyfuckface', 'shittyful', 'shity', 'shiz', 'shiznit',
  'shmale', 'shortfuck', 'shrimping', 'shut the fuck up', 'shyt', 'siklerde', 'sikmek', 'sixtynine', 'skankbitch',
  'skankybitch', 'skinflute', 'skullfuck', 'skum', 'skwa', 'skwe', 'sl*tty', 'slanty', 'slapper', 'slet',
  'sletterig', 'slit', 'smutty', 'snatch licker', 'snatchpatch', 'snedfitta', 'snefitta', 'son o bitch',
  'son of a bitch', 'son of a whore', 'son-of-a-bitch', 'sonna bitch', 'sons of b1tches', 'sons of bitches',
  'sons-of-bitches', 'sonz of bitchez', 'soplapollas', 'spade', 'spades', 'spearchucker', 'spearchuckers',
  'spicks', 'spicshit', 'spigotty', 'splittail', 'spompinare', 'spooge', 'sraczka', 'srát', 'stiffy', 'stronza',
  'stronzo', 'stupid fucker', 'stupid hoe', 'stupidasses', 'stupidfuck', 'stupidfucker', 'ståpikk', 'ståpikker',
  'suck my cock', 'suck my d', 'suck my dick', 'suck off', 'suckass', 'suckme', 'sum of a bitch', 'sumbitch',
  'szajhák', 'szajhákat', 'szajhát', 'szar', 'szarabb', 'szarik', 'szarok', 'szarokat', 't*tty', 'tarado',
  'tard asses', 'tart', 'tastemy', 'tatte', 'taşakların', 'terd', 'teringlijer', 'terrone', 'tette', 'thicklip',
  'thicklips', 'throat yogurt', 'throater', 'throating', 'thundercunt', 'tickle the pickle', 'tit', 'titfuck',
  'titfuckin', 'titi', 'titt', 'tittchen', 'tittie', 'titties', 'tittis', 'titty', 'tittys', 'tity', 'tongethruster',
  'tongueina', 'tonto del culo', 'topa', 'tosser', 'towelhead', 'towelheads', 'towelshithead', 'trannie', 'trombare',
  'trottoirteef', 'trou du cul', 'trouser snake', 'trousersnake', 'tuckahoe', 'turd', 'turdcutter', 'turlute',
  'tussu', 'tussukka', 'tussut', 'twatface', 'twatlips', 'twats', 'twatzilla', 'twobitwhore', 'twunt', 'twunter',
  'tête de nœud', 'ublyudok', 'ussys', 'va te faire foutre', 'vai à merda', 'verga', 'verneuken', 'vittuilla',
  'vittuilu', 'vittumainen', 'vittuuntunut', 'vitun', 'vitusti', 'vituttaa', 'vitutus', 'vleesroos', 'vpizdu',
  'vullva', 'vögeln', 'we1back', 'weiner', 'wet back', 'what the fuck', 'whitenigger', 'whitetrash', 'whitey',
  'whiteys', 'whoars', 'whoralicious', 'whore', 'whored', 'whorefucker', 'whores', 'whoring', 'wigger', 'wiggers',
  'wnker', 'yellowshowers', 'yid', 'yourboobs', 'yourpenis', 'yourtits', 'zigounette', 'zipperhead', 'zipperheads',
  'sexe', 'sex', 'rape', 'hitler', 'nazi', 'retard', 'faggot', 'nigger', 'autist', 'terrorist', 'pedophile',
];

// Ajouter toutes les listes au dictionnaire leo-profanity
leoProfanity.add(ACE_RESERVED_WORDS);
leoProfanity.add(VBW_WORDS);

// Export pour compatibilité avec le frontend
export const FORBIDDEN_WORDS = [...ACE_RESERVED_WORDS, ...VBW_WORDS];

/**
 * Normalise un texte pour détecter les contournements (leet speak, accents, caractères spéciaux)
 */
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retire les accents
    // Convertit le leet speak en lettres normales
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/6/g, 'g')
    .replace(/7/g, 't')
    .replace(/8/g, 'b')
    .replace(/9/g, 'g')
    // Substitutions de lettres courantes
    .replace(/v/g, 'u') // fvck → fuck
    .replace(/ph/g, 'f') // phuck → fuck
    .replace(/kk/g, 'ck') // fukk → fuck
    .replace(/xx/g, 'ck') // fuxx → fuck
    .replace(/\$/g, 's') // sh$t → shit
    .replace(/@/g, 'a') // f@ck → fuck
    // Retire les caractères spéciaux souvent utilisés pour contourner les filtres
    .replace(/[#%^&*()_+=\-\[\]{};':"\\|,.<>/?~`!]/g, '')
    .replace(/\s+/g, ''); // Retire les espaces
};

/**
 * Vérifie si un username contient des mots inappropriés
 * Utilise leo-profanity avec support leet-speak et multilingue
 * Filtre modéré: bloque les mots complets mais pas les sous-parties (évite faux positifs)
 * @param username - Le username à vérifier
 * @returns true si le username est valide, false sinon
 */
export const isUsernameAppropriate = (username: string): boolean => {
  // 1. Vérifier l'original avec leo-profanity
  if (leoProfanity.check(username)) {
    return false;
  }

  // 2. Normaliser le username pour détecter les contournements leet-speak + substitutions
  const normalized = normalize(username);
  if (leoProfanity.check(normalized)) {
    return false;
  }

  // 3. Triple vérification: retire complètement les chiffres (pour NI56GGER → NIGGER)
  const withoutNumbers = username.toLowerCase().replace(/[0-9]/g, '');
  if (withoutNumbers && leoProfanity.check(withoutNumbers)) {
    return false;
  }

  return true;
};

/**
 * Retourne le message d'erreur approprié si le username est invalide
 */
export const getUsernameValidationError = (username: string): string | null => {
  if (!isUsernameAppropriate(username)) {
    return 'Ce nom d\'utilisateur contient des mots interdits';
  }
  return null;
};
