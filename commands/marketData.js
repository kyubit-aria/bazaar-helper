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
        await $.get( process.env.GET_HTTP, function( data )
        {
            
            let currentElement;
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
            interaction.reply(`${currentElement.quick_status.productId}
                Sell Price: ${currentElement.quick_status.sellPrice}
                Sell Volume: ${currentElement.quick_status.sellVolume}
                Buy Price: ${currentElement.quick_status.buyPrice}
                Buy Volume: ${currentElement.quick_status.buyVolume}`);
        }
        ,'json'
        );
    },
}