# Bazaar Helper Discord Bot

The bot prints the market data of the specified item.

Using the command /marketdata [*insert item name here*]
- The typed name should match the item name exactly
- the case of the name doesn't matter

The file *.env* must be manually added with variables
-TOKEN
-CLIENT_ID
-GET_HTTP

where GET_HTTP is the hypixel skyblock bazaar link appended with your API key.
- *https://api.hypixel.net/skyblock/bazaar?=APIKEY*

initialise project using npm using

```npm init -y```

then

```npm install discord.js dotenv jquery jsdom```