const { SlashCommandBuilder } = require("discord.js");
const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM();
$ = jQuery = require('jquery')(window)

function difference(first,toCompare) 
{
    let diff = 0;
    let max_index = Math.min( toCompare.length,first.length)
    let largest_index = Math.max( toCompare.length,first.length)
    

    for(let i = 0 ; i < max_index ; i++) 
    {
        diff += Math.abs(first.charCodeAt(i) - toCompare.charCodeAt(i));
    }

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
            
            let currentLowest;
            let currentDifference = 0;
            let lowestDifference = 10000000;
            
            $.each(data.products, function(index, element)
            {
                currentDifference = difference(element.quick_status.productId, item);
                if(currentDifference < lowestDifference) 
                {
                    currentLowest = element;
                    lowestDifference = currentDifference;
                }
            });

            interaction.reply(`${currentLowest.quick_status.productId}
                Sell Price: ${currentLowest.quick_status.sellPrice}
                Sell Volume: ${currentLowest.quick_status.sellVolume}
                Buy Price: ${currentLowest.quick_status.buyPrice}
                Buy Volume: ${currentLowest.quick_status.buyVolume}`);
        }
        ,'json'
        );
    },
}