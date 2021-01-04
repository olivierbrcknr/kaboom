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

    switch( props.k-props.startingPos ){

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

      let cardStyle = {
        left: 'calc( var(--card-margin) + ( var(--card-width) + var(--card-margin) ) * '+c.slot.x+' )',
        top: 'calc( var(--card-margin) + ( var(--card-height) + var(--card-margin) ) * '+c.slot.y+' )'
      };

      return( <Card
        className={styles.CardGrid_Card.toString()}
        style={cardStyle}
        symbol={c.color}
        number={c.value}
        key={'myCard-'+k}
        isHighlight={ props.isHighlight }
        onClick={() => { props.onClick(c) } }
        //isBack
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