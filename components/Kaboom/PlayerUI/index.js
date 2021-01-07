import React, {useState, useEffect} from 'react'

import styles from './PlayerUI.module.css';

import Card from '../Card'

const PlayerUI = (props) => {

  let classes = [styles.PlayerUI];
  classes.push(props.className);

  // map
  let cards = null;

  if( props.isCurrent ){
    classes.push(styles.isCurrent);
  }

  if( props.isMainPlayer ){
    classes.push(styles.isMainPlayer);
    classes.push(styles.posBottom);

  }else{

    switch( props.playerNo-props.startingPos ){

      case -3:
      case 1:
        classes.push(styles.posLeft);
        break;
      case -2:
      case 2:
        classes.push(styles.posTop);
        break;
      case -1:
      case 3:
        classes.push(styles.posRight);
        break;

      // aka you are not playing
      default:
        classes.push(styles.posBottom);
        break;
    }
  }

  if( props.cards && props.cards.length > 0 ){

    cards = props.cards.map( (c,k)=>{

      let isVisible = false;
      let isSelected = false;
      let isSwopped = false;

      let indicatorType = null;


      // see effects
      if( props.effects.effect && props.effects.effect !== '' ){

        // initial effect
        if( props.effects.effect === 'initialBottomRow' && c.slot.y === 1 && props.isMainPlayer ){
          isVisible = true;
        }

        // regular effect
        for ( let i = 0; i < props.effects.cards.length; i++ ){

          if ( c.id === props.effects.cards[i].id ){

            switch( props.effects.effect ){

              case 'lookAt':
              case 'lookAtKing':
                isVisible = true;
                break;

              case 'swop':
                isSelected = true;
                break;

              default:
                // do nothing
                break;
            }
          }
        }

        // endround effect
        if( props.effects.effect === 'endRound' ){
          isVisible = true;
        }
      }

      // see swop
      if(props.swopHighlight.cards.length > 0){
        for ( let i = 0; i < props.swopHighlight.cards.length; i++ ){
          if ( c.id === props.swopHighlight.cards[i].id ){
            indicatorType = props.swopHighlight.type;
          }
        }
      }

      let cardStyle = {
        left: 'calc( var(--card-margin) + ( var(--card-width) + var(--card-margin) ) * '+c.slot.x+' )',
        top: 'calc( var(--card-margin) + ( var(--card-height) + var(--card-margin) ) * '+c.slot.y+' )'
      };

      if( props.spectatorMode ){
        isVisible = true;
      }

      return( <Card
        className={styles.CardGrid_Card.toString()}
        style={cardStyle}
        symbol={c.color}
        number={c.value}
        key={'myCard-'+k}
        indicatorType={ indicatorType }
        isHighlight={ props.isHighlight }
        isSelected={ isSelected }
        onClick={() => { props.onClick(c) } }
        isBack={!isVisible}
        /> )
    } )
  }


  return (
    <div className={classes.join(" ")}>

      <div className={styles.CardGrid}>
        {cards}
      </div>

      <div className={styles.Name}>
        {props.player.name}
      </div>

    </div>
  )
}

export default PlayerUI
