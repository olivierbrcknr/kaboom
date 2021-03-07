




# Kaboom

This is a card game that combines the rules of Memory and Uno at the same time. It is about speed and memorization. 

## Basic Rules

### The Goal

The goal is to have as few points as possible at the end of a round and ultimately the game. Each card has as many points as its numeric value. For the picture cards it generally counts as `10` points. However, an **Ace** only counts as `1` point, a **Joker** as `0` points, and a **red King** even as `-1` point.

|Card         |Value     |
|-------------|----------|
|2-10         |As on card|
|J,Q,K (black)|10        |
|K (red)      |-1        |
|A            |1         |
|Joker        |0         |

Whoever exceeds `100` points has lost the game. Directly hitting `50` points decreases the points to `0` again, directly hitting `100` decreases to points to `50`.

## Actions

### Setup

![Base Setup](BaseSetup.png)

At the beginning, each player has 4 cards laying in front of them. Before each round, they can look at the bottom two cards and need to remember them. Then the cards get flipped again. 

### The Player's turn

The game is played clock-wise. At each player's turn, the player can either draw a card from the *deck* or from the *graveyard*. The player can briefly look at the card.

### Adding A Card To The Player's Hand

If the player decides to add the card to their hand, the card is covertly swopped with one of the cards lying in front of them. **The position must not be changed!** The card that has been there previously is then put onto the *graveyard*.

### Playing A Card From The Deck

If the player decides to not take the card but directly throwing it onto the *graveyard*, an effect is played, depending on the card's value. The effects are as following: 

|Card     |Effect                                 |
|---------|---------------------------------------|
|2-6      |none                                   |
|7,8      |look at one own card                  |
|9,10     |look at someone else's card           |
|J,Q      |swop any two cards                    |
|K (black)|Look any card, then swop any two cards|
|K (red)  |none                                   |
|A        |none                                   |
|Joker    |none                                   |

### Quick-Playing A Card

If a card is lying on top of the graveyard which has the same **value** as a card the player knows, they are able to put it directly on the graveyard. If this card is from the player's hand, it does not need to be replaced. If the player puts a card from an opponent correctly onto the deck, they can select a card from their own hand that is placed on the fired card's position.

If the player selects a wrong card, they receive a hidden penalty which is then added to their hand.

Players are not allowed to fire two times from the same stack. Meaning, if one has fired a card from player 1 not other player can fire a card from player 1 until either a new cards has been drawn or a card from another player's stack has been fired.

### Ending A Round

At any point in the game, a player can end the round. If the player has the lowest amount if points, they points will simply added to the total point score. However, if the ending player has the same amount of points or more on their hand, they will receive `30` penalty points.

Another way to end a round is by having no cards on their hand, thus preventing the player from executing another round. In this case, the game immediately stops once the player is reached. But be aware, also here, the less or same amount of points rule applies!

-----

## Colors

```colors
[
  {
    color: 'var(--color-draw)',
    type: 'Drawing A Card'
  },
  {
    color: 'var(--color-lookAt)',
    type: 'Looking At A Card'
  },
  {
    color: 'var(--color-swop)',
    type: 'Swopping A Card'
  },
  {
    color: 'var(--color-select)',
    type: 'Selecting A Card'
  }
]
```
