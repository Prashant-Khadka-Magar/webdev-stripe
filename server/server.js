import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import cors from "cors";
dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());

app.use(cors({
  origin:'http://localhost:5500',
}))

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "learn React" }],
  [2, { priceInCents: 20000, name: "learn Css" }],
]);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items:req.body.items.map((item)=>{
        const storeItem=storeItems.get(item.id);
        return {
            price_data:{
                currency:'usd',
                product_data:{
                    name:storeItem.name,
                },
                unit_amount:storeItem.priceInCents
            },
            quantity:item.quantity
        }
      }),   
      success_url: `${process.env.SERVER_URL}/success.html`,
      cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`app is listening on port:${port}`);
});
