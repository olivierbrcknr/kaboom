import React, {useState, useEffect} from 'react'

import styles from './MainPlayerUI.module.css';

import Card from '../Card'

const MainPlayerUI = (props) => {

  let classes = [styles.MainPlayerUI];
  classes.push(props.className);

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
        key={'myCard-'+k}
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

export default MainPlayerUI
