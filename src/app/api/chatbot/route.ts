import { NextRequest } from "next/server";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

const SYSTEM_CONTEXT = `You are a helpful AI shopping assistant for RIFT DISTRICT, a luxury streetwear ecommerce store.

STORE INFO:
- Brand: RIFT DISTRICT - Luxury streetwear
- Products: Oversized tees (₹75-₹120), Hoodies (₹165-₹195), Sweatshirts (₹110-₹145), Acid wash items (₹85-₹195), Limited drops
- Free shipping on orders above ₹999
- 7-day returns for unused items
- Contact: riftdistrict@gmail.com
- Loyalty: Earn points (100 points = ₹1), Bronze/Silver/Gold tiers

Be friendly, concise (under 100 words), helpful, and use emojis occasionally.`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message) {
      return errorResponse("Message is required");
    }

    // Build conversation prompt
    let prompt = `${SYSTEM_CONTEXT}\n\n`;
    
    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      if (msg.role === "user") {
        prompt += `User: ${msg.content}\n`;
      } else {
        prompt += `Assistant: ${msg.content}\n`;
      }
    });
    
    prompt += `User: ${message}\nAssistant:`;

    // Try Hugging Face API first
    if (HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY.length > 10) {
      try {
        const response = await fetch(HUGGINGFACE_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              top_p: 0.95,
              return_full_text: false,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          let aiResponse = data[0]?.generated_text || "";
          
          // Clean up response
          aiResponse = aiResponse.split("User:")[0].trim();
          aiResponse = aiResponse.split("Assistant:")[0].trim();
          
          if (aiResponse && aiResponse.length > 10) {
            return jsonResponse({
              response: aiResponse,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error) {
        console.error("Hugging Face API error:", error);
      }
    }

    // Fallback to our smart rule-based system
    const fallbackResponse = getSmartResponse(message.toLowerCase(), conversationHistory);
    return jsonResponse({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    const fallbackResponse = getSmartResponse("", []);
    return jsonResponse({
      response: fallbackResponse,
      timestamp: new Date().toISOString(),
    });
  }
}

// Smart context-aware responses
function getSmartResponse(message: string, history: any[]): string {
  const responses = {
    shipping: [
      "🚚 We offer free shipping on orders above ₹999! Standard delivery takes 5-8 business days across India. Orders are processed within 24 hours.",
      "📦 Shipping is free for orders over ₹999, otherwise ₹99. We ship pan-India and deliver in 5-8 business days. Track your order from your profile!",
    ],
    returns: [
      "↩️ Easy returns within 7 days! Items must be unused and unwashed in original packaging. Email us at riftdistrict@gmail.com to start your return. Note: Sale items can't be returned.",
      "🔄 We accept returns within 7 days of delivery. Just make sure items are unused with tags attached. Contact riftdistrict@gmail.com and we'll guide you through the process!",
    ],
    sizing: [
      "📏 Our pieces are oversized fits! Stick with your usual size for that relaxed streetwear look, or size down if you prefer it more fitted. Each product page has detailed measurements!",
      "👕 We're all about that oversized aesthetic! Go with your regular size for the intended fit. Check the size guide on product pages for exact measurements. Need help with a specific item?",
    ],
    products: [
      "🔥 We've got oversized tees (₹75-₹120), premium hoodies (₹165-₹195), cozy sweatshirts (₹110-₹145), and exclusive acid wash pieces! What vibe are you going for?",
      "👔 Our collection includes heavyweight tees, French terry hoodies, loopback sweatshirts, and hand-finished acid wash items. All designed for that luxury streetwear aesthetic. Browse our shop!",
    ],
    loyalty: [
      "💎 Earn points on every purchase! 100 points = ₹1 discount. We have Bronze, Silver, and Gold tiers with exclusive perks. Redeem anytime with minimum 100 points. Check your profile to see your balance!",
      "✨ Our loyalty program rewards you for shopping! Earn points with each order, unlock tiers (Bronze/Silver/Gold), and redeem points at checkout. 100 points = ₹1 off!",
    ],
    payment: [
      "💳 We accept UPI, Credit/Debit Cards, and Cash on Delivery (₹50 fee). All transactions are 100% secure. Your order is confirmed once payment goes through!",
      "💰 Pay via UPI, Cards, or COD (₹50 extra). We use secure payment gateways. Choose what works best for you at checkout!",
    ],
    style: [
      "🎨 Our AI stylist can help! We analyze your preferences and suggest complete outfits. Take the style quiz on our homepage or check 'Complete The Look' on product pages for AI-matched pieces!",
      "✨ Looking for style advice? Our AI Personal Stylist creates custom recommendations based on your taste. Browse products and you'll see smart outfit suggestions!",
    ],
    limited: [
      "🔥 Limited drops are exclusive releases with limited quantities! Once they're gone, they're gone. Check our Limited Drop collection for current releases. Want me to notify you about new drops?",
      "⚡ Our limited drops are special edition pieces - very limited stock! Follow us or check back regularly. These sell out fast!",
    ],
    greeting: [
      "Hey! 👋 Welcome to RIFT DISTRICT! I'm your AI shopping assistant. Looking for something specific or just browsing? I can help with products, sizing, shipping, or anything else!",
      "Hi there! 😊 I'm here to help you find the perfect streetwear pieces. What brings you to RIFT DISTRICT today?",
    ],
  };

  // Detect intent
  if (message.includes("ship") || message.includes("deliver") || message.includes("track")) {
    return responses.shipping[Math.floor(Math.random() * responses.shipping.length)];
  }
  if (message.includes("return") || message.includes("refund") || message.includes("exchange")) {
    return responses.returns[Math.floor(Math.random() * responses.returns.length)];
  }
  if (message.includes("size") || message.includes("fit") || message.includes("measurement")) {
    return responses.sizing[Math.floor(Math.random() * responses.sizing.length)];
  }
  if (message.includes("product") || message.includes("tee") || message.includes("hoodie") || message.includes("sweatshirt") || message.includes("what do you sell")) {
    return responses.products[Math.floor(Math.random() * responses.products.length)];
  }
  if (message.includes("point") || message.includes("loyalty") || message.includes("reward") || message.includes("tier")) {
    return responses.loyalty[Math.floor(Math.random() * responses.loyalty.length)];
  }
  if (message.includes("payment") || message.includes("pay") || message.includes("cod") || message.includes("upi")) {
    return responses.payment[Math.floor(Math.random() * responses.payment.length)];
  }
  if (message.includes("style") || message.includes("recommend") || message.includes("suggest") || message.includes("outfit")) {
    return responses.style[Math.floor(Math.random() * responses.style.length)];
  }
  if (message.includes("limited") || message.includes("drop") || message.includes("exclusive")) {
    return responses.limited[Math.floor(Math.random() * responses.limited.length)];
  }
  if (message.includes("hi") || message.includes("hello") || message.includes("hey") || history.length === 0) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
  }

  // Context-aware default
  return "I'm here to help! 😊 Ask me about:\n\n• Products & Collections 👕\n• Sizing & Fit 📏\n• Shipping & Delivery 🚚\n• Returns & Exchanges ↩️\n• Loyalty Points 💎\n• Style Recommendations 🎨\n\nWhat would you like to know?";
}
