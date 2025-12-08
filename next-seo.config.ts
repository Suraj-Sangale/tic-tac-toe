export default {
    title: "Tic-Tac-Toe Online | Play Single & Multiplayer Game",
    description:
        "Play Tic-Tac-Toe online with beautiful UI and smooth animations. Choose Single Player (vs Computer) or Multiplayer mode to play with friends in real-time.",
    keywords: [
        "tic tac toe",
        "tic tac toe game",
        "play tic tac toe online",
        "xo game",
        "noughts and crosses",
        "tic tac toe multiplayer",
        "tic tac toe single player",
        "tic tac toe next js",
        "real time game",
        "websocket game"
    ],
    openGraph: {
        title: "Tic-Tac-Toe — Single Player & Online Multiplayer",
        description:
            "Play Tic-Tac-Toe online. Single Player (AI bot) and Multiplayer mode with real-time WebSocket support. Fast, responsive and modern UI.",
        url: "https://playtictac.vercel.app",
        type: "website",
        images: [
            {
                url: "https://playtictac.vercel.app/tictactoe-preview.png",
                width: 1200,
                height: 630,
                alt: "Tic Tac Toe Game Preview",
            },
        ],
    },
    twitter: {
        handle: "@yourhandle",
        site: "@yourhandle",
        cardType: "summary_large_image",
    },
    additionalMetaTags: [
        {
            name: "author",
            content: "Suraj Sangale",
        },
        {
            name: "theme-color",
            content: "#000000",
        },
    ],
    additionalLinkTags: [
        {
            rel: "icon",
            href: "/favicon.ico",
        },
    ],

    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
            noimageindex: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};