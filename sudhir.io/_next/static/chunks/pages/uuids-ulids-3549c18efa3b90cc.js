(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[940],{3905:function(e,t,a){"use strict";a.d(t,{kt:function(){return m}});var n=a(7294);function s(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function o(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){s(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function r(e,t){if(null==e)return{};var a,n,s=function(e,t){if(null==e)return{};var a,n,s={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(s[a]=e[a]);return s}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(s[a]=e[a])}return s}var l=n.createContext({}),h=function(e){var t=n.useContext(l),a=t;return e&&(a="function"===typeof e?e(t):o(o({},t),e)),a},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},c=n.forwardRef((function(e,t){var a=e.components,s=e.mdxType,i=e.originalType,l=e.parentName,c=r(e,["components","mdxType","originalType","parentName"]),m=h(a),p=s,d=m["".concat(l,".").concat(p)]||m[p]||u[p]||i;return a?n.createElement(d,o(o({ref:t},c),{},{components:a})):n.createElement(d,o({ref:t},c))}));function m(e,t){var a=arguments,s=t&&t.mdxType;if("string"===typeof e||s){var i=a.length,o=new Array(i);o[0]=c;var r={};for(var l in t)hasOwnProperty.call(t,l)&&(r[l]=t[l]);r.originalType=e,r.mdxType="string"===typeof e?e:s,o[1]=r;for(var h=2;h<i;h++)o[h]=a[h];return n.createElement.apply(null,o)}return n.createElement.apply(null,a)}c.displayName="MDXCreateElement"},3522:function(e,t,a){(window.__NEXT_P=window.__NEXT_P||[]).push(["/uuids-ulids",function(){return a(9852)}])},9852:function(e,t,a){"use strict";a.r(t),a.d(t,{default:function(){return r}});a(7294);var n=a(3905),s=a(9008);function i(e,t){if(null==e)return{};var a,n,s=function(e,t){if(null==e)return{};var a,n,s={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(s[a]=e[a]);return s}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(s[a]=e[a])}return s}var o={};function r(e){var t=e.components,a=i(e,["components"]);return(0,n.kt)("wrapper",Object.assign({},o,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)(s.default,{mdxType:"Head"},(0,n.kt)("title",null,"Understanding UUIDs, ULIDs and String Representations"),(0,n.kt)("meta",{name:"description",content:"What UUIDs and ULIDs are under the hood, and how to encode and use them."})),(0,n.kt)("h1",null,"Understanding UUIDs, ULIDs and String Representations"),(0,n.kt)("p",{className:"lead"},"What UUIDs and ULIDs are under the hood, and how to encode and use them."),(0,n.kt)("p",null,"Database and data storage systems need identifiers for each piece of information they store. Using numbers as identifiers is a one way to do it, but that has limitations \u2014 and we have alternatives in the form of UUIDs and ULIDs."),(0,n.kt)("h2",null,"Numbers"),(0,n.kt)("p",null,"The easiest and most intuitive way to generate IDs is to use numbers. They're small, efficient and simple. In SQL databases like PostgreSQL, MySQL, SQL Server or Oracle, the numeric primary key is normally called ",(0,n.kt)("inlineCode",{parentName:"p"},"SERIAL")," with an explicit or implicit size. The common sizes are 4 bytes, which corresponds to a 32 digit (or ",(0,n.kt)("em",{parentName:"p"},"32 bit"),") binary number, capable of representing numbers from 0 to 2,147,483,647; and a bigger version (",(0,n.kt)("inlineCode",{parentName:"p"},"BIGSERIAL"),") at 8 bytes, or 64 bits, which can go from 0 to 9,223,372,036,854,775,807."),(0,n.kt)("p",null,"That's the first problem right there. When using a numeric primary key, you need to be sure the size of key you're using is big enough. 2,147,483,647 looks like a big number, but in the context of modern web applications it's not that large. An application that serves a few hundred thousand people can quickly blow through that number, especially if it's being used to identify individual items, changes, or events."),(0,n.kt)("p",null,"Using 8 bytes gives you more headroom to grow \u2014 9,223,372,036,854,775,807 of anything is pretty hard to hit. Most frameworks will / should set this as the primary key default when creating databases for you, but it always helps to double-check. I've experienced and heard of many times where tables have run out of 32-bit space and engineers had to run upgrades and migrations at the worst possible time. "),(0,n.kt)("p",null,"How does a numeric ID work, though? And what are its limitations? The first thing to remember is that if a number is being used as an identifier it needs to be unique \u2014 which means some entity needs to keep track of which numbers have already been used and make sure they're never used again. In most database systems, this is done via the use of a ",(0,n.kt)("em",{parentName:"p"},"sequence")," object. When adding a new piece of data, this sequence object is asked for a new number \u2014 it checks its storage to get last number it gave out, increments it, durably updates the new number in storage, and then gives it out. The most common type of sequence is a ",(0,n.kt)("em",{parentName:"p"},"monotonically increasing")," sequence, which means that each time you ask the ",(0,n.kt)("em",{parentName:"p"},"sequence")," object for a number it'll give you the previous number it gave out plus one."),(0,n.kt)("p",null,"You might have noticed that when you asked for a number the sequence object stored the number first and then gave it out to you. Why would it do that? Why not give you the number and then store it? This is an important distinction \u2014 if the sequence didn't store the number first before giving it out to you, and it crashed before storing that number, it would give the same number out again the next time someone asked for one. This is a catastrophic failure \u2014 multiple consumers will have received the same number out of a sequence whose main job is to make sure no two consumers get the same number. This means that the sequence implementation must err on the side of caution \u2014 it must update the number first ",(0,n.kt)("em",{parentName:"p"},"before")," it gives it out to you."),(0,n.kt)("p",null,"But there's a downside to this approach \u2014 what if ",(0,n.kt)("em",{parentName:"p"},"you")," crash ",(0,n.kt)("em",{parentName:"p"},"before")," using the number that you got out of the sequence generator? When you restart and try your work again, you'll get a new number, incremented even if no other consumer is using this sequence. That number that you first pulled out and didn't use is lost forever. This is a common error with sequences \u2014 you can never assume that the highest number you see as an ID is implicitly the count of the number of items or rows. This ",(0,n.kt)("em",{parentName:"p"},"may")," the case if nothing has ever gone wrong during the lifetime of the system, but that's pretty unlikely."),(0,n.kt)("p",null,"Numeric sequences also have the disadvantage of being a separate entity from the datasets that they're being used in, making them ",(0,n.kt)("em",{parentName:"p"},"implicitly coupled"),". You can copy a table over to a new database and forget to copy over the sequence generator object and its state, setting yourself up for an unexpected blowup. You might make the mistake of resetting the sequence generator to a number that's already been used (usually back to zero). Or your database backup/restore script might make the same mistakes. When you have coupling like this, there's a lot that can go wrong."),(0,n.kt)("p",null,"Then there's ",(0,n.kt)("em",{parentName:"p"},"scalability")," \u2014 this is something you don't often need, but if and when you do need it it's always too late for simple fixes. Having a single place where identifiers are generated means that you can add data only as fast as your sequence generator can reliably generate IDs. If you suddenly have a million people who want to buy things on your store, you can't ask them to wait because your sequence generator can't number their order line items fast enough. And because a sequence must store each number to disk before giving it out, your entire system is bottle-necked by the speed of rewriting a number on one SSD or hard disk \u2014\xa0no matter how many servers you have."),(0,n.kt)("p",null,"On a scaling-related note, numeric IDs limit your sharding options \u2014 if you're trying to split your workloads across multiple databases, you'll need to be careful to make sure that sequences can't overlap. You might make one shard's sequence run in even numbers, and another one run in odd numbers, for example; or more complex schemes when you have more shards."),(0,n.kt)("p",null,"So numeric IDs are simple and work great in many situations, but remember that they're separate objects from the data you're storing but still always need to managed in tandem with your data; choosing a small size is likely to cause a crash when you least expect it; they look like counters but they're not; and they'll limit how fast you can add new data by their nature."),(0,n.kt)("h2",null,"UUIDs"),(0,n.kt)("p",null,"With the rise of distributed systems it became more and more important to have identifiers that could be created on multiple computers simultaneously, without forcing them to communicate with each other. This is necessary either because the systems are geographically independent, like databases that take orders in different countries and then merge them for global sales reporting, or because the rate of identifier creation required was greater than what could be supported by one sequence generator."),(0,n.kt)("p",null,"The most common type of UUID or GUID in use today is a 128-bit (16-byte) number, generated at random. This means that under the ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://tools.ietf.org/html/rfc4122"}),"RFC 4122")," specification, where 122 bits are generated randomly, it can represent a number up to to ",(0,n.kt)("inlineCode",{parentName:"p"},"5.3\xd710^36"),". That's a lot of zeroes, and makes for a very large number \u2014 so large we consider it practically unreachable under any single application, or even the combination of all human applications. The new internet protocol address format, IPv6, is also essentially a 128 bit number given as a unique address to every possible internet connected object."),(0,n.kt)("p",null,"Most database systems support UUIDs, and do so efficiently. The human readable standard representation of a UUID looks like ",(0,n.kt)("inlineCode",{parentName:"p"},"xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx")," with ",(0,n.kt)("inlineCode",{parentName:"p"},"x")," being the hexadecimal representation of a random byte and ",(0,n.kt)("inlineCode",{parentName:"p"},"M")," and ",(0,n.kt)("inlineCode",{parentName:"p"},"N")," representing version information. This looks like a long string, but most databases will internally support an efficient  binary UUID type that maps onto a 16-byte array. It's also possible to use all the bits for randomness, if you don't care about conformance to the specification."),(0,n.kt)("p",null,"This entire idea of using random IDs assumes that your computers can generate random numbers that are random and unpredictable \u2014 this isn't an easy problem, and there's a lot of research being done in the field. The ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://www.cloudflare.com/en-in/learning/ssl/lava-lamp-encryption/"}),"Cloudflare lava lamp project")," is an interesting look into how to tap into a real-world source of randomness. Studies into the nature of random number generators in modern computers and operating systems is its own topic, and for now we'll just assume that all our systems are using state-of-the-art cryptographic random number generators."),(0,n.kt)("p",null,"Using UUIDs then allows us to rise above some of the problems we saw with numeric IDs. Since there's no single authority or sequence generator in charge of a particular identifier, it becomes possible to generate identifiers for anything at a practically unlimited rate. There's also no problems with generating identifiers at multiple places simultaneously \u2014 there's no need for them to coordinate, so if you need more identifier generation capacity you can just add more hardware to handle the problem. Because these identifiers are independent, it's also possible to merge them into a single dataset later (asynchronously) without reasonably expecting any problems."),(0,n.kt)("p",null,"That last sentence might have raised your eyebrows, though. What does \u201cwithout reasonably expecting any problems\u201d mean?. The issue with random IDs that it is remotely possible that the same ID may be generated more than once, even by the same system. If you're using a single system it may be possible to check the data and reject a duplicate ID, but if you're using multiple systems this won't be possible. The chances of this happening are extremely remote, though \u2014 similar to your chances of winning the lottery multiple times and immediately being struck by lightning each time \u2014 but they're not strictly zero. There's a ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://en.wikipedia.org/wiki/Universally_unique_identifier#Collisions"}),"mathematical treatment on the Wikipedia page"),", but the basic premise is that the more IDs you generate they more your probability of a duplicate ID, or a ",(0,n.kt)("em",{parentName:"p"},"collision"),", increases. This probability is actually more than just the naive assumption that it's ",(0,n.kt)("inlineCode",{parentName:"p"},"1 / TOTAL_POSSIBLE_IDS")," because of an interesting concept called the ",(0,n.kt)("em",{parentName:"p"},"birthday paradox"),". The probability that a your birthday is the same as mine is ",(0,n.kt)("inlineCode",{parentName:"p"},"1/365"),", but in a room of 30 people the probability that ",(0,n.kt)("em",{parentName:"p"},"any")," two people have the same birthday ",(0,n.kt)("em",{parentName:"p"},"isn't")," ",(0,n.kt)("inlineCode",{parentName:"p"},"1/365"),", because the universe now has many more chances to get a match. The same things applies with UUIDs, because each UUID you generate has the chance to collide with every UUID ever generated in the history of your dataset. In practice, though, this isn't a problem. Most applications will ignore the these odds, and some may have a contingency in place to handle a collision, but will almost never actually experience one. "),(0,n.kt)("p",null,"The bigger problem with UUIDs is they have no concept of ",(0,n.kt)("em",{parentName:"p"},"locality"),". With numeric IDs, we could examine the ID and reasonably assume that higher numbers were generated later than lower ones, and the highest ID is the last one generated. This also helps optimize indexes in some databases \u2014 additions are made only on one side of the index tree, so it's possible to optimize for that use case. In a completely random UUID system, though, IDs are being inserted with no concept of location at all. Any ID has an equal chance of being inserted anywhere in the spectrum of possibilities. This means that indexes become wasteful \u2014 they're usually made to order items neatly, but if you put UUIDs in them you're wasting any ordering capability, and mostly causing extra bloat and book-keeping that won't be used. Alternate ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://www.postgresql.org/docs/current/hash-intro.html"}),"indexes based on hashing")," are excellent for UUIDs, though, but they're not as popular or optimized because they only offer fast lookup and no sorting."),(0,n.kt)("h2",null,"ULIDs To The Rescue"),(0,n.kt)("p",null,"So given the two major problems of UUIDs, which are 1) collision possibilities across the history of all generated IDs, and 2) complete loss of locality, can we do better? Yes, we can!"),(0,n.kt)("p",null,"Instead of using all the 128 bits for randomness, what if we use the first 48 bits for a timestamp? 48 bits is enough to represent a millisecond-precision Unix timestamp (the number of milliseconds since an ",(0,n.kt)("em",{parentName:"p"},"epoch")," at the beginning of Jan 1, 1970) till the year 10889 AD. Given the way we're going, humanity in its present form isn't likely to exist them, so when this becomes an issue it'll be somebody else's problem. More likely ",(0,n.kt)("em",{parentName:"p"},"something")," else's problem."),(0,n.kt)("p",null,"The remaining 80 bits are available for randomness, which means they still represent a pretty large number: ~1,208,925,820,000,000,000,000,000. You get to generate this many IDs inside a ",(0,n.kt)("em",{parentName:"p"},"single millisecond"),"."),(0,n.kt)("p",null,"At one stroke, this solves both the problems we have. An ID generated at a particular millisecond in the past can never collide with one generated in the future, so we only need to worry about collisions inside the same millisecond \u2014 which is to say the amount of worrying we need to do is a lot closer to zero. It also introduces ",(0,n.kt)("em",{parentName:"p"},"locality")," into the ID, which means that IDs generated later will have higher byte values than those generated earlier. Assuming they're encoded with the proper alphabet, they'll also sort correctly. We'll come back to encoding later."),(0,n.kt)("p",null,"This time-based ULID system continues to give us all the advantages of a UUID system\u2014it can be distributed, because there's no single sequence authority, the IDs can be merged into a single dataset later, and there's an even lower chance of global collision, because collisions are only possible inside the same millisecond. And because they sort based on time, we can use them in append-only settings, where we can keep adding them to our dataset without having to re-balance indexes. The ULID format also allows continuous archiving of our data \u2014 because we know we're not going to receive any more data with identifiers lower than those representing a particular time, we can just archive all data in permanent storage each hour or day or week if we wanted to. It would still be possible to quickly find the data we need based on the timestamp prefix."),(0,n.kt)("h2",null,"Words Matter"),(0,n.kt)("p",null,"Speaking of prefixes, the way we represent our IDs makes a big difference. SQL database systems will usually have an optimized 16-byte representation internally, but most No-SQL systems work on strings. Strings also come into play when sending the IDs over JSON, XML or any other format over the wire. Let's look at a few common encoding options:"),(0,n.kt)("p",null,"To start with, we're working with a 128 bit binary number that looks like this:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"11111111011110001010111001101011011100010111011001000110111010011000000111000110010010111110111001100000101110101000000110111011\n")),(0,n.kt)("p",null,"Encodings work with bytes instead of bits, so let's see what our ID looks like when split into 8-bit chunks, or bytes:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"[11111111, 01111000, 10101110, 01101011, 01110001, 01110110, 01000110, 11101001, 10000001, 11000110, 01001011, 11101110, 01100000, 10111010, 10000001, 10111011]\n")),(0,n.kt)("p",null,"In decimal, or ",(0,n.kt)("inlineCode",{parentName:"p"},"base10"),", this is really just a sequence of numbers between 0 and 255:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"[255, 120, 174, 107, 113, 118, 70, 233, 129, 198, 75, 238, 96, 186, 129, 187]\n")),(0,n.kt)("p",null,"The UUID spec uses hexadecimal characters to represent IDs. Each hexadecimal character represents 4 bits, so it can represent the binary number 0000 (decimal 0) to 1111 (decimal 16). Since we're dealing with a byte, we'll need two hexadecimal characters for each byte in the sequence:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),'["ff", "78", "ae", "6b", "71", "76", "46", "e9", "81", "c6", "4b", "ee", "60", "ba", "81", "bb"]\n')),(0,n.kt)("p",null,"If we smash them all together we get ",(0,n.kt)("inlineCode",{parentName:"p"},"ff78ae6b717646e981c64bee60ba81bb"),", and if we insert hyphens according to the ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://tools.ietf.org/html/rfc4122"}),"RFC 4122 spec")," we get:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"ff78ae6b-7176-46e9-81c6-4bee60ba81bb\n")),(0,n.kt)("p",null,"But of course this isn't the only way to do it. We had to use two characters for each byte because the hexadecimal alphabet has only 16 characters, which are ",(0,n.kt)("inlineCode",{parentName:"p"},"0123456789abcdef"),". But what if we use more characters? What if we exactly double our available alphabet, to ",(0,n.kt)("inlineCode",{parentName:"p"},"0123456789ABCDEFGHJKMNPQRSTVWXYZ"),"? Then we wind up with a more compact representation:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"7ZF2Q6PWBP8VMR3HJBXSGBN0DV\n")),(0,n.kt)("p",null,"This alphabet, ",(0,n.kt)("inlineCode",{parentName:"p"},"0123456789ABCDEFGHJKMNPQRSTVWXYZ"),", is ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://www.crockford.com/base32.html"}),"Douglas Crockford's Base32"),", chosen for human readability and being able to call it out over a phone if required. You'll see that ambiguous letters like I and L have been omitted because they can be confused with 1 \u2014 along with other considerations."),(0,n.kt)("p",null,"This Base32 is what's used in the ULID format. In a ULID the first 48 bits are the timestamp, so here's what a ULID that I generated looks like:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"01EWW6K6EXQDX5JV0E9CAHPXG5\n")),(0,n.kt)("p",null,"In binary, that's"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"1011101110011100001101001100110011101110110111011011110100101100101101100000011100100101100010101000110110111011000000101\n")),(0,n.kt)("p",null,"or ",(0,n.kt)("inlineCode",{parentName:"p"},"1948255503464693300277367552865957381")," if we're just using decimal."),(0,n.kt)("p",null,"Using the process above, we can always just turn this back into the UUID format:"),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"01773869-99dd-bb7a-596c-0e4b151b7605\n")),(0,n.kt)("p",null,"If you remember, the first 48 bits it a timestamp, and 48 bits is 6 bytes, and since each byte is written with two hexadecimal characters, the first 12 characters are the timestamp component: ",(0,n.kt)("inlineCode",{parentName:"p"},"0177386999dd"),". Convert that to to decimal and you get 1611559180765 \u2014 which is the number of UTC milliseconds between Jan 1, 1970 and the time I generated this ID."),(0,n.kt)("p",null,(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("em",{parentName:"strong"},"All this is to say that UUIDs and ULIDs are really just big numbers. We can write them however we want, making their string representations as small or as big as we want."))),(0,n.kt)("p",null,"We could use ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://en.wikipedia.org/wiki/Base64"}),"base64"),", for instance, and write the ID as ",(0,n.kt)("inlineCode",{parentName:"p"},"AXc4aZndu3pZbAAADksVGw"),". Or we could ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://gist.github.com/snikch/6969879"})),(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://gist.github.com/snikch/6969879"}),"go all in")," on UTF-8 and use a 1,112,064 character alphabet, including emoji and symbols."),(0,n.kt)("p",null,"My personal favourite alphabet is the ",(0,n.kt)("strong",{parentName:"p"},(0,n.kt)("em",{parentName:"strong"},"lexicographic base62")),".: "),(0,n.kt)("pre",null,(0,n.kt)("code",Object.assign({parentName:"pre"},{}),"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\n")),(0,n.kt)("p",null,"This contains every number and every uppercase and lowercase English alphabet, and no symbols. This means it's safe for URLs, and results in fairly short identifiers \u2014 but most importantly, it sorts correctly under ASCII and UTF-8 sorting. This means that you can encode ULIDs with this alphabet, and as long as you make sure all your IDs are the same length (you can left pad to a standard length with a zero), they'll string sort correctly."),(0,n.kt)("p",null,"This is fantastic for NoSQL databases \u2014 your primary identifier can now act as a timestamp and natural sort, allowing you to do time range queries on a UUID primary key."),(0,n.kt)("p",null,"This is one of my pet subjects, so here are a few tools I've built to help work with UUIDs and ULIDs:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://github.com/sudhirj/uulid.go"}),"https://github.com/sudhirj/uulid.go")," \u2014\xa0easily move between UUIDs and ULIDs in Go"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://github.com/sudhirj/shortuuid.rb"}),"https://github.com/sudhirj/shortuuid.rb")," \u2014\xa0UUID encoding into any alphabet for Ruby"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://github.com/sudhirj/shortuuid.go"}),"https://github.com/sudhirj/shortuuid.go")," \u2014\xa0UUID encoding into any alphabet for Go")),(0,n.kt)("h3",null,"References"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://github.com/ulid/spec"}),"https://github.com/ulid/spec")," \u2014\xa0the ULID spec"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"http://www.crockford.com/base32.html"}),"http://www.crockford.com/base32.html")," \u2014\xa0Douglas Crockford's Base32")),(0,n.kt)("h3",null,"Other Formats"),(0,n.kt)("p",null,"I wrote about UUIDs and ULIDs because they're compatible with each other and widely supported, but there some other options if you just need strings: "),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://github.com/segmentio/ksuid"}),"https://github.com/segmentio/ksuid")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake"}),"Twitter's Snowflake")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",Object.assign({parentName:"li"},{href:"https://github.com/ericelliott/cuid"}),"https://github.com/ericelliott/cuid"))),(0,n.kt)("h3",null,"PS"),(0,n.kt)("p",null,"New UUID formats are also being proposed: ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-01"}),"https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format-01")),(0,n.kt)("p",null,"There's a Hacker News discussion here: ",(0,n.kt)("a",Object.assign({parentName:"p"},{href:"https://news.ycombinator.com/item?id=29794186"}),"https://news.ycombinator.com/item?id=29794186")))}r.isMDXComponent=!0},9008:function(e,t,a){e.exports=a(5443)}},function(e){e.O(0,[774,888,179],(function(){return t=3522,e(e.s=t);var t}));var t=e.O();_N_E=t}]);