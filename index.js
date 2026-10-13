const express = require('express');
const app = express();

app.use(express.json());

// ⚙️ CONFIGURAÇÕES (Substitua pelos seus links)
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1343310462376345610/EDFdeF0Qk2Io6sH1QmANrMvJio42BLp76EE4oHOhL8gqisYLlJ1o0L1EVLGcoIPxuzX7";
const BANNER_IMGUR_URL = "https://i.imgur.com/ZaLTh8R.jpeg"; // Link direto da imagem do Imgur (ex: https://i.imgur.com/abc1234.png)

// Rota padrão para teste de saúde da aplicação
app.get('/', (req, res) => {
  res.send('Servidor de Webhook MisticPay rodando com sucesso!');
});

// Rota que receberá a notificação da MisticPay
app.post('/webhook/misticpay', async (req, res) => {
  try {
    const data = req.body;

    // Log para visualizar no console da DisCloud os dados recebidos
    console.log("Recebido Webhook MisticPay:", JSON.stringify(data));

    /*
      Extração dos dados conforme o padrão MisticPay / Gateways.
      Ajusta conforme os campos exatos do webhook se necessário.
    */
    const clientName = data.client?.name || data.customer_name || data.payer_name || data.buyer_name || "Cliente";
    const productName = data.product?.name || data.item_name || data.product_name || "Produto Digital";
    const rawValue = data.amount || data.price || data.value || 0;
    
    // Formata o valor para R$ (Ex: 25.00 -> R$ 25,00)
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(typeof rawValue === 'number' && rawValue > 100 && !Number.isInteger(rawValue) ? rawValue / 100 : rawValue);

    // Monta a Embed estilizada para o Discord
    const embedPayload = {
      embeds: [
        {
          title: "🛒 Nova Venda Confirmada!",
          color: 0x2b2d31, // Cor do card em hexadecimal (0x2b2d31 = Escuro / 0x00FF00 = Verde)
          fields: [
            {
              name: "👤 Cliente",
              value: `\`${clientName}\``,
              inline: true
            },
            {
              name: "📦 Produto",
              value: `\`${productName}\``,
              inline: true
            },
            {
              name: "💰 Valor Pago",
              value: `\`${formattedValue}\``,
              inline: false
            },
            {
              name: "Avaliação do Cliente",
              value: "⭐⭐⭐⭐⭐ (5.0/5.0)",
              inline: false
            }
          ],
          image: {
            url: BANNER_IMGUR_URL
          },
          timestamp: new Date().toISOString(),
          footer: {
            text: "Pagamento processado via MisticPay"
          }
        }
      ]
    };

    // Envia a mensagem para o Discord
    await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(embedPayload)
    });

    return res.status(200).json({ status: "success", message: "Notificação enviada ao Discord" });

  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

// Porta padrão para a DisCloud
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor iniciado na porta ${PORT}`);
});
