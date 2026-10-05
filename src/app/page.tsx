import type { Metadata } from "next";
import Link from "next/link";
import { posts, visuals, practiceAreas, results } from "@/lib/content";
import { NewsList } from "@/components/content";
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};
export default function Home() {
  return (
    <>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(15,29,38,.91),rgba(15,29,38,.22)),url(${visuals.hero})`,
        }}
      >
        <div className="hero-inner">
          <p className="eyebrow">San Francisco · Trial & Appellate Lawyers</p>
          <h1>
            When winning
            <br />
            is the <em>only option.</em>
          </h1>
          <p className="hero-copy">
            A litigation boutique built for high-stakes disputes.
            <br />
            Experienced advocates. Personally invested.
          </p>
          <Link className="button light" href="/practice-areas/">
            Explore our practice <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero-bottom">
          <span>GAW | POE LLP</span>
          <a href="#our-approach">
            A different kind of firm <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <section className="results-strip" aria-label="Selected firm results">
        {results.map((result) => (
          <div key={result.label}>
            <strong>{result.value}</strong>
            <span>{result.label}</span>
          </div>
        ))}
      </section>
      <section className="recognition">
        <p>
          National recognition.
          <br />
          <strong>Boutique attention.</strong>
        </p>
        <span>
          The National
          <br />
          <strong>Law Journal</strong>
        </span>
        {visuals.chambers && (
          <a
            href="https://chambers.com/law-firm/gaw-poe-5:23824568"
            aria-label="Gaw Poe Chambers firm ranking"
          >
            <img
              src={visuals.chambers}
              alt="Chambers ranked firm"
              width="134"
              height="113"
            />
          </a>
        )}
        <span className="super-lawyers">Super Lawyers</span>
      </section>
      <section className="intro content-band" id="our-approach">
        <div className="intro-photo">
          <img
            src={visuals.founders}
            alt="Gaw Poe founders Mark Poe and Randolph Gaw"
          />
          <span>Mark Poe & Randolph Gaw · Founding partners</span>
        </div>
        <div className="intro-copy">
          <p className="eyebrow">A focused firm. A formidable team.</p>
          <h2>
            Respected.
            <br />
            Responsive.
            <br />
            <em>Results.</em>
          </h2>
          <p>
            Gaw | Poe founders Mark Poe and Randolph Gaw are nationally
            recognized litigators who graduated from the same class at Stanford
            Law School. Since starting their boutique firm in 2014, they have
            delivered over $180 million in successful results for their clients.
          </p>
          <Link className="text-link" href="/about/">
            Our story <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section className="practice-section">
        <div className="content-band">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What we do</p>
              <h2>
                Focused on what
                <br />
                <em>matters most.</em>
              </h2>
            </div>
            <p>
              From the first strategic decision to the final appeal, our lawyers
              bring hands-on attention to consequential disputes.
            </p>
          </div>
          <div className="practice-list">
            {practiceAreas.map((p, i) => (
              <Link href={`/${p.path}/`} key={p.path}>
                <span className="index">0{i + 1}</span>
                <h3>{p.title}</h3>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="content-band">
        <div className="section-heading">
          <div>
            <p className="eyebrow">In the news</p>
            <h2>
              The latest from <em>Gaw | Poe.</em>
            </h2>
          </div>
          <Link className="text-link" href="/press/">
            All press <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <NewsList items={posts.slice(0, 3)} />
      </section>
    </>
  );
}
