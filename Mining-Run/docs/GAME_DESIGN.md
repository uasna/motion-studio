# Mining Run — Game Design

**Platform:** Roblox  
**Game language:** English  
**Status:** Core direction approved; detailed tuning and several systems remain open.

## 1. Core loop
1. The player enters a dangerous mountain.
2. The player follows a route containing drillable rocks.
3. The player chooses a rock and drills it; discovery is determined by drilling and luck.
4. The player can carry at most two minerals, one in each hand.
5. An individual mountain guardian hunts that player.
6. The player tries to escape and return to their own plot.
7. At the plot, the player sells minerals or secures them in essence extractors for passive income.
8. Deeper mountain areas offer better rewards and greater danger; access is gated by **Físico**.

## 2. Mountain and multiplayer
- Players share the visible mountain and can see one another.
- Minerals are not visibly predetermined before drilling.
- Minerals can be found at every depth; rare minerals may also appear in early areas.
- Each rare mineral can be claimed by only one player.
- Each player has an individual guardian encounter; do not build a shared boss encounter.
- One main guardian concept may have different appearances/aspects across zones.
- Guardian detection, chase behavior, difficulty, and rare-discovery announcement UX remain OPEN.

## 3. Drilling
- The drill heats up and slows down while being used.
- There is no separate cooling/cooldown mechanic.
- Exact heat behavior, timings, upgrades, and values remain OPEN.

## 4. Minerals, carrying, and Físico
- Maximum carried minerals: two, one per hand.
- The stat is officially named **Físico**.
- Físico is persistent accumulated progression and is never spent when carrying minerals.
- Físico affects carrying capacity/weight and access to deeper zones.
- Carrying weight slightly reduces movement speed.
- Carrying beyond capacity weakens the player and may eventually cause fainting; exact behavior is OPEN.
- If caught by the guardian, the player returns to their own plot and loses only minerals currently held in their hands.
- The player keeps Físico, money, upgrades, secured minerals, and all other progression.
- Secured minerals are safe and can be placed directly into extractors.

## 5. Personal plots and economy
- There are seven personal plots.
- Each plot has an AFK Físico training area.
- The training machine performs a repeated automatic punching/hitting animation and periodically grants Físico.
- Maximum four training machines per plot.
- The only specialized machine category is **essence extractors**.
- Extractors generate money passively, including offline.
- Money can upgrade the plot, extractors (capacity/profitability), training machine/area, drill, and other progression.
- Players can sell minerals or deposit them into extractors.
- The shop is a physical in-world stand/kiosk, not a HUD shop button.

## 6. Monetization
- Monetization principle: **Pay to Fast, not Pay to Win**.
- Core progression must remain possible without Robux.
- Potential purchases include money, Físico, multipliers, training-area upgrades, and a better drill.
- Premium multiplier applies only to Físico, not money or movement speed.
- Multiplier progression: x2 → x4 → x8 → x16 → x32 → x64.
- HUD displays the active Físico multiplier.
- Robux prices, product types, and purchase flow remain OPEN.

## 7. HUD and interfaces
- HUD should show money, Físico, active multiplier, and necessary gameplay information.
- No mission/quest system.
- No shop button in the HUD.
- Full HUD layout and inventory, mineral-announcement, plot, and shop interfaces require approval.
- Visual references:
  - [HUD/button style reference](../OhxEmf.png)
  - [2x SPEED button reference](../speed-keyboard-escape-1.webp)

## 8. Map references
The original sketches are stored at the repository root and remain untouched:
- [Map sketch — overview](../Mining%20run%20bocetos.png)
- [Map sketch 1](../Mining%20run%20bocetos%201.png)
- [Map sketch 2](../Mining%20run%20bocetos%202.png)
- [Map sketch 3](../Mining%20run%20bocetos%203.png)

These sketches are the spatial source of truth. Any generated visual references should preserve their intended layout and remain practical to build in Roblox Studio.

## 9. Explicit exclusions
- No missions or quests.
- No HUD shop button.
- No shared guardian encounter.
- No separate drill cooling mechanic.
- Never carry more than two minerals.
- Never exceed four training machines per plot.
- No additional specialized machine categories beyond essence extractors.
- Being caught never removes Físico, money, upgrades, or secured minerals.
- Do not change the approved core loop without Game Director approval.

## 10. Open decisions
- Mountain length and number of zones.
- Físico access thresholds per zone.
- Mineral rarity, probabilities, weights, and values.
- Rare discovery announcement audience and UX.
- Drill heat model and tuning.
- Guardian AI, detection, chase, and difficulty.
- Fainting behavior.
- Extractor capacity, production, and offline limits.
- Training machine rates and costs.
- Plot upgrades, selling/deposit interactions, shop inventory, and prices.
- Robux prices and product configuration.
- HUD, inventory, announcements, plot, and shop interfaces.
- Mobile/controller support, audio/music.
- Technical architecture, persistence, multiplayer ownership, anti-exploit strategy, performance targets, and test plan.
