# Review Audit — parser v4.1.0

Generated: 2026-08-29T15:37:56.701Z

> Read-only audit. effects、review decisions、manual overrideは変更していません。reason件数はReview節単位、pattern件数はparser candidate単位です。

> Resolution bucketはpattern単位の推奨です。同じReview節に複数patternがあるため、bucket間のReview節件数は重複する場合があります。

## Summary

- needs_review: 183 sections
- parser candidates: 327 occurrences
- blocking parser candidates: 253 occurrences
- published effects (unchanged): 886
- manual_override review items: 0

## needs_review_reasons

| Reason | Review sections | Candidate occurrences |
|---|---:|---:|
| ambiguous_value | 23 | 26 |
| special_mechanic | 94 | 146 |
| ambiguous_target | 47 | 53 |
| ambiguous_duration | 7 | 7 |
| ambiguous_trigger | 8 | 11 |
| missing_value | 10 | 10 |
| parser_failure | 20 | 29 |
| not_a_buff_candidate | 11 | 11 |

## Reason combinations

| Combination | Review sections |
|---|---:|
| special_mechanic | 80 |
| ambiguous_target | 35 |
| parser_failure | 17 |
| ambiguous_value + not_a_buff_candidate | 8 |
| missing_value | 8 |
| ambiguous_value | 7 |
| ambiguous_duration | 5 |
| special_mechanic + ambiguous_target | 4 |
| ambiguous_target + ambiguous_trigger | 3 |
| ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate | 3 |
| ambiguous_trigger | 2 |
| special_mechanic + ambiguous_duration | 2 |
| ambiguous_target + missing_value | 1 |
| ambiguous_value + ambiguous_target | 1 |
| ambiguous_value + ambiguous_trigger | 1 |
| ambiguous_value + missing_value | 1 |
| ambiguous_value + special_mechanic | 1 |
| ambiguous_value + special_mechanic + parser_failure | 1 |
| special_mechanic + ambiguous_trigger | 1 |
| special_mechanic + ambiguous_trigger + parser_failure | 1 |
| special_mechanic + parser_failure | 1 |

## 既に構造化済みでreview flagだけ除去できそう

8 patterns / 9 candidate occurrences / 8 review sections

| Pattern | Occurrences | Characters | Reasons | Confidence |
|---|---:|---|---|---|
| effect {index}: charge damage ▲ {percent}. | 2 | Ada, Emilia | ambiguous_duration | medium |
| changes the weapon in use: electric power, fully full charge | 1 | Laplace: Ultimate Hero | special_mechanic | medium |
| changes the weapon in use: matis uberbuster | 1 | Maxwell: Ordinary Mechanic | special_mechanic | medium |
| changes the weapon in use: snipe mode | 1 | Cinderella: Crystal Wave | special_mechanic | medium |
| effect {index}: incoming healing ▲ {percent}. | 1 | Emma: Tactical Upgrade | ambiguous_duration | medium |
| heat emission: reload ratio ▼ {percent}. removes heat emission under certain conditions. | 1 | Grave | ambiguous_duration | medium |
| status {number}: if in the assigned part: dancing status, mint gains assigned part: singing. this effect is continuous and cannot be removed. | 1 | Mint | special_mechanic | high |
| status {number}: if not in the assigned part: dancing status, mint gains assigned part: dancing. this effect is continuous and cannot be removed. | 1 | Mint | special_mechanic | high |

## parser rule追加で一括解決できそう

137 patterns / 183 candidate occurrences / 145 review sections

| Pattern | Occurrences | Characters | Reasons | Confidence |
|---|---:|---|---|---|
| atk ▲ {percent} of the skill user's atk for {seconds} sec. | 7 | Crust, Lily, Maiden: Ice Rose, Quiry, Rei Ayanami (Tentative Name) | ambiguous_target + ambiguous_trigger | high |
| atk ▲ {percent} for {seconds} sec. | 5 | iDoll Sun, Privaty, Product 12, Scarlet: Black Shadow, Soda: Twinkling Bunny | parser_failure + ambiguous_value + ambiguous_target | high |
| deals {percent} of final atk as damage. attacks sequentially {number} times. | 4 | Cinderella, EVE, Little Mermaid, Sakura: Bloom in Summer | ambiguous_value + not_a_buff_candidate | high |
| increases the firepower gauge's charge by {number}. | 4 | Neon: Vision Eye | missing_value + special_mechanic | high |
| sustained damage ▲ {percent} for {seconds} sec. | 4 | Ark Ranger Black, Crust, Diesel: Winter Sweets | ambiguous_target | high |
| creates a shared shield with hp equal to {percent} of the skill user's final max hp that protects all allies from damage. lasts for {seconds} sec. | 3 | Blanc, Centi, Poli | ambiguous_value + ambiguous_target + ambiguous_trigger | high |
| decoy: creates an avatar with {percent} of the skill user's final max hp. this effect is continuous. | 3 | Cinderella, Cinderella: Crystal Wave | special_mechanic | high |
| atk ▲ {percent} of the skill user's atk continuously. | 2 | Elegg: Boom and Shock, EVE | special_mechanic + ambiguous_trigger + parser_failure | high |
| camouflage: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit. | 2 | Eunhwa: Tactical Upgrade | special_mechanic | high |
| charges restraint chains by {number}, up to {number}. | 2 | Mihara: Bonding Chain | missing_value | high |
| concealment: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit. | 2 | Rosanna | special_mechanic | high |
| creates a shared shield with hp equal to {percent} of the skill user's final max hp. this effect is continuous. | 2 | Rapunzel: Pure Grace | ambiguous_value | high |
| decoy: creates an avatar with {percent} of the skill user's final max hp that lasts for {seconds} sec. | 2 | Delta, Rei | special_mechanic | high |
| effect {index}: activates when the target is alive. | 2 | Marciana: Marine Study | special_mechanic | high |
| effect {index}: affects self. expends ammo from the ammo pouch. amount: {rounds} rounds(s). | 2 | Velvet | special_mechanic | high |
| effect {number} targets: all allies | 2 | Emma: Tactical Upgrade | special_mechanic | high |
| hit rate ▲ {percent} for {seconds} sec. | 2 | Soda: Twinkling Bunny, Trina | ambiguous_target + ambiguous_trigger | high |
| max ammunition capacity ▼ {percent} for {seconds} sec. | 2 | Anis: Sparkling Summer, Privaty | parser_failure | high |
| note: unable to take cover while using burst skill. | 2 | Laplace, Moran | special_mechanic | high |
| proportionally shares damage taken. this effect is continuous. | 2 | Bay | parser_failure + ambiguous_target + missing_value | high |
| rebuilds cover with {percent} hp. | 2 | Biscuit, Lily | ambiguous_target | high |
| recurring interval: {seconds} sec | 2 | Elegg: Boom and Shock, Emma: Tactical Upgrade | special_mechanic | high |
| reliable cooking: def ▲ {percent} of the skill user's def for {seconds} sec. | 2 | Crust | ambiguous_target | high |
| reload speed ▲ {percent} for {seconds} sec. | 2 | Privaty, Trina | parser_failure + ambiguous_target | high |
| restores hp equal to {percent} of the skill user's final max hp. | 2 | Snow Crane, Soline: Frost Ticket | ambiguous_target | high |
| stage {number}: activates when explore route stage {number} is at max stacks. affects self. | 2 | Quency: Escape Queen | special_mechanic | high |
| stage {number}: activates when golden chip is at {number} or more stacks. affects self. | 2 | Soda: Twinkling Bunny | special_mechanic | high |
| stage {number}: with {number} or more stacks of golden chip, | 2 | Soda: Twinkling Bunny | special_mechanic | high |
| storage: stores excess incoming healing, up to {percent} of the skill user's max hp. lasts for {seconds} sec. | 2 | Anchor: Innocent Maid, Marciana | special_mechanic | high |
| summons {number} near feathers. | 2 | Ein | missing_value + special_mechanic | high |
| activates at the start of battle and upon reloading to max ammunition. affects self. acid ammo function: upon reloading to max ammunition, the first round deals sustained damage to the target. effect: deals {percent} of final atk as sustained damage every second for {seconds} sec. | 1 | Jill | parser_failure | medium |
| affects the target(s) afflicted with anti a.t. field. annihilation function: after annihilation state ends, fires powerful attacks at targets affected by anti a.t. field. deals {percent} of final atk as additional damage. mirrors the stack count of anti a.t. field for certain targets. anti a.t. field status is removed after the effect is triggered. | 1 | Asuka: WILLE | parser_failure | medium |
| aftertaste: deals {percent} of final atk as sustained damage every second for {seconds} sec. | 1 | Bready | special_mechanic | medium |
| atk ▲ ({percent} * number of drunken stacks) of the skill user's atk for {seconds} sec. | 1 | Mast: Romantic Maid | special_mechanic + ambiguous_target | medium |
| attack damage ▲ {percent} for {seconds} sec. | 1 | Trina | ambiguous_target | medium |
| attack speed: ▼ {percent} | 1 | K | ambiguous_duration | medium |
| baton pass: atk ▲ {percent} of the skill user's atk continuously. stacks up to {number} times. | 1 | Queen (Makoto) | ambiguous_target | medium |
| brand: accumulates total damage dealt to the designated enemy during the duration, and then deals that accumulated damage to all enemies as distributed damage once the duration ends. the maximum accumulated damage is {percent} of the skill user's final atk. lasts for {seconds} sec. | 1 | Dorothy | special_mechanic | medium |
| changes full charge attack count required for skill {number} to {number} time/{number} times/{number} times for {seconds} sec. | 1 | Scarlet: Black Shadow | ambiguous_value | medium |
| charge damage ▲ {percent} for {seconds} sec. | 1 | Scarlet: Black Shadow | ambiguous_value | medium |
| charge damage ▲ {percent} for {shots} shots. | 1 | Eunhwa | parser_failure | medium |
| charge speed ▲ {percent} for {rounds} rounds. | 1 | Eunhwa | parser_failure | medium |
| charge speed ▲ {percent} for {seconds} sec. | 1 | Yuni | parser_failure | medium |
| charge speed ▲ {percent} of the skill user's charge speed for {seconds} sec. | 1 | Liberalio | ambiguous_target | medium |
| charge speed ▲ {percent}. removed upon reloading to max ammunition. | 1 | Cinderella | ambiguous_duration | medium |
| charge time ▼ {seconds} sec for {seconds} sec. | 1 | Mana | ambiguous_target | medium |
| cherry blossom tea: {percent} of def. stacks up to {number} times and lasts for {seconds} sec. | 1 | Sakura | special_mechanic | medium |
| converts damage to elemental advantage damage against electric code enemies. this effect is continuous and cannot be removed. | 1 | Rapi: Red Hood | special_mechanic | medium |
| creates a shield with hp equal to {percent} of the the skill user's final max hp that lasts for {seconds} sec. | 1 | Ether | ambiguous_value + not_a_buff_candidate | medium |
| critical damage ▲ {percent}. stacks up to {number} times and lasts for {seconds} sec. | 1 | Modernia | ambiguous_value + special_mechanic + parser_failure | medium |
| critical rate ▲ {percent} for {seconds} sec. | 1 | Scarlet | parser_failure | medium |
| cumulative damage skill active for {seconds} sec. | 1 | Trony | special_mechanic | medium |
| damage to interruption parts ▲{percent} permanently. | 1 | Helm | ambiguous_trigger | medium |
| deals {percent} of final atk as additional damage. mirrors the stack count of beautiful. | 1 | Cinderella | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate | medium |
| deals {percent} of final atk as additional damage. removes calling card. | 1 | Phantom | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate | medium |
| deals {percent} of final atk as burst skill damage. | 1 | iDoll Flower | ambiguous_value + not_a_buff_candidate | medium |
| deals {percent} of final atk as sustained damage every second for {seconds} sec. | 1 | Diesel: Winter Sweets | ambiguous_value + not_a_buff_candidate | medium |
| deals {percent} of final atk as sustained damage every second. stacks up to {number} times and lasts for {seconds} sec. | 1 | Sakura: Bloom in Summer | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate | medium |
| deals fixed damage to the main body equal to {percent} of the damage dealt by self. | 1 | Emilia | ambiguous_value + not_a_buff_candidate | medium |
| decreases the firepower gauge's charge by {number}. | 1 | Neon: Vision Eye | special_mechanic | medium |
| def ▲ {percent} for {seconds} sec. | 1 | iDoll Sun | parser_failure | medium |
| def ▲ {percent} of the skill user's def continuously. | 1 | Bay | parser_failure | medium |
| deploys two missile containers that deal {percent} of final atk as damage to the enemy with the lowest remaining hp every second for {seconds} sec. | 1 | Vesti | ambiguous_value | medium |
| distributed damage ▲ {percent} for {seconds} sec. | 1 | Crust | ambiguous_target | medium |
| distributed damage ▲ {percent} x number of drunken stacks for {seconds} sec. | 1 | Mast: Romantic Maid | special_mechanic | medium |
| duplicates {percent} of the max hp of ally with the highest max hp. lasts for {seconds} sec. | 1 | Sin | special_mechanic | medium |
| duplicates {percent} of the max hp of the nikke with the highest max hp. lasts for {seconds} sec. | 1 | Quency | ambiguous_value | medium |
| eagle eye-type exospine. | 1 | EVE | parser_failure | medium |
| effect {index}: accumulates {percent} of the skill user's atk damage. | 1 | Trony | special_mechanic | medium |
| effect {index}: activates every {seconds} sec. affects all allies. media: restores hp equal to {percent} of the skill user's final max hp. | 1 | Yukiko | special_mechanic | medium |
| effect {index}: activates every {seconds} sec. affects all allies. mediarama: restores hp equal to {percent} of the skill user's final max hp. | 1 | Yukiko | special_mechanic | medium |
| effect {index}: affects all allies from the same squad. critical damage ▲ {percent} continuously. | 1 | Emma: Tactical Upgrade | ambiguous_target | medium |
| effect {index}: affects all allies from the same squad. critical rate ▲ {percent} continuously. | 1 | Eunhwa: Tactical Upgrade | ambiguous_target | medium |
| effect {index}: affects all allies. cooldown of burst skill ▼ {seconds} sec. | 1 | Anis: Star | special_mechanic + ambiguous_trigger + parser_failure | medium |
| effect {index}: affects self. my own star: atk ▲ {percent}. this effect is continuous and cannot be removed. | 1 | Anis: Star | special_mechanic + ambiguous_trigger + parser_failure | medium |
| effect {index}: affects self. recurring interval of environment setup ▼ {seconds} sec continuously. | 1 | Emma: Tactical Upgrade | special_mechanic | medium |
| effect {index}: atk ▲ {percent} continuously x the number of homemade magazines. | 1 | E.H. | special_mechanic | medium |
| effect {index}: deals distributed damage to enemies within the attack range when cumulative damage skill explodes. | 1 | Trony | special_mechanic | medium |
| effect {index}: environment setup: restores hp equal to {percent} of the skill user's final max hp every second for {seconds} sec. | 1 | Emma: Tactical Upgrade | special_mechanic | medium |
| effect {index}: fixes charge time at {seconds} sec continuously. | 1 | Snow White: Heavy Arms | special_mechanic | medium |
| effect {index}: max ammunition capacity ▼ {percent} for {seconds} sec. (similar effects cannot be stacked.) | 1 | K | parser_failure | medium |
| effect {index}: maximum accumulated damage is {percent} of the skill user's final atk. | 1 | Trony | special_mechanic | medium |
| effect {index}: ninjutsu injection: restores hp equal to {percent} of attack damage. this effect is continuous. | 1 | Delta: Ninja Thief | special_mechanic | medium |
| effect {index}: once the duration ends, all allies are healed for the stored recovery amount. | 1 | Delta: Ninja Thief | special_mechanic | medium |
| effect {index}: the "damage taken" multiplier of environment setup is scaled by {percent}. | 1 | Emma: Tactical Upgrade | special_mechanic | medium |
| effect {index}: the maximum amount stored is equal to {percent} of the skill user's final atk. | 1 | Delta: Ninja Thief | special_mechanic | medium |
| effect: the damage multiplier of eagle eye-type exospine is scaled by {percent}. | 1 | EVE | special_mechanic | medium |
| effect: the damage multiplier of unstable energy sequential attacks is scaled by {percent}. | 1 | EVE | special_mechanic | medium |
| elemental advantage attack damage ▲ {percent} continuously. | 1 | Elegg: Boom and Shock | special_mechanic + ambiguous_trigger | medium |
| elemental advantage attack damage ▲ {percent} for {seconds} sec. | 1 | Maiden: Ice Rose | ambiguous_target | medium |
| emergency-crafted bullets: reload {percent} of the magazine(s). | 1 | Tove | ambiguous_trigger | medium |
| ensnaring chains: deals {percent} final atk as sustained damage every second. stacks up to {number} times. this effect is continuous and cannot be removed. | 1 | Mihara: Bonding Chain | special_mechanic | medium |
| extrasensory ▼ {percent}. | 1 | Chisato | special_mechanic | medium |
| firepower charge: charges the firepower gauge for {seconds} sec. this effect cannot be removed. | 1 | Neon: Vision Eye | special_mechanic | medium |
| first damage: {percent} of final atk | 1 | Laplace | special_mechanic | medium |
| fixes charge time at {seconds} sec continuously. | 1 | Snow White: Heavy Arms | parser_failure | medium |
| flash grenade toss activation time condition ▼ {seconds} sec for {seconds} sec. | 1 | Ada | special_mechanic | medium |
| focuses fire continuously. | 1 | Little Mermaid | missing_value | medium |
| follow up: atk ▲ {percent} of the skill user's atk for {seconds} sec. | 1 | Yukiko | ambiguous_target | medium |
| forcefully uses skill {number}. | 1 | Sakura: Bloom in Summer | missing_value | medium |
| full burst duration ▲ {seconds} sec. | 1 | D | ambiguous_target | medium |
| gentle current: fixes charge time at {seconds} sec continuously. | 1 | Liberalio | special_mechanic | medium |
| hit count required for skill {number} ▼ {number} time(s) for {seconds} sec. | 1 | Snow White: Innocent Days | special_mechanic | medium |
| hit rate ▲ {percent} continuously. | 1 | Viper | parser_failure | medium |
| incoming healing ▲ {percent} continuously. stacks up to {number} times. | 1 | Flora | special_mechanic + ambiguous_target | medium |
| incoming healing ▲ {percent}. | 1 | Anne: Miracle Fairy | ambiguous_duration | medium |
| invulnerable for {seconds} sec. activates {number} time(s) per battle. | 1 | Neon: Vision Eye | parser_failure | medium |
| max ammunition capacity ▲ {percent} continuously. | 1 | EVE | parser_failure | medium |
| max ammunition capacity ▲ {rounds} rounds(s) for {seconds} sec. | 1 | Trina | ambiguous_target + ambiguous_trigger | medium |
| max ammunition capacity ▼ {percent}. stacks up to {number} times and lasts for {seconds} sec. | 1 | Modernia | ambiguous_value + special_mechanic + parser_failure | medium |
| max hp ▲ {percent} continuously. | 1 | Quiry | ambiguous_target | medium |
| max hp ▲ {percent} of the skill user's max hp (without restoring hp) continuously. | 1 | Trina | ambiguous_target | medium |
| mind if i borrow this?: duplicates {percent} of the atk of the ally with the highest atk. stacks up to {number} times and lasts for {seconds} sec. | 1 | Guilty | ambiguous_value + special_mechanic | medium |
| next shield's hp ▲ {percent} for {seconds} sec. | 1 | Delta: Ninja Thief | ambiguous_target | medium |
| normal damage: {percent} of final atk | 1 | Laplace | special_mechanic | medium |
| number of pellets ▲ {number} for {seconds} sec. | 1 | Leona | ambiguous_target | medium |
| number of uses of seven dwarves fully active ▼ {number}. | 1 | Snow White: Heavy Arms | special_mechanic | medium |
| only when above {percent}: atk ▲ {percent}. this effect is continuous and cannot be removed. | 1 | Chisato | special_mechanic | medium |
| only when above {percent}: hit rate ▲ {percent}. this effect is continuous and cannot be removed. | 1 | Chisato | special_mechanic | medium |
| only when above {percent}: true damage ▲ {percent}. this effect is continuous and cannot be removed. | 1 | Chisato | special_mechanic | medium |
| only when at {percent}: dodging bullets: invulnerable for {seconds} sec. | 1 | Chisato | special_mechanic + parser_failure | medium |
| previous effects trigger repeatedly. | 1 | EVE | parser_failure | medium |
| projectile explosion damage ▲ {percent} for {seconds} sec. | 1 | Anis: Star | ambiguous_target | medium |
| reload speed ▲ {percent} x number of drunken stacks for {seconds} sec. | 1 | Mast: Romantic Maid | special_mechanic | medium |
| replenishes {number} mp, up to a maximum of {number}. all mp is removed when using burst skill. | 1 | Maiden: Ice Rose | ambiguous_value + missing_value | medium |
| restores hp equal to {percent} of attack damage. lasts for {seconds} sec. | 1 | Signal | parser_failure | medium |
| restores hp equal to {percent} of the skill user's final max hp every second. | 1 | Flora | special_mechanic + ambiguous_target | medium |
| resurrect with {percent} hp. | 1 | Mana | ambiguous_target | medium |
| revives with {percent} hp. | 1 | Rapunzel | ambiguous_target | medium |
| shared delusion: the shield created by label becomes invulnerable for {seconds} sec. | 1 | Label | parser_failure | medium |
| shield coin: damage taken ▼{percent} continuously. | 1 | Rouge | ambiguous_target | medium |
| single point attack: sustained damage ▲ {percent} for {seconds} sec. | 1 | Raven | ambiguous_target | medium |
| special note: fires an exploding bullet dealing area-of-effect damage. | 1 | Eunhwa: Tactical Upgrade | special_mechanic | medium |
| storage: stores excess incoming healing, up to {percent} of the skill user's max hp. stacks up to {number} times and lasts for {seconds} sec. | 1 | Sora | special_mechanic | medium |
| sword coin: attack damage ▲ {percent} continuously. | 1 | Rouge | ambiguous_target | medium |
| three times: affects the {number} enemy unit(s) with the lowest final def. | 1 | Scarlet: Black Shadow | special_mechanic | medium |
| three times: decreases the stack count of stackable debuffs by {number}. | 1 | Anchor: Innocent Maid | special_mechanic | medium |

## 人間判断が必要そう

61 patterns / 61 candidate occurrences / 49 review sections

| Pattern | Occurrences | Characters | Reasons | Confidence |
|---|---:|---|---|---|
| a.n. mode | 1 | Raven | special_mechanic | high |
| ability: find and capture ghosts possessing the enemy. | 1 | Elegg: Boom and Shock | special_mechanic | high |
| attachable projectiles | 1 | Rapi: Red Hood | special_mechanic | high |
| attack interval: {seconds} sec | 1 | Anis: Star | special_mechanic | high |
| cancels assigned part: dancing. | 1 | Mint | special_mechanic | high |
| cancels assigned part: singing. | 1 | Mint | special_mechanic | high |
| cancels combat assist. | 1 | Rapi: Red Hood | special_mechanic | high |
| cancels ensnaring chains after the effect is triggered. | 1 | Mihara: Bonding Chain | special_mechanic | high |
| cancels lingering taste. | 1 | Bready | special_mechanic | high |
| cancels recommended taste. | 1 | Bready | special_mechanic | high |
| changes spread roots to wilted roots. | 1 | Trina | special_mechanic | high |
| combat assist: changes to burst stage {number}. this effect is continuous and cannot be removed. | 1 | Rapi: Red Hood | special_mechanic | high |
| delusion shattered: activates up to {number} time(s). this effect is continuous. | 1 | Label | special_mechanic | high |
| effect {index}: affects self. cancels everyone's star. | 1 | Anis: Star | special_mechanic | high |
| effect {index}: affects self. cancels my own star. | 1 | Anis: Star | special_mechanic | high |
| effect {index}: affects self. everyone's star: re-enters burst and changes to stage {number}. this effect is continuous and cannot be removed. | 1 | Anis: Star | special_mechanic | high |
| effect {index}: affects self. exposure activation disabled continuously. | 1 | Emma: Tactical Upgrade | special_mechanic | high |
| effect {index}: affects self. fills the ammo pouch with {rounds} rounds(s), up to a maximum of {number}. this effect is continuous and cannot be removed. | 1 | Velvet | special_mechanic | high |
| effect {index}: affects the member who initiated sing along. assigned part: singing. this effect is continuous and cannot be removed. | 1 | Prika | special_mechanic | high |
| effect {index}: expends ammo from the ammo pouch. amount: {rounds} rounds(s). | 1 | Velvet | special_mechanic | high |
| effect {index}: imagined heartbreak: prevents being targeted by single-target attacks for {seconds} sec x delusion shattered count. this effect is removed upon taking a direct hit. | 1 | Label | special_mechanic | high |
| effect {index}: ninjutsu camouflage: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit. | 1 | Delta: Ninja Thief | special_mechanic | high |
| effect {number} targets: all enemies | 1 | Emma: Tactical Upgrade | special_mechanic | high |
| effect {number} targets: all enemies (including those that appear during environment setup) | 1 | Emma: Tactical Upgrade | special_mechanic | high |
| effect: captures {number} ghost when the required hit count reaches {percent}. a maximum of {number} ghost(s) can be captured. | 1 | Elegg: Boom and Shock | special_mechanic | high |
| effect: launches attachable projectiles that attach to hit locations. when entering full burst, the projectiles explode. | 1 | Rapi: Red Hood | special_mechanic | high |
| exposure (cannot be removed) | 1 | Emma: Tactical Upgrade | special_mechanic | high |
| extends her line of sight and auto-aims at all enemies within range. the stage target is treated as a single enemy regardless of whether it has parts (including interruption parts). | 1 | Modernia | special_mechanic | high |
| fills burst gauge by {percent}. activates {number} time(s) per battle. | 1 | D | special_mechanic | high |
| fills burst gauge by {percent}. activates once per battle. | 1 | Elegg | ambiguous_value | high |
| first train discount for {seconds} sec. | 1 | Soline: Frost Ticket | special_mechanic | high |
| fist of justice!: this effect is continuous and cannot be removed. | 1 | Queen (Makoto) | special_mechanic | high |
| hero level up: reaches a maximum of level {number}. | 1 | Guillotine: Winter Slayer | special_mechanic | high |
| invulnerable for {seconds} sec. | 1 | Trina | ambiguous_target | high |
| issues {number} ticket, up to a maximum of {number}. this effect is continuous. | 1 | Soline: Frost Ticket | special_mechanic | high |
| max ammo loaded by auto fire ready: {number} | 1 | Snow White: Heavy Arms | special_mechanic | high |
| max lock-on targets: {number} | 1 | Snow White: Heavy Arms | special_mechanic | high |
| nine times: affects all enemies. | 1 | Scarlet: Black Shadow | special_mechanic | high |
| ninjutsu ifak: lasts for {seconds} sec. | 1 | Delta: Ninja Thief | special_mechanic | high |
| number of uses: {number} | 1 | Snow White: Heavy Arms | special_mechanic | high |
| only one assigned part is applied according to mint's current status. | 1 | Mint | special_mechanic | high |
| overconfident, huh?!: | 1 | Milk: Blooming Bunny | special_mechanic | high |
| papillon heart: this effect is continuous and cannot be removed. | 1 | Aigis | special_mechanic | high |
| pellet count: {number} | 1 | K | special_mechanic | high |
| persona - johanna: this effect is continuous and cannot be removed. | 1 | Queen (Makoto) | special_mechanic | high |
| persona - konohana sakuya: this effect is continuous and cannot be removed. | 1 | Yukiko | special_mechanic | high |
| persona - palladion: this effect is continuous and cannot be removed. | 1 | Aigis | special_mechanic | high |
| possession lasts for {seconds} sec. | 1 | Elegg: Boom and Shock | special_mechanic | high |
| removal condition: reloading to max ammunition while in the preparation for change state. | 1 | Cinderella: Crystal Wave | special_mechanic | high |
| removes {number} debuff(s). | 1 | Cocoa | ambiguous_target + ambiguous_trigger | high |
| required hit count: {number} time(s) in total, cumulative across all allies. | 1 | Elegg: Boom and Shock | special_mechanic | high |
| scarlet flower: this effect is continuous and cannot be removed. | 1 | Yukiko | special_mechanic | high |
| six times: affects enemies within attack range. | 1 | Scarlet: Black Shadow | special_mechanic | high |
| stage {number}: affects all enemies. | 1 | Soda: Twinkling Bunny | special_mechanic | high |
| stage {number}: affects self. | 1 | Quency: Escape Queen | special_mechanic | high |
| stage {number}: when in time extension i state, | 1 | Soda: Twinkling Bunny | special_mechanic | high |
| stage {number}: when in time extension ii state, | 1 | Soda: Twinkling Bunny | special_mechanic | high |
| target: target(s) hit | 1 | Eunhwa: Tactical Upgrade | special_mechanic | high |
| triggers eagle eye-type exospine mk2. | 1 | EVE | special_mechanic | high |
| triggers impact-type exospine mk2. | 1 | EVE | special_mechanic | high |
| vamp: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit. | 1 | Viper | special_mechanic | high |

## Targeted diagnostics

- special_mechanic_only: 126 occurrences / 83 sections
- structured_resource_heal_weapon_state_with_review: 1 occurrences / 1 sections
- likely_stale_structured_resource_heal_weapon_state: 0 occurrences / 0 sections
- suspected_value_duration_confusion: 0 occurrences / 0 sections
- resolved_context_but_ambiguous_target_or_trigger: 1 occurrences / 1 sections
- definitive_nonbuff_with_not_a_buff_candidate: 11 occurrences / 11 sections

## Normalized groups by reason

## ambiguous_value

20 patterns / 26 candidate occurrences

#### 1. `deals {percent} of final atk as damage. attacks sequentially {number} times.`

- 出現: 4 / Review節: 4
- キャラクター: Cinderella, EVE, Little Mermaid, Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | Deals 457.14% of final ATK as damage. Attacks sequentially 10 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
| Cinderella | Burst / Glass Slippers. Full Contact. | Deals 1365.92% of final ATK as damage. Attacks sequentially 10 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
| Little Mermaid | Skill 2 / Bubble Wave | Deals 63.36% of final ATK as damage. Attacks sequentially 4 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
| EVE | Burst / Counter Chain | Deals 457.14% of final ATK as damage. Attacks sequentially 6 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 2. `creates a shared shield with hp equal to {percent} of the skill user's final max hp that protects all allies from damage. lasts for {seconds} sec.`

- 出現: 3 / Review節: 3
- キャラクター: Blanc, Centi, Poli
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Blanc | Skill 1 / Lucky Guard | Creates a shared shield with HP equal to 11.8% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + ambiguous_target |
| Poli | Burst / Poli's Defense Line | Creates a shared shield with HP equal to 22.27% of the skill user's final max HP that protects all allies from damage. Lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |
| Centi | Skill 2 / Field Discussion | Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + ambiguous_trigger |

#### 3. `creates a shared shield with hp equal to {percent} of the skill user's final max hp. this effect is continuous.`

- 出現: 2 / Review節: 2
- キャラクター: Rapunzel: Pure Grace
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapunzel: Pure Grace | Skill 1 / Sanctuary | Creates a shared shield with HP equal to 20.59% of the skill user's final max HP. This effect is continuous. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |
| Rapunzel: Pure Grace | Skill 1 / Sanctuary | Creates a shared shield with HP equal to 20.59% of the skill user's final max HP. This effect is continuous. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 4. `atk ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet: Black Shadow
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet: Black Shadow | Burst / Fleetly Fading: Strike | ATK ▲ 115.12% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 5. `changes full charge attack count required for skill {number} to {number} time/{number} times/{number} times for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet: Black Shadow
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet: Black Shadow | Burst / Fleetly Fading: Strike | Changes Full Charge attack count required for Skill 1 to 1 time/2 times/3 times for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 6. `charge damage ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet: Black Shadow
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet: Black Shadow | Burst / Fleetly Fading: Strike | Charge Damage ▲ 169.63% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 7. `creates a shield with hp equal to {percent} of the the skill user's final max hp that lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Ether
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Ether | Burst / Colossal Single Cell | Creates a shield with HP equal to 96% of the the skill user's final max HP that lasts for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 8. `critical damage ▲ {percent}. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Skill 1 / High-Speed Evolution | Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + parser_failure |

#### 9. `deals {percent} of final atk as additional damage. mirrors the stack count of beautiful.`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella | Burst / Glass Slippers. Full Contact. | Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 10. `deals {percent} of final atk as additional damage. removes calling card.`

- 出現: 1 / Review節: 1
- キャラクター: Phantom
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Phantom | Skill 2 / Thief's Vision | Deals 84.33% of final ATK as additional damage. Removes Calling Card. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 11. `deals {percent} of final atk as burst skill damage.`

- 出現: 1 / Review節: 1
- キャラクター: iDoll Flower
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| iDoll Flower | Burst / Perennial Perfume | Deals 330.61% of final ATK as Burst Skill damage. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 12. `deals {percent} of final atk as sustained damage every second for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Diesel: Winter Sweets
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Diesel: Winter Sweets | Skill 2 / I'm Gonna Sing Now! | Deals 63.33% of final ATK as sustained damage every second for 9 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 13. `deals {percent} of final atk as sustained damage every second. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 14. `deals fixed damage to the main body equal to {percent} of the damage dealt by self.`

- 出現: 1 / Review節: 1
- キャラクター: Emilia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emilia | Skill 2 / Great Spirit's Mace | Deals Fixed Damage to the main body equal to 58.99% of the damage dealt by self. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 15. `deploys two missile containers that deal {percent} of final atk as damage to the enemy with the lowest remaining hp every second for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Vesti
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Vesti | Burst / Justifiable Defense | Deploys two Missile Containers that deal 15.56% of final ATK as damage to the enemy with the lowest remaining HP every second for 18 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 16. `duplicates {percent} of the max hp of the nikke with the highest max hp. lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Quency
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Quency | Skill 1 / New Route | Duplicates 12.42% of the max HP of the Nikke with the highest max HP. Lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 17. `fills burst gauge by {percent}. activates once per battle.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg | Skill 2 / Fast Charge | Fills Burst Gauge by 100%. Activates once per battle. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value |

#### 18. `max ammunition capacity ▼ {percent}. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Skill 1 / High-Speed Evolution | Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + parser_failure |

#### 19. `mind if i borrow this?: duplicates {percent} of the atk of the ally with the highest atk. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Guilty
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Guilty | Skill 1 / Mind If I Borrow This? | Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic |

#### 20. `replenishes {number} mp, up to a maximum of {number}. all mp is removed when using burst skill.`

- 出現: 1 / Review節: 1
- キャラクター: Maiden: Ice Rose
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Maiden: Ice Rose | Skill 1 / Meditation | Replenishes 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + missing_value |

## special_mechanic

132 patterns / 146 candidate occurrences

#### 1. `decoy: creates an avatar with {percent} of the skill user's final max hp. this effect is continuous.`

- 出現: 3 / Review節: 3
- キャラクター: Cinderella, Cinderella: Crystal Wave
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella | Skill 2 / Dirt-Resistant Mirror | Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous. | special_mechanic / — / — | self | — / — | 継続 (— ) | Decoy | null | special_mechanic |
| Cinderella | Skill 2 / Dirt-Resistant Mirror | Decoy: Creates an avatar with 96% of the skill user's final max HP. This effect is continuous. | special_mechanic / — / — | self | — / — | 継続 (— ) | Decoy | null | special_mechanic |
| Cinderella: Crystal Wave | Skill 2 / Mode Swap | Decoy: Creates an avatar with 70.34% of the skill user's final max HP. This effect is continuous. | special_mechanic / — / — | self | — / — | 継続 (— ) | Decoy | null | special_mechanic |

#### 2. `camouflage: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit.`

- 出現: 2 / Review節: 2
- キャラクター: Eunhwa: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Eunhwa: Tactical Upgrade | Skill 1 / Camouflage Scarf | Camouflage: Prevents being targeted by single-target attacks for 5 sec. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | Camouflage | null | special_mechanic |
| Eunhwa: Tactical Upgrade | Skill 1 / Camouflage Scarf | Camouflage: Prevents being targeted by single-target attacks for 5 sec. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | Camouflage | null | special_mechanic |

#### 3. `concealment: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit.`

- 出現: 2 / Review節: 2
- キャラクター: Rosanna
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rosanna | Skill 1 / On the Lam | Concealment: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | Concealment | null | special_mechanic |
| Rosanna | Skill 2 / Capo dei Capi | Concealment: Prevents being targeted by single-target attacks for 5 sec. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | Concealment | null | special_mechanic |

#### 4. `decoy: creates an avatar with {percent} of the skill user's final max hp that lasts for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: Delta, Rei
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta | Burst / Remember Me | Decoy: Creates an avatar with 91.68% of the skill user's final max HP that lasts for 10 sec. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Decoy | null | special_mechanic |
| Rei | Skill 2 / Senior Spirit | Decoy: Creates an avatar with 96% of the skill user's final max HP that lasts for 240 sec. | special_mechanic / — / — | self | — / — | 240 sec (— ) | Decoy | null | special_mechanic |

#### 5. `effect {index}: activates when the target is alive.`

- 出現: 2 / Review節: 2
- キャラクター: Marciana: Marine Study
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Marciana: Marine Study | Skill 1 / Emergency Whistle | Effect 2: Activates when the target is alive. | special_mechanic / — / — | — | — / — | Instant (— ) | Flagged Target Designation | null | special_mechanic |
| Marciana: Marine Study | Skill 1 / Emergency Whistle | Effect 2: Activates when the target is alive. | special_mechanic / — / — | — | — / — | Instant (— ) | Flagged Target Designation | null | special_mechanic |

#### 6. `effect {index}: affects self. expends ammo from the ammo pouch. amount: {rounds} rounds(s).`

- 出現: 2 / Review節: 2
- キャラクター: Velvet
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Velvet | Skill 2 / Bullets of Love | Effect 1: Affects self. Expends ammo from the ammo pouch. Amount: 300 round(s). | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |
| Velvet | Skill 2 / Bullets of Love | Effect 1: Affects self. Expends ammo from the ammo pouch. Amount: 300 round(s). | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 7. `effect {number} targets: all allies`

- 出現: 2 / Review節: 2
- キャラクター: Emma: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 1 / Environment Setup | Effect 2 Targets: All allies | special_mechanic / — / — | self | — / — | Instant (— ) | Effect 2 Targets | null | special_mechanic |
| Emma: Tactical Upgrade | Burst / Battlefield Formation | Effect 2 Targets: All allies | special_mechanic / — / — | self | — / — | Instant (— ) | Effect 2 Targets | null | special_mechanic |

#### 8. `note: unable to take cover while using burst skill.`

- 出現: 2 / Review節: 2
- キャラクター: Laplace, Moran
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Laplace | Burst / Laplace Buster | Note: Unable to take cover while using Burst Skill. | special_mechanic / — / — | self | — / — | Instant (— ) | Note | null | special_mechanic |
| Moran | Burst / Fair and Square! | Note: Unable to take cover while using Burst Skill. | special_mechanic / — / — | self | — / — | Instant (— ) | Note | null | special_mechanic |

#### 9. `recurring interval: {seconds} sec`

- 出現: 2 / Review節: 2
- キャラクター: Elegg: Boom and Shock, Emma: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Recurring interval: 6 sec | special_mechanic / — / — | — | — / — | Instant (— ) | Recurring interval | null | special_mechanic |
| Emma: Tactical Upgrade | Skill 1 / Environment Setup | Recurring interval: 30 sec | special_mechanic / — / — | self | — / — | Instant (— ) | Recurring interval | null | special_mechanic |

#### 10. `stage {number}: activates when explore route stage {number} is at max stacks. affects self.`

- 出現: 2 / Review節: 1
- キャラクター: Quency: Escape Queen
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Quency: Escape Queen | Skill 2 / Explore Route | Stage 2: Activates when Explore Route Stage 1 is at max stacks. Affects self. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |
| Quency: Escape Queen | Skill 2 / Explore Route | Stage 3: Activates when Explore Route Stage 2 is at max stacks. Affects self. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 11. `stage {number}: activates when golden chip is at {number} or more stacks. affects self.`

- 出現: 2 / Review節: 1
- キャラクター: Soda: Twinkling Bunny
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soda: Twinkling Bunny | Burst / Onward, Soda! | Stage 2: Activates when Golden Chip is at 20 or more stacks. Affects self. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |
| Soda: Twinkling Bunny | Burst / Onward, Soda! | Stage 3: Activates when Golden Chip is at 30 or more stacks. Affects self. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 12. `stage {number}: with {number} or more stacks of golden chip,`

- 出現: 2 / Review節: 1
- キャラクター: Soda: Twinkling Bunny
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soda: Twinkling Bunny | Skill 2 / Beginner's Rewards | Stage 1: With 10 or more stacks of Golden Chip, | special_mechanic / — / — | all_allies | — / — | Instant (— ) | — | null | special_mechanic |
| Soda: Twinkling Bunny | Skill 2 / Beginner's Rewards | Stage 2: With 20 or more stacks of Golden Chip, | special_mechanic / — / — | all_allies | — / — | Instant (— ) | — | null | special_mechanic |

#### 13. `storage: stores excess incoming healing, up to {percent} of the skill user's max hp. lasts for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: Anchor: Innocent Maid, Marciana
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Marciana | Burst / A Teacher's Grace | Storage: Stores excess incoming healing, up to 27.87% of the skill user's max HP. Lasts for 10 sec. | special_mechanic / — / — | all_allies | — / — | 10 sec (— ) | Storage | null | special_mechanic |
| Anchor: Innocent Maid | Burst / Seaside Stroll | Storage: Stores excess incoming healing, up to 60.19% of the skill user's max HP. Lasts for 25 sec. | special_mechanic / — / — | all_allies | — / — | 25 sec (— ) | Storage | null | special_mechanic |

#### 14. `a.n. mode`

- 出現: 1 / Review節: 1
- キャラクター: Raven
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Raven | Burst / Tempest | A.N. Mode | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 15. `ability: find and capture ghosts possessing the enemy.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Ability: Find and capture ghosts possessing the enemy. | special_mechanic / — / — | — | — / — | Instant (— ) | Ability | null | special_mechanic |

#### 16. `aftertaste: deals {percent} of final atk as sustained damage every second for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Bready
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bready | Skill 2 / Favorite Candy | Aftertaste: Deals  150.04% of final ATK as sustained damage every second for 5 sec. | special_mechanic / — / — | — | — / — | 5 sec (— ) | Aftertaste | null | special_mechanic |

#### 17. `atk ▲ ({percent} * number of drunken stacks) of the skill user's atk for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Mast: Romantic Maid
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mast: Romantic Maid | Burst / A Pirate's Romance | ATK ▲ (20.06% * Number of Drunken stacks) of the skill user's ATK for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | special_mechanic + ambiguous_target |

#### 18. `atk ▲ {percent} of the skill user's atk continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | ATK ▲ 16.2% of the skill user's ATK continuously. | buff / caster_atk_based_atk / increase | element | 16.2 / caster_atk_percent | 継続 (— continuous) | 1 or more ghosts | null | special_mechanic + ambiguous_trigger |

#### 19. `attachable projectiles`

- 出現: 1 / Review節: 1
- キャラクター: Rapi: Red Hood
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapi: Red Hood | Skill 2 / Attachable Projectiles | Attachable Projectiles | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 20. `attack interval: {seconds} sec`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Burst / Star Anis | Attack Interval: 0.25 sec | special_mechanic / — / — | self | — / — | 10 sec (— ) | Shooting Stars | null | special_mechanic |

#### 21. `brand: accumulates total damage dealt to the designated enemy during the duration, and then deals that accumulated damage to all enemies as distributed damage once the duration ends. the maximum accumulated damage is {percent} of the skill user's final atk. lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Dorothy
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Dorothy | Burst / Paradise Lost | Brand: Accumulates total damage dealt to the designated enemy during the duration, and then deals that accumulated damage to all enemies as distributed damage once the duration ends. The maximum accumulated damage is 8900.83% of the skill user's final ATK. Lasts for 10 sec. | special_mechanic / — / — | — | — / — | 10 sec (— ) | Brand | null | special_mechanic |

#### 22. `cancels assigned part: dancing.`

- 出現: 1 / Review節: 1
- キャラクター: Mint
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mint | Skill 2 / Fantastic Performance! | Cancels Assigned Part: Dancing. | special_mechanic / — / — | self | — / — | Instant (— ) | Cancels Assigned Part | null | special_mechanic |

#### 23. `cancels assigned part: singing.`

- 出現: 1 / Review節: 1
- キャラクター: Mint
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mint | Skill 2 / Fantastic Performance! | Cancels Assigned Part: Singing. | special_mechanic / — / — | self | — / — | Instant (— ) | Cancels Assigned Part | null | special_mechanic |

#### 24. `cancels combat assist.`

- 出現: 1 / Review節: 1
- キャラクター: Rapi: Red Hood
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapi: Red Hood | Skill 1 / Battlefield Assessment | Cancels Combat Assist. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 25. `cancels ensnaring chains after the effect is triggered.`

- 出現: 1 / Review節: 1
- キャラクター: Mihara: Bonding Chain
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mihara: Bonding Chain | Burst / Bonding Pain | Cancels Ensnaring Chains after the effect is triggered. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 26. `cancels lingering taste.`

- 出現: 1 / Review節: 1
- キャラクター: Bready
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bready | Skill 1 / Lonely Gourmet | Cancels Lingering Taste. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 27. `cancels recommended taste.`

- 出現: 1 / Review節: 1
- キャラクター: Bready
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bready | Skill 1 / Lonely Gourmet | Cancels Recommended Taste. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 28. `changes spread roots to wilted roots.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Burst / Mother Forest | Changes Spread Roots to Wilted Roots. | special_mechanic / — / — | all_allies | — / — | Instant (— ) | — | null | special_mechanic |

#### 29. `changes the weapon in use: electric power, fully full charge`

- 出現: 1 / Review節: 1
- キャラクター: Laplace: Ultimate Hero
- 推奨: review_flag_removal_candidate (medium) — 比較対象外のspecial文法として確定可能で、review flagのみ残っている可能性があります。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Laplace: Ultimate Hero | Skill 1 / Electric Power, Fully Full Charge! | Changes the weapon in use: Electric Power, Fully Full Charge | special_mechanic / — / — | self | — / — | Instant (— ) | Changes the weapon in use | null | special_mechanic |

#### 30. `changes the weapon in use: matis uberbuster`

- 出現: 1 / Review節: 1
- キャラクター: Maxwell: Ordinary Mechanic
- 推奨: review_flag_removal_candidate (medium) — 比較対象外のspecial文法として確定可能で、review flagのみ残っている可能性があります。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Maxwell: Ordinary Mechanic | Burst / Matis UberBuster | Changes the weapon in use: Matis UberBuster | special_mechanic / — / — | self | — / — | Instant (— ) | Changes the weapon in use | null | special_mechanic |

#### 31. `changes the weapon in use: snipe mode`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella: Crystal Wave
- 推奨: review_flag_removal_candidate (medium) — 比較対象外のspecial文法として確定可能で、review flagのみ残っている可能性があります。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella: Crystal Wave | Skill 1 / Beauty-Full | Changes the weapon in use: Snipe Mode | special_mechanic / — / — | self | — / — | Instant (— ) | Changes the weapon in use | null | special_mechanic |

#### 32. `cherry blossom tea: {percent} of def. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sakura
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura | Skill 1 / Cherry Blossom Tea | Cherry Blossom Tea: 8.15% of DEF. Stacks up to 10 times and lasts for 15 sec. | special_mechanic / — / — | all_allies | — / — | 15 sec (— ) | Cherry Blossom Tea | null | special_mechanic |

#### 33. `combat assist: changes to burst stage {number}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Rapi: Red Hood
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapi: Red Hood | Skill 1 / Battlefield Assessment | Combat Assist: Changes to Burst Stage 1. This effect is continuous and cannot be removed. | special_mechanic / — / — | — | — / — | 継続 (— ) | Combat Assist | null | special_mechanic |

#### 34. `converts damage to elemental advantage damage against electric code enemies. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Rapi: Red Hood
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapi: Red Hood | Skill 2 / Attachable Projectiles | Converts damage to Elemental Advantage damage against Electric Code enemies. This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | — | null | special_mechanic |

#### 35. `critical damage ▲ {percent}. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Skill 1 / High-Speed Evolution | Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + parser_failure |

#### 36. `cumulative damage skill active for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trony
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trony | Skill 1 / T.Rony Bomber | Cumulative Damage Skill active for 5 sec. | special_mechanic / — / — | — | — / — | 5 sec (— ) | — | null | special_mechanic |

#### 37. `deals {percent} of final atk as additional damage. mirrors the stack count of beautiful.`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella | Burst / Glass Slippers. Full Contact. | Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 38. `deals {percent} of final atk as additional damage. removes calling card.`

- 出現: 1 / Review節: 1
- キャラクター: Phantom
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Phantom | Skill 2 / Thief's Vision | Deals 84.33% of final ATK as additional damage. Removes Calling Card. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 39. `deals {percent} of final atk as sustained damage every second. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 40. `decreases the firepower gauge's charge by {number}.`

- 出現: 1 / Review節: 1
- キャラクター: Neon: Vision Eye
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Neon: Vision Eye | Burst / Super Firepower | Decreases the Firepower Gauge's charge by 100. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 41. `delusion shattered: activates up to {number} time(s). this effect is continuous.`

- 出現: 1 / Review節: 1
- キャラクター: Label
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Label | Skill 1 / Meeting and Parting (Imagined) | Delusion Shattered: Activates up to 2 time(s). This effect is continuous. | special_mechanic / — / — | self | — / — | 継続 (— ) | Delusion Shattered | null | special_mechanic |

#### 42. `distributed damage ▲ {percent} x number of drunken stacks for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Mast: Romantic Maid
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mast: Romantic Maid | Skill 2 / A Pirate's Spirit | Distributed Damage ▲ 15.03% x number of Drunken stacks for 10 sec. | buff / distributed_damage / increase | all_allies | 15.03 / percent | 10 sec (10 seconds) | — | null | special_mechanic |

#### 43. `duplicates {percent} of the max hp of ally with the highest max hp. lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sin
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sin | Skill 1 / Full Stop | Duplicates 15.03% of the max HP of ally with the highest max HP. Lasts for 5 sec. | special_mechanic / — / — | self | — / — | 5 sec (— ) | — | null | special_mechanic |

#### 44. `effect {index}: accumulates {percent} of the skill user's atk damage.`

- 出現: 1 / Review節: 1
- キャラクター: Trony
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trony | Skill 1 / T.Rony Bomber | Effect 2: Accumulates 50% of the skill user's ATK damage. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 45. `effect {index}: activates every {seconds} sec. affects all allies. media: restores hp equal to {percent} of the skill user's final max hp.`

- 出現: 1 / Review節: 1
- キャラクター: Yukiko
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Yukiko | Skill 1 / Persona: Konohana Sakuya | Effect 1: Activates every 3 sec. Affects all allies. Media: Restores HP equal to 5.7% of the skill user's final max HP. | special_mechanic / — / — | all_allies | — / — | Instant (— ) | Persona - Konohana Sakuya | null | special_mechanic |

#### 46. `effect {index}: activates every {seconds} sec. affects all allies. mediarama: restores hp equal to {percent} of the skill user's final max hp.`

- 出現: 1 / Review節: 1
- キャラクター: Yukiko
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Yukiko | Skill 2 / Scarlet Flower | Effect 1: Activates every 3 sec. Affects all allies. Mediarama: Restores HP equal to 5.7% of the skill user's final max HP. | special_mechanic / — / — | all_allies | — / — | Until When Full Burst ends. (— until_condition) | Scarlet Flower | null | special_mechanic |

#### 47. `effect {index}: affects all allies. cooldown of burst skill ▼ {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 3: Affects all allies. Cooldown of Burst Skill ▼ 7.48 sec. | buff / burst_cooldown_reduction / decrease | all_allies | 7.48 / seconds | Instant (— ) | — | null | special_mechanic + ambiguous_trigger + parser_failure |

#### 48. `effect {index}: affects self. cancels everyone's star.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 1: Affects self. Cancels Everyone's Star. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 49. `effect {index}: affects self. cancels my own star.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 1: Affects self. Cancels My Own Star. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 50. `effect {index}: affects self. everyone's star: re-enters burst and changes to stage {number}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 2: Affects self. Everyone's Star: Re-enters Burst and changes to Stage 1. This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | — | null | special_mechanic |

#### 51. `effect {index}: affects self. exposure activation disabled continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 2 / LT Formation | Effect 3: Affects self. Exposure activation disabled continuously. | special_mechanic / — / — | self | — / — | 継続 (— ) | Bonus effects while this unit is in the AS Formation state | null | special_mechanic |

#### 52. `effect {index}: affects self. fills the ammo pouch with {rounds} rounds(s), up to a maximum of {number}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Velvet
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Velvet | Skill 1 / Sticky Fingers | Effect 2: Affects self. Fills the ammo pouch with 6000 round(s), up to a maximum of 6000. This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | Bullet Snatch | null | special_mechanic |

#### 53. `effect {index}: affects self. my own star: atk ▲ {percent}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 2: Affects self. My Own Star: ATK ▲ 40.01%. This effect is continuous and cannot be removed. | buff / atk / increase | self | 40.01 / percent | 継続 (— continuous) | My Own Star | null | special_mechanic + ambiguous_trigger + parser_failure |

#### 54. `effect {index}: affects self. recurring interval of environment setup ▼ {seconds} sec continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 2 / LT Formation | Effect 4: Affects self. Recurring interval of Environment Setup ▼ 20 sec continuously. | special_mechanic / — / — | self | 20 / seconds | 継続 (— ) | Bonus effects while this unit is in the AS Formation state | null | special_mechanic |

#### 55. `effect {index}: affects the member who initiated sing along. assigned part: singing. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Prika
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Prika | Skill 2 / One More Song! | Effect 1: Affects the member who initiated Sing Along. Assigned Part: Singing. This effect is continuous and cannot be removed. | special_mechanic / — / — | — | — / — | 継続 (— ) | Encore | null | special_mechanic |

#### 56. `effect {index}: atk ▲ {percent} continuously x the number of homemade magazines.`

- 出現: 1 / Review節: 1
- キャラクター: E.H.
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| E.H. | Skill 1 / Homemade Magazine | Effect 3: ATK ▲ 7.5% continuously x the number of homemade magazines. | buff / atk / increase | self | 7.5 / percent | 継続 (— continuous) | — | null | special_mechanic |

#### 57. `effect {index}: deals distributed damage to enemies within the attack range when cumulative damage skill explodes.`

- 出現: 1 / Review節: 1
- キャラクター: Trony
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trony | Skill 1 / T.Rony Bomber | Effect 3: Deals distributed damage to enemies within the attack range when Cumulative Damage Skill explodes. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 58. `effect {index}: environment setup: restores hp equal to {percent} of the skill user's final max hp every second for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 1 / Environment Setup | Effect 2: Environment Setup: Restores HP equal to 2.32% of the skill user's final max HP every second for 10 sec. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Effect 1 Targets | null | special_mechanic |

#### 59. `effect {index}: expends ammo from the ammo pouch. amount: {rounds} rounds(s).`

- 出現: 1 / Review節: 1
- キャラクター: Velvet
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Velvet | Skill 1 / Sticky Fingers | Effect 1: Expends ammo from the ammo pouch. Amount: 100 round(s). | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 60. `effect {index}: fixes charge time at {seconds} sec continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Heavy Arms
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Heavy Arms | Burst / Seven Dwarves Fully Active | Effect 1: Fixes charge time at 3.2 sec continuously. | special_mechanic / — / — | self | — / — | 継続 (— ) | Number of uses | null | special_mechanic |

#### 61. `effect {index}: imagined heartbreak: prevents being targeted by single-target attacks for {seconds} sec x delusion shattered count. this effect is removed upon taking a direct hit.`

- 出現: 1 / Review節: 1
- キャラクター: Label
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Label | Skill 1 / Meeting and Parting (Imagined) | Effect 1: Imagined Heartbreak: Prevents being targeted by single-target attacks for 1 sec x Delusion Shattered count. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | Delusion Shattered | null | special_mechanic |

#### 62. `effect {index}: maximum accumulated damage is {percent} of the skill user's final atk.`

- 出現: 1 / Review節: 1
- キャラクター: Trony
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trony | Skill 1 / T.Rony Bomber | Effect 1: Maximum Accumulated Damage is 1536% of the skill user's final ATK. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 63. `effect {index}: ninjutsu camouflage: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit.`

- 出現: 1 / Review節: 1
- キャラクター: Delta: Ninja Thief
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | Effect 1: Ninjutsu Camouflage: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | — | null | special_mechanic |

#### 64. `effect {index}: ninjutsu injection: restores hp equal to {percent} of attack damage. this effect is continuous.`

- 出現: 1 / Review節: 1
- キャラクター: Delta: Ninja Thief
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | Effect 2: Ninjutsu Injection: Restores HP equal to 11.22% of attack damage. This effect is continuous. | special_mechanic / — / — | self | — / — | 継続 (— ) | — | null | special_mechanic |

#### 65. `effect {index}: once the duration ends, all allies are healed for the stored recovery amount.`

- 出現: 1 / Review節: 1
- キャラクター: Delta: Ninja Thief
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | Effect 2: Once the duration ends, all allies are healed for the stored recovery amount. | special_mechanic / — / — | self | — / — | Instant (— ) | Ninjutsu IFAK | null | special_mechanic |

#### 66. `effect {index}: the "damage taken" multiplier of environment setup is scaled by {percent}.`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Burst / Battlefield Formation | Effect 1: The "Damage Taken" multiplier of Environment Setup is scaled by 100%. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Enhanced Environment Setup | null | special_mechanic |

#### 67. `effect {index}: the maximum amount stored is equal to {percent} of the skill user's final atk.`

- 出現: 1 / Review節: 1
- キャラクター: Delta: Ninja Thief
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | Effect 1: The maximum amount stored is equal to 165.28% of the skill user's final ATK. | special_mechanic / — / — | self | — / — | Instant (— ) | Ninjutsu IFAK | null | special_mechanic |

#### 68. `effect {number} targets: all enemies`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Burst / Battlefield Formation | Effect 1 Targets: All enemies | special_mechanic / — / — | self | — / — | Instant (— ) | Effect 1 Targets | null | special_mechanic |

#### 69. `effect {number} targets: all enemies (including those that appear during environment setup)`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 1 / Environment Setup | Effect 1 Targets: All enemies (including those that appear during Environment Setup) | special_mechanic / — / — | self | — / — | Instant (— ) | Effect 1 Targets | null | special_mechanic |

#### 70. `effect: captures {number} ghost when the required hit count reaches {percent}. a maximum of {number} ghost(s) can be captured.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Effect: Captures 1 ghost when the required hit count reaches 100%. A maximum of 13 ghost(s) can be captured. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 71. `effect: launches attachable projectiles that attach to hit locations. when entering full burst, the projectiles explode.`

- 出現: 1 / Review節: 1
- キャラクター: Rapi: Red Hood
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapi: Red Hood | Skill 2 / Attachable Projectiles | Effect: Launches attachable projectiles that attach to hit locations. When entering Full Burst, the projectiles explode. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 72. `effect: the damage multiplier of eagle eye-type exospine is scaled by {percent}.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Burst / Counter Chain | Effect: The damage multiplier of Eagle Eye-Type Exospine is scaled by 100%. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Exospine Mk2 | null | special_mechanic |

#### 73. `effect: the damage multiplier of unstable energy sequential attacks is scaled by {percent}.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Burst / Counter Chain | Effect: The damage multiplier of Unstable Energy sequential attacks is scaled by 100%. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Exospine Mk2 | null | special_mechanic |

#### 74. `elemental advantage attack damage ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Elemental Advantage Attack Damage ▲ 35% continuously. | buff / elemental_advantage_damage / increase | element | 35 / percent | 継続 (— continuous) | 4 or more ghosts | null | special_mechanic + ambiguous_trigger |

#### 75. `ensnaring chains: deals {percent} final atk as sustained damage every second. stacks up to {number} times. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Mihara: Bonding Chain
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mihara: Bonding Chain | Skill 1 / Body Contact | Ensnaring Chains: Deals 25.08% final ATK as sustained damage every second. Stacks up to 20 times. This effect is continuous and cannot be removed. | special_mechanic / — / — | — | — / — | 継続 (— ) | Ensnaring Chains | null | special_mechanic |

#### 76. `exposure (cannot be removed)`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 1 / Environment Setup | Exposure (Cannot be removed) | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 77. `extends her line of sight and auto-aims at all enemies within range. the stage target is treated as a single enemy regardless of whether it has parts (including interruption parts).`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Burst / New World | Extends her line of sight and auto-aims at all enemies within range. The stage target is treated as a single enemy regardless of whether it has parts (including interruption parts). | special_mechanic / — / — | self | — / — | Instant (— ) | Destroy Mode | null | special_mechanic |

#### 78. `extrasensory ▼ {percent}.`

- 出現: 1 / Review節: 1
- キャラクター: Chisato
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Chisato | Skill 1 / Extrasensory | Extrasensory ▼ 1%. | special_mechanic / — / — | — | 1 / percent | Instant (— ) | — | null | special_mechanic |

#### 79. `fills burst gauge by {percent}. activates {number} time(s) per battle.`

- 出現: 1 / Review節: 1
- キャラクター: D
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| D | Skill 2 / Surprise Attack | Fills Burst Gauge by 98.56%. Activates 1 time(s) per battle. | special_mechanic / — / — | all_allies | — / — | Instant (— ) | — | null | special_mechanic |

#### 80. `firepower charge: charges the firepower gauge for {seconds} sec. this effect cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Neon: Vision Eye
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Neon: Vision Eye | Burst / Super Firepower | Firepower Charge: Charges the Firepower Gauge for 10 sec. This effect cannot be removed. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Firepower Charge | null | special_mechanic |

#### 81. `first damage: {percent} of final atk`

- 出現: 1 / Review節: 1
- キャラクター: Laplace
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Laplace | Burst / Laplace Buster | First Damage: 897.6% of final ATK | special_mechanic / — / — | self | — / — | Instant (— ) | First Damage | null | special_mechanic |

#### 82. `first train discount for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Soline: Frost Ticket
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soline: Frost Ticket | Skill 2 / I'll Help You Board the Train! | First Train Discount for 6 sec. | special_mechanic / — / — | all_allies | — / — | 6 sec (— ) | — | null | special_mechanic |

#### 83. `fist of justice!: this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Queen (Makoto)
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Queen (Makoto) | Skill 2 / Fist of Justice! | Fist of Justice!: This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | Until When Full Burst ends. (— until_condition) | — | null | special_mechanic |

#### 84. `flash grenade toss activation time condition ▼ {seconds} sec for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Ada
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Ada | Skill 2 / Flash Grenade | Flash Grenade Toss activation time condition ▼ 1 sec for 10 sec. | special_mechanic / — / — | self | 1 / seconds | 10 sec (— ) | — | null | special_mechanic |

#### 85. `gentle current: fixes charge time at {seconds} sec continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Liberalio
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Liberalio | Skill 2 / Strange Currents | Gentle Current: Fixes charge time at 1 sec continuously. | special_mechanic / — / — | self | — / — | 継続 (— ) | Gentle Current | null | special_mechanic |

#### 86. `hero level up: reaches a maximum of level {number}.`

- 出現: 1 / Review節: 1
- キャラクター: Guillotine: Winter Slayer
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Guillotine: Winter Slayer | Skill 1 / Hero's Fate | Hero Level Up: Reaches a maximum of Level 11. | special_mechanic / — / — | self | — / — | Instant (— ) | Hero Level Up | null | special_mechanic |

#### 87. `hit count required for skill {number} ▼ {number} time(s) for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Innocent Days
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Innocent Days | Burst / Seven Dwarves III | Hit count required for Skill 2 ▼ 20 time(s) for 10 sec. | special_mechanic / — / — | self | 20 / seconds | 10 sec (— ) | — | null | special_mechanic |

#### 88. `incoming healing ▲ {percent} continuously. stacks up to {number} times.`

- 出現: 1 / Review節: 1
- キャラクター: Flora
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Flora | Skill 1 / Petunia | Incoming Healing ▲ 4% continuously. Stacks up to 5 times. | — / — / — | — | — / — | — (— ) | — | null | special_mechanic + ambiguous_target |

#### 89. `increases the firepower gauge's charge by {number}.`

- 出現: 1 / Review節: 1
- キャラクター: Neon: Vision Eye
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Neon: Vision Eye | Burst / Super Firepower | Increases the Firepower Gauge's charge by 1. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 90. `issues {number} ticket, up to a maximum of {number}. this effect is continuous.`

- 出現: 1 / Review節: 1
- キャラクター: Soline: Frost Ticket
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soline: Frost Ticket | Skill 1 / I'll Check Your Ticket! | Issues 1 ticket, up to a maximum of 2. This effect is continuous. | special_mechanic / — / — | all_allies | — / — | 継続 (— ) | — | null | special_mechanic |

#### 91. `max ammo loaded by auto fire ready: {number}`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Heavy Arms
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Heavy Arms | Skill 1 / Seven Dwarves V+VI | Max ammo loaded by Auto Fire Ready: 5 | special_mechanic / — / — | self | — / — | Instant (— ) | Max ammo loaded by Auto Fire Ready | null | special_mechanic |

#### 92. `max ammunition capacity ▼ {percent}. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Skill 1 / High-Speed Evolution | Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + parser_failure |

#### 93. `max lock-on targets: {number}`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Heavy Arms
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Heavy Arms | Skill 1 / Seven Dwarves V+VI | Max Lock-On Targets: 5 | special_mechanic / — / — | — | — / — | Instant (— ) | Max Lock-On Targets | null | special_mechanic |

#### 94. `mind if i borrow this?: duplicates {percent} of the atk of the ally with the highest atk. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Guilty
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Guilty | Skill 1 / Mind If I Borrow This? | Mind If I Borrow This?: Duplicates 8.81% of the ATK of the ally with the highest ATK. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic |

#### 95. `nine times: affects all enemies.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet: Black Shadow
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet: Black Shadow | Skill 1 / Fleetly Fading: Breakthrough | Nine times: Affects all enemies. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 96. `ninjutsu ifak: lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Delta: Ninja Thief
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta: Ninja Thief | Skill 2 / Ninjutsu Camouflage | Ninjutsu IFAK: Lasts for 4 sec. | special_mechanic / — / — | self | — / — | 4 sec (— ) | Ninjutsu IFAK | null | special_mechanic |

#### 97. `normal damage: {percent} of final atk`

- 出現: 1 / Review節: 1
- キャラクター: Laplace
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Laplace | Burst / Laplace Buster | Normal Damage: 14.52% of final ATK | special_mechanic / — / — | self | — / — | Instant (— ) | Normal Damage | null | special_mechanic |

#### 98. `number of uses of seven dwarves fully active ▼ {number}.`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Heavy Arms
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Heavy Arms | Skill 1 / Seven Dwarves V+VI | Number of uses of Seven Dwarves Fully Active ▼ 1. | special_mechanic / — / — | self | 1 / flat_value | Instant (— ) | — | null | special_mechanic |

#### 99. `number of uses: {number}`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Heavy Arms
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Heavy Arms | Burst / Seven Dwarves Fully Active | Number of uses: 2 | special_mechanic / — / — | self | — / — | Instant (— ) | Number of uses | null | special_mechanic |

#### 100. `only one assigned part is applied according to mint's current status.`

- 出現: 1 / Review節: 1
- キャラクター: Mint
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mint | Burst / Let's Sing Together! | Only one Assigned Part is applied according to Mint's current status. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 101. `only when above {percent}: atk ▲ {percent}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Chisato
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Chisato | Skill 1 / Extrasensory | Only when above 70%: ATK ▲ 53.69%. This effect is continuous and cannot be removed. | buff / atk / increase | self | 53.69 / percent | 継続 (— continuous) | — | null | special_mechanic |

#### 102. `only when above {percent}: hit rate ▲ {percent}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Chisato
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Chisato | Skill 1 / Extrasensory | Only when above 25%: Hit Rate ▲ 22.37%. This effect is continuous and cannot be removed. | buff / hit_rate / increase | self | 22.37 / percent | 継続 (— continuous) | — | null | special_mechanic |

#### 103. `only when above {percent}: true damage ▲ {percent}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Chisato
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Chisato | Skill 1 / Extrasensory | Only when above 55%: True Damage ▲ 48.62%. This effect is continuous and cannot be removed. | buff / true_damage / increase | self | 48.62 / percent | 継続 (— continuous) | — | null | special_mechanic |

#### 104. `only when at {percent}: dodging bullets: invulnerable for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Chisato
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Chisato | Skill 1 / Extrasensory | Only when at 100%: Dodging Bullets: Invulnerable for 2 sec. | buff / — / — | self | — / — | — (— ) | — | null | special_mechanic + parser_failure |

#### 105. `overconfident, huh?!:`

- 出現: 1 / Review節: 1
- キャラクター: Milk: Blooming Bunny
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Milk: Blooming Bunny | Burst / Embarrassment Explosion | Overconfident, Huh?!: | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 106. `papillon heart: this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Aigis
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Aigis | Skill 2 / Papillon Heart | Papillon Heart: This effect is continuous and cannot be removed. | special_mechanic / — / — | — | — / — | Until When Full Burst ends. (— until_condition) | Papillon Heart | null | special_mechanic |

#### 107. `pellet count: {number}`

- 出現: 1 / Review節: 1
- キャラクター: K
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| K | Burst / Means of Righteousness | Pellet Count: 10 | special_mechanic / — / — | self | — / — | Instant (— ) | Pellet Count | null | special_mechanic |

#### 108. `persona - johanna: this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Queen (Makoto)
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Queen (Makoto) | Skill 1 / Persona: Johanna | Persona - Johanna: This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | Persona - Johanna | null | special_mechanic |

#### 109. `persona - konohana sakuya: this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Yukiko
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Yukiko | Skill 1 / Persona: Konohana Sakuya | Persona - Konohana Sakuya: This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | Persona - Konohana Sakuya | null | special_mechanic |

#### 110. `persona - palladion: this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Aigis
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Aigis | Skill 1 / Persona: Palladion | Persona - Palladion: This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | Persona - Palladion | null | special_mechanic |

#### 111. `possession lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Possession lasts for 6 sec. | special_mechanic / — / — | — | — / — | 6 sec (— ) | — | null | special_mechanic |

#### 112. `reload speed ▲ {percent} x number of drunken stacks for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Mast: Romantic Maid
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mast: Romantic Maid | Skill 2 / A Pirate's Spirit | Reload Speed ▲ 15.04% x number of Drunken stacks for 10 sec. | buff / reload_speed / increase | all_allies | 15.04 / percent | 10 sec (10 seconds) | — | null | special_mechanic |

#### 113. `removal condition: reloading to max ammunition while in the preparation for change state.`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella: Crystal Wave
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella: Crystal Wave | Skill 1 / Beauty-Full | Removal Condition: Reloading to max ammunition while in the Preparation for Change state. | special_mechanic / — / — | self | — / — | Instant (— ) | Removal Condition | null | special_mechanic |

#### 114. `required hit count: {number} time(s) in total, cumulative across all allies.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Required hit count: 100 time(s) in total, cumulative across all allies. | special_mechanic / — / — | — | — / — | Instant (— ) | Required hit count | null | special_mechanic |

#### 115. `restores hp equal to {percent} of the skill user's final max hp every second.`

- 出現: 1 / Review節: 1
- キャラクター: Flora
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Flora | Skill 1 / Petunia | Restores HP equal to 1% of the skill user's final max HP every second. | — / — / — | — | — / — | — (— ) | — | null | special_mechanic + ambiguous_target |

#### 116. `scarlet flower: this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Yukiko
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Yukiko | Skill 2 / Scarlet Flower | Scarlet Flower: This effect is continuous and cannot be removed. | special_mechanic / — / — | — | — / — | Until When Full Burst ends. (— until_condition) | Scarlet Flower | null | special_mechanic |

#### 117. `six times: affects enemies within attack range.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet: Black Shadow
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet: Black Shadow | Skill 1 / Fleetly Fading: Breakthrough | Six times: Affects enemies within attack range. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 118. `special note: fires an exploding bullet dealing area-of-effect damage.`

- 出現: 1 / Review節: 1
- キャラクター: Eunhwa: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Eunhwa: Tactical Upgrade | Burst / Explosive Round | Special note: Fires an Exploding Bullet dealing area-of-effect damage. | special_mechanic / — / — | self | — / — | Instant (— ) | Special note | null | special_mechanic |

#### 119. `stage {number}: affects all enemies.`

- 出現: 1 / Review節: 1
- キャラクター: Soda: Twinkling Bunny
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soda: Twinkling Bunny | Burst / Onward, Soda! | Stage 1: Affects all enemies. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 120. `stage {number}: affects self.`

- 出現: 1 / Review節: 1
- キャラクター: Quency: Escape Queen
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Quency: Escape Queen | Skill 2 / Explore Route | Stage 1: Affects self. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 121. `stage {number}: when in time extension i state,`

- 出現: 1 / Review節: 1
- キャラクター: Soda: Twinkling Bunny
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soda: Twinkling Bunny | Skill 2 / Beginner's Rewards | Stage 1: When in Time Extension I state, | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 122. `stage {number}: when in time extension ii state,`

- 出現: 1 / Review節: 1
- キャラクター: Soda: Twinkling Bunny
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soda: Twinkling Bunny | Skill 2 / Beginner's Rewards | Stage 2: When in Time Extension II state, | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 123. `status {number}: if in the assigned part: dancing status, mint gains assigned part: singing. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Mint
- 推奨: review_flag_removal_candidate (high) — 比較対象外のeffect_typeとsubtypeまで構造化済みで、残存reasonは分類済み状態を再確認しているだけです。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mint | Burst / Let's Sing Together! | Status 1: If in the Assigned Part: Dancing status, Mint gains Assigned Part: Singing. This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | Status 1 | null | special_mechanic |

#### 124. `status {number}: if not in the assigned part: dancing status, mint gains assigned part: dancing. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Mint
- 推奨: review_flag_removal_candidate (high) — 比較対象外のeffect_typeとsubtypeまで構造化済みで、残存reasonは分類済み状態を再確認しているだけです。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mint | Burst / Let's Sing Together! | Status 2: If not in the Assigned Part: Dancing status, Mint gains Assigned Part: Dancing. This effect is continuous and cannot be removed. | special_mechanic / — / — | self | — / — | 継続 (— ) | Status 2 | null | special_mechanic |

#### 125. `storage: stores excess incoming healing, up to {percent} of the skill user's max hp. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sora
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sora | Skill 2 / Secret Carry-On | Storage: Stores excess incoming healing, up to 5.36% of the skill user's max HP. Stacks up to 5 times and lasts for 15 sec. | special_mechanic / — / — | all_allies | — / — | 15 sec (— ) | Storage | null | special_mechanic |

#### 126. `summons {number} near feathers.`

- 出現: 1 / Review節: 1
- キャラクター: Ein
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Ein | Burst / Feather All-Range | Summons 6 Near Feathers. | special_mechanic / — / — | self | — / — | Instant (— ) | — | null | special_mechanic |

#### 127. `target: target(s) hit`

- 出現: 1 / Review節: 1
- キャラクター: Eunhwa: Tactical Upgrade
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Eunhwa: Tactical Upgrade | Burst / Explosive Round | Target: Target(s) hit | special_mechanic / — / — | self | — / — | Instant (— ) | Target | null | special_mechanic |

#### 128. `three times: affects the {number} enemy unit(s) with the lowest final def.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet: Black Shadow
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet: Black Shadow | Skill 1 / Fleetly Fading: Breakthrough | Three times: Affects the 1 enemy unit(s) with the lowest final DEF. | special_mechanic / — / — | — | — / — | Instant (— ) | — | null | special_mechanic |

#### 129. `three times: decreases the stack count of stackable debuffs by {number}.`

- 出現: 1 / Review節: 1
- キャラクター: Anchor: Innocent Maid
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anchor: Innocent Maid | Skill 1 / Starfish (Shaped) Omurice | Three times: Decreases the stack count of stackable debuffs by 1. | special_mechanic / — / — | all_allies | — / — | Instant (— ) | — | null | special_mechanic |

#### 130. `triggers eagle eye-type exospine mk2.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Burst / Counter Chain | Triggers Eagle Eye-Type Exospine Mk2. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Exospine Mk2 | null | special_mechanic |

#### 131. `triggers impact-type exospine mk2.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Burst / Counter Chain | Triggers Impact-Type Exospine Mk2. | special_mechanic / — / — | self | — / — | 10 sec (— ) | Exospine Mk2 | null | special_mechanic |

#### 132. `vamp: prevents being targeted by single-target attacks for {seconds} sec. this effect is removed upon taking a direct hit.`

- 出現: 1 / Review節: 1
- キャラクター: Viper
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Viper | Skill 2 / Snake Scale | Vamp: Prevents being targeted by single-target attacks for 10 sec. This effect is removed upon taking a direct hit. | special_mechanic / — / — | self | — / — | Until taking a direct hit (— until_condition) | Vamp | null | special_mechanic |

## ambiguous_target

39 patterns / 53 candidate occurrences

#### 1. `atk ▲ {percent} of the skill user's atk for {seconds} sec.`

- 出現: 7 / Review節: 7
- キャラクター: Crust, Lily, Maiden: Ice Rose, Quiry, Rei Ayanami (Tentative Name)
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Maiden: Ice Rose | Skill 2 / Blessings Upon You | ATK ▲ 20.9% of the skill user's ATK for 10 sec. | buff / caster_atk_based_atk / increase | — | 20.9 / caster_atk_percent | 10 sec (10 seconds) | — | null | ambiguous_target |
| Quiry | Skill 1 / Glance | ATK ▲ 5.81% of the skill user's ATK for 3 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |
| Crust | Skill 2 / Reliable Cooking | ATK ▲ 20% of the skill user's ATK for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |
| Rei Ayanami (Tentative Name) | Skill 1 / Annihilation Support | ATK ▲ 17.6% of the skill user's ATK for 9 sec. | buff / caster_atk_based_atk / increase | — | 17.6 / caster_atk_percent | 9 sec (9 seconds) | — | null | ambiguous_target |
| Lily | Skill 1 / Precise Adjustment | ATK ▲ 20% of the skill user's ATK for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |
| Lily | Burst / The Best Engineer! | ATK ▲ 20% of the skill user's ATK for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |
| Lily | Burst / The Best Engineer! | ATK ▲ 40% of the skill user's ATK for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 2. `sustained damage ▲ {percent} for {seconds} sec.`

- 出現: 4 / Review節: 4
- キャラクター: Ark Ranger Black, Crust, Diesel: Winter Sweets
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Crust | Burst / True Flavor | Sustained Damage ▲ 10% for 10 sec. | buff / sustained_damage / increase | — | 10 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |
| Ark Ranger Black | Skill 2 / Tremble! Ark Black Collider! | Sustained Damage ▲ 77.5% for 10 sec. | buff / sustained_damage / increase | — | 77.5 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |
| Diesel: Winter Sweets | Skill 1 / Ah Ah, Mic Test | Sustained damage ▲ 60.19% for 10 sec. | buff / sustained_damage / increase | — | 60.19 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |
| Diesel: Winter Sweets | Skill 1 / Ah Ah, Mic Test | Sustained damage ▲ 235.03% for 10 sec. | buff / sustained_damage / increase | — | 235.03 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 3. `atk ▲ {percent} for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: iDoll Sun, Soda: Twinkling Bunny
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| iDoll Sun | Skill 2 / Sunlight | ATK ▲ 9.09% for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |
| Soda: Twinkling Bunny | Burst / Onward, Soda! | ATK ▲ 65.25% for 15 sec. | buff / atk / increase | — | 65.25 / percent | 15 sec (15 seconds) | — | null | ambiguous_target |

#### 4. `hit rate ▲ {percent} for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: Soda: Twinkling Bunny, Trina
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Soda: Twinkling Bunny | Burst / Onward, Soda! | Hit Rate ▲ 38.91% for 15 sec. | buff / hit_rate / increase | — | 38.91 / percent | 15 sec (15 seconds) | — | null | ambiguous_target |
| Trina | Burst / Mother Forest | Hit Rate ▲ 45.3% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

#### 5. `rebuilds cover with {percent} hp.`

- 出現: 2 / Review節: 2
- キャラクター: Biscuit, Lily
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Biscuit | Burst / Walk Training | Rebuilds cover with 93.6% HP. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |
| Lily | Burst / The Best Engineer! | Rebuilds cover with 30% HP. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 6. `reliable cooking: def ▲ {percent} of the skill user's def for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: Crust
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Crust | Skill 2 / Reliable Cooking | Reliable Cooking: DEF ▲ 10% of the skill user's DEF for 10 sec. | buff / caster_def_based_def / increase | — | 10 / caster_def_percent | 10 sec (10 seconds) | Reliable Cooking | null | ambiguous_target |
| Crust | Skill 2 / Reliable Cooking | Reliable Cooking: DEF ▲ 10% of the skill user's DEF for 10 sec. | buff / caster_def_based_def / increase | — | 10 / caster_def_percent | 10 sec (10 seconds) | Reliable Cooking | null | ambiguous_target |

#### 7. `restores hp equal to {percent} of the skill user's final max hp.`

- 出現: 2 / Review節: 2
- キャラクター: Snow Crane, Soline: Frost Ticket
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow Crane | Skill 2 / Legal Effect | Restores HP equal to 1.32% of the skill user's final max HP. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |
| Soline: Frost Ticket | Skill 2 / I'll Help You Board the Train! | Restores HP equal to 12.27% of the skill user's final max HP. | heal / caster_max_hp_based_heal / restore | — | 12.27 / caster_max_hp_percent | Instant (— ) | — | null | ambiguous_target |

#### 8. `atk ▲ ({percent} * number of drunken stacks) of the skill user's atk for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Mast: Romantic Maid
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mast: Romantic Maid | Burst / A Pirate's Romance | ATK ▲ (20.06% * Number of Drunken stacks) of the skill user's ATK for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | special_mechanic + ambiguous_target |

#### 9. `attack damage ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Skill 2 / Peaceful Tree | Attack Damage ▲ 94.15% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 10. `baton pass: atk ▲ {percent} of the skill user's atk continuously. stacks up to {number} times.`

- 出現: 1 / Review節: 1
- キャラクター: Queen (Makoto)
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Queen (Makoto) | Skill 2 / Fist of Justice! | Baton Pass: ATK ▲ 35.2% of the skill user's ATK continuously. Stacks up to 3 times. | buff / caster_atk_based_atk / increase | — | 35.2 / caster_atk_percent | 継続 (— continuous) | Baton Pass | null | ambiguous_target |

#### 11. `charge speed ▲ {percent} of the skill user's charge speed for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Liberalio
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Liberalio | Skill 1 / Calm Depths | Charge Speed ▲ 12.74% of the skill user's Charge Speed for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 12. `charge time ▼ {seconds} sec for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Mana
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mana | Skill 2 / Metal σ | Charge Time ▼ 0.18 sec for 10 sec. | buff / charge_time / decrease | — | 0.18 / seconds | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 13. `creates a shared shield with hp equal to {percent} of the skill user's final max hp that protects all allies from damage. lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Blanc
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Blanc | Skill 1 / Lucky Guard | Creates a shared shield with HP equal to 11.8% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + ambiguous_target |

#### 14. `deals {percent} of final atk as additional damage. mirrors the stack count of beautiful.`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella | Burst / Glass Slippers. Full Contact. | Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 15. `deals {percent} of final atk as additional damage. removes calling card.`

- 出現: 1 / Review節: 1
- キャラクター: Phantom
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Phantom | Skill 2 / Thief's Vision | Deals 84.33% of final ATK as additional damage. Removes Calling Card. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 16. `deals {percent} of final atk as sustained damage every second. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 17. `distributed damage ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Crust
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Crust | Burst / True Flavor | Distributed Damage ▲ 60% for 10 sec. | buff / distributed_damage / increase | — | 60 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 18. `effect {index}: affects all allies from the same squad. critical damage ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Skill 2 / LT Formation | Effect 1: Affects all allies from the same squad. Critical Damage ▲ 23.51% continuously. | buff / critical_damage / increase | — | 23.51 / percent | 継続 (— continuous) | LT Formation | null | ambiguous_target |

#### 19. `effect {index}: affects all allies from the same squad. critical rate ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Eunhwa: Tactical Upgrade
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Eunhwa: Tactical Upgrade | Skill 2 / AS Formation | Effect 1: Affects all allies from the same squad. Critical Rate ▲ 8.16% continuously. | buff / critical_rate / increase | — | 8.16 / percent | 継続 (— continuous) | AS Formation | null | ambiguous_target |

#### 20. `elemental advantage attack damage ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Maiden: Ice Rose
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Maiden: Ice Rose | Skill 2 / Blessings Upon You | Elemental Advantage Attack Damage ▲ 40.9% for 10 sec. | buff / elemental_advantage_damage / increase | — | 40.9 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 21. `follow up: atk ▲ {percent} of the skill user's atk for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Yukiko
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Yukiko | Skill 2 / Scarlet Flower | Follow Up: ATK ▲ 80.25% of the skill user's ATK for 25 sec. | buff / caster_atk_based_atk / increase | — | 80.25 / caster_atk_percent | 25 sec (25 seconds) | Follow Up | null | ambiguous_target |

#### 22. `full burst duration ▲ {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: D
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| D | Burst / Chastisement | Full Burst Duration ▲ 5.04 sec. | buff / full_burst_duration / increase | — | 5.04 / seconds | Instant (— ) | — | null | ambiguous_target |

#### 23. `incoming healing ▲ {percent} continuously. stacks up to {number} times.`

- 出現: 1 / Review節: 1
- キャラクター: Flora
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Flora | Skill 1 / Petunia | Incoming Healing ▲ 4% continuously. Stacks up to 5 times. | — / — / — | — | — / — | — (— ) | — | null | special_mechanic + ambiguous_target |

#### 24. `invulnerable for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Skill 2 / Peaceful Tree | Invulnerable for 2 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 25. `max ammunition capacity ▲ {rounds} rounds(s) for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Burst / Mother Forest | Max Ammunition Capacity ▲ 20 round(s) for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

#### 26. `max hp ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Quiry
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Quiry | Skill 2 / Scrutiny | Max HP ▲ 11.63% continuously. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 27. `max hp ▲ {percent} of the skill user's max hp (without restoring hp) continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Skill 2 / Peaceful Tree | Max HP ▲ 44.98% of the skill user's max HP (without restoring HP) continuously. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 28. `next shield's hp ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Delta: Ninja Thief
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Delta: Ninja Thief | Burst / Secret Technique: Ninja Overdrive | Next shield's HP ▲ 20.13% for 10 sec. | buff / next_shield_hp / increase | — | 20.13 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 29. `number of pellets ▲ {number} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Leona
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Leona | Skill 2 / Courageous Look | Number of pellets ▲ 5 for 10 sec. | buff / pellet_count / increase | — | 5 / flat_value | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 30. `projectile explosion damage ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 2 / Stardust | Projectile Explosion Damage ▲ 92.03% for 10 sec. | buff / projectile_explosion_damage / increase | — | 92.03 / percent | 10 sec (10 seconds) | — | null | ambiguous_target |

#### 31. `proportionally shares damage taken. this effect is continuous.`

- 出現: 1 / Review節: 1
- キャラクター: Bay
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bay | Skill 2 / Cheer Up Together | Proportionally shares damage taken. This effect is continuous. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + missing_value |

#### 32. `reload speed ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Skill 2 / Peaceful Tree | Reload Speed ▲ 50.82% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 33. `removes {number} debuff(s).`

- 出現: 1 / Review節: 1
- キャラクター: Cocoa
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cocoa | Skill 1 / Professional Origami | Removes 1 debuff(s). | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

#### 34. `restores hp equal to {percent} of the skill user's final max hp every second.`

- 出現: 1 / Review節: 1
- キャラクター: Flora
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Flora | Skill 1 / Petunia | Restores HP equal to 1% of the skill user's final max HP every second. | — / — / — | — | — / — | — (— ) | — | null | special_mechanic + ambiguous_target |

#### 35. `resurrect with {percent} hp.`

- 出現: 1 / Review節: 1
- キャラクター: Mana
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mana | Skill 1 / Metal γ | Resurrect with 96% HP. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 36. `revives with {percent} hp.`

- 出現: 1 / Review節: 1
- キャラクター: Rapunzel
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rapunzel | Burst / Garden of Shangri-La | Revives with 81.67% HP. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target |

#### 37. `shield coin: damage taken ▼{percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Rouge
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rouge | Skill 2 / Coin Flip | Shield Coin: Damage Taken ▼15.2% continuously. | buff / damage_taken / decrease | — | 15.2 / percent | 継続 (— continuous) | Shield Coin | null | ambiguous_target |

#### 38. `single point attack: sustained damage ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Raven
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Raven | Skill 2 / Blue Blade | Single Point Attack: Sustained damage ▲ 47.32% for 15 sec. | buff / sustained_damage / increase | — | 47.32 / percent | 15 sec (15 seconds) | Single Point Attack | null | ambiguous_target |

#### 39. `sword coin: attack damage ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Rouge
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Rouge | Skill 2 / Coin Flip | Sword Coin: Attack Damage ▲ 6.65% continuously. | buff / attack_damage / increase | — | 6.65 / percent | 継続 (— continuous) | Sword Coin | null | ambiguous_target |

## ambiguous_duration

6 patterns / 7 candidate occurrences

#### 1. `effect {index}: charge damage ▲ {percent}.`

- 出現: 2 / Review節: 2
- キャラクター: Ada, Emilia
- 推奨: review_flag_removal_candidate (medium) — 比較effectの主要軸がすべて取得済みで、親・条件継承後の古いambiguity flagである可能性があります。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emilia | Burst / Freezing Witch | Effect 2: Charge Damage ▲ 1300.53%. | buff / charge_damage / increase | self | 1300.53 / percent | Instant (— ) | Freezing Witch | null | ambiguous_duration |
| Ada | Burst / Secret Agent | Effect 2: Charge Damage ▲ 1500%. | buff / charge_damage / increase | self | 1500 / percent | Instant (— ) | Special Modification | null | ambiguous_duration |

#### 2. `attack speed: ▼ {percent}`

- 出現: 1 / Review節: 1
- キャラクター: K
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| K | Burst / Means of Righteousness | Attack Speed: ▼ 90% | buff / — / — | self | — / — | — (— ) | Attack Speed | null | ambiguous_duration |

#### 3. `charge speed ▲ {percent}. removed upon reloading to max ammunition.`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella | Skill 1 / Flawless Glass | Charge Speed ▲ 100%. Removed upon reloading to max ammunition. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_duration |

#### 4. `effect {index}: incoming healing ▲ {percent}.`

- 出現: 1 / Review節: 1
- キャラクター: Emma: Tactical Upgrade
- 推奨: review_flag_removal_candidate (medium) — 比較effectの主要軸がすべて取得済みで、親・条件継承後の古いambiguity flagである可能性があります。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emma: Tactical Upgrade | Burst / Battlefield Formation | Effect 2: Incoming Healing ▲ 29.04%. | buff / incoming_healing / increase | self | 29.04 / percent | Instant (— ) | Effect 1 Targets | null | ambiguous_duration |

#### 5. `heat emission: reload ratio ▼ {percent}. removes heat emission under certain conditions.`

- 出現: 1 / Review節: 1
- キャラクター: Grave
- 推奨: review_flag_removal_candidate (medium) — 比較effectの主要軸がすべて取得済みで、親・条件継承後の古いambiguity flagである可能性があります。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Grave | Skill 1 / Heat Emission | Heat Emission: Reload Ratio ▼ 50%. Removes Heat Emission under certain conditions. | buff / reload_ratio / decrease | self | 50 / percent | — (— ) | Heat Emission | null | ambiguous_duration |

#### 6. `incoming healing ▲ {percent}.`

- 出現: 1 / Review節: 1
- キャラクター: Anne: Miracle Fairy
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anne: Miracle Fairy | Skill 2 / Fairy's Jest | Incoming Healing ▲ 23.46%. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_duration |

## ambiguous_trigger

11 patterns / 11 candidate occurrences

#### 1. `atk ▲ {percent} of the skill user's atk continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | ATK ▲ 16.2% of the skill user's ATK continuously. | buff / caster_atk_based_atk / increase | element | 16.2 / caster_atk_percent | 継続 (— continuous) | 1 or more ghosts | null | special_mechanic + ambiguous_trigger |

#### 2. `atk ▲ {percent} of the skill user's atk for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Lily
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Lily | Skill 1 / Precise Adjustment | ATK ▲ 20% of the skill user's ATK for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

#### 3. `creates a shared shield with hp equal to {percent} of the skill user's final max hp that protects all allies from damage. lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Centi
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Centi | Skill 2 / Field Discussion | Creates a shared shield with HP equal to 6.38% of the skill user's final max HP that protects all allies from damage. Lasts for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + ambiguous_trigger |

#### 4. `damage to interruption parts ▲{percent} permanently.`

- 出現: 1 / Review節: 1
- キャラクター: Helm
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Helm | Skill 2 / Fire Away | Damage to Interruption Parts ▲3.08% permanently. | buff / interruption_parts_damage / increase | all_allies | 3.08 / percent | Permanent (— permanent) | — | null | ambiguous_trigger |

#### 5. `effect {index}: affects all allies. cooldown of burst skill ▼ {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 3: Affects all allies. Cooldown of Burst Skill ▼ 7.48 sec. | buff / burst_cooldown_reduction / decrease | all_allies | 7.48 / seconds | Instant (— ) | — | null | special_mechanic + ambiguous_trigger + parser_failure |

#### 6. `effect {index}: affects self. my own star: atk ▲ {percent}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 2: Affects self. My Own Star: ATK ▲ 40.01%. This effect is continuous and cannot be removed. | buff / atk / increase | self | 40.01 / percent | 継続 (— continuous) | My Own Star | null | special_mechanic + ambiguous_trigger + parser_failure |

#### 7. `elemental advantage attack damage ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Elegg: Boom and Shock
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Elegg: Boom and Shock | Skill 1 / Hello Ghost | Elemental Advantage Attack Damage ▲ 35% continuously. | buff / elemental_advantage_damage / increase | element | 35 / percent | 継続 (— continuous) | 4 or more ghosts | null | special_mechanic + ambiguous_trigger |

#### 8. `emergency-crafted bullets: reload {percent} of the magazine(s).`

- 出現: 1 / Review節: 1
- キャラクター: Tove
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Tove | Skill 1 / Emergency-Crafted Bullets | Emergency-Crafted Bullets: Reload 5.31% of the magazine(s). | buff / reload_ratio / restore | self | 5.31 / percent | Instant (— ) | Emergency-Crafted Bullets | null | ambiguous_trigger |

#### 9. `hit rate ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Burst / Mother Forest | Hit Rate ▲ 45.3% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

#### 10. `max ammunition capacity ▲ {rounds} rounds(s) for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Trina
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Trina | Burst / Mother Forest | Max Ammunition Capacity ▲ 20 round(s) for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

#### 11. `removes {number} debuff(s).`

- 出現: 1 / Review節: 1
- キャラクター: Cocoa
- 推奨: human_judgement_candidate (high) — 対象・値・条件・特殊関係の意味が文法だけでは一意に確定しない候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cocoa | Skill 1 / Professional Origami | Removes 1 debuff(s). | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + ambiguous_trigger |

## missing_value

7 patterns / 10 candidate occurrences

#### 1. `increases the firepower gauge's charge by {number}.`

- 出現: 3 / Review節: 3
- キャラクター: Neon: Vision Eye
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Neon: Vision Eye | Skill 2 / Firepower Charge | Increases the Firepower Gauge's charge by 100. | — / — / — | — | — / — | — (— ) | — | null | missing_value |
| Neon: Vision Eye | Skill 2 / Firepower Charge | Increases the Firepower Gauge's charge by 2. | — / — / — | — | — / — | — (— ) | — | null | missing_value |
| Neon: Vision Eye | Skill 2 / Firepower Charge | Increases the Firepower Gauge's charge by 45. | — / — / — | — | — / — | — (— ) | — | null | missing_value |

#### 2. `charges restraint chains by {number}, up to {number}.`

- 出現: 2 / Review節: 2
- キャラクター: Mihara: Bonding Chain
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Mihara: Bonding Chain | Skill 1 / Body Contact | Charges Restraint Chains by 10, up to 10. | — / — / — | — | — / — | — (— ) | — | null | missing_value |
| Mihara: Bonding Chain | Skill 1 / Body Contact | Charges Restraint Chains by 10, up to 10. | — / — / — | — | — / — | — (— ) | — | null | missing_value |

#### 3. `focuses fire continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Little Mermaid
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Little Mermaid | Skill 1 / Bubble Order | Focuses fire continuously. | — / — / — | — | — / — | — (— ) | — | null | missing_value |

#### 4. `forcefully uses skill {number}.`

- 出現: 1 / Review節: 1
- キャラクター: Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Skill 1 / Bloom | Forcefully uses Skill 2. | — / — / — | — | — / — | — (— ) | — | null | missing_value |

#### 5. `proportionally shares damage taken. this effect is continuous.`

- 出現: 1 / Review節: 1
- キャラクター: Bay
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bay | Skill 2 / Cheer Up Together | Proportionally shares damage taken. This effect is continuous. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_target + missing_value |

#### 6. `replenishes {number} mp, up to a maximum of {number}. all mp is removed when using burst skill.`

- 出現: 1 / Review節: 1
- キャラクター: Maiden: Ice Rose
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Maiden: Ice Rose | Skill 1 / Meditation | Replenishes 1 MP, up to a maximum of 12. All MP is removed when using Burst Skill. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + missing_value |

#### 7. `summons {number} near feathers.`

- 出現: 1 / Review節: 1
- キャラクター: Ein
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Ein | Skill 1 / Feather Standby | Summons 4 Near Feathers. | — / — / — | — | — / — | — (— ) | — | null | missing_value |

## parser_failure

27 patterns / 29 candidate occurrences

#### 1. `atk ▲ {percent} for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: Privaty, Product 12
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Privaty | Skill 1 / EX Magazine | ATK ▲ 23.61% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |
| Product 12 | Skill 1 / Action: Increase ATK | ATK ▲ 8.28% for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 2. `max ammunition capacity ▼ {percent} for {seconds} sec.`

- 出現: 2 / Review節: 2
- キャラクター: Anis: Sparkling Summer, Privaty
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Sparkling Summer | Burst / Sparkling Wave | Max Ammunition Capacity ▼ 73.92% for 10 sec. | buff / — / — | self | — / — | — (— ) | — | null | parser_failure |
| Privaty | Skill 1 / EX Magazine | Max Ammunition Capacity ▼ 50.66% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 3. `activates at the start of battle and upon reloading to max ammunition. affects self. acid ammo function: upon reloading to max ammunition, the first round deals sustained damage to the target. effect: deals {percent} of final atk as sustained damage every second for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Jill
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Jill | Skill 2 / Acid Ammo | Activates at the start of battle and upon reloading to max ammunition. Affects self.<br>Acid Ammo<br>Function: Upon reloading to max ammunition, the first round deals sustained damage to the target.<br>Effect: Deals 192% of final ATK as sustained damage every second for 30 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 4. `affects the target(s) afflicted with anti a.t. field. annihilation function: after annihilation state ends, fires powerful attacks at targets affected by anti a.t. field. deals {percent} of final atk as additional damage. mirrors the stack count of anti a.t. field for certain targets. anti a.t. field status is removed after the effect is triggered.`

- 出現: 1 / Review節: 1
- キャラクター: Asuka: WILLE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Asuka: WILLE | Burst / Annihilation State | Affects the target(s) afflicted with Anti A.T. Field.<br>Annihilation<br>Function: After Annihilation State ends, fires powerful attacks at targets affected by Anti A.T. Field.<br>Deals 6.62% of final ATK as additional damage. Mirrors the stack count of Anti A.T. Field for certain targets. Anti A.T. Field status is removed after the effect is triggered. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 5. `atk ▲ {percent} of the skill user's atk continuously.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Skill 2 / Eagle Eye-Type Exospine | ATK ▲ 50% of the skill user's ATK continuously. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 6. `charge damage ▲ {percent} for {shots} shots.`

- 出現: 1 / Review節: 1
- キャラクター: Eunhwa
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Eunhwa | Skill 1 / Ready and Able | Charge Damage ▲ 37.28% for 2 shots. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 7. `charge speed ▲ {percent} for {rounds} rounds.`

- 出現: 1 / Review節: 1
- キャラクター: Eunhwa
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Eunhwa | Skill 1 / Ready and Able | Charge Speed ▲ 15.53% for 2 rounds. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 8. `charge speed ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Yuni
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Yuni | Skill 1 / DMNS | Charge Speed ▲ 8.97% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 9. `critical damage ▲ {percent}. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Skill 1 / High-Speed Evolution | Critical Damage ▲ 14.25%. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + parser_failure |

#### 10. `critical rate ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Scarlet
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Scarlet | Burst / Scarlet Flash | Critical Rate ▲ 19.57% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 11. `def ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: iDoll Sun
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| iDoll Sun | Skill 1 / Sunshine | DEF ▲ 7.56% for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 12. `def ▲ {percent} of the skill user's def continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Bay
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bay | Skill 1 / You Can Do It | DEF ▲ 10.13% of the skill user's DEF continuously. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 13. `eagle eye-type exospine.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Skill 2 / Eagle Eye-Type Exospine | Eagle Eye-Type Exospine. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 14. `effect {index}: affects all allies. cooldown of burst skill ▼ {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 3: Affects all allies. Cooldown of Burst Skill ▼ 7.48 sec. | buff / burst_cooldown_reduction / decrease | all_allies | 7.48 / seconds | Instant (— ) | — | null | special_mechanic + ambiguous_trigger + parser_failure |

#### 15. `effect {index}: affects self. my own star: atk ▲ {percent}. this effect is continuous and cannot be removed.`

- 出現: 1 / Review節: 1
- キャラクター: Anis: Star
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Anis: Star | Skill 1 / Starfall | Effect 2: Affects self. My Own Star: ATK ▲ 40.01%. This effect is continuous and cannot be removed. | buff / atk / increase | self | 40.01 / percent | 継続 (— continuous) | My Own Star | null | special_mechanic + ambiguous_trigger + parser_failure |

#### 16. `effect {index}: max ammunition capacity ▼ {percent} for {seconds} sec. (similar effects cannot be stacked.)`

- 出現: 1 / Review節: 1
- キャラクター: K
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| K | Skill 2 / Execution of Righteousness | Effect 1: Max ammunition capacity ▼ 51.13% for 10 sec. (Similar effects cannot be stacked.) | buff / — / — | all_allies | — / — | — (— ) | Fulfillment of Righteousness | null | parser_failure |

#### 17. `fixes charge time at {seconds} sec continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Snow White: Heavy Arms
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Snow White: Heavy Arms | Skill 2 / Shades of White | Fixes charge time at 1.2 sec continuously. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 18. `hit rate ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: Viper
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Viper | Skill 2 / Snake Scale | Hit Rate ▲ 3.43% continuously. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 19. `invulnerable for {seconds} sec. activates {number} time(s) per battle.`

- 出現: 1 / Review節: 1
- キャラクター: Neon: Vision Eye
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Neon: Vision Eye | Skill 1 / Healthy Body | Invulnerable for 3 sec. Activates 5 time(s) per battle. | buff / — / — | self | — / — | — (— ) | — | null | parser_failure |

#### 20. `max ammunition capacity ▲ {percent} continuously.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Skill 2 / Eagle Eye-Type Exospine | Max Ammunition Capacity ▲ 25% continuously. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 21. `max ammunition capacity ▼ {percent}. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Modernia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Modernia | Skill 1 / High-Speed Evolution | Max Ammunition Capacity ▼ 5.04%. Stacks up to 5 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + parser_failure |

#### 22. `only when at {percent}: dodging bullets: invulnerable for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Chisato
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Chisato | Skill 1 / Extrasensory | Only when at 100%: Dodging Bullets: Invulnerable for 2 sec. | buff / — / — | self | — / — | — (— ) | — | null | special_mechanic + parser_failure |

#### 23. `previous effects trigger repeatedly.`

- 出現: 1 / Review節: 1
- キャラクター: EVE
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| EVE | Skill 2 / Eagle Eye-Type Exospine | Previous effects trigger repeatedly. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 24. `proportionally shares damage taken. this effect is continuous.`

- 出現: 1 / Review節: 1
- キャラクター: Bay
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Bay | Skill 1 / You Can Do It | Proportionally shares damage taken. This effect is continuous. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 25. `reload speed ▲ {percent} for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Privaty
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Privaty | Skill 1 / EX Magazine | Reload Speed ▲ 51.16% for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 26. `restores hp equal to {percent} of attack damage. lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Signal
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Signal | Skill 2 / Waiting for Signal | Restores HP equal to 44.08% of attack damage. Lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | parser_failure |

#### 27. `shared delusion: the shield created by label becomes invulnerable for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Label
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Label | Burst / Bursting Heart | Shared Delusion: The shield created by Label becomes invulnerable for 10 sec. | buff / — / — | self | — / — | — (— ) | Shared Delusion | null | parser_failure |

## not_a_buff_candidate

8 patterns / 11 candidate occurrences

#### 1. `deals {percent} of final atk as damage. attacks sequentially {number} times.`

- 出現: 4 / Review節: 4
- キャラクター: Cinderella, EVE, Little Mermaid, Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (high) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | Deals 457.14% of final ATK as damage. Attacks sequentially 10 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
| Cinderella | Burst / Glass Slippers. Full Contact. | Deals 1365.92% of final ATK as damage. Attacks sequentially 10 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
| Little Mermaid | Skill 2 / Bubble Wave | Deals 63.36% of final ATK as damage. Attacks sequentially 4 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
| EVE | Burst / Counter Chain | Deals 457.14% of final ATK as damage. Attacks sequentially 6 times. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 2. `creates a shield with hp equal to {percent} of the the skill user's final max hp that lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Ether
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Ether | Burst / Colossal Single Cell | Creates a shield with HP equal to 96% of the the skill user's final max HP that lasts for 5 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 3. `deals {percent} of final atk as additional damage. mirrors the stack count of beautiful.`

- 出現: 1 / Review節: 1
- キャラクター: Cinderella
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Cinderella | Burst / Glass Slippers. Full Contact. | Deals 28.9% of final ATK as additional damage. Mirrors the stack count of Beautiful. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 4. `deals {percent} of final atk as additional damage. removes calling card.`

- 出現: 1 / Review節: 1
- キャラクター: Phantom
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Phantom | Skill 2 / Thief's Vision | Deals 84.33% of final ATK as additional damage. Removes Calling Card. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 5. `deals {percent} of final atk as burst skill damage.`

- 出現: 1 / Review節: 1
- キャラクター: iDoll Flower
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| iDoll Flower | Burst / Perennial Perfume | Deals 330.61% of final ATK as Burst Skill damage. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 6. `deals {percent} of final atk as sustained damage every second for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Diesel: Winter Sweets
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Diesel: Winter Sweets | Skill 2 / I'm Gonna Sing Now! | Deals 63.33% of final ATK as sustained damage every second for 9 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |

#### 7. `deals {percent} of final atk as sustained damage every second. stacks up to {number} times and lasts for {seconds} sec.`

- 出現: 1 / Review節: 1
- キャラクター: Sakura: Bloom in Summer
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Sakura: Bloom in Summer | Burst / Ephemeral Splendor | Deals 35.16% of final ATK as sustained damage every second. Stacks up to 10 times and lasts for 10 sec. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + special_mechanic + ambiguous_target + not_a_buff_candidate |

#### 8. `deals fixed damage to the main body equal to {percent} of the damage dealt by self.`

- 出現: 1 / Review節: 1
- キャラクター: Emilia
- 推奨: parser_rule_batch_candidate (medium) — 正規化パターンまたは明示的な効果文法があり、parser rule追加・継承修正で再現可能な候補です。

| Character | Slot / Skill | Source line | Effect / Buff / Modifier | Target | Value / Unit | Duration | Parent | Section condition | Reasons |
|---|---|---|---|---|---|---|---|---|---|
| Emilia | Skill 2 / Great Spirit's Mace | Deals Fixed Damage to the main body equal to 58.99% of the damage dealt by self. | — / — / — | — | — / — | — (— ) | — | null | ambiguous_value + not_a_buff_candidate |
