# 🤖 Skynet Discord Bot

Bot Discord modulaire avec gestion des tâches cron et surveillance RSS.

## 📋 À propos

**Skynet** est un bot Discord conçu pour automatiser les tâches récurrentes et surveiller les flux RSS. Il intègre :
- 🔄 Un planificateur de tâches cron
- 📡 Un module de surveillance RSS (Geek-o-polis)
- 🕐 Gestion des fuseaux horaires avec heure d'été/hiver
- 💬 Notifications automatiques sur Discord

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Token Discord Bot
- IDs des canaux Discord

### Installation des dépendances

```bash
npm install
```

## ⚙️ Configuration

Créez un fichier `src/config.json` :

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "channelId": "YOUR_LOG_CHANNEL_ID",
  "channelIdLog": "YOUR_LOG_CHANNEL_ID",
  "channelRss": "YOUR_RSS_CHANNEL_ID",
  "channelNewArticle": "YOUR_NEW_ARTICLE_NOTIFICATION_CHANNEL_ID"
}
```

Les flux RSS à surveiller peuvent être configurés dans les modules correspondants.

## 🚀 Démarrage

### Développement (avec compilation TypeScript)

```bash
./run.sh
```

### Production (utiliser le build existant)

```bash
npm run build
node build/index.js
```

## 📚 Structure du projet

```
skynet/
├── src/
│   ├── index.ts                    # Point d'entrée principal
│   ├── config.json                 # Configuration du bot
│   ├── commands/                   # Commandes Discord
│   │   └── command.ts
│   ├── modules/                    # Modules principaux
│   │   ├── discordClient/          # Client Discord
│   │   ├── cronScheduler/          # Planificateur cron
│   │   │   └── models/
│   │   │       └── cronTask.ts     # Interface CronTask
│   │   └── geekOPolis-Rss/         # Module RSS Geek-o-polis
│   │       ├── adapter/in/
│   │       ├── application/
│   │       │   ├── models/
│   │       │   │   └── rssTypes.ts
│   │       │   └── services/
│   │       │       └── searchLastArticleUseCaseImpl.ts
│   │       └── geekOPolis-Rss-Component.ts
│   ├── cronTasks/                  # Tâches cron
│   │   └── newArticle.ts           # Tâche de vérification RSS
│   ├── config/                     # Fichiers de configuration
│   │   └── seenArticles.json       # Articles déjà vus
│   ├── utils/                      # Utilitaires
│   │   └── timeUtils.ts            # Gestion des fuseaux horaires
│   └── types/                      # Types TypeScript
├── build/                          # Code compilé JavaScript
├── tsconfig.json                   # Configuration TypeScript
├── package.json
├── README.md
└── run.sh                          # Script de démarrage
```

## 🔧 Modules

### 1. DiscordClient
Client Discord avec gestion des messages et des slash commands.

**Méthodes principales :**
- `sendMessage(channelId: string, content: string)` - Envoie un message à un canal
- `registerCommand(command: Command)` - Enregistre une slash command
- `registerCommands(commands: Command[])` - Enregistre plusieurs slash commands
- `deployCommands(guildId?: string)` - Déploie les commandes auprès de Discord

### 2. CronScheduler
Planificateur de tâches basé sur node-cron.

**Interface CronTask :**
```typescript
interface CronTask {
  name: string;        // Nom de la tâche
  schedule: string;    // Pattern cron (ex: "*/5 * * * *")
  task: () => Promise<void> | void;  // Fonction à exécuter
}
```

**Exemple d'utilisation :**
```typescript
const cronScheduler = new CronScheduler([
  {
    name: "Mon tâche",
    schedule: "0 9 * * *",  // 9h du matin chaque jour
    task: async () => { /* code */ }
  }
]);
```

### 3. GeekOPolis RSS
Surveille le flux RSS de Geek-o-polis et détecte les nouveaux articles.

**Fonctionnalités :**
- ✅ Détection automatique des nouveaux articles
- ✅ Persistance des articles vus dans `seenArticles.json`
- ✅ Retour typé `CustomItem | null`

**Méthodes :**
- `checkNewArticle(): Promise<CustomItem | null>` - Vérifie les nouveaux articles

### 4. Utilitaires de temps
Gère les fuseaux horaires avec heure d'été/hiver automatique.

**Fonctions :**
- `getLocalTimeString()` - Heure avec zone horaire (ex: "14:30:45 CET")
- `getLocalDateTimeString()` - Date + heure avec zone horaire (ex: "14.02.2026 14:30:45 CET")
- `formatRssDate(dateString)` - Formate une date RSS avec zone horaire

## � Slash Commands

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `/ping` | Teste la latence du bot |
| `/status` | Affiche l'état du bot (uptime, latence, serveurs) |
| `/help` | Affiche la liste des commandes disponibles |

### Ajouter une nouvelle commande

#### 1. Créer le fichier de la commande

Créez un nouveau fichier dans `src/commands/` (ex: `src/commands/mycommand.ts`):

```typescript
import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import type { Command } from "./command.js";

export class MyCommand implements Command {
    data = new SlashCommandBuilder()
        .setName("mycommand")
        .setDescription("Description de ma commande")
        .addStringOption(option =>
            option
                .setName("parametre")
                .setDescription("Un paramètre")
                .setRequired(true)
        );

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const param = interaction.options.getString("parametre", true);
        await interaction.reply({
            content: `Vous avez envoyé : ${param}`,
            ephemeral: true  // Message visible seulement pour vous
        });
    }
}
```

#### 2. Enregistrer la commande dans index.ts

```typescript
import { MyCommand } from "./commands/mycommand.js";

// ...

discordClient.registerCommands([
    new PingCommand(),
    new StatusCommand(),
    new HelpCommand(),
    new MyCommand()  // ← Ajouter ici
]);
```

#### 3. Déployer les commandes

Deux méthodes :

**Option 1 : Déploiement global (recommandé)**
```typescript
await discordClient.deployCommands();
```

**Option 2 : Déploiement sur un serveur spécifique (plus rapide pour le développement)**
```typescript
await discordClient.deployCommands("YOUR_GUILD_ID");
```

### Structure d'une Command

L'interface `Command` requiert :

```typescript
interface Command {
    data: SlashCommandBuilder;  // Configuration slash command Discord
    execute(interaction: ChatInputCommandInteraction): Promise<void>;  // Logique d'exécution
}
```

### Options SlashCommandBuilder courants

```typescript
// String
.addStringOption(option =>
    option
        .setName("name")
        .setDescription("description")
        .setRequired(true)
)

// Integer
.addIntegerOption(option =>
    option
        .setName("name")
        .setDescription("description")
        .setMinValue(1)
        .setMaxValue(100)
)

// Boolean
.addBooleanOption(option =>
    option
        .setName("name")
        .setDescription("description")
)

// Choices
.addStringOption(option =>
    option
        .setName("name")
        .setDescription("description")
        .addChoices(
            { name: "Option 1", value: "option1" },
            { name: "Option 2", value: "option2" }
        )
)
```

## �📅 Tâches cron disponibles

### NewArticle
Vérifie les nouveaux articles du flux RSS Geek-o-polis.

**Configuration :**
- **Fréquence :** Toutes les 10 minutes (modifiable)
- **Action :** Envoie une notification Discord avec le titre, le lien et la date

**Exemple de notification :**
```
📰 **Nouvel Article Détecté sur Geek-o-polis!**

**Titre:** Titre de l'article
**Lien:** https://...
**Date:** 14.02.2026 14:30:45 CET
```

## 🔄 Ajouter une nouvelle tâche cron

### 1. Créer la classe

```typescript
import type { CronTask } from "../modules/cronScheduler/models/cronTask.js";

export class MaTache implements CronTask {
  name: string;
  schedule: string;
  task: () => Promise<void>;

  constructor() {
    this.name = "Ma Tâche";
    this.schedule = "0 * * * *";  // Chaque heure
    this.task = this.executeTask.bind(this);
  }

  private async executeTask(): Promise<void> {
    // Votre code ici
  }
}
```

### 2. Ajouter à index.ts

```typescript
const cronScheduler: CronScheduler = new CronScheduler([
  new NewArticle(...),
  new MaTache()  // ← Ajouter ici
]);
```

## 📝 Patterns cron courants

| Pattern | Description |
|---------|-------------|
| `*/5 * * * *` | Toutes les 5 minutes |
| `0 * * * *` | Chaque heure |
| `0 9 * * *` | Chaque jour à 9h |
| `0 9 * * 1` | Chaque lundi à 9h |
| `0 0 1 * *` | Le 1er de chaque mois à minuit |

## 🔍 Monitorer les articles RSS

Les articles vus sont stockés dans `src/config/seenArticles.json`.

**Format :**
```json
{
  "articles": [
    "guid-or-link-1",
    "guid-or-link-2"
  ]
}
```

Nettoyez ce fichier pour réinitialiser la détection.

## 🐛 Dépannage

### Le bot ne démarre pas
- Vérifiez que le token Discord est correct
- Vérifiez que les IDs de canaux existent

### Les tâches cron ne s'exécutent pas
- Vérifiez le pattern cron (utiliser un validateur en ligne)
- Vérifiez les logs de la tâche

### Les dates ne sont pas correctes
- La zone horaire est configurée pour `Europe/Paris`
- Modifiez `'Europe/Paris'` dans `src/utils/timeUtils.ts` pour votre zone

## 📄 Licence

MIT

## 🔧 Configuration Discord

### 1. Créer une application

- Allez sur https://discord.com/developers/applications
- Cliquez sur "New Application"
- Donnez un nom à votre bot

### 2. Créer le bot

- Onglet "Bot" → "Add Bot"
- Copiez le token dans `src/config.json`

### 3. Inviter le bot

Onglet "OAuth2" → "URL Generator" :

**Scopes :**
- ✅ `bot`
- ✅ `applications.commands`

**Bot Permissions :**
- ✅ Send Messages
- ✅ View Channels

Copiez l'URL générée et ouvrez-la pour inviter le bot sur votre serveur.

## ❓ Dépannage

### Le bot ne se connecte pas

- Vérifiez que le token dans `config.json` est correct
- Le token doit commencer par `MTQ...` ou `OTg...`

## 📖 Ressources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Slash Commands Guide](https://discordjs.guide/interactions/slash-commands.html)

## 🎓 Pour aller plus loin

Le fichier `simple-bot.ts` contient TOUT dans un seul fichier.

Le fichier `index.ts` montre une architecture modulaire :
- `commands/` - Gestion des commandes
- `modules/` - Logique métier séparée
- `types/` - Définitions TypeScript

Commencez avec `simple-bot.ts`, puis passez à l'architecture modulaire quand vous êtes à l'aise !
