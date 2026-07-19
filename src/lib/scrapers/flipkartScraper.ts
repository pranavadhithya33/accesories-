import * as cheerio from "cheerio";

export async function scrapeFlipkart(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Flipkart page: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Title
    const title = $("span.B_NuCI").text().trim() || $("span.VU-Tz5").text().trim() || $(".VU-Tz5").text().trim();

    // Brand (Flipkart usually puts it above the title or in specs)
    let brand = "";
    $(".Gxc2YT").each((_, el) => {
      if ($(el).text().trim().toLowerCase() === "brand") {
        brand = $(el).next().text().trim();
      }
    });

    // Price
    const priceText = $("div._30jeq3._16Jk6d").text().trim() || $("div.Nx9bqj.CxhGGd").text().trim();
    const price = priceText ? parseFloat(priceText.replace(/[^0-9.]/g, "")) : 0;

    // MRP
    const mrpText = $("div._3I9_wc._2p6lqe").text().trim() || $("div.yRaY8j.A6-E6v").text().trim();
    const mrp = mrpText ? parseFloat(mrpText.replace(/[^0-9.]/g, "")) : price;

    // Description & Highlights
    const descriptionLines: string[] = [];
    $("div._2418kt ul li").each((_, el) => {
      descriptionLines.push($(el).text().trim());
    });
    
    // Add product description if available
    const desc = $("div._1mXcCf").text().trim();
    if (desc) descriptionLines.push("\n" + desc);
    
    const description = descriptionLines.join("\n");

    // Images
    const images: string[] = [];
    $("img.q6DClP, img.DByuf4").each((_, el) => {
      const src = $(el).attr("src");
      if (src) {
        // Flipkart thumbnails have 128/128, replace with original resolution
        const hiRes = src.replace(/\/[0-9]+\/[0-9]+\//, "/original/");
        if (!images.includes(hiRes)) {
          images.push(hiRes);
        }
      }
    });

    return {
      title,
      brand,
      price,
      mrp,
      description,
      images,
      source: "flipkart"
    };
  } catch (error: any) {
    console.error("Flipkart scraping error:", error);
    throw new Error(`Failed to scrape Flipkart: ${error.message}`);
  }
}
