export type DraftCharacter = {
    id: string;
    name: string;
    anime: string;
    imageUrl?: string;

    stats: {
        leadership: number;
        power: number;
        utility: number;
        speed: number;
        iq: number;
        defense: number;
    };
};

export type DraftPosition =
    | "Captain"
    | "Vice Captain"
    | "Support"
    | "Scout"
    | "Strategist"
    | "Assassin"
    | "Ace"
    | "Vanguard"

export const positionWeights = {
    Captain: {
        leadership: 0.65,
        iq: 0.10,
        power: 0.15,
        utility: 0.05,
        defense: 0.05,
    },

    ViceCaptain: {
        leadership: 0.25,
        power: 0.25,
        iq: 0.20,
        utility: 0.15,
        defense: 0.15,
    },

    Support: {
        utility: 0.50,
        iq: 0.20,
        speed: 0.15,
        defense: 0.15,
    },

    Scout: {
        speed: 0.45,
        iq: 0.25,
        utility: 0.20,
        power: 0.10,
    },

    Strategist: {
        iq: 0.70,
        leadership: 0.15,
        utility: 0.10,
        speed: 0.05,
    },

    Assassin: {
        speed: 0.45,
        power: 0.35,
        iq: 0.10,
        utility: 0.10,
    },

    Ace: {
        power: 0.55,
        speed: 0.20,
        defense: 0.15,
        iq: 0.10,
    },

    Vanguard: {
        defense: 0.5,
        leadership: 0.15,
        power: 0.15,
        utility: 0.1,
        speed: 0.05,
        iq: 0.05,
    }
};

export const draftCharacters: DraftCharacter[] = [
    // Naruto
    {
        id: "naruto-uzumaki",
        name: "Naruto Uzumaki",
        anime: "Naruto",
        imageUrl: "/draft/naruto/naruto.png",
        stats: {
            leadership: 88,
            power: 96,
            utility: 35,
            speed: 85,
            iq: 60,
            defense: 78,
        },
    },
    {
        id: "sasuke-uchiha",
        name: "Sasuke Uchiha",
        anime: "Naruto",
        imageUrl: "/draft/naruto/sasuke.png",
        stats: {
            leadership: 58,
            power: 88,
            utility: 82,
            speed: 92,
            iq: 82,
            defense: 78,
        },
    },
    {
        id: "kakashi-hatake",
        name: "Kakashi Hatake",
        anime: "Naruto",
        imageUrl: "/draft/naruto/kakashi.png",
        stats: {
            leadership: 84,
            power: 84,
            utility: 88,
            speed: 82,
            iq: 91,
            defense: 72,
        },
    },
    {
        id: "itachi-uchiha",
        name: "Itachi Uchiha",
        anime: "Naruto",
        imageUrl: "/draft/naruto/itachi.png",
        stats: {
            leadership: 72,
            power: 91,
            utility: 90,
            speed: 87,
            iq: 98,
            defense: 68,
        },
    },
    {
        id: "minato-namikaze",
        name: "Minato Namikaze",
        anime: "Naruto",
        imageUrl: "/draft/naruto/minato.png",
        stats: {
            leadership: 88,
            power: 90,
            utility: 76,
            speed: 99,
            iq: 87,
            defense: 65,
        },
    },
    {
        id: "jiraiya",
        name: "Jiraiya",
        anime: "Naruto",
        imageUrl: "/draft/naruto/jiraiya.png",
        stats: {
            leadership: 82,
            power: 88,
            utility: 86,
            speed: 68,
            iq: 77,
            defense: 78,
        },
    },
    {
        id: "tsunade",
        name: "Tsunade",
        anime: "Naruto",
        imageUrl: "/draft/naruto/tsunade.png",
        stats: {
            leadership: 86,
            power: 86,
            utility: 92,
            speed: 56,
            iq: 78,
            defense: 91,
        },
    },
    {
        id: "shikamaru-nara",
        name: "Shikamaru Nara",
        anime: "Naruto",
        imageUrl: "/draft/naruto/shikamaru.png",
        stats: {
            leadership: 78,
            power: 42,
            utility: 82,
            speed: 50,
            iq: 99,
            defense: 46,
        },
    },
    {
        id: "gaara",
        name: "Gaara",
        anime: "Naruto",
        imageUrl: "/draft/naruto/gaara.png",
        stats: {
            leadership: 84,
            power: 84,
            utility: 72,
            speed: 50,
            iq: 74,
            defense: 96,
        },
    },
    {
        id: "rock-lee",
        name: "Rock Lee",
        anime: "Naruto",
        imageUrl: "/draft/naruto/rocklee.png",
        stats: {
            leadership: 70,
            power: 82,
            utility: 18,
            speed: 87,
            iq: 42,
            defense: 76,
        },
    },
    {
        id: "neji-hyuga",
        name: "Neji Hyuga",
        anime: "Naruto",
        imageUrl: "/draft/naruto/neji.png",
        stats: {
            leadership: 74,
            power: 78,
            utility: 76,
            speed: 78,
            iq: 82,
            defense: 74,
        },
    },
    {
        id: "might-guy",
        name: "Might Guy",
        anime: "Naruto",
        imageUrl: "/draft/naruto/guy.png",
        stats: {
            leadership: 84,
            power: 88,
            utility: 32,
            speed: 88,
            iq: 56,
            defense: 82,
        },
    },
    {
        id: "obito-uchiha",
        name: "Obito Uchiha",
        anime: "Naruto",
        imageUrl: "/draft/naruto/obito.png",
        stats: {
            leadership: 74,
            power: 88,
            utility: 88,
            speed: 82,
            iq: 84,
            defense: 86,
        },
    },
    {
        id: "madara-uchiha",
        name: "Madara Uchiha",
        anime: "Naruto",
        imageUrl: "/draft/naruto/madara.png",
        stats: {
            leadership: 92,
            power: 96,
            utility: 86,
            speed: 85,
            iq: 92,
            defense: 91,
        },
    },
    {
        id: "pain",
        name: "Pain",
        anime: "Naruto",
        imageUrl: "/draft/naruto/pain.png",
        stats: {
            leadership: 86,
            power: 92,
            utility: 88,
            speed: 72,
            iq: 84,
            defense: 81,
        },
    },
    {
        id: "hinata-hyuga",
        name: "Hinata Hyuga",
        anime: "Naruto",
        imageUrl: "/draft/naruto/hinata.png",
        stats: {
            leadership: 60,
            power: 64,
            utility: 56,
            speed: 61,
            iq: 66,
            defense: 58,
        },
    },
    {
        id: "sakura-haruno",
        name: "Sakura Haruno",
        anime: "Naruto",
        imageUrl: "/draft/naruto/sakura.png",
        stats: {
            leadership: 72,
            power: 82,
            utility: 83,
            speed: 61,
            iq: 78,
            defense: 79,
        },
    },
    {
        id: "killer-bee",
        name: "Killer Bee",
        anime: "Naruto",
        imageUrl: "/draft/naruto/killerbee.png",
        stats: {
            leadership: 62,
            power: 86,
            utility: 66,
            speed: 80,
            iq: 56,
            defense: 78,
        },
    },
    {
        id: "hashirama-senju",
        name: "Hashirama Senju",
        anime: "Naruto",
        imageUrl: "/draft/naruto/hashirama.png",
        stats: {
            leadership: 95,
            power: 91,
            utility: 81,
            speed: 76,
            iq: 82,
            defense: 92,
        },
    },
    {
        id: "tobirama-senju",
        name: "Tobirama Senju",
        anime: "Naruto",
        imageUrl: "/draft/naruto/tobirama.webp",
        stats: {
            leadership: 86,
            power: 88,
            utility: 87,
            speed: 89,
            iq: 92,
            defense: 78,
        },
    },
    // One Piece
    {
        id: "monkey-d-luffy",
        name: "Monkey D. Luffy",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/luffy.avif",
        stats: {
            leadership: 99,
            power: 95,
            utility: 60,
            speed: 88,
            iq: 50,
            defense: 95,
        },
    },
    {
        id: "roronoa-zoro",
        name: "Roronoa Zoro",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/zoro.webp",
        stats: {
            leadership: 75,
            power: 94,
            utility: 25,
            speed: 86,
            iq: 50,
            defense: 90,
        },
    },
    {
        id: "sanji",
        name: "Sanji",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/sanji.avif",
        stats: {
            leadership: 70,
            power: 90,
            utility: 55,
            speed: 95,
            iq: 82,
            defense: 82,
        },
    },
    {
        id: "nami",
        name: "Nami",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/nami.avif",
        stats: {
            leadership: 68,
            power: 38,
            utility: 88,
            speed: 55,
            iq: 90,
            defense: 35,
        },
    },
    {
        id: "usopp",
        name: "Usopp",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/usopp.webp",
        stats: {
            leadership: 60,
            power: 55,
            utility: 90,
            speed: 65,
            iq: 82,
            defense: 50,
        },
    },
    {
        id: "nico-robin",
        name: "Nico Robin",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/robin.avif",
        stats: {
            leadership: 70,
            power: 72,
            utility: 95,
            speed: 65,
            iq: 92,
            defense: 60,
        },
    },
    {
        id: "franky",
        name: "Franky",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/franky.webp",
        stats: {
            leadership: 68,
            power: 82,
            utility: 78,
            speed: 50,
            iq: 78,
            defense: 88,
        },
    },
    {
        id: "brook",
        name: "Brook",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/brook.jpg",
        stats: {
            leadership: 55,
            power: 78,
            utility: 75,
            speed: 88,
            iq: 72,
            defense: 55,
        },
    },
    {
        id: "jinbe",
        name: "Jinbe",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/jinbe.jpeg",
        stats: {
            leadership: 88,
            power: 88,
            utility: 60,
            speed: 65,
            iq: 80,
            defense: 92,
        },
    },
    {
        id: "trafalgar-law",
        name: "Trafalgar Law",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/law.webp",
        stats: {
            leadership: 82,
            power: 90,
            utility: 99,
            speed: 82,
            iq: 92,
            defense: 70,
        },
    },
    {
        id: "eustass-kid",
        name: "Eustass Kid",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/kid.webp",
        stats: {
            leadership: 78,
            power: 90,
            utility: 75,
            speed: 70,
            iq: 68,
            defense: 85,
        },
    },
    {
        id: "portgas-d-ace",
        name: "Portgas D. Ace",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/ace.avif",
        stats: {
            leadership: 72,
            power: 90,
            utility: 65,
            speed: 82,
            iq: 70,
            defense: 72,
        },
    },
    {
        id: "sabo",
        name: "Sabo",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/sabo.png",
        stats: {
            leadership: 88,
            power: 91,
            utility: 72,
            speed: 88,
            iq: 84,
            defense: 78,
        },
    },
    {
        id: "boa-hancock",
        name: "Boa Hancock",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/hancock.webp",
        stats: {
            leadership: 78,
            power: 88,
            utility: 86,
            speed: 82,
            iq: 76,
            defense: 72,
        },
    },
    {
        id: "dracule-mihawk",
        name: "Dracule Mihawk",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/mihawk.jpg",
        stats: {
            leadership: 65,
            power: 97,
            utility: 30,
            speed: 92,
            iq: 85,
            defense: 82,
        },
    },
    {
        id: "shanks",
        name: "Shanks",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/shanks.avif",
        stats: {
            leadership: 99,
            power: 98,
            utility: 70,
            speed: 90,
            iq: 88,
            defense: 85,
        },
    },
    {
        id: "kaido",
        name: "Kaido",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/kaido.avif",
        stats: {
            leadership: 82,
            power: 99,
            utility: 60,
            speed: 78,
            iq: 60,
            defense: 99,
        },
    },
    {
        id: "charlotte-linlin",
        name: "Big Mom",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/bigmom.webp",
        stats: {
            leadership: 88,
            power: 98,
            utility: 78,
            speed: 60,
            iq: 55,
            defense: 98,
        },
    },
    {
        id: "gol-d-roger",
        name: "Gol D. Roger",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/roger.webp",
        stats: {
            leadership: 99,
            power: 99,
            utility: 65,
            speed: 90,
            iq: 85,
            defense: 88,
        },
    },
    {
        id: "edward-newgate",
        name: "Edward Newgate",
        anime: "One Piece",
        imageUrl: "/draft/onepiece/whitebeard.webp",
        stats: {
            leadership: 97,
            power: 99,
            utility: 55,
            speed: 72,
            iq: 78,
            defense: 95,
        },
    },
    // Bleach
    {
        id: "ichigo-kurosaki",
        name: "Ichigo Kurosaki",
        anime: "Bleach",
        imageUrl: "/draft/bleach/ichigo.webp",
        stats: {
            leadership: 82,
            power: 97,
            utility: 70,
            speed: 88,
            iq: 68,
            defense: 90,
        },
    },
    {
        id: "rukia-kuchiki",
        name: "Rukia Kuchiki",
        anime: "Bleach",
        imageUrl: "/draft/bleach/rukia.jpg",
        stats: {
            leadership: 75,
            power: 82,
            utility: 78,
            speed: 75,
            iq: 80,
            defense: 72,
        },
    },
    {
        id: "byakuya-kuchiki",
        name: "Byakuya Kuchiki",
        anime: "Bleach",
        imageUrl: "/draft/bleach/byakuya.avif",
        stats: {
            leadership: 90,
            power: 92,
            utility: 88,
            speed: 92,
            iq: 88,
            defense: 85,
        },
    },
    {
        id: "kenpachi-zaraki",
        name: "Kenpachi Zaraki",
        anime: "Bleach",
        imageUrl: "/draft/bleach/kenpachi.jpg",
        stats: {
            leadership: 65,
            power: 99,
            utility: 15,
            speed: 75,
            iq: 35,
            defense: 98,
        },
    },
    {
        id: "sosuke-aizen",
        name: "Sosuke Aizen",
        anime: "Bleach",
        imageUrl: "/draft/bleach/aizen.avif",
        stats: {
            leadership: 95,
            power: 98,
            utility: 99,
            speed: 92,
            iq: 99,
            defense: 92,
        },
    },
    {
        id: "kisuke-urahara",
        name: "Kisuke Urahara",
        anime: "Bleach",
        imageUrl: "/draft/bleach/kisuke.webp",
        stats: {
            leadership: 88,
            power: 90,
            utility: 98,
            speed: 88,
            iq: 98,
            defense: 82,
        },
    },
    {
        id: "yamamoto",
        name: "Genryusai Yamamoto",
        anime: "Bleach",
        imageUrl: "/draft/bleach/yamamoto.webp",
        stats: {
            leadership: 99,
            power: 99,
            utility: 78,
            speed: 80,
            iq: 88,
            defense: 95,
        },
    },
    {
        id: "toshiro-hitsugaya",
        name: "Toshiro Hitsugaya",
        anime: "Bleach",
        imageUrl: "/draft/bleach/toshiro.png",
        stats: {
            leadership: 88,
            power: 88,
            utility: 85,
            speed: 82,
            iq: 90,
            defense: 78,
        },
    },
    {
        id: "shunsui-kyoraku",
        name: "Shunsui Kyoraku",
        anime: "Bleach",
        imageUrl: "/draft/bleach/shunsui.webp",
        stats: {
            leadership: 96,
            power: 93,
            utility: 88,
            speed: 85,
            iq: 94,
            defense: 82,
        },
    },
    {
        id: "mayuri-kurotsuchi",
        name: "Mayuri Kurotsuchi",
        anime: "Bleach",
        imageUrl: "/draft/bleach/mayuri.jpeg",
        stats: {
            leadership: 70,
            power: 82,
            utility: 99,
            speed: 65,
            iq: 99,
            defense: 72,
        },
    },
    {
        id: "yoruichi-shihoin",
        name: "Yoruichi Shihoin",
        anime: "Bleach",
        imageUrl: "/draft/bleach/yoruichi.webp",
        stats: {
            leadership: 80,
            power: 88,
            utility: 82,
            speed: 99,
            iq: 88,
            defense: 72,
        },
    },
    {
        id: "ulquiorra-cifer",
        name: "Ulquiorra Cifer",
        anime: "Bleach",
        imageUrl: "/draft/bleach/ulquiorra.jpg",
        stats: {
            leadership: 55,
            power: 94,
            utility: 75,
            speed: 88,
            iq: 86,
            defense: 88,
        },
    },
    {
        id: "grimmjow-jaegerjaquez",
        name: "Grimmjow Jaegerjaquez",
        anime: "Bleach",
        imageUrl: "/draft/bleach/grimmjow.jpeg",
        stats: {
            leadership: 45,
            power: 90,
            utility: 45,
            speed: 85,
            iq: 55,
            defense: 82,
        },
    },
    {
        id: "yhwach",
        name: "Yhwach",
        anime: "Bleach",
        imageUrl: "/draft/bleach/yhwach.webp",
        stats: {
            leadership: 98,
            power: 99,
            utility: 99,
            speed: 90,
            iq: 95,
            defense: 95,
        },
    },
    {
        id: "jugram-haschwalth",
        name: "Jugram Haschwalth",
        anime: "Bleach",
        imageUrl: "/draft/bleach/jugram.avif",
        stats: {
            leadership: 90,
            power: 95,
            utility: 85,
            speed: 82,
            iq: 90,
            defense: 88,
        },
    },
    {
        id: "uryu-ishida",
        name: "Uryu Ishida",
        anime: "Bleach",
        imageUrl: "/draft/bleach/uryu.avif",
        stats: {
            leadership: 70,
            power: 85,
            utility: 88,
            speed: 82,
            iq: 92,
            defense: 70,
        },
    },
    {
        id: "renji-abarai",
        name: "Renji Abarai",
        anime: "Bleach",
        imageUrl: "/draft/bleach/renji.webp",
        stats: {
            leadership: 75,
            power: 86,
            utility: 65,
            speed: 78,
            iq: 65,
            defense: 80,
        },
    },
    {
        id: "orihime-inoue",
        name: "Orihime Inoue",
        anime: "Bleach",
        imageUrl: "/draft/bleach/orihime.webp",
        stats: {
            leadership: 60,
            power: 45,
            utility: 95,
            speed: 50,
            iq: 70,
            defense: 90,
        },
    },
    {
        id: "gin-ichimaru",
        name: "Gin Ichimaru",
        anime: "Bleach",
        imageUrl: "/draft/bleach/gin.webp",
        stats: {
            leadership: 72,
            power: 88,
            utility: 82,
            speed: 92,
            iq: 90,
            defense: 68,
        },
    },
    {
        id: "sajin-komamura",
        name: "Sajin Komamura",
        anime: "Bleach",
        imageUrl: "/draft/bleach/komamura.webp",
        stats: {
            leadership: 88,
            power: 86,
            utility: 45,
            speed: 45,
            iq: 70,
            defense: 95,
        },
    },
    // Dragon Ball
    {
        id: "son-goku",
        name: "Son Goku",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/goku.webp",
        stats: {
            leadership: 80,
            power: 99,
            utility: 55,
            speed: 98,
            iq: 55,
            defense: 95,
        },
    },
    {
        id: "vegeta",
        name: "Vegeta",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/vegeta.jpg",
        stats: {
            leadership: 72,
            power: 98,
            utility: 50,
            speed: 95,
            iq: 78,
            defense: 93,
        },
    },
    {
        id: "piccolo",
        name: "Piccolo",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/piccolo.webp",
        stats: {
            leadership: 88,
            power: 88,
            utility: 82,
            speed: 80,
            iq: 92,
            defense: 88,
        },
    },
    {
        id: "gohan",
        name: "Son Gohan",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/gohan.webp",
        stats: {
            leadership: 78,
            power: 96,
            utility: 72,
            speed: 88,
            iq: 90,
            defense: 85,
        },
    },
    {
        id: "future-trunks",
        name: "Future Trunks",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/trunks.webp",
        stats: {
            leadership: 85,
            power: 92,
            utility: 65,
            speed: 88,
            iq: 82,
            defense: 82,
        },
    },
    {
        id: "frieza",
        name: "Frieza",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/frieza.webp",
        stats: {
            leadership: 82,
            power: 98,
            utility: 78,
            speed: 95,
            iq: 88,
            defense: 88,
        },
    },
    {
        id: "beerus",
        name: "Beerus",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/beerus.webp",
        stats: {
            leadership: 75,
            power: 99,
            utility: 75,
            speed: 98,
            iq: 85,
            defense: 95,
        },
    },
    {
        id: "whis",
        name: "Whis",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/whis.webp",
        stats: {
            leadership: 90,
            power: 99,
            utility: 98,
            speed: 99,
            iq: 98,
            defense: 95,
        },
    },
    {
        id: "bulma",
        name: "Bulma",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/bulma.webp",
        stats: {
            leadership: 75,
            power: 5,
            utility: 99,
            speed: 10,
            iq: 99,
            defense: 5,
        },
    },
    {
        id: "android-17",
        name: "Android 17",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/android17.avif",
        stats: {
            leadership: 70,
            power: 92,
            utility: 75,
            speed: 90,
            iq: 82,
            defense: 90,
        },
    },
    {
        id: "android-18",
        name: "Android 18",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/android18.webp",
        stats: {
            leadership: 65,
            power: 88,
            utility: 65,
            speed: 88,
            iq: 78,
            defense: 88,
        },
    },
    {
        id: "cell",
        name: "Cell",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/cell.jpg",
        stats: {
            leadership: 78,
            power: 97,
            utility: 85,
            speed: 92,
            iq: 90,
            defense: 92,
        },
    },
    {
        id: "majin-buu",
        name: "Majin Buu",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/buu.webp",
        stats: {
            leadership: 20,
            power: 96,
            utility: 92,
            speed: 75,
            iq: 15,
            defense: 99,
        },
    },
    {
        id: "broly",
        name: "Broly",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/broly.jpg",
        stats: {
            leadership: 35,
            power: 99,
            utility: 20,
            speed: 92,
            iq: 20,
            defense: 98,
        },
    },
    {
        id: "jiren",
        name: "Jiren",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/jiren.webp",
        stats: {
            leadership: 65,
            power: 99,
            utility: 35,
            speed: 97,
            iq: 72,
            defense: 99,
        },
    },
    {
        id: "hit",
        name: "Hit",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/hit.webp",
        stats: {
            leadership: 55,
            power: 95,
            utility: 95,
            speed: 96,
            iq: 88,
            defense: 82,
        },
    },
    {
        id: "krillin",
        name: "Krillin",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/krillin.webp",
        stats: {
            leadership: 80,
            power: 60,
            utility: 65,
            speed: 68,
            iq: 78,
            defense: 55,
        },
    },
    {
        id: "master-roshi",
        name: "Master Roshi",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/roshi.avif",
        stats: {
            leadership: 92,
            power: 65,
            utility: 78,
            speed: 45,
            iq: 92,
            defense: 60,
        },
    },
    {
        id: "yamcha",
        name: "Yamcha",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/yamcha.png",
        stats: {
            leadership: 50,
            power: 45,
            utility: 35,
            speed: 55,
            iq: 50,
            defense: 40,
        },
    },
    {
        id: "tien",
        name: "Tien Shinhan",
        anime: "Dragon Ball",
        imageUrl: "/draft/dragonball/tien.webp",
        stats: {
            leadership: 72,
            power: 72,
            utility: 60,
            speed: 70,
            iq: 72,
            defense: 70,
        },
    },
    // Death Note
    {
        id: "light-yagami",
        name: "Light Yagami",
        anime: "Death Note",
        imageUrl: "/draft/deathnote/light.webp",
        stats: {
            leadership: 90,
            power: 34,
            utility: 90,
            speed: 25,
            iq: 98,
            defense: 20,
        },
    },
    {
        id: "l",
        name: "L",
        anime: "Death Note",
        imageUrl: "/draft/deathnote/l.webp",
        stats: {
            leadership: 70,
            power: 20,
            utility: 30,
            speed: 25,
            iq: 99,
            defense: 20,
        },
    },
    // Attack on Titan
    {
        id: "eren-yeager",
        name: "Eren Yeager",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/eren.webp",
        stats: {
            leadership: 88,
            power: 90,
            utility: 88,
            speed: 72,
            iq: 82,
            defense: 85,
        },
    },
    {
        id: "mikasa-ackerman",
        name: "Mikasa Ackerman",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/mikasa.jpg",
        stats: {
            leadership: 72,
            power: 82,
            utility: 35,
            speed: 90,
            iq: 79,
            defense: 82,
        },
    },
    {
        id: "levi-ackerman",
        name: "Levi Ackerman",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/levi.webp",
        stats: {
            leadership: 93,
            power: 85,
            utility: 45,
            speed: 95,
            iq: 90,
            defense: 78,
        },
    },
    {
        id: "armin-arlert",
        name: "Armin Arlert",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/armin.webp",
        stats: {
            leadership: 88,
            power: 90,
            utility: 85,
            speed: 40,
            iq: 95,
            defense: 90,
        },
    },
    {
        id: "erwin-smith",
        name: "Erwin Smith",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/erwin.webp",
        stats: {
            leadership: 99,
            power: 45,
            utility: 60,
            speed: 45,
            iq: 97,
            defense: 60,
        },
    },
    {
        id: "hange-zoe",
        name: "Hange Zoe",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/hange.webp",
        stats: {
            leadership: 85,
            power: 55,
            utility: 92,
            speed: 72,
            iq: 95,
            defense: 55,
        },
    },
    {
        id: "reiner-braun",
        name: "Reiner Braun",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/reiner.webp",
        stats: {
            leadership: 80,
            power: 82,
            utility: 50,
            speed: 55,
            iq: 70,
            defense: 95,
        },
    },
    {
        id: "annie-leonhart",
        name: "Annie Leonhart",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/annie.avif",
        stats: {
            leadership: 60,
            power: 80,
            utility: 62,
            speed: 88,
            iq: 82,
            defense: 72,
        },
    },
    {
        id: "zeke-yeager",
        name: "Zeke Yeager",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/zeke.webp",
        stats: {
            leadership: 82,
            power: 78,
            utility: 80,
            speed: 40,
            iq: 96,
            defense: 65,
        },
    },
    {
        id: "pieck-finger",
        name: "Pieck Finger",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/pieck.webp",
        stats: {
            leadership: 78,
            power: 65,
            utility: 95,
            speed: 68,
            iq: 90,
            defense: 75,
        },
    },
    {
        id: "porco-galliard",
        name: "Porco Galliard",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/porco.webp",
        stats: {
            leadership: 55,
            power: 78,
            utility: 45,
            speed: 82,
            iq: 65,
            defense: 68,
        },
    },
    {
        id: "ymir",
        name: "Ymir",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/ymir.webp",
        stats: {
            leadership: 58,
            power: 70,
            utility: 50,
            speed: 78,
            iq: 68,
            defense: 60,
        },
    },
    {
        id: "jean-kirstein",
        name: "Jean Kirstein",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/jean.jpg",
        stats: {
            leadership: 82,
            power: 52,
            utility: 65,
            speed: 62,
            iq: 80,
            defense: 58,
        },
    },
    {
        id: "connie-springer",
        name: "Connie Springer",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/connie.webp",
        stats: {
            leadership: 50,
            power: 45,
            utility: 35,
            speed: 68,
            iq: 45,
            defense: 42,
        },
    },
    {
        id: "sasha-blouse",
        name: "Sasha Blouse",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/sasha.webp",
        stats: {
            leadership: 55,
            power: 48,
            utility: 55,
            speed: 72,
            iq: 58,
            defense: 45,
        },
    },
    {
        id: "falco-grice",
        name: "Falco Grice",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/falco.webp",
        stats: {
            leadership: 72,
            power: 70,
            utility: 75,
            speed: 68,
            iq: 78,
            defense: 65,
        },
    },
    {
        id: "gabi-braun",
        name: "Gabi Braun",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/gabi.webp",
        stats: {
            leadership: 68,
            power: 55,
            utility: 80,
            speed: 60,
            iq: 70,
            defense: 45,
        },
    },
    {
        id: "bertholdt-hoover",
        name: "Bertholdt Hoover",
        anime: "Attack on Titan",
        imageUrl: "/draft/aot/bertholdt.webp",
        stats: {
            leadership: 45,
            power: 90,
            utility: 70,
            speed: 45,
            iq: 72,
            defense: 90,
        },
    },
    // Fullmetal Alchemist: Brotherhood
    {
        id: "edward-elric",
        name: "Edward Elric",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/edward.webp",
        stats: {
            leadership: 88,
            power: 82,
            utility: 95,
            speed: 82,
            iq: 92,
            defense: 72,
        },
    },
    {
        id: "alphonse-elric",
        name: "Alphonse Elric",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/alphonse.webp",
        stats: {
            leadership: 82,
            power: 80,
            utility: 88,
            speed: 65,
            iq: 85,
            defense: 95,
        },
    },
    {
        id: "roy-mustang",
        name: "Roy Mustang",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/mustang.webp",
        stats: {
            leadership: 95,
            power: 92,
            utility: 90,
            speed: 82,
            iq: 95,
            defense: 70,
        },
    },
    {
        id: "riza-hawkeye",
        name: "Riza Hawkeye",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/riza.webp",
        stats: {
            leadership: 78,
            power: 72,
            utility: 75,
            speed: 78,
            iq: 88,
            defense: 65,
        },
    },
    {
        id: "alex-louis-armstrong",
        name: "Alex Louis Armstrong",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/armstrong.webp",
        stats: {
            leadership: 80,
            power: 82,
            utility: 65,
            speed: 55,
            iq: 70,
            defense: 88,
        },
    },
    {
        id: "olivier-armstrong",
        name: "Olivier Mira Armstrong",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/olivier.webp",
        stats: {
            leadership: 98,
            power: 78,
            utility: 72,
            speed: 72,
            iq: 92,
            defense: 85,
        },
    },
    {
        id: "maes-hughes",
        name: "Maes Hughes",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/hughes.webp",
        stats: {
            leadership: 90,
            power: 35,
            utility: 75,
            speed: 45,
            iq: 88,
            defense: 40,
        },
    },
    {
        id: "scar",
        name: "Scar",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/scar.avif",
        stats: {
            leadership: 72,
            power: 88,
            utility: 72,
            speed: 82,
            iq: 75,
            defense: 80,
        },
    },
    {
        id: "izumi-curtis",
        name: "Izumi Curtis",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/izumi.webp",
        stats: {
            leadership: 82,
            power: 88,
            utility: 85,
            speed: 78,
            iq: 88,
            defense: 82,
        },
    },
    {
        id: "van-hohenheim",
        name: "Van Hohenheim",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/hohenheim.webp",
        stats: {
            leadership: 88,
            power: 92,
            utility: 98,
            speed: 70,
            iq: 95,
            defense: 88,
        },
    },
    {
        id: "king-bradley",
        name: "King Bradley",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/bradley.webp",
        stats: {
            leadership: 92,
            power: 92,
            utility: 75,
            speed: 95,
            iq: 90,
            defense: 85,
        },
    },
    {
        id: "envy",
        name: "Envy",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/envy.webp",
        stats: {
            leadership: 45,
            power: 78,
            utility: 88,
            speed: 72,
            iq: 68,
            defense: 78,
        },
    },
    {
        id: "greed-ling",
        name: "Greed (Ling Yao)",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/greed.webp",
        stats: {
            leadership: 82,
            power: 85,
            utility: 82,
            speed: 82,
            iq: 82,
            defense: 92,
        },
    },
    {
        id: "ling-yao",
        name: "Ling Yao",
        anime: "Fullmetal Alchemist: Brotherhood",
        imageUrl: "/draft/fmab/ling.webp",
        stats: {
            leadership: 90,
            power: 78,
            utility: 75,
            speed: 85,
            iq: 85,
            defense: 70,
        },
    },
    // My Hero Academia
    {
        id: "izuku-midoriya",
        name: "Izuku Midoriya",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/deku.webp",
        stats: {
            leadership: 88,
            power: 93,
            utility: 88,
            speed: 88,
            iq: 93,
            defense: 85,
        },
    },
    {
        id: "katsuki-bakugo",
        name: "Katsuki Bakugo",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/bakugo.avif",
        stats: {
            leadership: 72,
            power: 93,
            utility: 82,
            speed: 92,
            iq: 82,
            defense: 78,
        },
    },
    {
        id: "shoto-todoroki",
        name: "Shoto Todoroki",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/todoroki.avif",
        stats: {
            leadership: 75,
            power: 92,
            utility: 88,
            speed: 80,
            iq: 85,
            defense: 85,
        },
    },
    {
        id: "all-might",
        name: "All Might",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/allmight.jpg",
        stats: {
            leadership: 99,
            power: 93,
            utility: 60,
            speed: 90,
            iq: 72,
            defense: 95,
        },
    },
    {
        id: "shota-aizawa",
        name: "Shota Aizawa",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/aizawa.avif",
        stats: {
            leadership: 88,
            power: 72,
            utility: 98,
            speed: 85,
            iq: 92,
            defense: 70,
        },
    },
    {
        id: "hawks",
        name: "Hawks",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/hawks.avif",
        stats: {
            leadership: 82,
            power: 85,
            utility: 90,
            speed: 99,
            iq: 88,
            defense: 68,
        },
    },
    {
        id: "endeavor",
        name: "Endeavor",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/endeavor.webp",
        stats: {
            leadership: 90,
            power: 93,
            utility: 72,
            speed: 78,
            iq: 82,
            defense: 90,
        },
    },
    {
        id: "all-for-one",
        name: "All For One",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/allforone.avif",
        stats: {
            leadership: 95,
            power: 98,
            utility: 99,
            speed: 85,
            iq: 95,
            defense: 92,
        },
    },
    {
        id: "tomura-shigaraki",
        name: "Tomura Shigaraki",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/shigaraki.avif",
        stats: {
            leadership: 85,
            power: 95,
            utility: 92,
            speed: 82,
            iq: 85,
            defense: 88,
        },
    },
    {
        id: "mirio-togata",
        name: "Mirio Togata",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/mirio.webp",
        stats: {
            leadership: 92,
            power: 88,
            utility: 92,
            speed: 90,
            iq: 85,
            defense: 82,
        },
    },
    {
        id: "tamaki-amajiki",
        name: "Tamaki Amajiki",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/tamaki.webp",
        stats: {
            leadership: 45,
            power: 88,
            utility: 95,
            speed: 75,
            iq: 80,
            defense: 82,
        },
    },
    {
        id: "nejire-hado",
        name: "Nejire Hado",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/nejire.webp",
        stats: {
            leadership: 65,
            power: 88,
            utility: 78,
            speed: 85,
            iq: 72,
            defense: 78,
        },
    },
    {
        id: "tenya-iida",
        name: "Tenya Iida",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/tenya.avif",
        stats: {
            leadership: 90,
            power: 72,
            utility: 60,
            speed: 95,
            iq: 85,
            defense: 72,
        },
    },
    {
        id: "ochaco-uraraka",
        name: "Ochaco Uraraka",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/uraraka.avif",
        stats: {
            leadership: 72,
            power: 65,
            utility: 88,
            speed: 72,
            iq: 75,
            defense: 65,
        },
    },
    {
        id: "tsuyu-asui",
        name: "Tsuyu Asui",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/tsuyu.jpg",
        stats: {
            leadership: 75,
            power: 65,
            utility: 85,
            speed: 82,
            iq: 80,
            defense: 68,
        },
    },
    {
        id: "eijiro-kirishima",
        name: "Eijiro Kirishima",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/eijiro.webp",
        stats: {
            leadership: 82,
            power: 82,
            utility: 40,
            speed: 60,
            iq: 55,
            defense: 95,
        },
    },
    {
        id: "momo-yaoyorozu",
        name: "Momo Yaoyorozu",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/momo.avif",
        stats: {
            leadership: 82,
            power: 50,
            utility: 99,
            speed: 55,
            iq: 95,
            defense: 50,
        },
    },
    {
        id: "dabi",
        name: "Dabi",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/dabi.jpeg",
        stats: {
            leadership: 60,
            power: 92,
            utility: 68,
            speed: 72,
            iq: 80,
            defense: 55,
        },
    },
    {
        id: "himiko-toga",
        name: "Himiko Toga",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/toga.avif",
        stats: {
            leadership: 35,
            power: 72,
            utility: 95,
            speed: 88,
            iq: 72,
            defense: 50,
        },
    },
    {
        id: "stain",
        name: "Hero Killer Stain",
        anime: "My Hero Academia",
        imageUrl: "/draft/mha/stain.jpg",
        stats: {
            leadership: 70,
            power: 82,
            utility: 90,
            speed: 90,
            iq: 82,
            defense: 72,
        },
    },
    // One Punch Man
    {
        id: "saitama",
        name: "Saitama",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/saitama.avif",
        stats: {
            leadership: 65,
            power: 99,
            utility: 25,
            speed: 99,
            iq: 45,
            defense: 99,
        },
    },
    {
        id: "genos",
        name: "Genos",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/genos.webp",
        stats: {
            leadership: 72,
            power: 90,
            utility: 82,
            speed: 88,
            iq: 80,
            defense: 78,
        },
    },
    {
        id: "blast",
        name: "Blast",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/blast.jpg",
        stats: {
            leadership: 95,
            power: 96,
            utility: 95,
            speed: 98,
            iq: 92,
            defense: 95,
        },
    },
    {
        id: "tatsumaki",
        name: "Tatsumaki",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/tatsumaki.webp",
        stats: {
            leadership: 45,
            power: 96,
            utility: 95,
            speed: 85,
            iq: 82,
            defense: 90,
        },
    },
    {
        id: "silver-fang",
        name: "Silver Fang",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/bang.jpg",
        stats: {
            leadership: 92,
            power: 92,
            utility: 72,
            speed: 88,
            iq: 90,
            defense: 88,
        },
    },
    {
        id: "garou",
        name: "Garou",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/garou.avif",
        stats: {
            leadership: 75,
            power: 98,
            utility: 78,
            speed: 95,
            iq: 88,
            defense: 92,
        },
    },
    {
        id: "king",
        name: "King",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/king.avif",
        stats: {
            leadership: 95,
            power: 5,
            utility: 35,
            speed: 5,
            iq: 82,
            defense: 10,
        },
    },
    {
        id: "atomic-samurai",
        name: "Atomic Samurai",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/atomicsamurai.png",
        stats: {
            leadership: 75,
            power: 94,
            utility: 40,
            speed: 92,
            iq: 75,
            defense: 75,
        },
    },
    {
        id: "child-emperor",
        name: "Child Emperor",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/childemperor.webp",
        stats: {
            leadership: 82,
            power: 68,
            utility: 98,
            speed: 50,
            iq: 99,
            defense: 62,
        },
    },
    {
        id: "metal-knight",
        name: "Metal Knight",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/metalknight.webp",
        stats: {
            leadership: 60,
            power: 92,
            utility: 99,
            speed: 25,
            iq: 97,
            defense: 95,
        },
    },
    {
        id: "watchdog-man",
        name: "Watchdog Man",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/watchdogman.jpg",
        stats: {
            leadership: 15,
            power: 90,
            utility: 15,
            speed: 88,
            iq: 35,
            defense: 92,
        },
    },
    {
        id: "speed-o-sound-sonic",
        name: "Speed-o'-Sound Sonic",
        anime: "One Punch Man",
        imageUrl: "/draft/opm/sonic.webp",
        stats: {
            leadership: 25,
            power: 82,
            utility: 35,
            speed: 98,
            iq: 72,
            defense: 58,
        },
    },
    // Demon Slayer
    {
        id: "tanjiro-kamado",
        name: "Tanjiro Kamado",
        anime: "Demon Slayer",
        imageUrl: "/draft/demonslayer/tanjiro.jpg",
        stats: {
            leadership: 82,
            power: 82,
            utility: 70,
            speed: 80,
            iq: 78,
            defense: 78,
        },
    },
    {
        id: "nezuko-kamado",
        name: "Nezuko Kamado",
        anime: "Demon Slayer",
        imageUrl: "/draft/demonslayer/nezuko.avif",
        stats: {
            leadership: 35,
            power: 82,
            utility: 75,
            speed: 78,
            iq: 55,
            defense: 82,
        },
    },
    {
        id: "zenitsu-agatsuma",
        name: "Zenitsu Agatsuma",
        anime: "Demon Slayer",
        imageUrl: "/draft/demonslayer/zenitsu.webp",
        stats: {
            leadership: 35,
            power: 78,
            utility: 35,
            speed: 94,
            iq: 55,
            defense: 55,
        },
    },
    {
        id: "inosuke-hashibira",
        name: "Inosuke Hashibira",
        anime: "Demon Slayer",
        imageUrl: "/draft/demonslayer/inosuke.webp",
        stats: {
            leadership: 45,
            power: 78,
            utility: 45,
            speed: 82,
            iq: 40,
            defense: 72,
        },
    },
    {
        id: "giyu-tomioka",
        name: "Giyu Tomioka",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/3/423445.webp",
        stats: {
            leadership: 75,
            power: 88,
            utility: 65,
            speed: 86,
            iq: 78,
            defense: 85
        }
    },
    {
        id: "kyojuro-rengoku",
        name: "Kyojuro Rengoku",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/2/377344.webp",
        stats: {
            leadership: 92,
            power: 88,
            utility: 55,
            speed: 84,
            iq: 75,
            defense: 82
        }
    },
    {
        id: "tengen-uzui",
        name: "Tengen Uzui",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/16/387706.webp",
        stats: {
            leadership: 78,
            power: 86,
            utility: 72,
            speed: 92,
            iq: 82,
            defense: 78
        }
    },
    {
        id: "muichiro-tokito",
        name: "Muichiro Tokito",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/5/464903.webp",
        stats: {
            leadership: 55,
            power: 88,
            utility: 60,
            speed: 90,
            iq: 82,
            defense: 75
        }
    },
    {
        id: "shinobu-kocho",
        name: "Shinobu Kocho",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/3/386591.webp",
        stats: {
            leadership: 78,
            power: 65,
            utility: 92,
            speed: 92,
            iq: 90,
            defense: 55
        }
    },
    {
        id: "mitsuri-kanroji",
        name: "Mitsuri Kanroji",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/11/514229.webp",
        stats: {
            leadership: 70,
            power: 86,
            utility: 58,
            speed: 84,
            iq: 68,
            defense: 78
        }
    },
    {
        id: "obanai-iguro",
        name: "Obanai Iguro",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/15/466014.webp",
        stats: {
            leadership: 72,
            power: 86,
            utility: 65,
            speed: 90,
            iq: 82,
            defense: 72
        }
    },
    {
        id: "sanemi-shinazugawa",
        name: "Sanemi Shinazugawa",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/11/556642.webp",
        stats: {
            leadership: 72,
            power: 90,
            utility: 58,
            speed: 88,
            iq: 75,
            defense: 85
        }
    },
    {
        id: "gyomei-himejima",
        name: "Gyomei Himejima",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/10/550017.webp",
        stats: {
            leadership: 88,
            power: 92,
            utility: 62,
            speed: 76,
            iq: 82,
            defense: 92
        }
    },
    {
        id: "kanae-kocho",
        name: "Kanae Kocho",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/16/389355.webp",
        stats: {
            leadership: 80,
            power: 76,
            utility: 88,
            speed: 82,
            iq: 84,
            defense: 65
        }
    },
    {
        id: "kanao-tsuyuri",
        name: "Kanao Tsuyuri",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/2/384712.webp",
        stats: {
            leadership: 55,
            power: 76,
            utility: 62,
            speed: 84,
            iq: 75,
            defense: 68
        }
    },
    {
        id: "muzan-kibutsuji",
        name: "Muzan Kibutsuji",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/4/384669.webp",
        stats: {
            leadership: 82,
            power: 94,
            utility: 90,
            speed: 88,
            iq: 88,
            defense: 96
        }
    },
    {
        id: "kokushibo",
        name: "Kokushibo",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/10/406156.webp",
        stats: {
            leadership: 75,
            power: 93,
            utility: 75,
            speed: 90,
            iq: 85,
            defense: 90
        }
    },
    {
        id: "doma",
        name: "Doma",
        anime: "Demon Slayer",
        imageUrl: "/draft/demonslayer/doma.webp",
        stats: {
            leadership: 70,
            power: 90,
            utility: 92,
            speed: 91,
            iq: 85,
            defense: 85
        }
    },
    {
        id: "akaza",
        name: "Akaza",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/images/characters/2/464775.webp",
        stats: {
            leadership: 55,
            power: 91,
            utility: 65,
            speed: 92,
            iq: 78,
            defense: 88
        }
    },
    {
        id: "rui",
        name: "Rui",
        anime: "Demon Slayer",
        imageUrl: "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
        stats: {
            leadership: 55,
            power: 70,
            utility: 82,
            speed: 65,
            iq: 68,
            defense: 62
        }
    },
    // Hunter x Hunter
    {
        id: "gon-freecss",
        name: "Gon Freecss",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/gon.webp",
        stats: {
            leadership: 85,
            power: 90,
            utility: 45,
            speed: 82,
            iq: 65,
            defense: 85
        }
    },
    {
        id: "killua-zoldyck",
        name: "Killua Zoldyck",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/killua.jpg",
        stats: {
            leadership: 65,
            power: 88,
            utility: 72,
            speed: 98,
            iq: 88,
            defense: 78
        }
    },
    {
        id: "kurapika",
        name: "Kurapika",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/kurapika.avif",
        stats: {
            leadership: 88,
            power: 85,
            utility: 95,
            speed: 82,
            iq: 95,
            defense: 82
        }
    },
    {
        id: "leorio",
        name: "Leorio Paradinight",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/leorio.webp",
        stats: {
            leadership: 82,
            power: 55,
            utility: 82,
            speed: 50,
            iq: 75,
            defense: 65
        }
    },
    {
        id: "hisoka",
        name: "Hisoka",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/hisoka.jpg",
        stats: {
            leadership: 40,
            power: 92,
            utility: 90,
            speed: 95,
            iq: 92,
            defense: 78
        }
    },
    {
        id: "chrollo-lucilfer",
        name: "Chrollo Lucilfer",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/chrollo.jpg",
        stats: {
            leadership: 98,
            power: 90,
            utility: 99,
            speed: 88,
            iq: 98,
            defense: 82
        }
    },
    {
        id: "isaac-netero",
        name: "Isaac Netero",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/netero.webp",
        stats: {
            leadership: 99,
            power: 97,
            utility: 75,
            speed: 95,
            iq: 92,
            defense: 92
        }
    },
    {
        id: "meruem",
        name: "Meruem",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/mereum.jpg",
        stats: {
            leadership: 95,
            power: 97,
            utility: 88,
            speed: 95,
            iq: 99,
            defense: 98
        }
    },
    {
        id: "neferpitou",
        name: "Neferpitou",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/neferpitou.webp",
        stats: {
            leadership: 65,
            power: 96,
            utility: 92,
            speed: 95,
            iq: 88,
            defense: 90
        }
    },
    {
        id: "shaiapouf",
        name: "Shaiapouf",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/shaiapouf.webp",
        stats: {
            leadership: 82,
            power: 82,
            utility: 98,
            speed: 90,
            iq: 96,
            defense: 72
        }
    },
    {
        id: "menthuthuyoupi",
        name: "Menthuthuyoupi",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/youpi.webp",
        stats: {
            leadership: 35,
            power: 98,
            utility: 45,
            speed: 70,
            iq: 45,
            defense: 99
        }
    },
    {
        id: "biscuit-krueger",
        name: "Biscuit Krueger",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/bisky.webp",
        stats: {
            leadership: 88,
            power: 88,
            utility: 92,
            speed: 85,
            iq: 90,
            defense: 82
        }
    },
    {
        id: "ging-freecss",
        name: "Ging Freecss",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/ging.webp",
        stats: {
            leadership: 78,
            power: 92,
            utility: 95,
            speed: 88,
            iq: 99,
            defense: 78
        }
    },
    {
        id: "silva-zoldyck",
        name: "Silva Zoldyck",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/silva.webp",
        stats: {
            leadership: 82,
            power: 92,
            utility: 72,
            speed: 88,
            iq: 82,
            defense: 90
        }
    },
    {
        id: "zeno-zoldyck",
        name: "Zeno Zoldyck",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/zeno.webp",
        stats: {
            leadership: 88,
            power: 88,
            utility: 82,
            speed: 88,
            iq: 95,
            defense: 82
        }
    },
    {
        id: "illumi-zoldyck",
        name: "Illumi Zoldyck",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/illumi.jpg",
        stats: {
            leadership: 65,
            power: 88,
            utility: 95,
            speed: 88,
            iq: 92,
            defense: 75
        }
    },
    {
        id: "kite",
        name: "Kite",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/kite.webp",
        stats: {
            leadership: 82,
            power: 85,
            utility: 82,
            speed: 82,
            iq: 85,
            defense: 78
        }
    },
    {
        id: "feitan",
        name: "Feitan",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/feitan.jpg",
        stats: {
            leadership: 35,
            power: 90,
            utility: 55,
            speed: 97,
            iq: 78,
            defense: 72
        }
    },
    {
        id: "machi",
        name: "Machi Komacine",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/machi.jpg",
        stats: {
            leadership: 55,
            power: 82,
            utility: 88,
            speed: 88,
            iq: 82,
            defense: 75
        }
    },
    {
        id: "knuckle-bine",
        name: "Knuckle Bine",
        anime: "Hunter x Hunter",
        imageUrl: "/draft/hxh/knuckle.jpg",
        stats: {
            leadership: 78,
            power: 82,
            utility: 88,
            speed: 75,
            iq: 82,
            defense: 82
        }
    },
    // Jujutsu Kaisen
    {
        id: "yuji-itadori",
        name: "Yuji Itadori",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/yuji.jpg",
        stats: {
            leadership: 82,
            power: 90,
            utility: 45,
            speed: 88,
            iq: 68,
            defense: 90
        }
    },
    {
        id: "megumi-fushiguro",
        name: "Megumi Fushiguro",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/megumi.webp",
        stats: {
            leadership: 78,
            power: 82,
            utility: 90,
            speed: 78,
            iq: 88,
            defense: 72
        }
    },
    {
        id: "nobara-kugisaki",
        name: "Nobara Kugisaki",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/nobara.webp",
        stats: {
            leadership: 68,
            power: 75,
            utility: 82,
            speed: 72,
            iq: 72,
            defense: 65
        }
    },
    {
        id: "satoru-gojo",
        name: "Satoru Gojo",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/gojo.jpg",
        stats: {
            leadership: 97,
            power: 99,
            utility: 99,
            speed: 99,
            iq: 96,
            defense: 99
        }
    },
    {
        id: "ryomen-sukuna",
        name: "Ryomen Sukuna",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/sukuna.jpg",
        stats: {
            leadership: 75,
            power: 99,
            utility: 98,
            speed: 99,
            iq: 97,
            defense: 99
        }
    },
    {
        id: "yuta-okkotsu",
        name: "Yuta Okkotsu",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/yuta.jpg",
        stats: {
            leadership: 80,
            power: 96,
            utility: 99,
            speed: 90,
            iq: 87,
            defense: 92
        }
    },
    {
        id: "suguru-geto",
        name: "Suguru Geto",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/geto.png",
        stats: {
            leadership: 92,
            power: 90,
            utility: 95,
            speed: 80,
            iq: 95,
            defense: 82
        }
    },
    {
        id: "toji-fushiguro",
        name: "Toji Fushiguro",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/toji.webp",
        stats: {
            leadership: 45,
            power: 94,
            utility: 70,
            speed: 95,
            iq: 92,
            defense: 88
        }
    },
    {
        id: "maki-zenin",
        name: "Maki Zenin",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/maki.webp",
        stats: {
            leadership: 82,
            power: 94,
            utility: 60,
            speed: 95,
            iq: 85,
            defense: 85
        }
    },
    {
        id: "kinji-hakari",
        name: "Kinji Hakari",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/hakari.avif",
        stats: {
            leadership: 45,
            power: 95,
            utility: 85,
            speed: 85,
            iq: 75,
            defense: 95
        }
    },
    {
        id: "aoi-todo",
        name: "Aoi Todo",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/todo.webp",
        stats: {
            leadership: 85,
            power: 83,
            utility: 95,
            speed: 82,
            iq: 99,
            defense: 88
        }
    },
    {
        id: "kento-nanami",
        name: "Kento Nanami",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/nanami.avif",
        stats: {
            leadership: 80,
            power: 82,
            utility: 75,
            speed: 72,
            iq: 92,
            defense: 82
        }
    },
    {
        id: "mahito",
        name: "Mahito",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/mahito.webp",
        stats: {
            leadership: 25,
            power: 86,
            utility: 85,
            speed: 82,
            iq: 88,
            defense: 90
        }
    },
    {
        id: "jogo",
        name: "Jogo",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/jogo.webp",
        stats: {
            leadership: 45,
            power: 95,
            utility: 82,
            speed: 80,
            iq: 68,
            defense: 82
        }
    },
    {
        id: "choso",
        name: "Choso",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/choso.avif",
        stats: {
            leadership: 72,
            power: 86,
            utility: 82,
            speed: 82,
            iq: 78,
            defense: 83
        }
    },
    {
        id: "mei-mei",
        name: "Mei Mei",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/meimei.webp",
        stats: {
            leadership: 70,
            power: 78,
            utility: 88,
            speed: 80,
            iq: 88,
            defense: 72
        }
    },
    {
        id: "utahime-iori",
        name: "Utahime Iori",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/utahime.jpeg",
        stats: {
            leadership: 82,
            power: 45,
            utility: 88,
            speed: 55,
            iq: 82,
            defense: 55
        }
    },
    {
        id: "panda",
        name: "Panda",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/panda.jpg",
        stats: {
            leadership: 75,
            power: 75,
            utility: 50,
            speed: 65,
            iq: 68,
            defense: 82
        }
    },
    {
        id: "toge-inumaki",
        name: "Toge Inumaki",
        anime: "Jujutsu Kaisen",
        imageUrl: "/draft/jjk/inumaki.jpg",
        stats: {
            leadership: 60,
            power: 75,
            utility: 90,
            speed: 72,
            iq: 72,
            defense: 65
        }
    },
    // Misc.
    {
        id: "mob",
        name: "Shigeo Kageyama",
        anime: "Mob Psycho 100",
        imageUrl: "/draft/misc/mob.jpg",
        stats: {
            leadership: 65,
            power: 98,
            utility: 90,
            speed: 75,
            iq: 65,
            defense: 95
        }
    },
    {
        id: "kirito",
        name: "Kirito",
        anime: "Sword Art Online",
        imageUrl: "/draft/misc/kirito.webp",
        stats: {
            leadership: 82,
            power: 90,
            utility: 70,
            speed: 90,
            iq: 82,
            defense: 82
        }
    },
    {
        id: "ken-kaneki",
        name: "Ken Kaneki",
        anime: "Tokyo Ghoul",
        imageUrl: "/draft/misc/kaneki.webp",
        stats: {
            leadership: 80,
            power: 92,
            utility: 72,
            speed: 88,
            iq: 82,
            defense: 90
        }
    },
    {
        id: "lelouch-lamperouge",
        name: "Lelouch Lamperouge",
        anime: "Code Geass",
        imageUrl: "/draft/misc/lelouch.jpg",
        stats: {
            leadership: 99,
            power: 15,
            utility: 99,
            speed: 30,
            iq: 99,
            defense: 20
        }
    },
    {
        id: "korosensei",
        name: "Korosensei",
        anime: "Assassination Classroom",
        imageUrl: "/draft/misc/korosensei.jpg",
        stats: {
            leadership: 98,
            power: 95,
            utility: 99,
            speed: 99,
            iq: 95,
            defense: 90
        }
    },
    {
        id: "spike-spiegel",
        name: "Spike Spiegel",
        anime: "Cowboy Bebop",
        imageUrl: "/draft/misc/spike.jpg",
        stats: {
            leadership: 70,
            power: 75,
            utility: 60,
            speed: 90,
            iq: 85,
            defense: 65
        }
    },
    {
        id: "senku-ishigami",
        name: "Senku Ishigami",
        anime: "Dr. Stone",
        imageUrl: "/draft/misc/senku.jpg",
        stats: {
            leadership: 92,
            power: 5,
            utility: 95,
            speed: 20,
            iq: 99,
            defense: 15
        }
    },
    {
        id: "kusuo-saiki",
        name: "Kusuo Saiki",
        anime: "The Disastrous Life of Saiki K.",
        imageUrl: "https://cdn.myanimelist.net/images/characters/12/337932.webp",
        stats: {
            leadership: 65,
            power: 99,
            utility: 99,
            speed: 99,
            iq: 90,
            defense: 99
        }
    },
    {
        id: "yusuke-urameshi",
        name: "Yusuke Urameshi",
        anime: "Yu Yu Hakusho",
        imageUrl: "/draft/misc/yusuke.webp",
        stats: {
            leadership: 88,
            power: 95,
            utility: 50,
            speed: 88,
            iq: 72,
            defense: 92
        }
    },
    {
        id: "kiyotaka-ayanokoji",
        name: "Kiyotaka Ayanokoji",
        anime: "Classroom of the Elite",
        imageUrl: "/draft/misc/ayanokoji.png",
        stats: {
            leadership: 70,
            power: 83,
            utility: 50,
            speed: 80,
            iq: 99,
            defense: 70
        }
    },
    // 7 Deadly Sins
    {
        id: "meliodas",
        name: "Meliodas",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/meliodas.webp",
        stats: {
            leadership: 92,
            power: 98,
            utility: 88,
            speed: 95,
            iq: 85,
            defense: 92
        }
    },
    {
        id: "ban",
        name: "Ban",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/ban.webp",
        stats: {
            leadership: 78,
            power: 92,
            utility: 85,
            speed: 92,
            iq: 78,
            defense: 95
        }
    },
    {
        id: "king",
        name: "King",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/king.jpg",
        stats: {
            leadership: 72,
            power: 90,
            utility: 95,
            speed: 82,
            iq: 82,
            defense: 75
        }
    },
    {
        id: "diane",
        name: "Diane",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/diane.webp",
        stats: {
            leadership: 68,
            power: 88,
            utility: 75,
            speed: 55,
            iq: 60,
            defense: 92
        }
    },
    {
        id: "gowther",
        name: "Gowther",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/gowther.jpg",
        stats: {
            leadership: 70,
            power: 72,
            utility: 96,
            speed: 70,
            iq: 95,
            defense: 55
        }
    },
    {
        id: "merlin",
        name: "Merlin",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/jpg",
        stats: {
            leadership: 85,
            power: 90,
            utility: 98,
            speed: 78,
            iq: 98,
            defense: 72
        }
    },
    {
        id: "escanor",
        name: "Escanor",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/escanor.jpg",
        stats: {
            leadership: 88,
            power: 99,
            utility: 35,
            speed: 60,
            iq: 75,
            defense: 99
        }
    },
    {
        id: "elizabeth-liones",
        name: "Elizabeth Liones",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/elizabeth.png",
        stats: {
            leadership: 82,
            power: 82,
            utility: 95,
            speed: 72,
            iq: 82,
            defense: 82
        }
    },
    {
        id: "zeldris",
        name: "Zeldris",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/zeldris.jpg",
        stats: {
            leadership: 88,
            power: 95,
            utility: 82,
            speed: 92,
            iq: 88,
            defense: 88
        }
    },
    {
        id: "estarossa",
        name: "Estarossa",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/estarossa.webp",
        stats: {
            leadership: 65,
            power: 94,
            utility: 72,
            speed: 82,
            iq: 68,
            defense: 92
        }
    },
    {
        id: "mael",
        name: "Mael",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/mael.webp",
        stats: {
            leadership: 85,
            power: 97,
            utility: 88,
            speed: 90,
            iq: 85,
            defense: 92
        }
    },
    {
        id: "chandler",
        name: "Chandler",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/chandler.webp",
        stats: {
            leadership: 72,
            power: 95,
            utility: 90,
            speed: 82,
            iq: 88,
            defense: 88
        }
    },
    {
        id: "cusack",
        name: "Cusack",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/cusack.webp",
        stats: {
            leadership: 78,
            power: 94,
            utility: 88,
            speed: 82,
            iq: 92,
            defense: 85
        }
    },
    {
        id: "demon-king",
        name: "Demon King",
        anime: "Seven Deadly Sins",
        imageUrl: "/draft/7ds/demonking.webp",
        stats: {
            leadership: 95,
            power: 99,
            utility: 95,
            speed: 88,
            iq: 92,
            defense: 99
        }
    },
    // Chainsaw Man
    {
        id: "denji",
        name: "Denji",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/denji.webp",
        stats: {
            leadership: 55,
            power: 92,
            utility: 65,
            speed: 82,
            iq: 40,
            defense: 92
        }
    },
    {
        id: "makima",
        name: "Makima",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/makima.webp",
        stats: {
            leadership: 95,
            power: 97,
            utility: 98,
            speed: 82,
            iq: 98,
            defense: 95
        }
    },
    {
        id: "aki-hayakawa",
        name: "Aki Hayakawa",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/aki.webp",
        stats: {
            leadership: 88,
            power: 80,
            utility: 90,
            speed: 78,
            iq: 88,
            defense: 72
        }
    },
    {
        id: "power",
        name: "Power",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/power.webp",
        stats: {
            leadership: 35,
            power: 85,
            utility: 65,
            speed: 72,
            iq: 30,
            defense: 78
        }
    },
    {
        id: "kishibe",
        name: "Kishibe",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/kishibe.webp",
        stats: {
            leadership: 92,
            power: 82,
            utility: 82,
            speed: 88,
            iq: 90,
            defense: 78
        }
    },
    {
        id: "reze",
        name: "Reze",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/reze.jpg",
        stats: {
            leadership: 45,
            power: 90,
            utility: 82,
            speed: 92,
            iq: 78,
            defense: 82
        }
    },
    {
        id: "quanxi",
        name: "Quanxi",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/quanxi.png",
        stats: {
            leadership: 68,
            power: 92,
            utility: 75,
            speed: 99,
            iq: 82,
            defense: 82
        }
    },
    {
        id: "angel-devil",
        name: "Angel Devil",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/angel.jpg",
        stats: {
            leadership: 40,
            power: 82,
            utility: 95,
            speed: 68,
            iq: 78,
            defense: 55
        }
    },
    {
        id: "kobeni",
        name: "Kobeni Higashiyama",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/kobeni.webp",
        stats: {
            leadership: 25,
            power: 55,
            utility: 40,
            speed: 70,
            iq: 65,
            defense: 45
        }
    },
    {
        id: "beam",
        name: "Beam",
        anime: "Chainsaw Man",
        imageUrl: "/draft/chainsawman/beam.webp",
        stats: {
            leadership: 20,
            power: 75,
            utility: 50,
            speed: 85,
            iq: 20,
            defense: 72
        }
    },
    // Black Clover
    {
        id: "asta",
        name: "Asta",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/asta.avif",
        stats: {
            leadership: 92,
            power: 97,
            utility: 82,
            speed: 90,
            iq: 65,
            defense: 95
        }
    },
    {
        id: "yuno",
        name: "Yuno",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/yuno.webp",
        stats: {
            leadership: 88,
            power: 96,
            utility: 90,
            speed: 95,
            iq: 88,
            defense: 85
        }
    },
    {
        id: "noelle-silva",
        name: "Noelle Silva",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/noelle.jpeg",
        stats: {
            leadership: 82,
            power: 92,
            utility: 85,
            speed: 82,
            iq: 80,
            defense: 88
        }
    },
    {
        id: "yami-sukehiro",
        name: "Yami Sukehiro",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/yami.jpg",
        stats: {
            leadership: 98,
            power: 95,
            utility: 75,
            speed: 85,
            iq: 82,
            defense: 90
        }
    },
    {
        id: "julius-novachrono",
        name: "Julius Novachrono",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/julius.png",
        stats: {
            leadership: 99,
            power: 97,
            utility: 99,
            speed: 95,
            iq: 95,
            defense: 88
        }
    },
    {
        id: "mereoleona-vermillion",
        name: "Mereoleona Vermillion",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/mereoleona.webp",
        stats: {
            leadership: 90,
            power: 98,
            utility: 55,
            speed: 90,
            iq: 75,
            defense: 95
        }
    },
    {
        id: "fuegoleon-vermillion",
        name: "Fuegoleon Vermillion",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/fuegoleon.jpeg",
        stats: {
            leadership: 98,
            power: 92,
            utility: 82,
            speed: 82,
            iq: 90,
            defense: 88
        }
    },
    {
        id: "nacht-faust",
        name: "Nacht Faust",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/nacht.jpg",
        stats: {
            leadership: 82,
            power: 93,
            utility: 95,
            speed: 88,
            iq: 95,
            defense: 72
        }
    },
    {
        id: "luck-voltia",
        name: "Luck Voltia",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/luck.jpg",
        stats: {
            leadership: 45,
            power: 90,
            utility: 50,
            speed: 98,
            iq: 60,
            defense: 72
        }
    },
    {
        id: "finral-roulacase",
        name: "Finral Roulacase",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/finral.jpg",
        stats: {
            leadership: 72,
            power: 35,
            utility: 99,
            speed: 82,
            iq: 82,
            defense: 35
        }
    },
    {
        id: "vanessa-enoteca",
        name: "Vanessa Enoteca",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/vanessa.jpg",
        stats: {
            leadership: 65,
            power: 55,
            utility: 95,
            speed: 72,
            iq: 75,
            defense: 60
        }
    },
    {
        id: "charmy-pappitson",
        name: "Charmy Pappitson",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/charmy.jpg",
        stats: {
            leadership: 35,
            power: 82,
            utility: 95,
            speed: 60,
            iq: 50,
            defense: 82
        }
    },
    {
        id: "william-vangeance",
        name: "William Vangeance",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/william.jpg",
        stats: {
            leadership: 95,
            power: 88,
            utility: 92,
            speed: 72,
            iq: 90,
            defense: 82
        }
    },
    {
        id: "dorothy-unsworth",
        name: "Dorothy Unsworth",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/dorothy.jpg",
        stats: {
            leadership: 72,
            power: 90,
            utility: 98,
            speed: 65,
            iq: 85,
            defense: 75
        }
    },
    {
        id: "patry",
        name: "Patry",
        anime: "Black Clover",
        imageUrl: "/draft/blackclover/patry.jpg",
        stats: {
            leadership: 88,
            power: 92,
            utility: 85,
            speed: 92,
            iq: 82,
            defense: 78
        }
    },
    // Fairy Tail
    {
        id: "natsu-dragneel",
        name: "Natsu Dragneel",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/natsu.webp",
        stats: {
            leadership: 88,
            power: 96,
            utility: 60,
            speed: 88,
            iq: 55,
            defense: 92
        }
    },
    {
        id: "lucy-heartfilia",
        name: "Lucy Heartfilia",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/lucy.avif",
        stats: {
            leadership: 78,
            power: 75,
            utility: 95,
            speed: 68,
            iq: 82,
            defense: 68
        }
    },
    {
        id: "gray-fullbuster",
        name: "Gray Fullbuster",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/gray.jpg",
        stats: {
            leadership: 82,
            power: 90,
            utility: 82,
            speed: 82,
            iq: 85,
            defense: 82
        }
    },
    {
        id: "erza-scarlet",
        name: "Erza Scarlet",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/erza.webp",
        stats: {
            leadership: 98,
            power: 95,
            utility: 92,
            speed: 85,
            iq: 82,
            defense: 95
        }
    },
    {
        id: "wendy-marvell",
        name: "Wendy Marvell",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/wendy.webp",
        stats: {
            leadership: 72,
            power: 82,
            utility: 95,
            speed: 82,
            iq: 78,
            defense: 72
        }
    },
    {
        id: "gajeel-redfox",
        name: "Gajeel Redfox",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/gajeel.webp",
        stats: {
            leadership: 75,
            power: 90,
            utility: 65,
            speed: 75,
            iq: 68,
            defense: 92
        }
    },
    {
        id: "laxus-dreyar",
        name: "Laxus Dreyar",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/laxus.jpg",
        stats: {
            leadership: 92,
            power: 95,
            utility: 70,
            speed: 88,
            iq: 75,
            defense: 92
        }
    },
    {
        id: "mirajane-strauss",
        name: "Mirajane Strauss",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/mirajane.webp",
        stats: {
            leadership: 85,
            power: 92,
            utility: 75,
            speed: 82,
            iq: 78,
            defense: 82
        }
    },
    {
        id: "jellal-fernandes",
        name: "Jellal Fernandes",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/jellal.webp",
        stats: {
            leadership: 88,
            power: 94,
            utility: 88,
            speed: 92,
            iq: 88,
            defense: 82
        }
    },
    {
        id: "makarov-dreyar",
        name: "Makarov Dreyar",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/makarov.webp",
        stats: {
            leadership: 99,
            power: 88,
            utility: 82,
            speed: 55,
            iq: 88,
            defense: 85
        }
    },
    {
        id: "gildarts-clive",
        name: "Gildarts Clive",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/clive.jpeg",
        stats: {
            leadership: 90,
            power: 99,
            utility: 75,
            speed: 82,
            iq: 78,
            defense: 95
        }
    },
    {
        id: "zeref-dragneel",
        name: "Zeref Dragneel",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/zeref.jpeg",
        stats: {
            leadership: 95,
            power: 99,
            utility: 99,
            speed: 82,
            iq: 99,
            defense: 92
        }
    },
    {
        id: "acnologia",
        name: "Acnologia",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/acnologia.webp",
        stats: {
            leadership: 55,
            power: 99,
            utility: 72,
            speed: 95,
            iq: 72,
            defense: 99
        }
    },
    {
        id: "august",
        name: "August",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/august.webp",
        stats: {
            leadership: 88,
            power: 98,
            utility: 98,
            speed: 82,
            iq: 95,
            defense: 90
        }
    },
    {
        id: "irene-belserion",
        name: "Irene Belserion",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/irene.webp",
        stats: {
            leadership: 90,
            power: 97,
            utility: 98,
            speed: 85,
            iq: 92,
            defense: 90
        }
    },
    {
        id: "dimaria-yesta",
        name: "Dimaria Yesta",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/dimaria.webp",
        stats: {
            leadership: 55,
            power: 92,
            utility: 95,
            speed: 90,
            iq: 72,
            defense: 75
        }
    },
    {
        id: "ultear-milkovich",
        name: "Ultear Milkovich",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/ultear.webp",
        stats: {
            leadership: 78,
            power: 88,
            utility: 95,
            speed: 82,
            iq: 92,
            defense: 72
        }
    },
    {
        id: "cana-alberona",
        name: "Cana Alberona",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/cana.webp",
        stats: {
            leadership: 72,
            power: 72,
            utility: 88,
            speed: 60,
            iq: 75,
            defense: 60
        }
    },
    {
        id: "mavis-vermillion",
        name: "Mavis Vermillion",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/mavis.webp",
        stats: {
            leadership: 99,
            power: 45,
            utility: 98,
            speed: 25,
            iq: 99,
            defense: 35
        }
    },
    {
        id: "sting-eucliffe",
        name: "Sting Eucliffe",
        anime: "Fairy Tail",
        imageUrl: "/draft/fairytail/sting.jpg",
        stats: {
            leadership: 82,
            power: 90,
            utility: 72,
            speed: 88,
            iq: 72,
            defense: 82
        }
    },
    // Fate
    {
        id: "artoria-pendragon",
        name: "Saber",
        anime: "Fate",
        imageUrl: "/draft/fate/saber.avif",
        stats: {
            leadership: 98,
            power: 95,
            utility: 82,
            speed: 88,
            iq: 82,
            defense: 95
        }
    },
    {
        id: "shirou-emiya",
        name: "Shirou Emiya",
        anime: "Fate",
        imageUrl: "/draft/fate/emiya.jpg",
        stats: {
            leadership: 85,
            power: 82,
            utility: 88,
            speed: 75,
            iq: 80,
            defense: 82
        }
    },
    {
        id: "gilgamesh",
        name: "Gilgamesh",
        anime: "Fate",
        imageUrl: "/draft/fate/gilgamesh.webp",
        stats: {
            leadership: 92,
            power: 95,
            utility: 99,
            speed: 88,
            iq: 95,
            defense: 90
        }
    },
    {
        id: "kiritsugu-emiya",
        name: "Kiritsugu Emiya",
        anime: "Fate",
        imageUrl: "/draft/fate/kiritsugu.png",
        stats: {
            leadership: 78,
            power: 82,
            utility: 92,
            speed: 88,
            iq: 95,
            defense: 72
        }
    },
    // Fire Force
    {
        id: "shinra-kusakabe",
        name: "Shinra Kusakabe",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/shinra.jpg",
        stats: {
            leadership: 82,
            power: 97,
            utility: 82,
            speed: 99,
            iq: 75,
            defense: 88
        }
    },
    {
        id: "arthur-boyle",
        name: "Arthur Boyle",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/arthur.png",
        stats: {
            leadership: 40,
            power: 97,
            utility: 35,
            speed: 88,
            iq: 20,
            defense: 90
        }
    },
    {
        id: "benimaru-shinmon",
        name: "Benimaru Shinmon",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/benimaru.jpg",
        stats: {
            leadership: 95,
            power: 99,
            utility: 85,
            speed: 92,
            iq: 88,
            defense: 95
        }
    },
    {
        id: "joker",
        name: "Joker",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/joker.jpg",
        stats: {
            leadership: 72,
            power: 92,
            utility: 90,
            speed: 95,
            iq: 95,
            defense: 82
        }
    },
    {
        id: "sho-kusakabe",
        name: "Sho Kusakabe",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/sho.jpg",
        stats: {
            leadership: 45,
            power: 95,
            utility: 82,
            speed: 99,
            iq: 78,
            defense: 85
        }
    },
    {
        id: "akitaru-obi",
        name: "Akitaru Obi",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/obi.webp",
        stats: {
            leadership: 99,
            power: 72,
            utility: 55,
            speed: 55,
            iq: 82,
            defense: 90
        }
    },
    {
        id: "princess-hibana",
        name: "Princess Hibana",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/hibana.webp",
        stats: {
            leadership: 82,
            power: 82,
            utility: 95,
            speed: 68,
            iq: 90,
            defense: 65
        }
    },
    {
        id: "maki-oze",
        name: "Maki Oze",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/maki.jpg",
        stats: {
            leadership: 82,
            power: 88,
            utility: 85,
            speed: 75,
            iq: 75,
            defense: 88
        }
    },
    {
        id: "takehisa-hinawa",
        name: "Takehisa Hinawa",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/hinawa.webp",
        stats: {
            leadership: 90,
            power: 85,
            utility: 88,
            speed: 75,
            iq: 95,
            defense: 82
        }
    },
    {
        id: "charon",
        name: "Charon",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/charon.webp",
        stats: {
            leadership: 55,
            power: 97,
            utility: 65,
            speed: 75,
            iq: 60,
            defense: 99
        }
    },
    {
        id: "haumea",
        name: "Haumea",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/haumea.webp",
        stats: {
            leadership: 82,
            power: 90,
            utility: 99,
            speed: 82,
            iq: 95,
            defense: 75
        }
    },
    {
        id: "kurono",
        name: "Kurono",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/kurono.jpg",
        stats: {
            leadership: 30,
            power: 96,
            utility: 72,
            speed: 92,
            iq: 82,
            defense: 82
        }
    },
    {
        id: "leonard-burns",
        name: "Leonard Burns",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/burns.webp",
        stats: {
            leadership: 95,
            power: 95,
            utility: 72,
            speed: 75,
            iq: 82,
            defense: 95
        }
    },
    {
        id: "dragon",
        name: "Dragon",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/dragon.webp",
        stats: {
            leadership: 45,
            power: 99,
            utility: 25,
            speed: 88,
            iq: 55,
            defense: 99
        }
    },
    {
        id: "evangelist",
        name: "The Evangelist",
        anime: "Fire Force",
        imageUrl: "/draft/fireforce/evangelist.webp",
        stats: {
            leadership: 99,
            power: 99,
            utility: 99,
            speed: 90,
            iq: 99,
            defense: 95
        }
    },
    // Gintama
    {
        id: "gintoki-sakata",
        name: "Gintoki Sakata",
        anime: "Gintama",
        imageUrl: "/draft/gintama/gintoki.jpeg",
        stats: {
            leadership: 92,
            power: 88,
            utility: 75,
            speed: 82,
            iq: 88,
            defense: 85
        }
    },
    {
        id: "kagura",
        name: "Kagura",
        anime: "Gintama",
        imageUrl: "/draft/gintama/kagura.jpg",
        stats: {
            leadership: 65,
            power: 90,
            utility: 45,
            speed: 82,
            iq: 55,
            defense: 90
        }
    },
    {
        id: "shinpachi-shimura",
        name: "Shinpachi Shimura",
        anime: "Gintama",
        imageUrl: "/draft/gintama/shinpachi.webp",
        stats: {
            leadership: 75,
            power: 50,
            utility: 45,
            speed: 55,
            iq: 72,
            defense: 50
        }
    },
    // Vinland Saga
    {
        id: "thorfinn",
        name: "Thorfinn",
        anime: "Vinland Saga",
        imageUrl: "/draft/vinlandsaga/thorfinn.jpg",
        stats: {
            leadership: 55,
            power: 82,
            utility: 45,
            speed: 85,
            iq: 78,
            defense: 72
        }
    },
    {
        id: "askeladd",
        name: "Askeladd",
        anime: "Vinland Saga",
        imageUrl: "/draft/vinlandsaga/askeladd.webp",
        stats: {
            leadership: 98,
            power: 78,
            utility: 75,
            speed: 82,
            iq: 98,
            defense: 72
        }
    },
    // Solo Leveling
    {
        id: "sung-jinwoo",
        name: "Sung Jin-Woo",
        anime: "Solo Leveling",
        imageUrl: "/draft/sololeveling/jinwoo.png",
        stats: {
            leadership: 98,
            power: 99,
            utility: 99,
            speed: 99,
            iq: 92,
            defense: 98,
        },
    },
    {
        id: "cha-haein",
        name: "Cha Hae-In",
        anime: "Solo Leveling",
        imageUrl: "/draft/sololeveling/chahaein.webp",
        stats: {
            leadership: 75,
            power: 88,
            utility: 65,
            speed: 90,
            iq: 78,
            defense: 80,
        },
    },
    {
        id: "go-gunhee",
        name: "Go Gun-Hee",
        anime: "Solo Leveling",
        imageUrl: "/draft/sololeveling/gogunhee.webp",
        stats: {
            leadership: 95,
            power: 82,
            utility: 75,
            speed: 40,
            iq: 90,
            defense: 72,
        },
    },
    {
        id: "beru",
        name: "Beru",
        anime: "Solo Leveling",
        imageUrl: "/draft/sololeveling/beru.jpg",
        stats: {
            leadership: 70,
            power: 95,
            utility: 82,
            speed: 95,
            iq: 82,
            defense: 90,
        },
    },
    {
        id: "igris",
        name: "Igris",
        anime: "Solo Leveling",
        imageUrl: "/draft/sololeveling/igris.webp",
        stats: {
            leadership: 85,
            power: 92,
            utility: 70,
            speed: 88,
            iq: 80,
            defense: 92,
        },
    },
    // Frieren
    {
        id: "frieren",
        name: "Frieren",
        anime: "Frieren: Beyond Journey's End",
        imageUrl: "/draft/frieren/frieren.webp",
        stats: {
            leadership: 75,
            power: 97,
            utility: 99,
            speed: 88,
            iq: 99,
            defense: 88,
        },
    },
    {
        id: "fern",
        name: "Fern",
        anime: "Frieren: Beyond Journey's End",
        imageUrl: "/draft/frieren/fern.png",
        stats: {
            leadership: 72,
            power: 90,
            utility: 88,
            speed: 92,
            iq: 88,
            defense: 78,
        },
    },
    {
        id: "stark",
        name: "Stark",
        anime: "Frieren: Beyond Journey's End",
        imageUrl: "/draft/frieren/stark.jpg",
        stats: {
            leadership: 68,
            power: 88,
            utility: 35,
            speed: 72,
            iq: 55,
            defense: 95,
        },
    },
    {
        id: "himmel",
        name: "Himmel",
        anime: "Frieren: Beyond Journey's End",
        imageUrl: "/draft/frieren/himmel.avif",
        stats: {
            leadership: 99,
            power: 88,
            utility: 75,
            speed: 90,
            iq: 88,
            defense: 82,
        },
    },
    // Jojo's Bizarre Adventures
    {
        id: "jotaro-kujo",
        name: "Jotaro Kujo",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/jotaro.webp",
        stats: {
            leadership: 88,
            power: 96,
            utility: 92,
            speed: 95,
            iq: 92,
            defense: 92,
        },
    },
    {
        id: "dio-brando",
        name: "DIO",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/dio.jpg",
        stats: {
            leadership: 92,
            power: 97,
            utility: 95,
            speed: 95,
            iq: 88,
            defense: 95,
        },
    },
    {
        id: "joseph-joestar",
        name: "Joseph Joestar",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/joseph.jpg",
        stats: {
            leadership: 90,
            power: 72,
            utility: 95,
            speed: 75,
            iq: 99,
            defense: 72,
        },
    },
    {
        id: "josuke-higashikata",
        name: "Josuke Higashikata",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/josuke.webp",
        stats: {
            leadership: 85,
            power: 88,
            utility: 95,
            speed: 82,
            iq: 78,
            defense: 90,
        },
    },
    {
        id: "giorno-giovanna",
        name: "Giorno Giovanna",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/giorno.webp",
        stats: {
            leadership: 98,
            power: 95,
            utility: 99,
            speed: 90,
            iq: 95,
            defense: 92,
        },
    },
    {
        id: "jolyne-cujoh",
        name: "Jolyne Cujoh",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/jolyne.webp",
        stats: {
            leadership: 88,
            power: 88,
            utility: 92,
            speed: 88,
            iq: 85,
            defense: 82,
        },
    },
    {
        id: "johnny-joestar",
        name: "Johnny Joestar",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/johnny.webp",
        stats: {
            leadership: 82,
            power: 98,
            utility: 95,
            speed: 82,
            iq: 88,
            defense: 85,
        },
    },
    {
        id: "gyro-zeppeli",
        name: "Gyro Zeppeli",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/gyro.jpg",
        stats: {
            leadership: 92,
            power: 88,
            utility: 98,
            speed: 82,
            iq: 95,
            defense: 82,
        },
    },
    {
        id: "kira-yoshikage",
        name: "Yoshikage Kira",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/kira.avif",
        stats: {
            leadership: 45,
            power: 92,
            utility: 98,
            speed: 82,
            iq: 95,
            defense: 82,
        },
    },
    {
        id: "diavolo",
        name: "Diavolo",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/diavolo.jpg",
        stats: {
            leadership: 82,
            power: 95,
            utility: 98,
            speed: 95,
            iq: 90,
            defense: 88,
        },
    },
    {
        id: "enrico-pucci",
        name: "Enrico Pucci",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/enrico.jpg",
        stats: {
            leadership: 95,
            power: 95,
            utility: 99,
            speed: 99,
            iq: 95,
            defense: 88,
        },
    },
    {
        id: "risotto-nero",
        name: "Risotto Nero",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/risotto.png",
        stats: {
            leadership: 82,
            power: 88,
            utility: 98,
            speed: 92,
            iq: 88,
            defense: 72,
        },
    },
    {
        id: "bruno-bucciarati",
        name: "Bruno Bucciarati",
        anime: "JoJo's Bizarre Adventure",
        imageUrl: "/draft/jojo/bruno.jpg",
        stats: {
            leadership: 99,
            power: 88,
            utility: 95,
            speed: 85,
            iq: 90,
            defense: 85,
        },
    },
];