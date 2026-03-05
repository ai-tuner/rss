
const rssFeeds = [

  {
    url: "https://www.thehindu.com/news/international/feeder/default.rss",
    source: "The Hindu - World"
  },

{
  url: "https://www.livemint.com/rss/news",
  source: "LiveMint - News"
},

{
  url: "https://www.livemint.com/rss/science",
  source: "Mint - Science"
},


{
  url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  source: "ToI - Top Stories"
},

{
  url: "https://timesofindia.indiatimes.com/rssfeeds/-2128816011.cms",
  source: "ToI - Hyderabad"
},

{
  url: "https://www.thehindu.com/feeder/default.rss",
  source: "The Hindu - Home"
},

{
url: "https://www.oneindia.com/rss/feeds/news-india-fb.xml",
    source: "OneIndia - Top Stories"
  },

{
    url: "https://telanganatoday.com/feed",
    source: "Telangana Today - Hyderabad"
  },

{
  url: "https://www.aninews.in/rss/feed/category/national.xml",
  source: "ANI - National"
}


];

async function loadRSS() {
  try {
    const allItems = [];

    for (let feed of rssFeeds) {
      const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items) {
        data.items.forEach(item => {
          item.sourceName = feed.source;
        });
        allItems.push(...data.items);
      }
    }

    // Sort by newest first
    const now = Date.now();
const twelveHours = 12 * 60 * 60 * 1000;

const recentItems = allItems.filter(item => {
  const pubTime = new Date(item.pubDate).getTime();
  return (now - pubTime) <= twelveHours;
});

renderArticles(recentItems.slice(0, 100));

  } catch (error) {
    document.getElementById("rss-reader").innerHTML = "Error loading feeds.";
  }
}

function renderArticles(items) {
  const container = document.getElementById("rss-reader");
  container.innerHTML = "";

  if (!items.length) {
    container.innerHTML = "No articles found.";
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "rss-card";

    const imageHTML = getImage(item);

    card.innerHTML = `
      <div class="rss-image">
        ${imageHTML}
      </div>

      <div class="rss-content">
        <span class="source-badge">${item.sourceName}</span>
        <div class="pub-date">${formatDate(item.pubDate)}</div>
        <h2>${item.title}</h2>
        <p>${cleanDescription(item.description)}</p>
        <a href="#" onclick="loadFullArticle('${item.link}')" class="read-link">
        Read Full Article
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

function getImage(item) {

  // enclosure image
  if (item.enclosure && item.enclosure.link) {
    return `<img src="${item.enclosure.link}" alt="news image"
            onerror="this.src='Latest-News.jpg'">`;
  }

  // image inside description
  if (item.description && item.description.includes("<img")) {
    const match = item.description.match(/<img[^>]+src="([^">]+)"/);

    if (match && match[1]) {
      return `<img src="${match[1]}" alt="news image"
              onerror="this.src='Latest-News.jpg'">`;
    }
  }

  // fallback image
  return `<img src="Latest-News.jpg" alt="default news image">`;
}

async function loadFullArticle(url) {

  const viewer = document.getElementById("article-viewer");
  viewer.innerHTML = "Loading article...";

  try {

    const proxy = "https://api.allorigins.win/raw?url=";
    const response = await fetch(proxy + encodeURIComponent(url));

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const article = new Readability(doc).parse();

    viewer.innerHTML = `
      <h1>${article.title}</h1>
      <div>${article.content}</div>
    `;

  } catch (err) {

    viewer.innerHTML = "Unable to load article.";

  }
}


function cleanDescription(description) {
  return description ? description.replace(/<img[^>]*>/g, "") : "";
}

function formatDate(dateStr) {
  if (!dateStr) return "";

  const now = new Date();
  const date = new Date(dateStr + " UTC");

  const diff = Math.floor((now - date) / 1000);

  const minutes = Math.floor(diff / 60);
  const hours = Math.floor(diff / 3600);
  const days = Math.floor(diff / 86400);

  if (diff < 60) return "Just now";
  if (minutes < 60) return minutes + " min ago";
  if (hours < 24) return hours + " hr ago";
  if (days === 1) return "Yesterday";
  if (days < 7) return days + " days ago";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
}

loadRSS();

