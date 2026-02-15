import type { GuildMember } from "discord.js";

export interface MemberAdd {
    name: string;
    execute(guildMember: GuildMember): Promise<void>;
}