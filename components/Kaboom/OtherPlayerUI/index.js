import React, {useState, useEffect} from 'react'

import styles from './OtherPlayerUI.module.css';

import Card from '../Card'


const OtherPlayerUI = (props) => {

  let classes = [styles.OtherPlayerUI];
  classes.push(props.className);

  if( props.isCurrent ){
    classes.push(styles.isCurrent);
  }

  // map
  let cards = null;

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
        isHighlight={ props.isHighlight }
        key={'player-'+props.player.name+'-Card_'+k}
        //isBack
        /> )
    } )
  }

  return (
    <div className={classes.join(" ")} key={'player-no_'+props.k}>

      <div className={styles.CardGrid}>
        {cards}
      </div>


      <div className={styles.Name}>
        {props.player.name}
      </div>

    </div>
  )
}

export default OtherPlayerUI
