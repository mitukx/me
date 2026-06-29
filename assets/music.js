document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("music-list");
  if (!container) return;

  const fallbackItems = [
  {
    "title": "RPG",
    "artist": "SEKAI NO OWARI",
    "album": "SEKAI NO OWARI 2010-2019",
    "duration": "4:47",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/70/62/fa/7062fa33-45c3-2ee4-d381-b9f5b89b421c/TFCC-86713WW.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/rpg/1550926052?i=1550926491"
  },
  {
    "title": "Dragon Night",
    "artist": "SEKAI NO OWARI",
    "album": "Dragon Night - Single",
    "duration": "3:51",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6c/62/3f/6c623fb3-8c57-df63-2493-c213c56dc0e1/Dragon_Night_iT.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/dragon-night/925252932?i=925252943"
  },
  {
    "title": "前前前世 (movie ver.)",
    "artist": "RADWIMPS",
    "album": "君の名は。",
    "duration": "4:46",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/fa/dc/81/fadc81d8-c4d4-0631-c52c-c9e7e7a74d1f/16UMGIM58500.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/%E5%89%8D%E5%89%8D%E5%89%8D%E4%B8%96-movie-ver/1518516628?i=1518516786"
  },
  {
    "title": "打上花火",
    "artist": "DAOKO×米津玄師",
    "album": "打上花火 - Single",
    "duration": "4:49",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a8/cf/1f/a8cf1f9a-d988-7c3d-b618-6ab53d12bc0d/TFCC-89632WW.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/%E6%89%93%E4%B8%8A%E8%8A%B1%E7%81%AB/1263790414?i=1263790415"
  },
  {
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "album": "After Hours (Deluxe)",
    "duration": "3:20",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/03/e1/67/03e167d6-ee05-eb32-55e9-c5040f55a8bf/20UMGIM21166.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/blinding-lights/1505683705?i=1505683988"
  },
  {
    "title": "Hype Boy",
    "artist": "NewJeans",
    "album": "NewJeans 1st EP 'New Jeans'",
    "duration": "2:59",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/9b/6c/d4/9b6cd44b-1cb4-3b78-4ea8-de4b21b36022/22UMGIM83264.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/hype-boy/1636790747?i=1636790753"
  },
  {
    "title": "ETA",
    "artist": "NewJeans",
    "album": "NewJeans 2nd EP 'Get Up'",
    "duration": "2:31",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2e/c2/98/2ec298e1-83d2-c2df-7f95-b52d1ece0627/23UMGIM76839.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/eta/1698275548?i=1698275849"
  },
  {
    "title": "ロードムービー",
    "artist": "高橋優",
    "album": "ロードムービー - EP",
    "duration": "5:23",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d5/51/b7/d551b765-4384-3935-8dd6-26d4b7f1cb9e/190295835385.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/%E3%83%AD%E3%83%BC%E3%83%89%E3%83%A0%E3%83%BC%E3%83%93%E3%83%BC/1218863021?i=1218863058"
  },
  {
    "title": "Homewrecker",
    "artist": "sombr",
    "album": "Homewrecker - Single",
    "duration": "3:29",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/84/bf/fb/84bffb0a-023f-419f-d5f7-6636f4e5d970/054391221933.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/homewrecker/1871595252?i=1871595253"
  },
  {
    "title": "Beauty and a Beat",
    "artist": "Justin Bieber",
    "album": "Believe",
    "duration": "3:48",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/bd/89/97/bd89971c-fc5a-47dd-5e90-a433d1b9e11f/12UMGIM31898.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/beauty-and-a-beat-feat-nicki-minaj/1440804754?i=1440805856"
  },
  {
    "title": "Sign of the Times",
    "artist": "Harry Styles",
    "album": "Harry Styles",
    "duration": "5:41",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3d/5e/aa/3d5eaaa3-9a86-c264-5cd5-7fac83f99a59/886446451978.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/sign-of-the-times/1226034336?i=1226034393"
  },
  {
    "title": "Die For You",
    "artist": "The Weeknd",
    "album": "Starboy",
    "duration": "4:20",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e2/61/f8/e261f8c1-73db-9a7a-c89e-1068f19970e0/16UMGIM67863.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/die-for-you/1440871397?i=1440872304"
  },
  {
    "title": "Save Your Tears",
    "artist": "The Weeknd",
    "album": "After Hours",
    "duration": "3:36",
    "explicit": true,
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6f/bc/e6/6fbce6c4-c38c-72d8-4fd0-66cfff32f679/20UMGIM12176.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/save-your-tears/1499378108?i=1499378613"
  },
  {
    "title": "No. 1 in C major (\"Waterfall\")",
    "artist": "Maurizio Pollini",
    "album": "Chopin - Etudes, Preludes & other works",
    "duration": "1:56",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/0e/09/df/0e09dff9-91f3-c8e6-6603-8ccb369fda75/22UM1IM41835.rgb.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/12%E3%81%AE%E7%B7%B4%E7%BF%92%E6%9B%B2-%E4%BD%9C%E5%93%8110-%E7%AC%AC1%E7%95%AA-%E3%83%8F%E9%95%B7%E8%AA%BF/1658834378?i=1658834769"
  },
  {
    "title": "No. 4 in C-sharp minor (\"Torrent\")",
    "artist": "Idil Biret",
    "album": "ショパン: エチュード Op. 10, 25",
    "duration": "2:12",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music/y2004/m08/d02/h12/s05.aigrjlyq.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/%E3%82%B7%E3%83%A7%E3%83%91%E3%83%B3-%E3%82%A8%E3%83%81%E3%83%A5%E3%83%BC%E3%83%89-%E7%AC%AC4%E7%95%AA-%E5%AC%B0%E3%83%8F%E7%9F%AD%E8%AA%BF-op-10-4/19918145?i=19918074"
  },
  {
    "title": "Clair de Lune",
    "artist": "Claude Debussy",
    "performer": "Irina Mejoueva",
    "album": "Gokujou Piano Tokumori: Teiban Classic Meikyoku Best 50",
    "duration": "5:23",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/46/ba/da/46bada6b-8f5b-e4ea-db4e-8e6b45d7fa73/mzi.lklewgkk.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/%E6%9C%88%E3%81%AE%E5%85%89/418114054?i=418114061"
  },
  {
    "title": "Arabesque No. 1",
    "artist": "Claude Debussy",
    "performer": "François-Joël Thiollier",
    "album": "Debussy: Clair de Lune",
    "duration": "5:07",
    "artwork": "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/28/95/c2/2895c288-d3b5-0b43-822e-1cb3c2f296fa/s05.sgnhchfc.jpg/300x300bb.jpg",
    "url": "https://music.apple.com/jp/album/%E3%83%89%E3%83%93%E3%83%A5%E3%83%83%E3%82%B7%E3%83%BC-%E3%82%A2%E3%83%A9%E3%83%99%E3%82%B9%E3%82%AF%E7%AC%AC1%E7%95%AA/29773727?i=29773544"
  }
];

  const escapeHTML = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const render = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = '<div class="music-placeholder">No tracks yet.</div>';
      return;
    }

    container.innerHTML = items.map((item, index) => {
      const title = escapeHTML(item.title);
      const artist = escapeHTML(item.artist);
      const album = escapeHTML(item.album || "");
      const duration = escapeHTML(item.duration || "");
      const explicit = item.explicit ? '<span class="music-explicit">E</span>' : '';
      const artwork = item.artwork
        ? `<img class="music-artwork" src="${escapeHTML(item.artwork)}" alt="${title} album artwork" loading="lazy" referrerpolicy="no-referrer" />`
        : `<div class="music-dot">${index + 1}</div>`;
      const inner = `
        ${artwork}
        <div class="music-meta">
          <div class="music-title">${title} ${explicit}</div>
          <div class="music-artist">${album ? `${album} — ` : ""}${artist}</div>
        </div>
        ${duration ? `<div class="music-duration">${duration}</div>` : ""}
      `;

      if (item.url) {
        return `<a class="music-item music-link" href="${escapeHTML(item.url)}" target="_blank" rel="noreferrer">${inner}</a>`;
      }

      return `<div class="music-item">${inner}</div>`;
    }).join("");
  };

  // Render immediately, then optionally replace with JSON data if available.
  render(fallbackItems);

  try {
    const response = await fetch("assets/recent-music.json", { cache: "no-store" });
    if (!response.ok) return;

    const items = await response.json();
    if (Array.isArray(items) && items.length > 0) render(items);
  } catch (error) {
    // Keep the static fallback list.
  }
});
