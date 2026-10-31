// Content for the policy pages. Put this file at: src/content/policyContent.js
//
// DRAFT: the values in SETTINGS below are proposed defaults. Morayo must confirm
// each one matches how she actually runs the business before the pages go live,
// then update lastUpdated.

export const BUSINESS = {
  name: "Mo_FashionForge",
  owner: "Morayo",
  email: "karimotmorayo2019@gmail.com",
  whatsapp: "+234 818 512 8390",
  whatsappUrl: "https://wa.me/2348185128390",
  hours: "Mon–Sat, 9am–6pm WAT",
};

export const SETTINGS = {
  lastUpdated: "15 October 2026",
  productionTime: "7–14",                // working days, standard orders
  deliveryTime: "2–5 working days",      // after the piece is completed and dispatched
  defectWindow: "48 hours",              // time to report damage or a fault after delivery
  cancelWindow: "24 hours",              // free cancellation, if making has not started
  refundTime: "7 working days",
  retentionMessages: "24 months",        // how long enquiries and messages are kept
};

const B = BUSINESS;
const S = SETTINGS;

// A block is a string (paragraph) or an array of strings (bullet list).
export const POLICIES = {
  privacy: {
    path: "/privacy",
    nav: "Privacy",
    title: "Privacy Policy",
    intro:
      `${B.name} respects your privacy. This policy explains what personal information we collect through this website, how we use it, and the choices you have. It is written to align with the Nigeria Data Protection Act 2023.`,
    sections: [
      {
        heading: "Who we are",
        body: [
          `${B.name} is a handmade crochet fashion brand run by ${B.owner}. We decide how and why your personal information is used, which makes us the "data controller". You can reach us at ${B.email} or on WhatsApp at ${B.whatsapp}.`,
        ],
      },
      {
        heading: "Information we collect",
        body: [
          [
            "Contact form: your name, email address and message.",
            "Custom order requests: your name, email address, phone or WhatsApp number, and your description of the piece you want.",
            "Orders: your name, email address, phone number, delivery address, the items you order and your payment reference.",
            "Photos: pictures of clients wearing our pieces, shown only when the client has agreed.",
            "Technical data: basic details such as browser type and IP address that our hosting provider records automatically when you visit.",
          ],
          "We do not ask for your card number or bank PIN on this website.",
        ],
      },
      {
        heading: "How and why we use it",
        body: [
          [
            "To reply to your messages and enquiries (your consent, and our interest in answering you).",
            "To quote for, make and deliver your order and to handle payment (to carry out our contract with you).",
            "To keep order, payment and tax records (a legal obligation).",
            "To show client photos in our gallery and promote the brand (your consent, which you can withdraw at any time).",
            "To keep the website secure and working (our legitimate interests).",
          ],
          "We do not sell your personal information, and we do not use it for automated decision-making.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "We share information only as far as needed to run the business:",
          [
            "Supabase, which stores our database and the images uploaded to this site.",
            "Our website hosting provider, which delivers the site to your browser.",
            "Payment providers, which process your payments.",
            "Couriers and dispatch riders, who receive your name, phone number and delivery address so they can deliver your order.",
            "Instagram (Meta): the Videos tab of our Gallery page embeds Instagram reels. When you view them, Instagram may collect data under its own privacy policy.",
          ],
          "We may also disclose information where the law requires it.",
        ],
      },
      {
        heading: "Transfers outside Nigeria",
        body: [
          "Some of our service providers store or process data on servers outside Nigeria. When that happens, we use providers that apply appropriate safeguards for personal data, as the Nigeria Data Protection Act requires.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          [
            `Messages and custom order enquiries: up to ${S.retentionMessages} after our last contact, then deleted.`,
            "Order and payment records: as long as needed for accounting, tax and legal purposes.",
            "Gallery photos: until you ask us to remove them or we retire the gallery.",
          ],
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask us to:",
          [
            "show you the personal information we hold about you;",
            "correct anything that is wrong or out of date;",
            "delete your information, or remove your photo from our gallery;",
            "restrict, or object to, how we use it;",
            "give you a copy in a portable format;",
            "stop relying on your consent. This will not affect anything we did before you withdrew it.",
          ],
          `Email ${B.email} and we will aim to reply within 30 days. If you are unhappy with how we handle your information, you can complain to the Nigeria Data Protection Commission (NDPC) at ndpc.gov.ng.`,
        ],
      },
      {
        heading: "Keeping your information safe",
        body: [
          "Our admin area is password-protected and open only to authorised people. Data travels over encrypted connections and is stored with providers that apply security controls. No online service is completely risk-free, so if you think your information has been misused, please tell us straight away.",
        ],
      },
      {
        heading: "Cookies and third-party content",
        body: [
          "Embedded content such as Instagram videos, and resources such as web fonts, can be loaded from third parties, which may set their own cookies or collect usage data. If we add analytics or advertising tools, we will update this policy and ask for your consent where required.",
        ],
      },
      {
        heading: "Children",
        body: [
          "This website is not aimed at children under 18. If you are under 18, please ask a parent or guardian to place orders or send enquiries for you.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "We may update this policy from time to time. The date at the top of the page shows when it last changed.",
        ],
      },
    ],
  },

  shipping: {
    path: "/shipping",
    nav: "Shipping",
    title: "Shipping Policy",
    lastUpdated: "16 October 2026",
    intro:
      "Every MO_FashionForge piece is thoughtfully handmade to order. Our shipping process includes two stages: production and delivery. Please review the details below to understand what to expect when placing your order.",
    sections: [
      {
        heading: "1. Production Time",
        body: [
          "Each piece is handmade with care to meet our quality standards.",
          [
            `Standard orders: Production takes approximately ${S.productionTime} working days from the date your order is confirmed and any required payment is received.`,
            "Custom orders: Production timelines will be communicated in your order quotation and may vary depending on the design and complexity of the piece.",
            "Rush orders: Expedited production may be available at an additional cost, subject to availability. Please contact us before placing your order to confirm eligibility and timing.",
          ],
          "Please note that production time is separate from delivery time.",
        ],
      },
      {
        heading: "2. Delivery Within Nigeria",
        body: [
          "We deliver orders within Nigeria through trusted courier services and dispatch riders.",
          `Delivery typically takes ${S.deliveryTime} after your piece has been completed and dispatched. Actual delivery times may vary depending on your location and the delivery service used.`,
        ],
      },
      {
        heading: "3. International Shipping",
        body: [
          "International shipping is available upon request. Delivery timelines and shipping costs depend on the destination and the selected shipping service.",
          "Please contact us before placing an international order to confirm availability, estimated delivery time, and shipping fees.",
          "Any applicable import duties, customs charges, and taxes are the responsibility of the customer.",
        ],
      },
      {
        heading: "4. Shipping Fees",
        body: [
          "Shipping fees are calculated based on your delivery location, parcel size, and applicable courier charges.",
          "Your shipping fee will be communicated and confirmed with you before payment. Any applicable shipping charges will be separate from the cost of your item unless otherwise stated.",
        ],
      },
      {
        heading: "5. Order Updates and Tracking",
        body: [
          "We will keep you informed about the progress of your order through WhatsApp or email.",
          "You will receive updates when your piece is completed and when your order is dispatched. Tracking information or dispatch rider details will be provided where available.",
        ],
      },
      {
        heading: "6. Delivery Information",
        body: [
          "To help ensure a smooth delivery, please provide:",
          [
            "Your full and accurate delivery address.",
            "A valid phone number that can be reached on the delivery day.",
            "Any additional directions needed to locate your address.",
          ],
          "Customers are responsible for ensuring that their delivery information is accurate and complete.",
          "If delivery fails because of incorrect details, the recipient's unavailability, or other circumstances within the customer's control, additional redelivery charges may apply.",
        ],
      },
      {
        heading: "7. Delays and Unforeseen Circumstances",
        body: [
          "Although we make every effort to meet our estimated timelines, production or delivery may occasionally be delayed by unforeseen circumstances, including courier disruptions or other events beyond our control.",
          "If we become aware of a significant delay, we will notify you as soon as reasonably possible and provide an updated estimate where available.",
          "We appreciate your patience and understanding, as each MO_FashionForge piece is handmade with care.",
        ],
      },
      {
        heading: "8. Damaged Items During Delivery",
        body: [
          `Please inspect your parcel upon arrival. If your item arrives damaged, contact us and follow the procedures outlined in our Returns Policy within ${S.defectWindow} of delivery.`,
          "Where possible, please provide clear photographs of the parcel and the damaged item to help us assess the issue.",
          "For further information about eligible returns, exchanges, or damage claims, please refer to our Returns Policy.",
        ],
      },
      {
        heading: "9. Contact Us",
        body: [
          "If you have questions about production timelines, shipping fees, delivery updates, or international orders, please contact MO_FashionForge through the contact details provided on our website.",
          "Thank you for choosing MO_FashionForge. We appreciate your support and look forward to delivering a piece made especially for you.",
        ],
      },
    ],
  },

  returns: {
    path: "/returns",
    nav: "Returns",
    title: "Returns Policy",
    intro:
      "Because each piece is handmade to order, our returns policy is different from a regular shop. Please read it before you order.",
    sections: [
      {
        heading: "Made-to-order pieces",
        body: [
          "We cannot accept returns or exchanges for a change of mind, or for fit issues where the piece was made to the measurements or size you gave us. Small colour differences between your screen and the yarn are normal for handmade work.",
        ],
      },
      {
        heading: "If something is wrong",
        body: [
          `If your piece arrives damaged, has a fault in the workmanship, or is not what you ordered, tell us within ${S.defectWindow} of receiving it. Send your order reference and clear photos by WhatsApp or email. After we review it, we will offer a repair, a remake or a refund, depending on what is practical.`,
        ],
      },
      {
        heading: "Cancelling an order",
        body: [
          `You can cancel for a full refund within ${S.cancelWindow} of confirming your order, as long as we have not started making it. Once making has started, the deposit on a custom order is non-refundable because the materials and work are already committed.`,
        ],
      },
      {
        heading: "Custom orders",
        body: [
          "Custom pieces are made to your brief and cannot be returned or resold, so please confirm sizes, colours and design details before paying your deposit. Faults are handled as described under \"If something is wrong\".",
        ],
      },
      {
        heading: "Refunds",
        body: [
          `Approved refunds go back to the original payment method within ${S.refundTime}.`,
        ],
      },
      {
        heading: "Your legal rights",
        body: [
          "Nothing in this policy takes away the rights you have under Nigerian consumer protection law.",
        ],
      },
    ],
  },

  faq: {
    path: "/faq",
    nav: "FAQ",
    title: "Frequently Asked Questions",
    intro: "Quick answers about ordering, sizing, delivery and care.",
    faq: [
      {
        q: "How do I order?",
        a: "Pick a piece in the Shop, then message Morayo on WhatsApp or through the Contact page with the piece's name and your size. Online checkout is coming soon.",
      },
      {
        q: "How long does an order take?",
        a: `Standard pieces take about ${S.productionTime} working days to make, plus delivery time. For custom orders, your quote will confirm the timeline.`,
        link: { to: "/shipping", label: "Read the Shipping Policy" },
      },
      {
        q: "Can I order a custom piece?",
        a: "Yes. Describe what you have in mind on the Custom Orders page. Morayo replies with a quote and timeline within 48 hours. Custom pricing starts from ₦30,000 and is quoted after your brief.",
        link: { to: "/custom-orders", label: "Start a custom order" },
      },
      {
        q: "How does payment work for custom orders?",
        a: "Custom orders need a 70% deposit upfront, with the remaining 30% due before delivery.",
      },
      {
        q: "Can I choose my own colours?",
        a: "Yes. Custom colours are available on request. You can share Pantone codes, yarn swatches or reference photos.",
      },
      {
        q: "How do I get the right size?",
        a: "Morayo guides you through taking measurements once you enquire. Pieces are made to the measurements you give, so please take them carefully.",
      },
      {
        q: "How should I care for my crochet piece?",
        a: "Hand wash gently in cool water with mild detergent, press out the water without wringing, and dry flat. Avoid hanging it wet, because the weight can stretch the stitches. Store it folded.",
      },
      {
        q: "Where do you deliver?",
        a: "We deliver across Nigeria by courier or dispatch rider, and internationally on request.",
        link: { to: "/shipping", label: "Read the Shipping Policy" },
      },
      {
        q: "Can I return a piece?",
        a: `Pieces are made to order, so we cannot take returns for a change of mind. If something arrives damaged or faulty, tell us within ${S.defectWindow} and we will put it right.`,
        link: { to: "/returns", label: "Read the Returns Policy" },
      },
      {
        q: "What happens to the details I send you?",
        a: "We use them only to reply to you, make and deliver your order, and keep our records. We never sell them.",
        link: { to: "/privacy", label: "Read the Privacy Policy" },
      },
      {
        q: "Can my photo be featured in the gallery?",
        a: "Only if you say yes. If you change your mind later, message us and we will remove it.",
      },
    ],
  },
};

export const POLICY_ORDER = ["privacy", "shipping", "returns", "faq"];
