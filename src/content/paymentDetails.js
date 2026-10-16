// Where customers send their bank transfer. Put this file at: src/content/paymentDetails.js
//
// Fill in Morayo's account below. Until accountNumber is filled in, the checkout shows a
// "payment details not available yet" notice and the submit button stays disabled, so
// customers can never be shown blank or placeholder account details.

export const BANK = {
  bankName: "OPAY DIGITAL BANK",
  accountName: "Karimot Morayo Hassan",
  accountNumber: "8185128390",
};

export const CHECKOUT = {
  // DRAFT: Morayo to confirm both of these before going live.
  verificationTime: "within 24 hours",
  deliveryNote:
    "Delivery fee is not included in this amount. Morayo will confirm it with you on WhatsApp.",
};
