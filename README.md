# 🤖 Skynet Discord Bot

Bot Discord simple avec Slash Commands.

## 📦 Installation

```bash
npm install
```

## 🚀 Démarrage rapide

### Version simple (recommandée pour débuter) :

```bash
# Compiler
npx tsc

# Lancer le bot
node build/simple-bot.js
```

### Version complète (avec modules) :

```bash
node build/index.js
```

### Mode démo (test sans Discord) :

```bash
node build/index.js --demo
```

## 📝 Commandes disponibles

Une fois le bot en ligne, tapez `/` dans Discord :

- `/hello [nom]` - Le bot vous dit bonjour
- `/ping` - Teste la latence du bot
- `/calc nombre1 nombre2` - Additionne deux nombres

## ⚙️ Configuration

Le fichier `src/config.json` contient :

```json
{
  "token": "VOTRE_TOKEN_BOT",
  "channelId": "ID_DU_CANAL"
}
```

## 📚 Structure du projet

```
skynet/
├── src/
│   ├── simple-bot.ts       ← Bot simple (1 fichier)
│   ├── index.ts            ← Bot complet (architecture modulaire)
│   ├── commands/           ← Gestionnaire de commandes
│   ├── modules/            ← Modules (Math, Storage, User, Discord)
│   └── types/              ← Types TypeScript
├── build/                  ← Code compilé
└── package.json
```

## 🎯 Ajouter une nouvelle commande

Dans `src/simple-bot.ts` :

### 1. Définir la commande (section 3)

```typescript
new SlashCommandBuilder()
    .setName('macommande')
    .setDescription('Description de ma commande')
    .addStringOption(option =>
        option
            .setName('parametre')
            .setDescription('Un paramètre')
            .setRequired(true)
    ),
```

### 2. Gérer la commande (section 6)

```typescript
case 'macommande': {
    const param = interaction.options.getString('parametre', true);
    await interaction.reply(`Vous avez envoyé : ${param}`);
    break;
}
```

### 3. Recompiler et relancer

```bash
npx tsc
node build/simple-bot.js
```

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

### Les commandes n'apparaissent pas

- Attendez 1-2 minutes (synchronisation Discord)
- Vérifiez que le bot a les permissions `applications.commands`
- Tapez `/` pour forcer le rafraîchissement

### "Used disallowed intents"

- Ce bot n'utilise PAS les intents privilégiés
- Si l'erreur persiste, utilisez `simple-bot.ts` qui est plus léger

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
