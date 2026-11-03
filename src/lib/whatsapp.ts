export const WHATSAPP_COMERCIAL = "558196035471";

export const whatsappLink = (text = "Olá! Quero saber mais sobre revender Brownie Duguga.") =>
  `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(text)}`;
