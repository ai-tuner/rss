
const rssFeeds = [
  {
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128816011.cms",
    source: "ToI - Hyderabad"
  },
  {
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    source: "ToI - Top Stories"
  },
 
  {
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    source: "The Hindu"
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
    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    renderArticles(allItems);

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
        <a href="${item.link}" target="_blank" class="read-link">
          Read Full Article
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

function getImage(item) {
  if (item.enclosure && item.enclosure.link) {
    return `<img src="${item.enclosure.link}" alt="image">`;
  }

  if (item.description && item.description.includes("<img")) {
    const match = item.description.match(/<img[^>]+>/);
    return match ? match[0] : "";
  }

  return "";
}

function cleanDescription(description) {
  return description ? description.replace(/<img[^>]*>/g, "") : "";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString();
}

loadRSS();
