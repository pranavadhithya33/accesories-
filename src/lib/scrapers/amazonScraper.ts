import * as cheerio from "cheerio";

export async function scrapeAmazon(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Amazon page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title
    const title = $("#productTitle").text().trim();

    // Brand
    const brand = $("#bylineInfo").text().trim().replace(/^Visit the | Store|Brand: /gi, "").trim();

    // Price
    let priceText = $(".a-price.a-text-price .a-offscreen").first().text().trim();
    if (!priceText) {
      priceText = $(".a-price .a-offscreen").first().text().trim();
    }
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ""));

    // MRP (Compare at Price)
    let mrpText = $(".a-text-strike").first().text().trim();
    const mrp = mrpText ? parseFloat(mrpText.replace(/[^0-9.]/g, "")) : price;

    // Description
    const descriptionLines: string[] = [];
    $("#feature-bullets ul li:not(.a-hidden)").each((_, el) => {
      const text = $(el).text().trim();
      if (text) descriptionLines.push(text);
    });
    const description = descriptionLines.join("\n\n");

    // Images
    const images: string[] = [];
    const imageScripts = $("script:contains('ImageBlockATF')").text();
    if (imageScripts) {
      try {
        const match = imageScripts.match(/'initial':\s*(\[.*?\])/);
        if (match && match[1]) {
          const parsedImages = JSON.parse(match[1]);
          parsedImages.forEach((img: any) => {
            if (img.hiRes) images.push(img.hiRes);
            else if (img.large) images.push(img.large);
          });
        }
      } catch (e) {
        console.error("Failed to parse Amazon images from script", e);
      }
    }

    // Fallback images
    if (images.length === 0) {
      $("#altImages img").each((_, el) => {
        const src = $(el).attr("src");
        if (src && !src.includes("icon")) {
          // Replace small image suffix with hi-res
          const hiResSrc = src.replace(/\._.*_\./, ".");
          if (!images.includes(hiResSrc)) {
            images.push(hiResSrc);
          }
        }
      });
    }

    return {
      title,
      brand,
      price: isNaN(price) ? 0 : price,
      mrp: isNaN(mrp) ? 0 : mrp,
      description,
      images,
      source: "amazon"
    };
  } catch (error: any) {
    console.error("Amazon scraping error:", error);
    throw new Error(`Failed to scrape Amazon: ${error.message}`);
  }
}
