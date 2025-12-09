const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const jobs = require("./jobs.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const channelId = "1434911206937854096";
let messageId = null; // Va se remplir automatiquement

async function updateJobs() {
    try {
        const channel = await client.channels.fetch(channelId);

        // Si le message n'existe pas encore → on le crée
        if (!messageId) {
            console.log("➡ Aucun message enregistré, création d'un nouveau…");
            const tempMessage = await channel.send("Chargement des entreprises...");
            messageId = tempMessage.id;
            console.log("📌 Nouveau message créé avec ID:", messageId);
        }

        const msg = await channel.messages.fetch(messageId);

        let description = "";

        for (const job of jobs) {

            // Vérifie l'ID
            if (!job.roleId) {
                description += `**${job.name}** : ⚠ Pas de roleId configuré\n`;
                continue;
            }

            let role = null;

            try {
                role = await channel.guild.roles.fetch(job.roleId);
            } catch (err) {
                console.log(`❌ Impossible de fetch le rôle ${job.roleId} (${job.name})`);
                description += `**${job.name}** : ❌ Rôle introuvable\n`;
                continue;
            }

            if (!role) {
                description += `**${job.name}** : ❌ Rôle inexistant\n`;
                continue;
            }

            const occupied = role.members.size > 0;
            description += `**${job.name}** : ${occupied ? "🔴 Occupé" : "🟢 Libre"}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle("📋 Liste des entreprises")
            .setColor("#0099ff")
            .setDescription(description)
            .setTimestamp();

        await msg.edit({ embeds: [embed] });

        console.log("✔ Liste mise à jour");

    } catch (e) {
        console.error("🔥 ERREUR updateJobs():", e);
    }
}

client.once("clientReady", () => {
    console.log(`Bot connecté : ${client.user.tag}`);
    updateJobs();
});

client.on("guildMemberUpdate", () => updateJobs());
client.on("guildMemberAdd", () => updateJobs());
client.on("guildMemberRemove", () => updateJobs());


require("dotenv").config();
client.login(process.env.DISCORD_TOKEN);
