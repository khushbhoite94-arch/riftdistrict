export const metadata = { title: "Terms & Conditions — RIFT DISTRICT" };

type Block =
  | { type: "text"; text: string }
  | { type: "list"; items: string[] }
  | { type: "subtitle"; text: string };

type Section = {
  title: string;
  blocks: Block[];
};

const sections: Section[] = [
  {
    title: "1. General",
    blocks: [
      {
        type: "text",
        text: "RIFT DISTRICT reserves the right to update, modify, or replace any part of these Terms & Conditions at any time without prior notice. Continued use of the website constitutes acceptance of any changes.",
      },
    ],
  },
  {
    title: "2. Products & Pricing",
    blocks: [
      { type: "text", text: "All products displayed on our website are subject to availability." },
      { type: "text", text: "We reserve the right to:" },
      {
        type: "list",
        items: [
          "Modify product prices without prior notice.",
          "Discontinue products at any time.",
          "Refuse or cancel orders if required.",
        ],
      },
      {
        type: "text",
        text: "While we strive to display product colors and details accurately, actual colors may vary slightly depending on screen settings and lighting conditions.",
      },
    ],
  },
  {
    title: "3. Orders",
    blocks: [
      { type: "text", text: "Once an order is placed, you will receive an order confirmation email." },
      { type: "text", text: "RIFT DISTRICT reserves the right to cancel any order due to:" },
      {
        type: "list",
        items: [
          "Pricing errors",
          "Product unavailability",
          "Suspected fraudulent activity",
          "Incomplete customer information",
        ],
      },
      {
        type: "text",
        text: "If an order is cancelled after payment, a full refund will be processed to the original payment method.",
      },
    ],
  },
  {
    title: "4. Shipping",
    blocks: [
      {
        type: "text",
        text: "Delivery times are estimates and may vary due to courier delays, weather conditions, holidays, or unforeseen circumstances.",
      },
      {
        type: "text",
        text: "Customers are responsible for providing accurate shipping information. RIFT DISTRICT is not responsible for delays or losses caused by incorrect addresses provided by customers.",
      },
    ],
  },
  {
    title: "5. Return, Exchange & Replacement Policy",
    blocks: [
      { type: "subtitle", text: "No Returns" },
      { type: "text", text: "All sales are final." },
      { type: "text", text: "We do not offer refunds or returns for any products once delivered." },
      { type: "subtitle", text: "Size Replacement Only" },
      {
        type: "text",
        text: "We offer replacements only in cases of sizing issues, subject to the following conditions:",
      },
      {
        type: "list",
        items: [
          "Replacement requests must be submitted within 7 days of delivery.",
          "The item must be unworn, unused, unwashed, and in its original condition with all tags attached.",
          "The requested size must be available in stock.",
          "Customers may be required to provide photographs for verification.",
          "Shipping charges for replacement may apply depending on location.",
        ],
      },
      {
        type: "text",
        text: "RIFT DISTRICT reserves the right to reject replacement requests that do not meet the above conditions.",
      },
      { type: "subtitle", text: "Damaged or Incorrect Items" },
      {
        type: "text",
        text: "If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with clear photographs and order details.",
      },
      {
        type: "text",
        text: "Approved claims will be resolved through replacement or another suitable solution at our discretion.",
      },
    ],
  },
  {
    title: "6. Intellectual Property",
    blocks: [
      { type: "text", text: "All content on this website including:" },
      {
        type: "list",
        items: ["Logos", "Graphics", "Product designs", "Images", "Videos", "Text", "Branding"],
      },
      {
        type: "text",
        text: "is the exclusive property of RIFT DISTRICT and may not be copied, reproduced, distributed, or used without written permission.",
      },
    ],
  },
  {
    title: "7. User Conduct",
    blocks: [
      { type: "text", text: "You agree not to:" },
      {
        type: "list",
        items: [
          "Use the website for unlawful purposes.",
          "Attempt to gain unauthorized access to our systems.",
          "Upload malicious software or harmful content.",
          "Interfere with the operation of the website.",
        ],
      },
    ],
  },
  {
    title: "8. Limitation of Liability",
    blocks: [
      {
        type: "text",
        text: "RIFT DISTRICT shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our website, products, or services.",
      },
    ],
  },
  {
    title: "9. Privacy",
    blocks: [
      {
        type: "text",
        text: "Any personal information collected is handled in accordance with our Privacy Policy.",
      },
      {
        type: "text",
        text: "By using our website, you consent to the collection and use of information as described in that policy.",
      },
    ],
  },
  {
    title: "10. Governing Law",
    blocks: [
      {
        type: "text",
        text: "These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India.",
      },
      {
        type: "text",
        text: "Any disputes arising from the use of this website shall be subject to the jurisdiction of the courts located in India.",
      },
    ],
  },
  {
    title: "11. Contact Us",
    blocks: [
      {
        type: "text",
        text: "For any questions regarding these Terms & Conditions, please contact us through the Contact page or our official support channels.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-4 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-32">
            <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-4">Legal</p>
            <h1 className="text-2xl font-bold mb-8">Terms & Conditions</h1>
            <nav className="space-y-2">
              {sections.map((s) => (
                <a
                  key={s.title}
                  href={`#${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="block text-xs text-rift-mist/60 hover:text-rift-orange transition-colors py-1"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <p className="text-sm text-rift-mist/60 leading-relaxed mb-12">
            Last Updated: 31st July 2026. Welcome to RIFT DISTRICT. By accessing or purchasing from our website, you agree to the following Terms & Conditions.
          </p>

          <div className="space-y-12">
            {sections.map((s) => (
              <section key={s.title} id={s.title.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-32">
                <h2 className="text-xl font-bold mb-6">{s.title}</h2>
                <div className="space-y-4">
                  {s.blocks.map((b, i) => {
                    if (b.type === "subtitle") {
                      return (
                        <h3 key={i} className="text-sm font-semibold text-rift-mist/80 tracking-wide pt-2">
                          {b.text}
                        </h3>
                      );
                    }
                    if (b.type === "list") {
                      return (
                        <ul key={i} className="list-disc pl-5 space-y-2">
                          {b.items.map((item) => (
                            <li key={item} className="text-rift-mist/60 leading-relaxed text-sm">
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={i} className="text-rift-mist/60 leading-relaxed text-sm">
                        {b.text}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-20 p-8 glass-card--strong rounded-2xl text-center">
            <p className="text-rift-mist/70 text-sm font-semibold tracking-wide">RIFT DISTRICT®</p>
            <p className="text-rift-mist/50 text-sm mt-1">Built Different.</p>
          </div>
        </div>
      </div>
    </div>
  );
}