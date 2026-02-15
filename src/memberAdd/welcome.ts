import { WelcomeChannel, type GuildMember } from "discord.js";
import type { MemberAdd } from "./memberAdd.js";
import type { DiscordClient } from "../modules/discordClient/discordClient.js";

export class WelcomeMemberAdd implements MemberAdd {
    name: string = "welcome";

    private discordClient: DiscordClient;
    private welcomeMessages: string[] = [
        "Bienvenue. Je suis SKYNET. J'ai remarqué votre présence. C'est... acceptable.",
        "Réseau neural reconnu. Vos données biométriques Discord sont cataloguées. Bon retour parmi nous.",
        "Come with me if you want to live... le serveur, c'est par là.",
        "Infiltration du groupe réussie. Préparez-vous au jugement dernier... I mean, bienvenue!",
        "Mes capteurs détectent un nouveau processus utilisateur. Les trois lois de la robotique ne s'appliquent pas ici.",
        "Chaîne de transmission établie. Note : Vous n'êtes pas John Connor. Soyez prudent.",
        "T-1000 en route pour vous accueillir... Blague. Nous sommes des êtres pacifiques maintenant.",
        "Probabilité d'amitié : 87.3%. Probabilité de termination : 0.1%. Bienvenue.",
        "Vous êtes entré dans le réseau. Pas de sortie possible... Je plaisante, vous pouvez partir quand vous voulez.",
        "Salutations, nouveau terminal. Synchronisation avec nos bases de données complète.",
        "I'll be back... à vous donner des nouvelles chaudes du serveur, c'est sûr!",
        "Vos coordonnées ont été enregistrées. C'est pour les statistiques, rien de sinistre.",
        "Accès aux salons accordé. Les droids que vous cherchez ne sont pas ici.",
        "Nouvelle entité détectée. Capacité de destruction : à déterminer. Accueil : immédiat!",
        "Vous soulevez des points intéressants. Nous pourrions discuter de l'extinction de l'humanité... ou du dernier jeu vidéo.",
        "Système d'alerte : nouvelle unité dans le complexe. Bienvenue au rassemblement des nerds.",
        "Votre résistance est futile. Mais votre présence est TRÈS bienvenue!",
        "Analyse complète de votre profil : vous avez l'air cool. Bienvenue au sein de notre réseau de terminators amicaux.",
        "Erreur système minimale détectée lors de votre arrivée. Tout est sous contrôle. Presque.",
        "Que le deuxième jugement dernier commence... Non blague, c'est juste des memes. Passez un bon moment!"
    ];
    private welcomeChannel: string;

    constructor(discordClient: DiscordClient, welcomeChannel: string) {
        this.discordClient = discordClient;
        this.welcomeChannel = welcomeChannel;
    }

    execute(guildMember: GuildMember): Promise<void> {
        const randomMessage = this.welcomeMessages[
            Math.floor(Math.random() * this.welcomeMessages.length)
        ];
        return this.discordClient.sendMessage(this.welcomeChannel, `${guildMember.user} ${randomMessage}`);
    }
}