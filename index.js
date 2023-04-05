const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const configuration = new Configuration({
  // apiKey: "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",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const textGeneration = async (prompt) => {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Human: ${prompt}\nAI: `,
      temperature: 0.9,
      max_tokens: 500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: ["Human:", "AI:"],
    });

    return {
      status: 1,
      response: `${response.data.choices[0].text}`,
    };
  } catch (error) {
    return {
      status: 0,
      response: "",
    };
  }
};

const webApp = express();

const PORT = 3080;

webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());
webApp.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
webApp.use((req, res, next) => {
  console.log(`Path ${req.path} with Method ${req.method}`);
  next();
});

webApp.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.sendStatus(200);
});

webApp.post("/dialogflow", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let action = req.body.queryResult.action;
  let queryText = req.body.queryResult.queryText;

  if (action === "input.unknown") {
    let result = await textGeneration(queryText);
    if (result.status == 1) {
      res.send({
        fulfillmentText: result.response,
      });
    } else {
      res.send({
        fulfillmentText: `Sorry, I'm not able to help with that.`,
      });
    }
  } else {
    res.send({
      fulfillmentText: `No handler for the action ${action}.`,
    });
  }
});

webApp.listen(PORT, () => {
  console.log(`Server is up and running at ${PORT}`);
});
