import Link from "next/link";

async function getBannerData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner/frontend`, {
      cache: "no-store",  
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        Accept: "application/json",
      },
      agent: new (require("https").Agent)({ rejectUnauthorized: false }), 
    });

    if (!res.ok) {
      throw new Error("Failed to fetch banner");
    }

    const data = await res.json();
    return data.result?.length > 0 ? data.result[0] : null;
  } catch (err) {
    console.log("Error fetching banner:", err);
    return null;
  }
}

export default async function Banner() {
  const bannerData = await getBannerData();

  if (!bannerData) {
    return <div className="banner-sec p-10 mt-[150px] mb-10 text-center text-red-500">Failed to load banner.</div>;
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}${bannerData.BannerImage}`;

  return (
    <section className="banner-sec -p-10 mt-[150px] mb-10">
      <div className="container">
        <div className={`banner-inner pb-10 bg-cover`} style={{ backgroundImage: `url(${imageUrl})` }}>
          <div className="banner-content pb-10 ">
            <span>Iconic Paintings by Legendary Artists</span>
            <h1>Current Art Collection Highlights</h1>
            <p className="mb-6">Discover The World Through Original Pantings For Sale</p>
            <Link href="/products" className="primary-btn pb-6 mb-10">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

