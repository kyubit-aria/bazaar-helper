const { SlashCommandBuilder } = require("discord.js");
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM();
$ = jQuery = require('jquery')(window)

// Computes characterwise string difference
// if one string is longer than the other
// the sum of the remaining characters is added
// to the difference
function difference(first,toCompare) 
{
    let diff = 0;
    let max_index = Math.min( toCompare.length,first.length)
    let largest_index = Math.max( toCompare.length,first.length)
    
    for(let i = 0 ; i < max_index ; i++) 
    {
        // Add the ascii difference at each position in the string
        diff += Math.abs(first.charCodeAt(i) - toCompare.charCodeAt(i));
    }

    // Add the sum of the ascii values of the remainder
    if(first.length > toCompare.length) {
        for(let j = max_index ; j < largest_index ; j++) 
        {
            diff += first.charCodeAt(j);
        }
    }
    else 
    {
        for(let j = max_index ; j < largest_index ; j++) 
        {
            diff += toCompare.charCodeAt(j);
        }
    }

    return diff;
}

// Computes Word similarity
// hits are weighted twice as heavily than misses
function score(first,toCompare) 
{
    let diff = 0;
    let smaller_index = Math.min( toCompare.length,first.length);
    let larger_index = Math.max( toCompare.length,first.length);

    for(let i = 0 ; i < smaller_index ; i++) 
    {
        if(Math.abs(first.charCodeAt(i) - toCompare.charCodeAt(i)) == 0) 
        {
            diff+=2; // There is an exact match at a position
        } 
        else 
        {
            diff--; // The characters don't match
        }
    }

    // The remaining characters won't match so add the length of remainder
    diff -= Math.abs(smaller_index - larger_index);
    return diff;
}

module.exports = 
{
    data: new SlashCommandBuilder()
        .setName('marketdata')
        .setDescription('gets market data of specified item')
        .addStringOption(option =>
            option.setName('item_name')
                  .setDescription('Type the name as closely as possible')
                  .setRequired(true)
                  .setMaxLength(100)),
    
    async execute(interaction)
    {
        const item = interaction.options.getString('item_name').toUpperCase();
        const { Configuration, OpenAIApi } = require("openai");
        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        
       let thePrompt = '';
       let currentElement;
        await $.get( process.env.GET_HTTP, function( data )
        {   
            let currentScore = 0;
            let bestScore = -1000;
            
            // Find element that matches best to input string
            $.each(data.products, function(index, element)
            {
                currentScore = score(element.quick_status.productId, item);
                if(currentScore > bestScore) 
                {
                    currentElement = element;
                    bestScore = currentScore;
                }
            });
            // Send matched Element Data back
            thePrompt = "Write a short sentence about: " + `${currentElement.quick_status.productId}`.toLowerCase()


        }
        ,'json'
        );

        const messagesTo = [{ role: "user", content: thePrompt }];

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: messagesTo,
            max_tokens: 25,
            temperature: 0.7,
            stop: ['\n', 'User:', 'Bot:']
        });

        console.log(response.data.choices[0].message.content)

        finalResponse = `Product: ${currentElement.quick_status.productId}\n`+
            `\tSell Price: ${currentElement.quick_status.sellPrice}\n` + 
            `\tSell Volume: ${currentElement.quick_status.sellVolume}\n` + 
            `\tBuy Price: ${currentElement.quick_status.buyPrice}\n` +
            `\tBuy Volume: ${currentElement.quick_status.buyVolume}\n` +
            `${response.data.choices[0].message.content}`

        interaction.reply(finalResponse);
    },
}