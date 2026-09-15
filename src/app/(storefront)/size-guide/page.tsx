import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your perfect fit with the AELIA size guide, including custom measurement guidance.",
};

const SIZE_CHART = [
  { size: "XS", bust: '32"', waist: '25"', hips: '35"' },
  { size: "S", bust: '34"', waist: '27"', hips: '37"' },
  { size: "M", bust: '36"', waist: '29"', hips: '39"' },
  { size: "L", bust: '38"', waist: '31"', hips: '41"' },
  { size: "XL", bust: '40"', waist: '33"', hips: '43"' },
  { size: "XXL", bust: '42"', waist: '35"', hips: '45"' },
];

export default function SizeGuidePage() {
  return (
    <div className="container-editorial max-w-3xl py-16 md:py-24">
      <div className="mb-12 text-center">
        <p className="kicker mb-3">Fit Guide</p>
        <h1 className="font-display text-4xl md:text-5xl">Size Guide</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-charcoal/75">
          All measurements are in inches, taken at the fullest part of the bust and hips, and
          the natural waistline.
        </p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="hairline text-left kicker">
            <th className="py-3">Size</th>
            <th className="py-3">Bust</th>
            <th className="py-3">Waist</th>
            <th className="py-3">Hips</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row) => (
            <tr key={row.size} className="border-b border-line/60">
              <td className="py-3 font-medium">{row.size}</td>
              <td className="py-3">{row.bust}</td>
              <td className="py-3">{row.waist}</td>
              <td className="py-3">{row.hips}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="kicker mb-3">How to Measure</p>
          <p className="text-sm leading-relaxed text-charcoal/80">
            Use a soft measuring tape and keep it parallel to the floor. For bust, measure
            around the fullest part. For waist, measure the narrowest point above the navel.
            For hips, measure around the fullest part, roughly 8 inches below the waist.
          </p>
        </div>
        <div>
          <p className="kicker mb-3">Custom Sizing</p>
          <p className="text-sm leading-relaxed text-charcoal/80">
            Between sizes, or want a fully bespoke fit? Select &ldquo;Custom&rdquo; at checkout
            or submit a{" "}
            <a href="/custom-order" className="underline">
              custom order request
            </a>{" "}
            and our team will contact you for a private fitting consultation.
          </p>
        </div>
      </div>
    </div>
  );
}
